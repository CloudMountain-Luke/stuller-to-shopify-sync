const express = require('express');
const router = express.Router();

// Import existing and new services
const { fetchStullerProducts } = require('../services/stullerService');
const { createShopifyProduct } = require('../services/shopifyService');
const { fetchProductDetails } = require('../services/productService');
const { fetchProductConfiguration } = require('../services/productConfigService');
const { createVirtualProduct } = require('../services/virtualProductService');
const { fetchGemDetails } = require('../services/gemService');
const { placeOrder } = require('../services/orderService');
const { fetchInvoice } = require('../services/invoiceService');

// Refined Route to fetch all Stuller products and sync to Shopify
router.get('/sync', async (req, res) => {
    console.log('Sync route accessed');

    try {
        // Step 1: Fetch all Stuller products
        const stullerProducts = await fetchStullerProducts();
        if (!stullerProducts || stullerProducts.length === 0) {
            return res.status(404).json({ error: 'No products found on Stuller.' });
        }

        console.log(`Fetched ${stullerProducts.length} products from Stuller`);

        const failedProducts = [];
        let successfulSyncs = 0;

        // Step 2: Sync Stuller products to Shopify in batches
        for (const product of stullerProducts) {
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

// Route to fetch product details from Stuller by SKU
router.get('/product/:sku', async (req, res) => {
    const sku = req.params.sku;
    try {
        const productDetails = await fetchProductDetails(sku);
        res.json(productDetails);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch product details.' });
    }
});

// Other routes omitted for brevity...

module.exports = router;
