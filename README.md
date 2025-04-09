# Wish Request Management

A simple server application for handling and storing requests.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
- For production:
```bash
npm start
```
- For development (with auto-reload):
```bash
npm run dev
```

The server will start on port 3000 by default. You can modify the port by setting the `PORT` environment variable.

## API Endpoints

### Save Request
- **URL**: `/api/save-request`
- **Method**: `POST`
- **Body**: Any JSON object
- **Response**: Returns the saved request object with added timestamp and ID

## Data Storage

All requests are stored in `data/requests.json`. The data directory and file will be automatically created if they don't exist. 