const express = require('express');
const dotenv = require('dotenv').config();
const bodyParser = require('body-parser');

const app = express();

// Middleware to capture raw body for Shopify signature verification
app.use(bodyParser.json({
    verify: (req, res, buf) => {
        req.rawBody = buf.toString();
    }
}));

// Middleware to parse JSON from request bodies
app.use(express.json());

// Import routes
let productRoutes, webhookRoutes;
try {
    productRoutes = require('./api/routes');  // Product sync routes
    webhookRoutes = require('./api/webhook'); // Webhook routes for Shopify
} catch (error) {
    console.error("Unable to load routes.", error);
    process.exit(1);
}

// Mount product and webhook routes
app.use('/api', productRoutes);
app.use('/api', webhookRoutes);  // Mounts webhook routes at /api/webhook/...

// Default route for server check
app.get('/', (req, res) => {
    res.send('Stuller to Shopify Sync Service is running');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
