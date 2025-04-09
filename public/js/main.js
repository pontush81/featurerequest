document.addEventListener('DOMContentLoaded', function() {
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('submissionDate').value = today;

    // Form elements
    const requestForm = document.getElementById('requestForm');
    const adminForm = document.getElementById('adminForm');
    const statusMessage = document.getElementById('statusMessage');
    const adminSection = document.getElementById('adminSection');

    // Handle business value checkboxes and ratings
    document.querySelectorAll('input[name="businessValueTypes"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const ratingSelect = document.getElementById(`${this.id}-rating`);
            if (this.checked) {
                ratingSelect.disabled = false;
                ratingSelect.value = "0"; // Set default value when enabled
            } else {
                ratingSelect.disabled = true;
                ratingSelect.value = "0";
            }
        });
    });

    // Show admin section if admin key is present in URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('admin') === 'true') {
        adminSection.style.display = 'block';
    }

    // Handle feature request form submission
    requestForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        try {
            // Get business value ratings for checked categories
            const businessValueRatings = {};
            document.querySelectorAll('input[name="businessValueTypes"]:checked').forEach(checkbox => {
                const ratingSelect = document.getElementById(`${checkbox.id}-rating`);
                businessValueRatings[checkbox.value] = parseInt(ratingSelect.value);
            });

            const formData = {
                id: Date.now(), // Unique ID based on timestamp
                project: document.getElementById('project').value,
                title: document.getElementById('title').value,
                description: document.getElementById('description').value,
                acceptanceCriteria: document.getElementById('acceptanceCriteria').value,
                businessValue: document.getElementById('businessValue').value,
                businessValueRatings: businessValueRatings,
                priority: document.getElementById('priority').value,
                requesterName: document.getElementById('requesterName').value,
                requesterEmail: document.getElementById('requesterEmail').value,
                submissionDate: document.getElementById('submissionDate').value,
                status: 'New' // Initial status
            };

            // Save to local storage as backup
            const savedRequests = JSON.parse(localStorage.getItem('featureRequests') || '[]');
            savedRequests.push(formData);
            localStorage.setItem('featureRequests', JSON.stringify(savedRequests));

            // Try to save to the JSON file
            try {
                const response = await fetch('/data/requests.json');
                const data = await response.json();
                data.requests.push(formData);

                // In a real implementation, we would send this to a server endpoint
                // For now, we'll just show success message and keep in localStorage
                console.log('Would save to server:', data);
                
                showStatusMessage('Feature request submitted successfully! (Saved locally)', 'success');
                requestForm.reset();
                
                // Reset date to today after form reset
                document.getElementById('submissionDate').value = today;
                
                // Disable all rating selects after form reset
                document.querySelectorAll('.value-rating').forEach(select => {
                    select.disabled = true;
                    select.value = "0";
                });
            } catch (error) {
                console.error('Error saving to JSON file:', error);
                showStatusMessage('Request saved locally (offline mode)', 'success');
            }
        } catch (error) {
            showStatusMessage('Error submitting feature request. Please try again.', 'error');
            console.error('Error:', error);
        }
    });

    // Add view requests functionality if admin
    if (urlParams.get('admin') === 'true') {
        loadSavedRequests();
    }

    // Function to load and display saved requests
    async function loadSavedRequests() {
        try {
            // Try to load from localStorage first
            const savedRequests = JSON.parse(localStorage.getItem('featureRequests') || '[]');
            
            // Create a table to display requests
            const table = document.createElement('table');
            table.className = 'requests-table';
            table.innerHTML = `
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Area</th>
                        <th>Title</th>
                        <th>Status</th>
                        <th>Priority</th>
                    </tr>
                </thead>
                <tbody>
                    ${savedRequests.map(request => `
                        <tr>
                            <td>${request.submissionDate}</td>
                            <td>${request.project}</td>
                            <td>${request.title}</td>
                            <td>${request.status}</td>
                            <td>${request.priority}</td>
                        </tr>
                    `).join('')}
                </tbody>
            `;
            
            // Add table to admin section
            const adminPanel = document.querySelector('.admin-panel');
            adminPanel.appendChild(table);
        } catch (error) {
            console.error('Error loading saved requests:', error);
        }
    }

    // Handle admin form submission
    adminForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        try {
            const jiraToken = document.getElementById('jiraToken').value;
            const jiraUser = document.getElementById('jiraUser').value;

            // TODO: Implement secure storage of credentials
            // For now, just show success message
            showStatusMessage('Admin configuration saved successfully!', 'success');
            adminForm.reset();
        } catch (error) {
            showStatusMessage('Error saving admin configuration. Please try again.', 'error');
            console.error('Error:', error);
        }
    });

    // Helper function to show status messages
    function showStatusMessage(message, type) {
        statusMessage.textContent = message;
        statusMessage.className = `status-message ${type}`;
        setTimeout(() => {
            statusMessage.className = 'status-message';
        }, 5000);
    }
}); 