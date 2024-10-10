const axios = require('axios');

// Function to fetch all Shopify products and return their SKUs
async function fetchShopifyProducts() {
    let allShopifyProducts = [];
    let nextPage = 1;
    const limit = 250;  // Shopify allows a maximum of 250 products per page

    try {
        while (nextPage) {
            const shopifyUrl = `https://${process.env.SHOPIFY_API_KEY}:${process.env.SHOPIFY_PASSWORD}@${process.env.SHOPIFY_SHOP_NAME}.myshopify.com/admin/api/2024-10/products.json?limit=${limit}&page=${nextPage}`;
            const response = await axios.get(shopifyUrl);
            const products = response.data.products;

            if (products.length > 0) {
                allShopifyProducts = [...allShopifyProducts, ...products];
                nextPage++;
            } else {
                nextPage = null; // No more products to fetch
            }
        }
    } catch (error) {
        console.error('Error fetching products from Shopify:', error.message);
        throw error;
    }

    return allShopifyProducts;
}

// Function to extract SKUs from the fetched Shopify products
function extractSKUsFromShopifyProducts(products) {
    return products.map(product => product.variants.map(variant => variant.sku)).flat();
}

// Function to create a product in Shopify (optional for later steps)
async function createShopifyProduct(product) {
    const shopifyUrl = `https://${process.env.SHOPIFY_API_KEY}:${process.env.SHOPIFY_PASSWORD}@${process.env.SHOPIFY_SHOP_NAME}.myshopify.com/admin/api/2024-10/products.json`;
    const payload = {
        product: {
            title: product.Description,
            body_html: product.LongGroupDescription,
            vendor: 'Stuller',
            variants: [{
                price: product.Price.Value,
                sku: product.SKU
            }],
            images: product.Images.map(image => ({ src: image.FullUrl }))
        }
    };

    try {
        const response = await axios.post(shopifyUrl, payload);
        return response.data;
    } catch (error) {
        console.error('Error creating Shopify product:', error.message);
        throw error;
    }
}

module.exports = { fetchShopifyProducts, extractSKUsFromShopifyProducts, createShopifyProduct };
