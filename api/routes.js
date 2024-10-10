const express = require('express');
const router = express.Router();
const { fetchStullerProducts } = require('../services/stullerService');
const { syncProductWithShopify, checkShopifyProductBySKU } = require('../services/shopifyService');

// Route to fetch products from Stuller by category and sync with Shopify
router.get('/sync', async (req, res) => {
    console.log('Sync route accessed');

    try {
        let totalSynced = 0;
        let totalSkipped = 0;
        const maxBatchSize = 250;  // Maximum number of products per batch
        const maxBatchesBeforeNextPage = 2;  // Fetch next page after 2 batches

        // We'll loop through each category, fetching all pages for each
        let categoriesProcessed = 0;
        let categoryIds = [
            26405, 27274, 27270, 27273, 26462, 26442, 27874, 26443, 26407, 26406,
            26607, 27694, 26616, 26409, 27873, 26452, 26614, 26444, 26446, 26422,
            26445, 27872, 26421, 26666, 26447
        ];

        for (const categoryId of categoryIds) {
            console.log(`Processing category: ${categoryId}`);
            let nextPage = null;
            let page = 1;

            // Fetch all pages for the current category
            do {
                console.log(`Fetching page ${page} for category ${categoryId}...`);
                const stullerResponse = await fetchStullerProducts(nextPage);

                if (!stullerResponse || !stullerResponse.Products) {
                    console.log(`No products found on page ${page} for category ${categoryId}.`);
                    break;  // Stop if no products are found
                }

                const stullerProducts = stullerResponse.Products;
                nextPage = stullerResponse.NextPage;  // Get the next page token for pagination
                let batchCount = 0;

                // Process products in batches
                for (let i = 0; i < stullerProducts.length; i += maxBatchSize) {
                    const productBatch = stullerProducts.slice(i, i + maxBatchSize);
                    let successfulSyncs = 0;
                    let skippedProducts = 0;

                    console.log(`Processing batch of ${productBatch.length} products for category ${categoryId}...`);

                    // Sync each product in the batch
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

                    // Fetch the next Stuller page after processing two batches
                    if (batchCount >= maxBatchesBeforeNextPage) {
                        console.log(`Processed ${batchCount} batches for category ${categoryId}. Fetching next page...`);
                        break;  // Stop processing this page and fetch the next one
                    }
                }

                page++;
            } while (nextPage);

            categoriesProcessed++;
            console.log(`Completed syncing category ${categoryId}. Total categories processed: ${categoriesProcessed}`);
        }

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
