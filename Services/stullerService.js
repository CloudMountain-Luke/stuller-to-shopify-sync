const axios = require('axios');

// Function to fetch products from Stuller using the Product API
async function fetchStullerProducts() {
  const baseUrl = process.env.STULLER_API_URL; // Example: "https://api.stuller.com/v2/products"
  const authToken = process.env.STULLER_API_TOKEN; // Base64 encoded token

  let products = [];
  let nextPage = null;

  do {
    try {
      // Build request body
      const requestBody = nextPage
        ? { NextPage: nextPage }
        : { Include: ["All"], Filter: ["Orderable", "OnPriceList"], Limit: 500 };

      const response = await axios.post(
        baseUrl,
        requestBody,
        {
          headers: {
            'Authorization': `Basic ${authToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          }
        }
      );

      const responseData = response.data;
      if (responseData && responseData.Products) {
        products = [...products, ...responseData.Products];
        nextPage = responseData.NextPage;
      } else {
        break; // No more products
      }

    } catch (error) {
      console.error('Error fetching products from Stuller:', error.message);
      throw error;
    }

  } while (nextPage !== null); // Keep requesting while there's a next page

  return products;
}

module.exports = { fetchStullerProducts };
