const axios = require('axios');

// Function to create a product in Shopify
async function createShopifyProduct(productData) {
  try {
    const shopifyCreateProductUrl = `https://${process.env.SHOPIFY_STORE_URL}/admin/api/2024-10/products.json`;

    const response = await axios.post(
      shopifyCreateProductUrl,
      { product: productData },
      {
        headers: {
          'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Successfully created product in Shopify:', response.data);
  } catch (error) {
    console.error('Error creating product in Shopify:', error.message);
    throw error;
  }
}

module.exports = { createShopifyProduct };
