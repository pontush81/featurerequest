const express = require('express');
const { Octokit } = require('@octokit/rest');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// GitHub configuration
const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
});

const owner = 'pontush81';
const repo = 'featurerequest';
const filePath = 'data/requests.json';

// Middleware
app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Function to get file content from GitHub
async function getFileContent() {
    try {
        console.log('Fetching file content from GitHub...');
        const response = await octokit.repos.getContent({
            owner,
            repo,
            path: filePath,
        });

        console.log('GitHub response received');
        const content = Buffer.from(response.data.content, 'base64').toString();
        const parsedContent = JSON.parse(content);
        console.log('Parsed content:', parsedContent);
        
        return {
            content: parsedContent,
            sha: response.data.sha
        };
    } catch (error) {
        console.error('Error in getFileContent:', error);
        if (error.status === 404) {
            console.log('File not found, returning empty requests array');
            return {
                content: { requests: [] },
                sha: null
            };
        }
        throw error;
    }
}

// Function to update file content on GitHub
async function updateFileContent(newContent, sha) {
    const message = 'Update requests data';
    const content = Buffer.from(JSON.stringify(newContent, null, 2)).toString('base64');

    const params = {
        owner,
        repo,
        path: filePath,
        message,
        content,
        ...(sha && { sha })
    };

    await octokit.repos.createOrUpdateFileContents(params);
}

// API Routes
app.get('/api/requests', async (req, res) => {
    try {
        console.log('GET /api/requests called');
        const { content } = await getFileContent();
        console.log('Sending response:', content.requests);
        res.json(content.requests);
    } catch (error) {
        console.error('Error in /api/requests:', error);
        res.status(500).json({ 
            error: 'Failed to read requests',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

app.post('/api/save-request', async (req, res) => {
    try {
        const { content, sha } = await getFileContent();
        
        const requestData = {
            ...req.body,
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            status: 'New'
        };

        content.requests.push(requestData);
        await updateFileContent(content, sha);

        res.status(201).json(requestData);
    } catch (error) {
        console.error('Error saving request:', error);
        res.status(500).json({ 
            error: 'Failed to save request',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Something broke!',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
}); 