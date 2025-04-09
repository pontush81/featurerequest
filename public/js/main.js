document.addEventListener('DOMContentLoaded', function() {
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('submissionDate').value = today;

    // Form elements
    const requestForm = document.getElementById('requestForm');
    const statusMessage = document.getElementById('statusMessage');
    const requestsTableContainer = document.getElementById('requestsTableContainer');

    // Load and display existing requests
    loadRequests();

    // Handle feature request form submission
    requestForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        try {
            const formData = {
                project: document.getElementById('project').value,
                title: document.getElementById('title').value,
                description: document.getElementById('description').value,
                acceptanceCriteria: document.getElementById('acceptanceCriteria').value,
                businessValue: document.getElementById('businessValue').value,
                businessValueTypes: Array.from(document.querySelectorAll('input[name="businessValueTypes"]:checked'))
                    .map(cb => cb.value),
                priority: document.getElementById('priority').value,
                requesterName: document.getElementById('requesterName').value,
                requesterEmail: document.getElementById('requesterEmail').value,
                submissionDate: document.getElementById('submissionDate').value,
                status: 'New'
            };

            // Save request
            const response = await fetch('/api/save-request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            showStatusMessage('Request submitted successfully!', 'success');
            requestForm.reset();
            
            // Reset date to today after form reset
            document.getElementById('submissionDate').value = today;
            
            // Reload the requests list
            loadRequests();
        } catch (error) {
            showStatusMessage('Error submitting request. Please try again.', 'error');
            console.error('Error:', error);
        }
    });

    // Function to load and display requests
    async function loadRequests() {
        try {
            const response = await fetch('/api/requests');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            
            if (!data.requests || !Array.isArray(data.requests)) {
                throw new Error('Invalid data format');
            }

            // Create table
            const table = document.createElement('table');
            table.className = 'requests-table';
            table.innerHTML = `
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Project</th>
                        <th>Title</th>
                        <th>Status</th>
                        <th>Priority</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.requests.map(request => `
                        <tr>
                            <td>${formatDate(request.submissionDate)}</td>
                            <td>${request.project}</td>
                            <td>${request.title}</td>
                            <td>${request.status}</td>
                            <td>${request.priority}</td>
                        </tr>
                    `).join('')}
                </tbody>
            `;
            
            // Clear and update the table container
            requestsTableContainer.innerHTML = '';
            requestsTableContainer.appendChild(table);
        } catch (error) {
            console.error('Error loading requests:', error);
            requestsTableContainer.innerHTML = '<p>Error loading requests. Please try again later.</p>';
        }
    }

    // Helper function to format dates
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('sv-SE');
    }

    // Helper function to show status messages
    function showStatusMessage(message, type) {
        statusMessage.textContent = message;
        statusMessage.className = `status-message ${type}`;
        setTimeout(() => {
            statusMessage.className = 'status-message';
        }, 5000);
    }
}); 