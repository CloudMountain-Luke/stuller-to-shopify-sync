const express = require('express');
const axios = require('axios');
const router = express.Router();

// Route to sync products from Stuller to Shopify
router.get('/stuller/products', async (req, res) => {
  try {
    console.log('Request received on /stuller/products');
    const stullerResponse = await axios.post(process.env.STULLER_API_URL, {
      // API request details
    });
    res.status(200).json(stullerResponse.data);
  } catch (error) {
    console.error('Error fetching products from Stuller API:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


    // Prepare Stuller API credentials
    const stullerUsername = process.env.STULLER_API_USERNAME;
    const stullerPassword = process.env.STULLER_API_PASSWORD;
    const stullerCredentials = Buffer.from(`${stullerUsername}:${stullerPassword}`).toString('base64');

    // Fetch data from Stuller API
    const stullerResponse = await axios.post(process.env.STULLER_API_URL, {
      "Include": ["All"], // Include all product details
      "Filter": ["Orderable", "OnPriceList"], // Filter for orderable products on price list
      "CategoryIds": [23618], // Example Category ID (adjust as needed)
    }, {
      headers: {
        Authorization: `Basic ${stullerCredentials}`, // Use the Base64-encoded credentials
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    });

    const products = stullerResponse.data.Products; // Assuming the products are returned in the response
    console.log(`Fetched ${products.length} products from Stuller`);

    // Example: Loop through products and create them in Shopify
    for (let product of products) {
      const shopifyResponse = await axios.post(`https://${process.env.SHOPIFY_STORE_URL}/admin/api/2022-04/products.json`, {
        product: {
          title: product.Description,
          body_html: product.LongGroupDescription || '',
          vendor: "Stuller",
          variants: [{
            price: product.Price.Value,
            sku: product.SKU,
            inventory_quantity: product.OnHand
          }]
        }
      }, {
        headers: {
          'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN,
          'Content-Type': 'application/json'
        }
      });

      console.log(`Created product ${shopifyResponse.data.product.id} in Shopify`);
    }

    res.status(200).json({ message: "Products synced successfully" });
  (error) 
    console.error('Error syncing products:', error);
    res.status(500).json({ error: 'An error occurred while syncing products' });
  
;

module.exports = router;
