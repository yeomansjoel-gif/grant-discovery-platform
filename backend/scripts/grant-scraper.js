const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Grant data sources configuration
const dataSources = {
    grantsGov: {
        url: 'https://www.grants.gov/web/grants/search-grants.html',
        apiKey: process.env.GRANTS_GOV_API_KEY,
        enabled: false // Enable when API key is available
    },
    sba: {
        url: 'https://www.sba.gov/funding-programs/grants',
        enabled: true
    },
    usda: {
        url: 'https://www.rd.usda.gov/programs-services/business-programs',
        enabled: true
    }
};

// Mock grant data for demonstration
const mockGrantData = [
    {
        title: "Advanced Manufacturing Technology Grant",
        agency: "Department of Commerce",
        type: "Federal",
        amount: 125000,
        description: "Funding for manufacturers adopting advanced technologies like AI, robotics, and IoT.",
        eligibility: {
            businessSize: "any",
            industry: ["manufacturing", "technology"],
            location: "nationwide",
            stage: ["established"],
            demographics: "any"
        },
        deadline: "2024-12-15",
        source: "commerce.gov",
        lastUpdated: new Date().toISOString()
    },
    {
        title: "Rural Healthcare Innovation Grant",
        agency: "Health and Human Services",
        type: "Federal",
        amount: 40000,
        description: "Support for healthcare businesses serving rural communities with innovative solutions.",
        eligibility: {
            businessSize: "small",
            industry: ["healthcare", "technology"],
            location: "rural",
            stage: ["startup", "established"],
            demographics: "any"
        },
        deadline: "2025-01-30",
        source: "hhs.gov",
        lastUpdated: new Date().toISOString()
    },
    {
        title: "Green Business Certification Grant",
        agency: "Environmental Protection Agency",
        type: "Federal",
        amount: 20000,
        description: "Grants for businesses implementing sustainable practices and green certifications.",
        eligibility: {
            businessSize: "small",
            industry: ["any"],
            location: "nationwide",
            stage: ["established"],
            demographics: "any"
        },
        deadline: "2025-02-28",
        source: "epa.gov",
        lastUpdated: new Date().toISOString()
    },
    {
        title: "Cybersecurity Enhancement Grant",
        agency: "Department of Homeland Security",
        type: "Federal",
        amount: 75000,
        description: "Funding for small businesses to improve cybersecurity infrastructure and training.",
        eligibility: {
            businessSize: "small",
            industry: ["technology", "services", "healthcare"],
            location: "nationwide",
            stage: ["established"],
            demographics: "any"
        },
        deadline: "2025-03-15",
        source: "dhs.gov",
        lastUpdated: new Date().toISOString()
    },
    {
        title: "Export Development Grant",
        agency: "International Trade Administration",
        type: "Federal",
        amount: 35000,
        description: "Support for businesses looking to expand into international markets.",
        eligibility: {
            businessSize: "small",
            industry: ["manufacturing", "services", "technology"],
            location: "nationwide",
            stage: ["established"],
            demographics: "any"
        },
        deadline: "2025-04-01",
        source: "trade.gov",
        lastUpdated: new Date().toISOString()
    }
];

class GrantScraper {
    constructor() {
        this.grants = [];
        this.lastUpdate = null;
    }

    async scrapeAllSources() {
        console.log('🔍 Starting grant data collection...');
        
        try {
            // In production, implement actual scraping logic
            // For now, use mock data
            await this.loadMockData();
            
            // Save to file
            await this.saveGrantData();
            
            console.log(`✅ Successfully collected ${this.grants.length} grants`);
            return this.grants;
            
        } catch (error) {
            console.error('❌ Error during grant scraping:', error);
            throw error;
        }
    }

    async loadMockData() {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        this.grants = [...mockGrantData];
        this.lastUpdate = new Date();
    }

    async scrapeGrantsGov() {
        if (!dataSources.grantsGov.enabled) {
            console.log('⏭️  Grants.gov scraping disabled (API key required)');
            return [];
        }

        try {
            // Implementation for Grants.gov API
            // This would require API key and proper authentication
            console.log('🔍 Scraping Grants.gov...');
            
            const response = await axios.get(dataSources.grantsGov.url, {
                headers: {
                    'Authorization': `Bearer ${dataSources.grantsGov.apiKey}`
                }
            });
            
            // Parse and format grant data
            return this.parseGrantsGovData(response.data);
            
        } catch (error) {
            console.error('Error scraping Grants.gov:', error.message);
            return [];
        }
    }

    async scrapeSBA() {
        try {
            console.log('🔍 Scraping SBA grants...');
            
            // In production, implement web scraping or API integration
            // For now, return mock SBA data
            return [
                {
                    title: "SBA Community Advantage Grant",
                    agency: "Small Business Administration",
                    type: "Federal",
                    amount: 45000,
                    description: "Grants for businesses in underserved communities.",
                    eligibility: {
                        businessSize: "small",
                        industry: ["any"],
                        location: "underserved-areas",
                        stage: ["startup", "established"],
                        demographics: "any"
                    },
                    deadline: "2025-05-15",
                    source: "sba.gov",
                    lastUpdated: new Date().toISOString()
                }
            ];
            
        } catch (error) {
            console.error('Error scraping SBA:', error.message);
            return [];
        }
    }

    async scrapeUSDA() {
        try {
            console.log('🔍 Scraping USDA grants...');
            
            // Mock USDA data
            return [
                {
                    title: "USDA Value-Added Producer Grant",
                    agency: "Department of Agriculture",
                    type: "Federal",
                    amount: 55000,
                    description: "Grants for agricultural businesses adding value to their products.",
                    eligibility: {
                        businessSize: "small",
                        industry: ["agriculture", "food"],
                        location: "rural",
                        stage: ["established"],
                        demographics: "any"
                    },
                    deadline: "2025-06-30",
                    source: "usda.gov",
                    lastUpdated: new Date().toISOString()
                }
            ];
            
        } catch (error) {
            console.error('Error scraping USDA:', error.message);
            return [];
        }
    }

    parseGrantsGovData(data) {
        // Implementation for parsing Grants.gov API response
        // This would depend on the actual API structure
        return [];
    }

    async saveGrantData() {
        const dataDir = path.join(__dirname, '../data');
        
        // Create data directory if it doesn't exist
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        
        const filePath = path.join(dataDir, 'grants.json');
        const data = {
            lastUpdated: this.lastUpdate,
            count: this.grants.length,
            grants: this.grants
        };
        
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        console.log(`💾 Grant data saved to ${filePath}`);
    }

    async loadGrantData() {
        const filePath = path.join(__dirname, '../data/grants.json');
        
        if (fs.existsSync(filePath)) {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            this.grants = data.grants || [];
            this.lastUpdate = new Date(data.lastUpdated);
            console.log(`📂 Loaded ${this.grants.length} grants from cache`);
            return this.grants;
        }
        
        return [];
    }

    shouldUpdate() {
        if (!this.lastUpdate) return true;
        
        const hoursSinceUpdate = (Date.now() - this.lastUpdate.getTime()) / (1000 * 60 * 60);
        return hoursSinceUpdate >= 24; // Update every 24 hours
    }

    async getGrants(forceUpdate = false) {
        if (forceUpdate || this.shouldUpdate()) {
            return await this.scrapeAllSources();
        } else {
            return await this.loadGrantData();
        }
    }
}

// Export for use in main server
module.exports = GrantScraper;

// CLI usage
if (require.main === module) {
    const scraper = new GrantScraper();
    
    scraper.scrapeAllSources()
        .then(grants => {
            console.log(`\n🎉 Grant scraping completed!`);
            console.log(`📊 Total grants collected: ${grants.length}`);
            console.log(`⏰ Last updated: ${new Date().toISOString()}`);
        })
        .catch(error => {
            console.error('❌ Grant scraping failed:', error);
            process.exit(1);
        });
}
