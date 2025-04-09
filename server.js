const express = require('express');
const { Octokit } = require('@octokit/rest');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// GitHub setup
const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
});

const OWNER = 'pontush81';
const REPO = 'featurerequest';
const FILE_PATH = 'data/requests.json';

// Middleware
app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Get file content from GitHub
async function getFileContent() {
    try {
        const response = await octokit.repos.getContent({
            owner: OWNER,
            repo: REPO,
            path: FILE_PATH,
        });

        const content = Buffer.from(response.data.content, 'base64').toString();
        return {
            content: JSON.parse(content),
            sha: response.data.sha
        };
    } catch (error) {
        if (error.status === 404) {
            return {
                content: { requests: [] },
                sha: null
            };
        }
        throw error;
    }
}

// Update file content on GitHub
async function updateFileContent(content, sha = null) {
    const message = sha 
        ? 'Update requests data'
        : 'Create requests data file';

    return octokit.repos.createOrUpdateFileContents({
        owner: OWNER,
        repo: REPO,
        path: FILE_PATH,
        message,
        content: Buffer.from(JSON.stringify(content, null, 2)).toString('base64'),
        sha
    });
}

// Get all requests
app.get('/api/requests', async (req, res) => {
    try {
        const { content } = await getFileContent();
        res.json(content);
    } catch (error) {
        console.error('Error reading requests:', error);
        res.status(500).json({ 
            error: 'Failed to read requests',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Save request endpoint
app.post('/api/save-request', async (req, res) => {
    try {
        const { content, sha } = await getFileContent();
        
        const requestData = {
            ...req.body,
            id: Date.now().toString(),
            timestamp: new Date().toISOString()
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