const axios = require('axios');

// Function to fetch products from Stuller based on specific categories
async function fetchStullerProducts(nextPage = null) {
    try {
        const username = process.env.STULLER_API_USERNAME;
        const password = process.env.STULLER_API_PASSWORD;
        const stullerApiUrl = process.env.STULLER_API_URL;

        // Create Basic Auth Token
        const authToken = Buffer.from(`${username}:${password}`).toString('base64');

        // List of category IDs you provided
        const categoryIds = [
            26405, 27274, 27270, 27273, 26462, 26442, 27874, 26443, 26407, 26406,
            26607, 27694, 26616, 26409, 27873, 26452, 26614, 26444, 26446, 26422,
            26445, 27872, 26421, 26666, 26447
        ];

        // Request body with filters
        const requestBody = nextPage
            ? { "NextPage": nextPage }
            : {
                "Include": ["All"],  // Include all necessary product details
                "Filter": ["Orderable", "OnPriceList"],  // Only include orderable and on price list products
                "CategoryIds": categoryIds  // Fetch only products in the specific categories you provided
            };

        // Make API request to Stuller
        const response = await axios.post(stullerApiUrl, requestBody, {
            headers: {
                'Authorization': `Basic ${authToken}`,
                'Content-Type': 'application/json'
            }
        });

        return response.data;  // Return the response (including NextPage, if available)
    } catch (error) {
        console.error('Error fetching products from Stuller:', error.message);
        throw error;
    }
}

module.exports = { fetchStullerProducts };
