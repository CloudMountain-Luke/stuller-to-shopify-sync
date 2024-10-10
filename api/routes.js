const express = require('express');
const router = express.Router();
const { fetchMatchingStullerProducts } = require('../services/stullerService');
const { fetchShopifyProducts, extractSKUsFromShopifyProducts, createShopifyProduct } = require('../services/shopifyService');

// Route to fetch products from Stuller and sync to Shopify based on Shopify SKUs
router.get('/sync', async (req, res) => {
    console.log('Sync route accessed');

    try {
        // Step 1: Fetch all Shopify products and extract SKUs
        const shopifyProducts = await fetchShopifyProducts();
        const shopifySKUs = extractSKUsFromShopifyProducts(shopifyProducts);
        console.log(`Fetched ${shopifySKUs.length} SKUs from Shopify`);

        // Step 2: Fetch matching Stuller products based on Shopify SKUs
        const stullerProducts = await fetchMatchingStullerProducts(shopifySKUs);
        console.log(`Fetched ${stullerProducts.length} matching products from Stuller`);

        const failedProducts = [];
        let successfulSyncs = 0;

        // Step 3: Sync Stuller products to Shopify (can be skipped initially if focusing only on fetching data)
        for (const product of stullerProducts) {
            try {
                await createShopifyProduct(product);
                successfulSyncs++;
            } catch (error) {
                console.error(`Failed to sync product SKU: ${product.SKU}, error: ${error.message}`);
                failedProducts.push(product.SKU);
            }
        }

        res.json({
            message: 'Stuller products sync process completed!',
            syncedProducts: successfulSyncs,
            failedProducts: failedProducts.length ? failedProducts : 'None',
        });

    } catch (error) {
        console.error('Error syncing products:', error.message);
        res.status(500).json({ error: 'Failed to sync products.' });
    }
});

module.exports = router;
