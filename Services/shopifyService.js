const axios = require('axios');

// Function to check if a Shopify product exists by SKU
async function checkShopifyProductBySKU(stullerSKU) {
    try {
        const shopifyProductUrl = `https://${process.env.SHOPIFY_STORE_URL}/admin/api/2024-10/products.json?sku=${stullerSKU}`;
        const response = await axios.get(shopifyProductUrl, {
            headers: {
                'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN
            }
        });

        // If Shopify returns a product for this SKU, return the product data
        if (response.data.products.length > 0) {
            return response.data.products[0];
        }

        return null; // Product not found on Shopify
    } catch (error) {
        console.error(`Error fetching product with SKU ${stullerSKU} from Shopify:`, error.message);
        return null;
    }
}

// Function to sync a Stuller product with a Shopify product by SKU
async function syncProductWithShopify(stullerProduct, shopifyProduct) {
    try {
        const shopifyUpdateUrl = `https://${process.env.SHOPIFY_STORE_URL}/admin/api/2024-10/products/${shopifyProduct.id}.json`;

        // Build the product update payload (sync data from Stuller to Shopify)
        const updatedProductData = {
            product: {
                id: shopifyProduct.id,
                title: stullerProduct.Description, // Example: Update title
                variants: [{
                    id: shopifyProduct.variants[0].id,
                    price: stullerProduct.Price, // Example: Sync price
                    inventory_quantity: stullerProduct.QuantityOnHand, // Example: Sync inventory
                }]
            }
        };

        // Log the product data being sent to Shopify
        console.log('Sending product data to Shopify:', updatedProductData);

        // Make API request to update the product on Shopify
        await axios.put(shopifyUpdateUrl, updatedProductData, {
            headers: {
                'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN,
                'Content-Type': 'application/json'
            }
        });

        console.log(`Successfully synced product with SKU: ${stullerProduct.SKU}`);
    } catch (error) {
        console.error(`Error syncing product with SKU ${stullerProduct.SKU} to Shopify:`, error.message);
        throw error;
    }
}

module.exports = { checkShopifyProductBySKU, syncProductWithShopify };
