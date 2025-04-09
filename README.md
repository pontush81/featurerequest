# Kontek Feature Request Portal

A web-based portal for submitting and managing feature requests within Kontek.

## Features

- Submit feature requests with detailed information
- Project selection
- Priority levels
- Business value categorization
- Acceptance criteria
- Data stored directly in GitHub repository

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a GitHub Personal Access Token:
   - Go to GitHub Settings -> Developer Settings -> Personal Access Tokens
   - Generate a new token with 'repo' scope
   - Copy the token

4. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Add your GitHub token to `.env`
   - Add environment variables to Vercel project settings if deploying

5. Start the server:
   - Development: `npm run dev`
   - Production: `npm start`

## Data Storage

All requests are stored in `data/requests.json` in the GitHub repository. The application uses GitHub's API to read and write data directly to the repository.

## API Endpoints

- `GET /api/requests`: Get all feature requests
- `POST /api/save-request`: Save a new feature request

## Deployment

This project is deployed on Vercel. The deployment is automatic when changes are pushed to the main branch.

Required environment variables for Vercel:
- `GITHUB_TOKEN`: Your GitHub Personal Access Token 