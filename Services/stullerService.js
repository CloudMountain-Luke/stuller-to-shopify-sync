const axios = require('axios');
require('dotenv').config(); // To load environment variables from .env

// Function to fetch products from Stuller
async function fetchStullerProducts() {
    try {
        const response = await axios.get(process.env.STULLER_API_URL, {
            headers: {
                'Authorization': `Bearer ${process.env.STULLER_API_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data.products; // Assuming the response has a "products" key
    } catch (error) {
        console.error('Error fetching products from Stuller:', error.message);
        throw error;
    }
}

module.exports = { fetchStullerProducts };
