const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
const requestsFile = path.join(dataDir, 'requests.json');

async function ensureDataDirExists() {
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir);
  }
  
  try {
    await fs.access(requestsFile);
  } catch {
    await fs.writeFile(requestsFile, JSON.stringify({ requests: [] }));
  }
}

// Get all requests
app.get('/api/requests', async (req, res) => {
  try {
    const data = await fs.readFile(requestsFile, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    console.error('Error reading requests:', error);
    res.status(500).json({ error: 'Failed to read requests' });
  }
});

// Save request endpoint
app.post('/api/save-request', async (req, res) => {
  try {
    const requestData = req.body;
    const data = JSON.parse(await fs.readFile(requestsFile, 'utf8'));
    
    if (!Array.isArray(data.requests)) {
      data.requests = [];
    }
    
    data.requests.push(requestData);
    await fs.writeFile(requestsFile, JSON.stringify(data, null, 2));

    res.json(requestData);
  } catch (error) {
    console.error('Error saving request:', error);
    res.status(500).json({ error: 'Failed to save request' });
  }
});

// Start server
async function startServer() {
  await ensureDataDirExists();
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

startServer().catch(console.error); 