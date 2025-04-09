// Configuration settings
const config = {
    // Jira API settings
    jiraApiUrl: 'https://kontek.atlassian.net/rest/api/3',
    
    // Feature request settings
    defaultProject: 'KID', // Kontek in Development as default
    priorityLevels: {
        highest: 'Highest - Critical Impact',
        high: 'High - Significant Impact',
        medium: 'Medium - Moderate Impact',
        low: 'Low - Minor Impact',
        lowest: 'Lowest - Minimal Impact'
    },
    
    // Business value categories
    businessValueTypes: {
        productivity: 'Productivity gains (produktivitetsökning)',
        reduced: 'Reduced costs (minskade kostnader)',
        avoided: 'Avoided costs (undvikna kostnader)',
        increased: 'Increased revenue (ökade intäkter)',
        service: 'Service level improvements (förbättrad servicenivå)',
        enhanced: 'Enhanced quality (förbättrad kvalitet)',
        differentiation: 'Differentiation in the marketplace (differentiering på marknaden)'
    }
}; 