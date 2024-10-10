const express = require('express');
const router = express.Router();
const { fetchStullerProducts } = require('../services/stullerService');
const { syncProductWithShopify, checkShopifyProductBySKU } = require('../services/shopifyService');

// Route to fetch products from Stuller and sync with Shopify
router.get('/sync', async (req, res) => {
    console.log('Sync route accessed');

    try {
        let nextPage = null;
        let totalSynced = 0;
        let totalSkipped = 0;
        let page = 1;
        const maxBatchSize = 250; // Maximum number of products per batch
        const maxBatchesBeforeNextPage = 2; // Fetch next page after 2 batches

        // Keep fetching pages from Stuller
        do {
            console.log(`Fetching page ${page} from Stuller...`);
            const stullerResponse = await fetchStullerProducts(nextPage);

            if (!stullerResponse || !stullerResponse.Products) {
                console.log('No products found on this page.');
                nextPage = null; // Stop if no products
                continue;
            }

            const stullerProducts = stullerResponse.Products;
            nextPage = stullerResponse.NextPage; // Get the next page token for pagination
            let batchCount = 0;

            // Split products into batches of 250 and sync them
            for (let i = 0; i < stullerProducts.length; i += maxBatchSize) {
                const productBatch = stullerProducts.slice(i, i + maxBatchSize);
                let successfulSyncs = 0;
                let skippedProducts = 0;

                console.log(`Processing batch of ${productBatch.length} products...`);

                // Iterate over the batch of products
                for (const stullerProduct of productBatch) {
                    const shopifyProduct = await checkShopifyProductBySKU(stullerProduct.SKU);

                    if (shopifyProduct) {
                        // If product exists on Shopify, sync it
                        await syncProductWithShopify(stullerProduct, shopifyProduct);
                        successfulSyncs++;
                    } else {
                        // Log the skipped product, no error
                        console.log(`Skipping product with SKU: ${stullerProduct.SKU} (not found on Shopify)`);
                        skippedProducts++;
                    }
                }

                totalSynced += successfulSyncs;
                totalSkipped += skippedProducts;
                batchCount++;

                // Fetch next Stuller page after two batches
                if (batchCount >= maxBatchesBeforeNextPage) {
                    console.log(`Fetched and processed ${batchCount} batches. Fetching next Stuller page...`);
                    break; // Stop processing this page and fetch the next one
                }
            }

            page++;
        } while (nextPage);

        res.json({
            message: 'Stuller products sync process completed!',
            syncedProducts: totalSynced,
            skippedProducts: totalSkipped,
        });

    } catch (error) {
        console.error('Error syncing products:', error.message);
        res.status(500).json({ error: 'Failed to sync products due to an internal error.' });
    }
});

module.exports = router;
