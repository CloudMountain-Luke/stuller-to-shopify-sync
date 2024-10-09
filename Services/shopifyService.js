const axios = require('axios');

// Shopify product creation logic
async function createShopifyProduct(product) {
    const shopifyUrl = `https://${process.env.SHOPIFY_API_KEY}:${process.env.SHOPIFY_PASSWORD}@${process.env.SHOPIFY_SHOP_NAME}.myshopify.com/admin/api/2021-10/products.json`;
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

module.exports = { createShopifyProduct };
