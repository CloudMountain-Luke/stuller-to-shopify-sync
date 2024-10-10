const express = require('express');
const router = express.Router();

// Example webhook route (e.g., handling Shopify Order Creation webhook)
router.post('/webhook/orders/create', (req, res) => {
    try {
        const orderData = req.body;  // Process the incoming order data
        console.log('Received Shopify Order Webhook:', orderData);

        // Add your logic to handle the incoming webhook payload
        // Example: saving the order data to a database or triggering additional processes

        // Respond with a 200 status to confirm receipt of the webhook
        res.status(200).send('Webhook received');
    } catch (error) {
        console.error('Error handling webhook:', error);
        res.status(500).send('Webhook handling failed');
    }
});

module.exports = router;
