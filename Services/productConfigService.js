const axios = require('axios');

// Fetch product configuration based on SKU
async function fetchProductConfiguration(sku) {
  try {
    const response = await axios.post(`${process.env.STULLER_API_URL}/product/config`, {
      "ProductCode": sku
    }, { headers });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching product configuration:', error.message);
    throw error;
  }
}

module.exports = { fetchProductConfiguration };
