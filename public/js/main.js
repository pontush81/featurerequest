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
        
        const businessValueScores = getBusinessValueScores();
        const businessValueSummary = calculateBusinessValueSummary(businessValueScores);

        const formData = {
            title: document.getElementById('title').value,
            description: document.getElementById('description').value,
            area: document.getElementById('area').value,
            priority: document.getElementById('priority').value,
            acceptanceCriteria: document.getElementById('acceptanceCriteria').value,
            businessValue: businessValueSummary,
            businessValueScores: businessValueScores,
            requesterName: document.getElementById('requesterName').value,
            requesterEmail: document.getElementById('requesterEmail').value,
            submissionDate: new Date().toISOString().split('T')[0]
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

            // Clear form and reset PRAISED selections
            requestForm.reset();
            resetPraisedSelections();
            
            // Reload requests list
            loadRequests();

            // Show success message
            showMessage('Request submitted successfully!', 'success');
        } catch (error) {
            console.error('Error:', error);
            showMessage('Error submitting request. Please try again.', 'error');
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
                    <td>${formatBusinessValue(request)}</td>
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
        // Om det är ett äldre önskemål utan businessValueScores, visa default värde
        if (!request.businessValueScores) {
            // Skapa ett tomt objekt med alla kategorier satta till 0
            const emptyScores = {};
            categories.forEach(category => {
                emptyScores[category.id] = 0;
            });
            request.businessValueScores = emptyScores;
        }

        const total = Object.values(request.businessValueScores).reduce((sum, score) => sum + score, 0);
        
        // Filtrera och sortera kategorier efter poäng (högst först)
        const scoresList = Object.entries(request.businessValueScores)
            .filter(([_, score]) => score > 0)
            .sort(([_, scoreA], [_, scoreB]) => scoreB - scoreA)
            .map(([category, score]) => {
                const categoryInfo = categories.find(c => c.id === category);
                const categoryName = categoryInfo ? categoryInfo.name : category;
                return `${categoryName}: ${score}`;
            })
            .join('<br>');

        if (total === 0) {
            return '<div class="business-value-cell">-</div>';
        }

        return `
            <div class="business-value-cell">
                <strong>Total: ${total}</strong>
                ${scoresList ? '<br>' + scoresList : ''}
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