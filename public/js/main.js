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
        
        const formData = {
            title: document.getElementById('title').value,
            description: document.getElementById('description').value,
            area: document.getElementById('area').value,
            priority: document.getElementById('priority').value,
            acceptanceCriteria: document.getElementById('acceptanceCriteria').value,
            businessValue: document.getElementById('businessValue').value,
            businessValueScores: getBusinessValueScores()
        };

        try {
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

            // Clear form
            requestForm.reset();
            
            // Reload requests list
            loadRequests();

            // Show success message
            showMessage('Request submitted successfully!', 'success');
        } catch (error) {
            console.error('Error:', error);
        }
    });

    // Function to load and display requests
    async function loadRequests() {
        try {
            const response = await fetch('/api/requests');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const requests = await response.json();
            
            const tableBody = document.getElementById('requestsTableBody');
            if (!tableBody) {
                console.error('Could not find table body element');
                return;
            }

            if (!Array.isArray(requests)) {
                console.error('Invalid response format:', requests);
                return;
            }

            tableBody.innerHTML = requests.map(request => `
                <tr>
                    <td>${formatDate(request.submissionDate || request.timestamp)}</td>
                    <td>${request.project || request.area || '-'}</td>
                    <td>${request.title || '-'}</td>
                    <td>${request.status || 'New'}</td>
                    <td>${request.priority || '-'}</td>
                    <td class="business-value-cell">
                        ${formatBusinessValue(request.businessValueScores)}
                    </td>
                </tr>
            `).join('');

        } catch (error) {
            console.error('Error loading requests:', error);
            const tableBody = document.getElementById('requestsTableBody');
            if (tableBody) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="6" class="error-message">
                            Error loading requests. Please try again later.
                        </td>
                    </tr>
                `;
            }
        }
    }

    function formatBusinessValue(scores) {
        if (!scores || Object.keys(scores).length === 0) {
            return '-';
        }

        const total = Object.values(scores).reduce((sum, score) => sum + score, 0);
        const scoresList = Object.entries(scores)
            .map(([category, score]) => {
                const categoryInfo = categories.find(c => c.id === category);
                return `${categoryInfo ? categoryInfo.name : category}: ${score}`;
            })
            .join('<br>');

        return `
            <div class="business-value-cell">
                <strong>Total: ${total}</strong><br>
                ${scoresList}
            </div>
        `;
    }

    // Helper function to format dates
    function formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        return date.toLocaleDateString();
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