// Business value categories configuration
const categories = [
    { id: 'productivity', name: 'Productivity gains' },
    { id: 'reduced', name: 'Reduced costs' },
    { id: 'avoided', name: 'Compliancy' },
    { id: 'increased', name: 'Increased revenue' },
    { id: 'service', name: 'Service level improvements' },
    { id: 'enhanced', name: 'Enhanced quality' }
];

// Initialize business value selection handlers
function initializePraisedSelections() {
    categories.forEach(category => {
        const checkbox = document.getElementById(`praised_${category.id}`);
        const select = document.getElementById(`${category.id}_rating`);
        
        if (checkbox && select) {
            // Make the select enabled/disabled based on checkbox
            select.disabled = !checkbox.checked;
            
            // Add event listener to toggle select based on checkbox
            checkbox.addEventListener('change', () => {
                select.disabled = !checkbox.checked;
                if (checkbox.checked && select.value === '0') {
                    select.value = '2'; // Default to moderate impact when checked
                }
            });
        }
    });
}

// Reset all business value selections
function resetPraisedSelections() {
    categories.forEach(category => {
        const checkbox = document.getElementById(`praised_${category.id}`);
        const select = document.getElementById(`${category.id}_rating`);
        if (checkbox) checkbox.checked = false;
        if (select) {
            select.value = '0';
            select.disabled = true;
        }
    });
}

// Get business value scores from form
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

// Calculate business value total (numeric)
function calculateBusinessValueTotal(scores) {
    return Object.values(scores).reduce((sum, score) => sum + score, 0);
}

// Calculate business value summary text
function calculateBusinessValueSummary(scores) {
    const totalScore = calculateBusinessValueTotal(scores);
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

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializePraisedSelections();
}); 