const express = require('express');
const router = express.Router();

// Mock payment processing (in production, integrate with Stripe)
const subscriptionPlans = {
    starter: {
        id: 'starter',
        name: 'Starter',
        price: 0,
        features: ['5 grant matches per month', 'Basic search filters', 'Email notifications'],
        limits: {
            monthlyMatches: 5,
            advancedFeatures: false
        }
    },
    professional: {
        id: 'professional',
        name: 'Professional',
        price: 29,
        features: ['Unlimited grant matches', 'Advanced filters', 'Priority support', 'Application templates'],
        limits: {
            monthlyMatches: -1, // unlimited
            advancedFeatures: true
        }
    },
    enterprise: {
        id: 'enterprise',
        name: 'Enterprise',
        price: 99,
        features: ['Everything in Professional', 'Dedicated account manager', 'Custom integrations', 'White-label options'],
        limits: {
            monthlyMatches: -1, // unlimited
            advancedFeatures: true,
            customIntegrations: true
        }
    }
};

// Mock user database (in production, use real database)
const users = new Map();

// Get subscription plans
router.get('/plans', (req, res) => {
    res.json({
        success: true,
        plans: Object.values(subscriptionPlans)
    });
});

// Create subscription
router.post('/subscribe', (req, res) => {
    try {
        const { email, planId, paymentMethod } = req.body;
        
        if (!email || !planId) {
            return res.status(400).json({
                success: false,
                error: 'Email and plan ID are required'
            });
        }
        
        const plan = subscriptionPlans[planId];
        if (!plan) {
            return res.status(400).json({
                success: false,
                error: 'Invalid plan ID'
            });
        }
        
        // Mock payment processing
        const subscription = {
            id: `sub_${Date.now()}`,
            userId: email,
            planId: planId,
            status: 'active',
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            createdAt: new Date()
        };
        
        // Store user subscription
        users.set(email, {
            email,
            subscription,
            usage: {
                monthlyMatches: 0,
                lastReset: new Date()
            }
        });
        
        res.json({
            success: true,
            subscription,
            message: 'Subscription created successfully'
        });
        
    } catch (error) {
        console.error('Subscription error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create subscription'
        });
    }
});

// Get user subscription
router.get('/subscription/:email', (req, res) => {
    const { email } = req.params;
    const user = users.get(email);
    
    if (!user) {
        return res.status(404).json({
            success: false,
            error: 'User not found'
        });
    }
    
    res.json({
        success: true,
        user
    });
});

// Update subscription
router.put('/subscription/:email', (req, res) => {
    const { email } = req.params;
    const { planId } = req.body;
    
    const user = users.get(email);
    if (!user) {
        return res.status(404).json({
            success: false,
            error: 'User not found'
        });
    }
    
    const plan = subscriptionPlans[planId];
    if (!plan) {
        return res.status(400).json({
            success: false,
            error: 'Invalid plan ID'
        });
    }
    
    // Update subscription
    user.subscription.planId = planId;
    user.subscription.updatedAt = new Date();
    
    users.set(email, user);
    
    res.json({
        success: true,
        subscription: user.subscription,
        message: 'Subscription updated successfully'
    });
});

// Cancel subscription
router.delete('/subscription/:email', (req, res) => {
    const { email } = req.params;
    const user = users.get(email);
    
    if (!user) {
        return res.status(404).json({
            success: false,
            error: 'User not found'
        });
    }
    
    // Cancel subscription
    user.subscription.status = 'cancelled';
    user.subscription.cancelledAt = new Date();
    
    users.set(email, user);
    
    res.json({
        success: true,
        message: 'Subscription cancelled successfully'
    });
});

// Check usage limits
router.post('/check-usage', (req, res) => {
    const { email, action } = req.body;
    
    const user = users.get(email) || {
        email,
        subscription: { planId: 'starter' },
        usage: { monthlyMatches: 0, lastReset: new Date() }
    };
    
    const plan = subscriptionPlans[user.subscription.planId];
    
    // Reset monthly usage if needed
    const now = new Date();
    const lastReset = new Date(user.usage.lastReset);
    if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
        user.usage.monthlyMatches = 0;
        user.usage.lastReset = now;
    }
    
    let canPerformAction = true;
    let message = '';
    
    if (action === 'grant_match') {
        if (plan.limits.monthlyMatches !== -1 && user.usage.monthlyMatches >= plan.limits.monthlyMatches) {
            canPerformAction = false;
            message = 'Monthly grant match limit reached. Please upgrade your plan.';
        } else {
            user.usage.monthlyMatches++;
        }
    }
    
    users.set(email, user);
    
    res.json({
        success: true,
        canPerformAction,
        message,
        usage: user.usage,
        limits: plan.limits
    });
});

// Webhook for payment processing (Stripe integration point)
router.post('/webhook', (req, res) => {
    // In production, verify webhook signature
    const event = req.body;
    
    switch (event.type) {
        case 'payment_intent.succeeded':
            console.log('Payment succeeded:', event.data.object);
            break;
        case 'subscription.updated':
            console.log('Subscription updated:', event.data.object);
            break;
        case 'subscription.deleted':
            console.log('Subscription cancelled:', event.data.object);
            break;
        default:
            console.log('Unhandled event type:', event.type);
    }
    
    res.json({ received: true });
});

module.exports = router;
