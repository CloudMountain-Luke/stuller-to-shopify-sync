const axios = require('axios');

// Headers for Stuller API authentication
const auth = Buffer.from(`${process.env.STULLER_API_USERNAME}:${process.env.STULLER_API_PASSWORD}`).toString('base64');
const headers = {
  'Authorization': `Basic ${auth}`,
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

// Fetch product details by SKU or product ID
async function fetchProductDetails(productSKU) {
  try {
    const response = await axios.post(`${process.env.STULLER_API_URL}/product`, {
      "Include": ["Default", "Media", "RingSizing"],
      "Filter": ["InStock", "Orderable"],
      "ProductCodes": [productSKU]
    }, { headers });
    
    if (response.data.Products && response.data.Products.length > 0) {
      return response.data.Products[0]; // Returning the first matching product
    } else {
      throw new Error('Product not found.');
    }
  } catch (error) {
    console.error('Error fetching product details:', error.message);
    throw error;
  }
}

module.exports = { fetchProductDetails };
