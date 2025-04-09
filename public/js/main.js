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
    document.getElementById('requestForm').addEventListener('submit', async function(e) {
        e.preventDefault();

        try {
            // Get form data
            const formData = {
                title: document.getElementById('title').value,
                description: document.getElementById('description').value,
                project: document.getElementById('project').value,
                priority: document.getElementById('priority').value,
                acceptanceCriteria: document.getElementById('acceptanceCriteria').value,
                requesterName: document.getElementById('requesterName').value,
                requesterEmail: document.getElementById('requesterEmail').value,
                submissionDate: new Date().toISOString().split('T')[0],
                businessValueScores: getBusinessValueScores()
            };

            console.log('Submitting form data:', formData);

            // Send data to server
            const response = await fetch('/api/save-request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save request');
            }

            const result = await response.json();
            console.log('Request saved successfully:', result);

            // Clear form and reset PRAISED selections
            document.getElementById('requestForm').reset();
            resetPraisedSelections();
            
            // Reload requests list
            loadRequests();

            // Show success message
            showMessage('Request submitted successfully!', 'success');
        } catch (error) {
            console.error('Error submitting request:', error);
            showMessage(error.message || 'Error submitting request. Please try again.', 'error');
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
            console.log('Loaded requests:', requests); // Debug log
            
            const tableBody = document.getElementById('requestsTableBody');
            if (!tableBody) {
                console.error('Could not find table body element');
                return;
            }

            if (!Array.isArray(requests)) {
                console.error('Invalid response format:', requests);
                return;
            }

            tableBody.innerHTML = requests.map(request => {
                console.log('Processing request:', request); // Debug log
                const businessValue = formatBusinessValue(request);
                console.log('Formatted business value:', businessValue); // Debug log
                return `
                    <tr>
                        <td>${formatDate(request.submissionDate || request.timestamp)}</td>
                        <td>${request.project || request.area || '-'}</td>
                        <td>${request.title || '-'}</td>
                        <td>${request.status || 'New'}</td>
                        <td>${request.priority || '-'}</td>
                        <td class="business-value-cell">${businessValue}</td>
                    </tr>
                `;
            }).join('');

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

    function getBusinessValueScores() {
        const scores = {};
        categories.forEach(category => {
            const checkbox = document.getElementById(`praised_${category.id}`);
            const select = document.getElementById(`${category.id}_rating`);
            if (checkbox && checkbox.checked && select) {
                scores[category.id] = parseInt(select.value);
            } else {
                scores[category.id] = 0;
            }
        });
        return scores;
    }

    function calculateBusinessValueSummary(scores) {
        const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
        const activeCategories = Object.entries(scores)
            .filter(([_, score]) => score > 0)
            .map(([category, score]) => {
                const categoryInfo = categories.find(c => c.id === category);
                return `${categoryInfo ? categoryInfo.name : category}: ${score}`;
            });

        if (activeCategories.length === 0) {
            return 'No business value categories selected';
        }

        return `Total Score: ${totalScore}\n${activeCategories.join('\n')}`;
    }

    function resetPraisedSelections() {
        categories.forEach(category => {
            const checkbox = document.getElementById(`praised_${category.id}`);
            const select = document.getElementById(`${category.id}_rating`);
            if (checkbox) checkbox.checked = false;
            if (select) select.value = '0';
        });
    }

    function formatBusinessValue(request) {
        console.log('Formatting business value for request:', request); // Debug log
        
        // Om det är ett äldre önskemål utan businessValueScores, visa default värde
        if (!request.businessValueScores) {
            console.log('No businessValueScores, using default empty scores'); // Debug log
            // Skapa ett tomt objekt med alla kategorier satta till 0
            const emptyScores = {};
            categories.forEach(category => {
                emptyScores[category.id] = 0;
            });
            request.businessValueScores = emptyScores;
        }

        const total = Object.values(request.businessValueScores).reduce((sum, score) => sum + score, 0);
        console.log('Total score:', total); // Debug log
        
        // Filtrera och sortera kategorier efter poäng (högst först)
        const scoresList = Object.entries(request.businessValueScores)
            .filter(([categoryId, score]) => score > 0)
            .sort(([_, scoreA], [__, scoreB]) => scoreB - scoreA)
            .map(([category, score]) => {
                const categoryInfo = categories.find(c => c.id === category);
                const categoryName = categoryInfo ? categoryInfo.name : category;
                return `${categoryName}: ${score}`;
            })
            .join('<br>');

        console.log('Scores list:', scoresList); // Debug log

        if (total === 0) {
            return request.businessValue || '-';
        }

        return `
            <strong>Total: ${total}</strong>
            ${scoresList ? '<br>' + scoresList : ''}
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
    function showMessage(message, type) {
        const statusMessage = document.getElementById('statusMessage');
        if (!statusMessage) {
            console.error('Status message element not found');
            alert(message); // Fallback to alert if element not found
            return;
        }
        
        statusMessage.textContent = message;
        statusMessage.className = `status-message ${type || 'info'}`;
        
        // Make sure the message is visible
        statusMessage.style.display = 'block';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            statusMessage.className = 'status-message';
            setTimeout(() => {
                statusMessage.style.display = 'none';
            }, 500);
        }, 5000);
    }
}); 