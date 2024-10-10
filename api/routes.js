const express = require('express');
const router = express.Router();

// Import existing and new services
const { fetchMatchingStullerProducts } = require('../services/stullerService');
const { fetchShopifyProducts, extractSKUsFromShopifyProducts, createShopifyProduct } = require('../services/shopifyService');
const { fetchProductDetails } = require('../services/productService');
const { fetchProductConfiguration } = require('../services/productConfigService');
const { createVirtualProduct } = require('../services/virtualProductService');
const { fetchGemDetails } = require('../services/gemService');
const { placeOrder } = require('../services/orderService');
const { fetchInvoice } = require('../services/invoiceService');

// Refined Route to fetch products from Stuller and sync to Shopify based on Shopify SKUs
router.get('/sync', async (req, res) => {
    console.log('Sync route accessed');

    try {
        // Step 1: Fetch all Shopify products and extract SKUs
        const shopifyProducts = await fetchShopifyProducts();
        if (!shopifyProducts || shopifyProducts.length === 0) {
            return res.status(404).json({ error: 'No products found on Shopify.' });
        }
        const shopifySKUs = extractSKUsFromShopifyProducts(shopifyProducts);
        console.log(`Fetched ${shopifySKUs.length} SKUs from Shopify`);

        // Step 2: Fetch matching Stuller products based on Shopify SKUs
        const stullerProducts = await fetchMatchingStullerProducts(shopifySKUs);
        if (!stullerProducts || stullerProducts.length === 0) {
            return res.status(404).json({ error: 'No matching products found on Stuller.' });
        }
        console.log(`Fetched ${stullerProducts.length} matching products from Stuller`);

        const failedProducts = [];
        let successfulSyncs = 0;

        // Step 3: Sync Stuller products to Shopify in batches
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

// Route to fetch product configuration by SKU
router.get('/product/config/:sku', async (req, res) => {
    const sku = req.params.sku;
    try {
        const configDetails = await fetchProductConfiguration(sku);
        res.json(configDetails);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch product configuration.' });
    }
});

// Route to create a virtual product
router.post('/product/virtual', async (req, res) => {
    const productDetails = req.body;
    try {
        const virtualProduct = await createVirtualProduct(productDetails);
        res.json(virtualProduct);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create virtual product.' });
    }
});

// Route to fetch gem details
router.get('/gem/:gemCode', async (req, res) => {
    const gemCode = req.params.gemCode;
    try {
        const gemDetails = await fetchGemDetails(gemCode);
        res.json(gemDetails);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch gem details.' });
    }
});

// Route to place an order
router.post('/order', async (req, res) => {
    const orderDetails = req.body;
    try {
        const orderResponse = await placeOrder(orderDetails);
        res.json(orderResponse);
    } catch (error) {
        res.status(500).json({ error: 'Failed to place order.' });
    }
});

// Route to fetch invoice details by order number
router.get('/invoice/:orderNumber', async (req, res) => {
    const orderNumber = req.params.orderNumber;
    try {
        const invoiceDetails = await fetchInvoice(orderNumber);
        res.json(invoiceDetails);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch invoice details.' });
    }
});

module.exports = router;
