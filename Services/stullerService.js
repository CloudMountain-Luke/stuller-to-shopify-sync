const axios = require('axios');

// Define the category IDs you want to exclude (e.g., religious symbols)
const excludedCategoryIds = [7230, 712, 2441, 41512, 994, 11936];  // Replace with actual CategoryIds for religious symbols

// Headers for the request (without Authorization since Postman is handling it)
const headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

// Function to fetch Stuller products
async function fetchStullerProducts() {
  let nextPage = null;
  let allProducts = [];

  do {
    const body = {
      "Include": ["All"],  // Include all available product data
      "Filter": ["InStock", "Orderable"],  // Only fetch products that are in stock or orderable
      "CategoryIds": excludedCategoryIds.map(id => ({ "Not": id })),  // Exclude unwanted categories
      "NextPage": nextPage,
      "PageSize": 500  // Maximum page size allowed
    };

    try {
      const response = await axios.post(process.env.STULLER_API_URL, body, { headers });
      const data = response.data;
      allProducts = [...allProducts, ...data.Products];
      nextPage = data.NextPage;  // Update nextPage for pagination
    } catch (error) {
      // Detailed error logging
      if (error.response) {
        console.error('Error response from Stuller API:', error.response.status);
        console.error('Response data:', error.response.data);
        console.error('Response headers:', error.response.headers);
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error setting up request:', error.message);
      }

      throw new Error('Failed to fetch products from Stuller API');
    }
  } while (nextPage);

  return allProducts;
}

module.exports = { fetchStullerProducts };
