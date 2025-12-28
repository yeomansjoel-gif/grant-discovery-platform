# Grant Discovery Platform - Deployment Guide

## 🚀 Production Deployment Options

### Option 1: Vercel (Recommended for MVP)

#### Why Vercel?
- **Zero Configuration**: Automatic builds and deployments
- **Global CDN**: Fast worldwide performance
- **Serverless Functions**: Automatic scaling
- **Free Tier**: Perfect for initial launch
- **GitHub Integration**: Automatic deployments on push

#### Deployment Steps

1. **Install Vercel CLI**
```bash
npm i -g vercel
Login to Vercel
vercel login
Deploy from Repository Root
vercel --prod
Configure Environment Variables
vercel env add NODE_ENV production
vercel env add PORT 3000
Vercel Configuration (vercel.json)
{
  "version": 2,
  "name": "grant-discovery-platform",
  "builds": [
    {
      "src": "backend/server.js",
      "use": "@vercel/node"
    },
    {
      "src": "frontend/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/backend/server.js"
    },
    {
      "src": "/(.*\\.(css|js|png|jpg|jpeg|gif|svg|ico))",
      "dest": "/frontend/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/frontend/index.html"
    }
  ]
}
Option 2: Netlify (Alternative Static Hosting)
Deployment Steps
Connect GitHub Repository
Go to netlify.com
Click "New site from Git"
Connect your GitHub repository
Build Settings
Build command: npm run build
Publish directory: frontend
Node version: 16
Environment Variables
Go to Site settings → Environment variables
Add production environment variables
Netlify Configuration (netlify.toml)
[build]
  publish = "frontend"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "16"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
Option 3: Heroku (Full-Stack Hosting)
Deployment Steps
Install Heroku CLI
# macOS
brew tap heroku/brew && brew install heroku

# Windows
# Download from heroku.com
Login and Create App
heroku login
heroku create your-app-name
Configure Environment Variables
heroku config:set NODE_ENV=production
heroku config:set PORT=3000
Deploy
git push heroku main
Heroku Configuration (Procfile)
web: node backend/server.js
Option 4: DigitalOcean App Platform
Deployment Steps
Create App
Go to DigitalOcean App Platform
Connect GitHub repository
Configure Build
Build command: npm install && npm run build
Run command: npm start
Environment Variables
Add in App Platform dashboard
🔧 Environment Configuration
Production Environment Variables
Create .env.production file:

# Server Configuration
NODE_ENV=production
PORT=3000

# Database Configuration
DATABASE_URL=your_database_url_here
REDIS_URL=your_redis_url_here

# API Keys
GRANTS_GOV_API_KEY=your_grants_gov_api_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# Security
JWT_SECRET=your_jwt_secret_here
SESSION_SECRET=your_session_secret_here

# External Services
SENDGRID_API_KEY=your_sendgrid_api_key
GOOGLE_ANALYTICS_ID=your_ga_id_here

# Monitoring
SENTRY_DSN=your_sentry_dsn_here
Security Configuration
SSL/HTTPS Setup
// In server.js for production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}
CORS Configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com', 'https://www.yourdomain.com']
    : ['http://localhost:3000'],
  credentials: true
};

app.use(cors(corsOptions));
📊 Database Setup
Option 1: PostgreSQL (Recommended for Scale)
Heroku Postgres
heroku addons:create heroku-postgresql:hobby-dev
DigitalOcean Managed Database
Create PostgreSQL cluster
Add connection string to environment variables
Database Migration
// migrations/001_initial_schema.sql
CREATE TABLE grants (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  agency VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  amount INTEGER NOT NULL,
  description TEXT,
  eligibility JSONB,
  deadline DATE,
  application_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  subscription_plan VARCHAR(50) DEFAULT 'starter',
  subscription_status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE grant_matches (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  grant_id INTEGER REFERENCES grants(id),
  match_score INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
Option 2: MongoDB Atlas (NoSQL Alternative)
Setup Steps
Create MongoDB Atlas account
Create cluster
Add connection string to environment variables
Schema Design
// Grant Schema
{
  _id: ObjectId,
  title: String,
  agency: String,
  type: String,
  amount: Number,
  description: String,
  eligibility: {
    businessSize: String,
    industry: [String],
    location: String,
    stage: [String],
    demographics: String
  },
  deadline: Date,
  applicationUrl: String,
  createdAt: Date,
  updatedAt: Date
}
🔍 Monitoring & Analytics
Application Monitoring
Sentry Error Tracking
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
Health Check Endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version
  });
});
Performance Monitoring
New Relic Integration
npm install newrelic
// At the top of server.js
require('newrelic');
Custom Metrics
const metrics = {
  grantMatches: 0,
  apiCalls: 0,
  errors: 0
};

app.use((req, res, next) => {
  metrics.apiCalls++;
  next();
});
🔒 Security Hardening
Security Headers
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
Rate Limiting
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

app.use('/api/', limiter);
Input Validation
const { body, validationResult } = require('express-validator');

app.post('/api/match-grants', [
  body('businessName').isLength({ min: 1 }).trim().escape(),
  body('industry').isIn(['technology', 'healthcare', 'manufacturing', 'services']),
  body('businessSize').isIn(['small', 'medium', 'large']),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // Process request
});
📈 Performance Optimization
Caching Strategy
Redis Setup
# Heroku Redis
heroku addons:create heroku-redis:hobby-dev
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);

// Cache grant data
app.get('/api/grants', async (req, res) => {
  const cacheKey = 'grants:all';
  const cached = await client.get(cacheKey);
  
  if (cached) {
    return res.json(JSON.parse(cached));
  }
  
  const grants = await getGrantsFromDatabase();
  await client.setex(cacheKey, 3600, JSON.stringify(grants)); // Cache for 1 hour
  res.json(grants);
});
CDN Configuration
// Static asset caching
app.use(express.static('frontend', {
  maxAge: '1y',
  etag: false
}));
Database Optimization
Indexing Strategy
-- PostgreSQL indexes
CREATE INDEX idx_grants_type ON grants(type);
CREATE INDEX idx_grants_industry ON grants USING GIN((eligibility->'industry'));
CREATE INDEX idx_grants_deadline ON grants(deadline);
CREATE INDEX idx_users_email ON users(email);
Query Optimization
// Efficient grant matching query
const matchGrants = async (businessProfile) => {
  const query = `
    SELECT * FROM grants 
    WHERE 
      (eligibility->>'businessSize' = $1 OR eligibility->>'businessSize' = 'any')
      AND eligibility->'industry' ? $2
      AND deadline > NOW()
    ORDER BY amount DESC
    LIMIT 50
  `;
  
  return await db.query(query, [businessProfile.businessSize, businessProfile.industry]);
};
🔄 CI/CD Pipeline
GitHub Actions Workflow
Create .github/workflows/deploy.yml:

name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'
    - name: Install dependencies
      run: cd backend && npm install
    - name: Run tests
      run: cd backend && npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        vercel-args: '--prod'
Automated Testing
// tests/api.test.js
const request = require('supertest');
const app = require('../backend/server');

describe('Grant API', () => {
  test('GET /api/grants returns grants', async () => {
    const response = await request(app)
      .get('/api/grants')
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(response.body.grants).toBeDefined();
  });

  test('POST /api/match-grants returns matches', async () => {
    const businessProfile = {
      businessName: 'Test Business',
      industry: 'technology',
      businessSize: 'small'
    };

    const response = await request(app)
      .post('/api/match-grants')
      .send(businessProfile)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.matches).toBeDefined();
  });
});
📱 Domain & DNS Setup
Domain Configuration
Purchase Domain
Recommended: Namecheap, Google Domains, or Cloudflare
DNS Configuration
Type    Name    Value
A       @       your-server-ip
CNAME   www     your-domain.com
CNAME   api     your-api-endpoint.com
SSL Certificate
Most hosting providers include free SSL
Alternative: Let's Encrypt for custom servers
Custom Domain Setup
Vercel
vercel domains add yourdomain.com
vercel domains add www.yourdomain.com
Netlify
Go to Domain settings
Add custom domain
Configure DNS records
🚨 Backup & Recovery
Database Backups
Automated Backups
# PostgreSQL backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > backup_$DATE.sql
aws s3 cp backup_$DATE.sql s3://your-backup-bucket/
Backup Schedule
Daily: Automated database backups
Weekly: Full application backup
Monthly: Archive old backups
Disaster Recovery Plan
RTO (Recovery Time Objective): 4 hours
RPO (Recovery Point Objective): 1 hour
Backup Locations: Multiple geographic regions
Recovery Testing: Monthly recovery drills
Your Grant Discovery Platform is now ready for production deployment! 🚀
