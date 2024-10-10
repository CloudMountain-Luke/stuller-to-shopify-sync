const axios = require('axios');

// Function to fetch products from Stuller
async function fetchStullerProducts(nextPage = null) {
  try {
    const username = process.env.STULLER_API_USERNAME;
    const password = process.env.STULLER_API_PASSWORD;
    const stullerApiUrl = process.env.STULLER_API_URL;

    // Create Basic Auth Token
    const authToken = Buffer.from(`${username}:${password}`).toString('base64');

    // Request body
    const requestBody = nextPage
      ? { "NextPage": nextPage }
      : {
          "Include": ["All"],
          "Filter": ["Orderable", "OnPriceList"]
        };

    // Make API request
    const response = await axios.post(stullerApiUrl, requestBody, {
      headers: {
        'Authorization': `Basic ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data; // Return the response (including NextPage, if available)
  } catch (error) {
    console.error('Error fetching products from Stuller:', error.message);
    throw error;
  }
}

module.exports = { fetchStullerProducts };
