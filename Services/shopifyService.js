const axios = require('axios');

async function fetchShopifyProducts(limit = 50) {
  const shopifyUrl = `https://${process.env.SHOPIFY_API_KEY}:${process.env.SHOPIFY_PASSWORD}@${process.env.SHOPIFY_SHOP_NAME}.myshopify.com/admin/api/2024-10/products.json?limit=${limit}`;

  try {
    const response = await axios.get(shopifyUrl);
    console.log("Successfully fetched products:", response.data);

    // Handle pagination if more products are available
    if (response.headers.link) {
      const linkHeader = response.headers.link;
      const nextLink = parseNextLink(linkHeader); // This function will parse and return the next URL from the 'Link' header
      if (nextLink) {
        const nextResponse = await axios.get(nextLink);
        console.log("Fetched additional products:", nextResponse.data);
      }
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching products from Shopify:", error.message);
    throw error;
  }
}

// Helper function to parse the Link header for pagination
function parseNextLink(linkHeader) {
  // Implement parsing logic to get the next link from 'Link' header
  // For example, this can be a regex or a simple split-based function
}

module.exports = { fetchShopifyProducts };
