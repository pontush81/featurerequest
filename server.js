const express = require('express');
const { Octokit } = require('@octokit/rest');
const path = require('path');
const fs = require('fs');

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
        const content = await fs.readFile(FILE_PATH, 'utf8');
        const data = JSON.parse(content);
        res.json(data.requests || []);
    } catch (error) {
        console.error('Error reading requests:', error);
        res.status(500).json({ error: 'Error reading requests' });
    }
});

// Save request endpoint
app.post('/api/save-request', async (req, res) => {
    try {
        let data = { requests: [] };
        
        // Read existing data if file exists
        try {
            const content = await fs.readFile(FILE_PATH, 'utf8');
            data = JSON.parse(content);
        } catch (error) {
            console.log('No existing data file, creating new one');
        }

        // Create new request object
        const newRequest = {
            ...req.body,
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            status: 'New'
        };

        // Add to requests array
        data.requests = data.requests || [];
        data.requests.push(newRequest);

        // Save to GitHub
        await updateFileContent(data);

        res.json(newRequest);
    } catch (error) {
        console.error('Error saving request:', error);
        res.status(500).json({ error: 'Error saving request' });
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