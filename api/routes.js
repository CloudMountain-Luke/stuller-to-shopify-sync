const express = require('express');
const router = express.Router();
const { fetchStullerProducts } = require('../services/stullerService');
const { createShopifyProduct } = require('../services/shopifyService');

// Route to fetch all products from Stuller and sync to Shopify
router.get('/sync', async (req, res) => {
    console.log('Sync route accessed');

    try {
        let nextPage = null;
        let allStullerProducts = [];
        let page = 1;

        // Fetch all pages of Stuller products
        do {
            console.log(`Fetching page ${page} from Stuller...`);
            const stullerResponse = await fetchStullerProducts(nextPage);

            if (stullerResponse && stullerResponse.Products) {
                allStullerProducts = allStullerProducts.concat(stullerResponse.Products);
                nextPage = stullerResponse.NextPage;
            } else {
                nextPage = null;
            }

            page++;
        } while (nextPage);

        if (allStullerProducts.length === 0) {
            return res.status(404).json({ error: 'No products found on Stuller.' });
        }
        console.log(`Fetched ${allStullerProducts.length} products from Stuller`);

        const failedProducts = [];
        let successfulSyncs = 0;

        // Sync Stuller products to Shopify
        for (const product of allStullerProducts) {
            try {
                await createShopifyProduct(product);
                successfulSyncs++;
            } catch (error) {
                console.error(`Failed to sync product SKU: ${product.SKU}, error: ${error.message}`);
                failedProducts.push({ sku: product.SKU, error: error.message });
            }
        }

        res.json({
            message: 'Stuller products sync process completed!',
            syncedProducts: successfulSyncs,
            failedProducts: failedProducts.length ? failedProducts : 'None',
        });

    } catch (error) {
        console.error('Error syncing products:', error.message);
        res.status(500).json({ error: 'Failed to sync products due to an internal error.' });
    }
});

module.exports = router;
