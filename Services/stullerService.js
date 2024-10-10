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

// Headers for the request (including Basic Authentication)
const auth = Buffer.from(`${process.env.STULLER_API_USERNAME}:${process.env.STULLER_API_PASSWORD}`).toString('base64');
const headers = {
    'Authorization': `Basic ${auth}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
};

// Function to fetch matching Stuller products based on Shopify SKUs
async function fetchMatchingStullerProducts(shopifySKUs) {
    let nextPage = null;
    let matchingProducts = [];

    try {
        do {
            const body = {
                "Include": ["Default", "Media", "RingSizing"],
                "Filter": ["InStock", "Orderable"],
                "NextPage": nextPage,
                "PageSize": 500
            };

            console.log('Fetching page from Stuller API...');
            const response = await axios.post(process.env.STULLER_API_URL, body, { headers });
            const stullerProducts = response.data.Products;

            // Filter Stuller products by matching Shopify SKUs
            const matched = stullerProducts.filter(product => shopifySKUs.includes(product.SKU));
            matchingProducts = [...matchingProducts, ...matched];

            nextPage = response.data.NextPage;
        } while (nextPage);

    } catch (error) {
        console.error('Error fetching products from Stuller:', error.message);
        throw error;
    }

    return matchingProducts;
}

module.exports = { fetchMatchingStullerProducts };
