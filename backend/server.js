const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Grant database (in production, this would be a real database)
const grantsDatabase = [
    {
        id: 1,
        title: "Small Business Innovation Research (SBIR)",
        agency: "Small Business Administration",
        type: "Federal",
        amount: 50000,
        description: "Funding for small businesses engaged in research and development with commercialization potential.",
        eligibility: {
            businessSize: "small",
            industry: ["technology", "healthcare", "manufacturing"],
            location: "nationwide",
            stage: ["startup", "established"],
            demographics: "any"
        },
        deadline: "2024-03-15",
        matchScore: 0,
        applicationUrl: "https://www.sbir.gov/apply"
    },
    {
        id: 2,
        title: "Economic Development Administration Grant",
        agency: "Department of Commerce",
        type: "Federal",
        amount: 75000,
        description: "Support for businesses that create jobs and promote economic development in distressed communities.",
        eligibility: {
            businessSize: "any",
            industry: ["manufacturing", "services", "retail"],
            location: "distressed-areas",
            stage: ["established"],
            demographics: "any"
        },
        deadline: "2024-04-30",
        matchScore: 0,
        applicationUrl: "https://www.eda.gov/funding/"
    },
    {
        id: 3,
        title: "USDA Rural Business Development Grant",
        agency: "Department of Agriculture",
        type: "Federal",
        amount: 25000,
        description: "Grants for small businesses in rural areas to support economic development and job creation.",
        eligibility: {
            businessSize: "small",
            industry: ["agriculture", "food", "manufacturing"],
            location: "rural",
            stage: ["startup", "established"],
            demographics: "any"
        },
        deadline: "2024-05-15",
        matchScore: 0,
        applicationUrl: "https://www.rd.usda.gov/programs-services/business-programs"
    },
    {
        id: 4,
        title: "Minority Business Enterprise Grant",
        agency: "State Economic Development",
        type: "State",
        amount: 15000,
        description: "Financial assistance for minority-owned businesses to expand operations and create jobs.",
        eligibility: {
            businessSize: "small",
            industry: ["any"],
            location: "state-specific",
            stage: ["startup", "established"],
            demographics: "minority"
        },
        deadline: "2024-06-01",
        matchScore: 0,
        applicationUrl: "https://www.sba.gov/funding-programs/grants"
    },
    {
        id: 5,
        title: "Women-Owned Small Business Grant",
        agency: "Small Business Administration",
        type: "Federal",
        amount: 30000,
        description: "Grants specifically for women-owned small businesses in various industries.",
        eligibility: {
            businessSize: "small",
            industry: ["technology", "services", "retail"],
            location: "nationwide",
            stage: ["startup", "established"],
            demographics: "women"
        },
        deadline: "2024-07-15",
        matchScore: 0,
        applicationUrl: "https://www.sba.gov/funding-programs/grants"
    },
    {
        id: 6,
        title: "Clean Energy Innovation Grant",
        agency: "Department of Energy",
        type: "Federal",
        amount: 100000,
        description: "Funding for businesses developing clean energy technologies and solutions.",
        eligibility: {
            businessSize: "any",
            industry: ["energy", "technology", "manufacturing"],
            location: "nationwide",
            stage: ["startup", "established"],
            demographics: "any"
        },
        deadline: "2024-08-30",
        matchScore: 0,
        applicationUrl: "https://www.energy.gov/funding-opportunities"
    },
    {
        id: 7,
        title: "Local Downtown Revitalization Grant",
        agency: "City Economic Development",
        type: "Local",
        amount: 10000,
        description: "Grants for businesses located in designated downtown revitalization areas.",
        eligibility: {
            businessSize: "small",
            industry: ["retail", "services", "hospitality"],
            location: "downtown-zones",
            stage: ["established"],
            demographics: "any"
        },
        deadline: "2024-09-15",
        matchScore: 0,
        applicationUrl: "https://www.cityeconomicdevelopment.gov/grants"
    },
    {
        id: 8,
        title: "Veteran-Owned Business Grant",
        agency: "Veterans Administration",
        type: "Federal",
        amount: 35000,
        description: "Financial support for businesses owned by military veterans.",
        eligibility: {
            businessSize: "small",
            industry: ["any"],
            location: "nationwide",
            stage: ["startup", "established"],
            demographics: "veteran"
        },
        deadline: "2024-10-01",
        matchScore: 0,
        applicationUrl: "https://www.va.gov/osdbu/"
    },
    {
        id: 9,
        title: "Technology Startup Accelerator Grant",
        agency: "National Science Foundation",
        type: "Federal",
        amount: 60000,
        description: "Grants for early-stage technology companies with high growth potential.",
        eligibility: {
            businessSize: "small",
            industry: ["technology", "software", "biotech"],
            location: "nationwide",
            stage: ["startup"],
            demographics: "any"
        },
        deadline: "2024-11-15",
        matchScore: 0,
        applicationUrl: "https://www.nsf.gov/funding/"
    },
    {
        id: 10,
        title: "Manufacturing Modernization Grant",
        agency: "Department of Commerce",
        type: "Federal",
        amount: 80000,
        description: "Support for manufacturing businesses to upgrade equipment and processes.",
        eligibility: {
            businessSize: "any",
            industry: ["manufacturing"],
            location: "nationwide",
            stage: ["established"],
            demographics: "any"
        },
        deadline: "2024-12-01",
        matchScore: 0,
        applicationUrl: "https://www.nist.gov/mep/grants"
    }
];

// AI-powered grant matching algorithm
function calculateGrantMatch(businessProfile, grant) {
    let score = 0;
    let maxScore = 0;

    // Business size matching (weight: 20%)
    maxScore += 20;
    if (grant.eligibility.businessSize === "any" || 
        grant.eligibility.businessSize === businessProfile.businessSize) {
        score += 20;
    } else if (grant.eligibility.businessSize === "small" && 
               businessProfile.employees <= 50) {
        score += 15;
    }

    // Industry matching (weight: 25%)
    maxScore += 25;
    if (grant.eligibility.industry.includes("any") || 
        grant.eligibility.industry.includes(businessProfile.industry)) {
        score += 25;
    } else {
        // Partial match for related industries
        const relatedIndustries = {
            "technology": ["software", "biotech", "manufacturing"],
            "healthcare": ["biotech", "services"],
            "manufacturing": ["technology", "energy"]
        };
        
        if (relatedIndustries[businessProfile.industry] && 
            relatedIndustries[businessProfile.industry].some(related => 
                grant.eligibility.industry.includes(related))) {
            score += 15;
        }
    }

    // Location matching (weight: 15%)
    maxScore += 15;
    if (grant.eligibility.location === "nationwide") {
        score += 15;
    } else if (grant.eligibility.location === businessProfile.location ||
               (grant.eligibility.location === "rural" && businessProfile.isRural) ||
               (grant.eligibility.location === "downtown-zones" && businessProfile.isDowntown)) {
        score += 15;
    }

    // Business stage matching (weight: 15%)
    maxScore += 15;
    if (grant.eligibility.stage.includes(businessProfile.stage)) {
        score += 15;
    }

    // Demographics matching (weight: 15%)
    maxScore += 15;
    if (grant.eligibility.demographics === "any" || 
        grant.eligibility.demographics === businessProfile.demographics) {
        score += 15;
    }

    // Revenue/funding need matching (weight: 10%)
    maxScore += 10;
    const fundingNeed = parseInt(businessProfile.fundingAmount);
    if (grant.amount >= fundingNeed * 0.5 && grant.amount <= fundingNeed * 2) {
        score += 10;
    } else if (grant.amount >= fundingNeed * 0.25) {
        score += 5;
    }

    return Math.round((score / maxScore) * 100);
}

// API Routes

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Get all grants
app.get('/api/grants', (req, res) => {
    res.json({
        success: true,
        count: grantsDatabase.length,
        grants: grantsDatabase
    });
});

// Submit business profile and get matched grants
app.post('/api/match-grants', (req, res) => {
    try {
        const businessProfile = req.body;
        
        // Validate required fields
        const requiredFields = ['businessName', 'industry', 'businessSize', 'location', 'stage'];
        const missingFields = requiredFields.filter(field => !businessProfile[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                error: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        // Calculate match scores for all grants
        const matchedGrants = grantsDatabase.map(grant => {
            const matchScore = calculateGrantMatch(businessProfile, grant);
            return {
                ...grant,
                matchScore
            };
        })
        .filter(grant => grant.matchScore >= 50) // Only return grants with 50%+ match
        .sort((a, b) => b.matchScore - a.matchScore) // Sort by match score descending
        .slice(0, 10); // Return top 10 matches

        res.json({
            success: true,
            businessProfile,
            matchCount: matchedGrants.length,
            matches: matchedGrants
        });

    } catch (error) {
        console.error('Error matching grants:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Get grant by ID
app.get('/api/grants/:id', (req, res) => {
    const grantId = parseInt(req.params.id);
    const grant = grantsDatabase.find(g => g.id === grantId);
    
    if (!grant) {
        return res.status(404).json({
            success: false,
            error: 'Grant not found'
        });
    }
    
    res.json({
        success: true,
        grant
    });
});

// Search grants
app.get('/api/search', (req, res) => {
    const { query, type, minAmount, maxAmount } = req.query;
    
    let filteredGrants = grantsDatabase;
    
    if (query) {
        const searchTerm = query.toLowerCase();
        filteredGrants = filteredGrants.filter(grant =>
            grant.title.toLowerCase().includes(searchTerm) ||
            grant.description.toLowerCase().includes(searchTerm) ||
            grant.agency.toLowerCase().includes(searchTerm)
        );
    }
    
    if (type) {
        filteredGrants = filteredGrants.filter(grant =>
            grant.type.toLowerCase() === type.toLowerCase()
        );
    }
    
    if (minAmount) {
        filteredGrants = filteredGrants.filter(grant =>
            grant.amount >= parseInt(minAmount)
        );
    }
    
    if (maxAmount) {
        filteredGrants = filteredGrants.filter(grant =>
            grant.amount <= parseInt(maxAmount)
        );
    }
    
    res.json({
        success: true,
        count: filteredGrants.length,
        grants: filteredGrants
    });
});

// Analytics endpoint
app.get('/api/analytics', (req, res) => {
    const analytics = {
        totalGrants: grantsDatabase.length,
        grantsByType: {
            federal: grantsDatabase.filter(g => g.type === 'Federal').length,
            state: grantsDatabase.filter(g => g.type === 'State').length,
            local: grantsDatabase.filter(g => g.type === 'Local').length
        },
        totalFunding: grantsDatabase.reduce((sum, grant) => sum + grant.amount, 0),
        averageAmount: Math.round(grantsDatabase.reduce((sum, grant) => sum + grant.amount, 0) / grantsDatabase.length),
        upcomingDeadlines: grantsDatabase
            .filter(grant => new Date(grant.deadline) > new Date())
            .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
            .slice(0, 5)
    };
    
    res.json({
        success: true,
        analytics
    });
});

// Serve frontend files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dashboard.html'));
});

app.get('/pricing', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pricing.html'));
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found'
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: 'Something went wrong!'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Grant Discovery Platform API running on port ${PORT}`);
    console.log(`📊 Database loaded with ${grantsDatabase.length} grants`);
    console.log(`🌐 Frontend available at http://localhost:${PORT}`);
});

module.exports = app;
