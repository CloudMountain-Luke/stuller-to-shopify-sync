const axios = require('axios');

// Create a virtual product representation
async function createVirtualProduct(productDetails) {
  try {
    const response = await axios.post(`${process.env.STULLER_API_URL}/product/virtual`, productDetails, { headers });
    return response.data;
  } catch (error) {
    console.error('Error creating virtual product:', error.message);
    throw error;
  }
}

module.exports = { createVirtualProduct };
