const axios = require('axios');
const axiosRetry = require('axios-retry');

// Add retry functionality to handle rate limits
axiosRetry(axios, {
    retries: 3, // Retry 3 times before failing
    retryDelay: (retryCount) => {
        console.log(`Retry attempt: ${retryCount}`);
        return retryCount * 1000; // Wait 1 second for the first retry, 2 seconds for the second, etc.
    },
    retryCondition: (error) => {
        return error.response && (error.response.status === 429 || error.response.status >= 500);
    }
});

// Function to fetch all Shopify products and return their SKUs
async function fetchShopifyProducts() {
    let allShopifyProducts = [];
    let nextPage = 1;
    const limit = 250;

    try {
        while (nextPage) {
            const shopifyUrl = `https://${process.env.SHOPIFY_API_KEY}:${process.env.SHOPIFY_PASSWORD}@${process.env.SHOPIFY_SHOP_NAME}.myshopify.com/admin/api/2024-10/products.json?limit=${limit}&page=${nextPage}`;
            const response = await axios.get(shopifyUrl);
            const products = response.data.products;

            if (products.length > 0) {
                allShopifyProducts = [...allShopifyProducts, ...products];
                nextPage++;
            } else {
                nextPage = null; // No more products to fetch
            }
        }
    } catch (error) {
        console.error('Error fetching products from Shopify:', error.message);
        throw error;
    }

    return allShopifyProducts;
}

module.exports = { fetchShopifyProducts, extractSKUsFromShopifyProducts, createShopifyProduct };
