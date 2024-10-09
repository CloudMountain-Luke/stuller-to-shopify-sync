const express = require('express');
const router = express.Router();
const { fetchStullerProducts } = require('../Services/stullerService');  // Ensure this matches the actual path
const { createShopifyProduct } = require('../services/shopifyService');

// Route to fetch products from Stuller and sync to Shopify
router.get('/sync', async (req, res) => {
    console.log('Sync route accessed'); // Log for debugging

    try {
        const stullerProducts = await fetchStullerProducts();
        console.log(`Fetched ${stullerProducts.length} products from Stuller`);

        const failedProducts = [];
        let successfulSyncs = 0;

        // Sync each product with Shopify
        for (const product of stullerProducts) {
            try {
                await createShopifyProduct(product);
                successfulSyncs++;
            } catch (error) {
                console.error(`Failed to sync product SKU: ${product.SKU}, error: ${error.message}`);
                failedProducts.push(product.SKU); // Track failed products
            }
        }

        // Response summary
        res.json({
            message: 'Stuller products sync process completed!',
            syncedProducts: successfulSyncs,
            failedProducts: failedProducts.length ? failedProducts : 'None',
        });

    } catch (error) {
        console.error('Error fetching products from Stuller:', error.message);
        res.status(500).json({ error: 'Failed to fetch products from Stuller.' });
    }
});

module.exports = router;
