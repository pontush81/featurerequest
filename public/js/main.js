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
                project: document.getElementById('project').value,
                title: document.getElementById('title').value,
                description: document.getElementById('description').value,
                acceptanceCriteria: document.getElementById('acceptanceCriteria').value,
                businessValue: document.getElementById('businessValue').value,
                businessValueRatings: businessValueRatings,
                priority: document.getElementById('priority').value,
                requesterName: document.getElementById('requesterName').value,
                requesterEmail: document.getElementById('requesterEmail').value,
                submissionDate: document.getElementById('submissionDate').value
            };

            console.log('Form data with ratings:', formData); // For debugging

            // TODO: Implement API call to create Jira issue
            // For now, just show success message
            showStatusMessage('Feature request submitted successfully!', 'success');
            requestForm.reset();
            // Reset date to today after form reset
            document.getElementById('submissionDate').value = today;
            // Disable all rating selects after form reset
            document.querySelectorAll('.value-rating').forEach(select => {
                select.disabled = true;
                select.value = "0";
            });
        } catch (error) {
            showStatusMessage('Error submitting feature request. Please try again.', 'error');
            console.error('Error:', error);
        }
    });

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