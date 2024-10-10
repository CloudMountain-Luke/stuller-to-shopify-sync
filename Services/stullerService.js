const axios = require('axios');

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
