// Dashboard functionality
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('questionnaire-form');
    const submitBtn = document.getElementById('submit-btn');
    const loadingSpinner = document.querySelector('.loading-spinner');
    const resultsSection = document.querySelector('.results-section');
    const grantResults = document.querySelector('.grant-results');
    const errorMessage = document.querySelector('.error-message');
    const successMessage = document.querySelector('.success-message');

    // Mock grant database for demo (since backend might not be connected)
    const mockGrants = [
        {
            id: 1,
            title: "Small Business Innovation Research (SBIR)",
            agency: "Small Business Administration",
            type: "Federal",
            amount: 50000,
            description: "Funding for small businesses engaged in research and development with commercialization potential.",
            matchScore: 92,
            applicationUrl: "https://www.sbir.gov/apply"
        },
        {
            id: 2,
            title: "Economic Development Administration Grant",
            agency: "Department of Commerce", 
            type: "Federal",
            amount: 75000,
            description: "Support for businesses that create jobs and promote economic development in distressed communities.",
            matchScore: 88,
            applicationUrl: "https://www.eda.gov/funding/"
        },
        {
            id: 3,
            title: "USDA Rural Business Development Grant",
            agency: "Department of Agriculture",
            type: "Federal", 
            amount: 25000,
            description: "Grants for small businesses in rural areas to support economic development and job creation.",
            matchScore: 85,
            applicationUrl: "https://www.rd.usda.gov/programs-services/business-programs"
        },
        {
            id: 4,
            title: "Minority Business Enterprise Grant",
            agency: "State Economic Development",
            type: "State",
            amount: 15000,
            description: "Financial assistance for minority-owned businesses to expand operations and create jobs.",
            matchScore: 82,
            applicationUrl: "https://www.sba.gov/funding-programs/grants"
        },
        {
            id: 5,
            title: "Women-Owned Small Business Grant",
            agency: "Small Business Administration",
            type: "Federal",
            amount: 30000,
            description: "Grants specifically for women-owned small businesses in various industries.",
            matchScore: 79,
            applicationUrl: "https://www.sba.gov/funding-programs/grants"
        }
    ];

    // Form submission handler
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Show loading state
            showLoading();
            hideMessages();
            
            // Get form data
            const formData = new FormData(form);
            const businessProfile = {
                businessName: formData.get('businessName'),
                industry: formData.get('industry'),
                businessSize: formData.get('businessSize'),
                employees: parseInt(formData.get('employees')),
                revenue: parseInt(formData.get('revenue')),
                location: formData.get('location'),
                stage: formData.get('stage'),
                demographics: formData.get('demographics'),
                fundingAmount: parseInt(formData.get('fundingAmount')),
                fundingPurpose: formData.get('fundingPurpose')
            };

            try {
                // Try to call real API first, fallback to mock data
                let matches;
                try {
                    const response = await fetch('/api/match-grants', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(businessProfile)
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        matches = data.matches;
                    } else {
                        throw new Error('API not available');
                    }
                } catch (apiError) {
                    console.log('API not available, using mock data');
                    // Use mock data with simulated matching
                    matches = mockGrants
                        .map(grant => ({
                            ...grant,
                            matchScore: calculateMockMatchScore(businessProfile, grant)
                        }))
                        .filter(grant => grant.matchScore >= 70)
                        .sort((a, b) => b.matchScore - a.matchScore)
                        .slice(0, 5);
                }

                // Hide loading and show results
                hideLoading();
                displayResults(matches);
                showSuccessMessage(`Found ${matches.length} grant matches for your business!`);

            } catch (error) {
                console.error('Error matching grants:', error);
                hideLoading();
                showErrorMessage('Sorry, there was an error finding grants. Please try again.');
            }
        });
    }

    // Mock matching algorithm for demo
    function calculateMockMatchScore(profile, grant) {
        let score = 70; // Base score
        
        // Industry matching
        if (grant.title.toLowerCase().includes(profile.industry.toLowerCase())) {
            score += 15;
        }
        
        // Business size matching
        if (profile.businessSize === 'small' && grant.amount <= 100000) {
            score += 10;
        }
        
        // Random variation for demo
        score += Math.floor(Math.random() * 10);
        
        return Math.min(score, 95); // Cap at 95%
    }

    // Display results
    function displayResults(matches) {
        if (!grantResults) return;
        
        grantResults.innerHTML = '';
        
        if (matches.length === 0) {
            grantResults.innerHTML = `
                <div class="no-results">
                    <h3>No matches found</h3>
                    <p>Try adjusting your business profile or check back later for new opportunities.</p>
                </div>
            `;
        } else {
            matches.forEach(grant => {
                const grantCard = createGrantCard(grant);
                grantResults.appendChild(grantCard);
            });
        }
        
        resultsSection.style.display = 'block';
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }

    // Create grant card element
    function createGrantCard(grant) {
        const card = document.createElement('div');
        card.className = 'grant-result-card';
        
        card.innerHTML = `
            <h3>${grant.title}</h3>
            <div class="grant-amount">$${grant.amount.toLocaleString()}</div>
            <p>${grant.description}</p>
            <div class="grant-match-score">${grant.matchScore}% Match</div>
            <div class="grant-meta">
                <small><strong>Agency:</strong> ${grant.agency}</small><br>
                <small><strong>Type:</strong> ${grant.type}</small>
            </div>
            <br>
            <a href="${grant.applicationUrl}" target="_blank" class="apply-btn">Learn More</a>
        `;
        
        return card;
    }

    // Loading state functions
    function showLoading() {
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Finding Grants...';
        }
        if (loadingSpinner) {
            loadingSpinner.style.display = 'block';
        }
    }

    function hideLoading() {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Find My Grants';
        }
        if (loadingSpinner) {
            loadingSpinner.style.display = 'none';
        }
    }

    // Message functions
    function showErrorMessage(message) {
        if (errorMessage) {
            errorMessage.textContent = message;
            errorMessage.style.display = 'block';
        }
    }

    function showSuccessMessage(message) {
        if (successMessage) {
            successMessage.textContent = message;
            successMessage.style.display = 'block';
        }
    }

    function hideMessages() {
        if (errorMessage) errorMessage.style.display = 'none';
        if (successMessage) successMessage.style.display = 'none';
    }

    // Form validation
    function validateForm() {
        const requiredFields = ['businessName', 'industry', 'businessSize', 'location', 'stage'];
        let isValid = true;

        requiredFields.forEach(fieldName => {
            const field = form.querySelector(`[name="${fieldName}"]`);
            if (field && !field.value.trim()) {
                field.style.borderColor = '#dc2626';
                isValid = false;
            } else if (field) {
                field.style.borderColor = '#e2e8f0';
            }
        });

        return isValid;
    }

    // Real-time validation
    if (form) {
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                if (this.hasAttribute('required') && !this.value.trim()) {
                    this.style.borderColor = '#dc2626';
                } else {
                    this.style.borderColor = '#e2e8f0';
                }
            });
        });
    }
});

// Analytics tracking (optional)
function trackEvent(eventName, properties = {}) {
    // Add your analytics tracking here
    console.log('Event:', eventName, properties);
}

// Track form submission
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('questionnaire-form');
    if (form) {
        form.addEventListener('submit', function() {
            trackEvent('grant_search_submitted', {
                timestamp: new Date().toISOString()
            });
        });
    }
});
