const express = require('express');
const router = express.Router();
const crypto = require('crypto');

// Middleware to verify Shopify webhook signature
function verifyShopifySignature(req, res, next) {
    try {
        const hmac = req.headers['x-shopify-hmac-sha256'];
        const generatedHash = crypto
            .createHmac('sha256', process.env.SHOPIFY_WEBHOOK_SECRET)
            .update(req.rawBody, 'utf8')
            .digest('base64');

        if (generatedHash !== hmac) {
            return res.status(401).send('Unauthorized webhook call');
        }

        next();
    } catch (error) {
        console.error('Error verifying Shopify signature:', error.message);
        res.status(400).send('Webhook verification failed');
    }
}

// Webhook route to handle incoming Shopify events (e.g., new orders)
router.post('/webhook', verifyShopifySignature, async (req, res) => {
    try {
        const orderData = req.body;

        console.log('Webhook Received - Order ID:', orderData.id);
        // Here you can add logic to handle order fulfillment with Stuller or another action

        res.status(200).send('Webhook received and processed successfully.');
    } catch (error) {
        console.error('Error handling Shopify webhook:', error.message);
        res.status(500).send('Error processing the webhook');
    }
});

module.exports = router;
