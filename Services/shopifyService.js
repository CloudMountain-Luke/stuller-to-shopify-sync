const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Path for error and missing SKU logs
const errorLogPath = path.join(__dirname, '../logs/error_log.txt');
const missingSKUsLogPath = path.join(__dirname, '../logs/missing_skus_log.txt');

// Function to log errors
function logError(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    fs.appendFileSync(errorLogPath, logMessage, 'utf8');
}

// Function to log missing SKUs
function logMissingSKU(sku) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] Missing SKU: ${sku}\n`;
    fs.appendFileSync(missingSKUsLogPath, logMessage, 'utf8');
}

// Function to check if a Shopify product exists by SKU
async function checkShopifyProductBySKU(stullerSKU) {
    try {
        const shopifyProductUrl = `https://${process.env.SHOPIFY_STORE_URL}/admin/api/2024-10/products.json?sku=${stullerSKU}`;
        const response = await axios.get(shopifyProductUrl, {
            headers: {
                'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN
            }
        });

        if (response.data.products.length > 0) {
            return response.data.products[0];  // Return the product if found
        } else {
            logMissingSKU(stullerSKU);  // Log the SKU if not found
            return null;
        }
    } catch (error) {
        logError(`Error fetching product with SKU ${stullerSKU} from Shopify: ${error.message}`);
        throw new Error(`Failed to fetch Shopify product by SKU: ${stullerSKU}`);
    }
}

// Function to sync a Stuller product with a Shopify product by SKU
async function syncProductWithShopify(stullerProduct, shopifyProduct) {
    try {
        const shopifyUpdateUrl = `https://${process.env.SHOPIFY_STORE_URL}/admin/api/2024-10/products/${shopifyProduct.id}.json`;

        // Extract price
        const price = typeof stullerProduct.Price === 'object' && stullerProduct.Price.Value
            ? stullerProduct.Price.Value
            : stullerProduct.Price;

        // Map product data from Stuller to Shopify
        const updatedProductData = {
            product: {
                id: shopifyProduct.id,
                title: stullerProduct.Description || shopifyProduct.title,
                body_html: stullerProduct.LongGroupDescription || shopifyProduct.body_html,
                vendor: stullerProduct.MerchandisingArea || "Stuller",
                product_type: stullerProduct.MerchandisingCategory1 || shopifyProduct.product_type,
                tags: stullerProduct.WebCategories ? stullerProduct.WebCategories.map(cat => cat.Name).join(", ") : shopifyProduct.tags,
                variants: [
                    {
                        id: shopifyProduct.variants[0].id,
                        option1: stullerProduct.RingSize || "Default",
                        price: price ? price.toString() : shopifyProduct.variants[0].price,
                        inventory_quantity: stullerProduct.OnHand || shopifyProduct.variants[0].inventory_quantity,
                        sku: stullerProduct.SKU,
                        grams: stullerProduct.GramWeight,
                        weight: stullerProduct.Weight || shopifyProduct.variants[0].weight,
                        fulfillment_service: "manual",
                        requires_shipping: true,
                        taxable: true,
                    }
                ],
                images: stullerProduct.Images ? stullerProduct.Images.map(image => ({
                    src: image.FullUrl,
                    alt: stullerProduct.Description || "Product image"
                })) : shopifyProduct.images
            }
        };

        // Log the product data being sent to Shopify for inspection
        console.log('Sending product data to Shopify:', JSON.stringify(updatedProductData, null, 2));

        // Make API request to update the product on Shopify
        await axios.put(shopifyUpdateUrl, updatedProductData, {
            headers: {
                'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN,
                'Content-Type': 'application/json'
            }
        });

        console.log(`Successfully synced product with SKU: ${stullerProduct.SKU}`);
    } catch (error) {
        logError(`Error syncing product with SKU ${stullerProduct.SKU}: ${error.message}`);
        throw new Error(`Failed to sync product with SKU: ${stullerProduct.SKU}`);
    }
}

// Main sync function to process SKUs
async function syncProducts(stullerProducts) {
    for (const stullerProduct of stullerProducts) {
        try {
            const shopifyProduct = await checkShopifyProductBySKU(stullerProduct.SKU);
            if (shopifyProduct) {
                await syncProductWithShopify(stullerProduct, shopifyProduct);
            } else {
                console.log(`Skipping SKU: ${stullerProduct.SKU}, not found on Shopify`);
            }
        } catch (error) {
            logError(`Failed to sync SKU ${stullerProduct.SKU}: ${error.message}`);
            console.log(`Continuing to the next SKU after error with SKU: ${stullerProduct.SKU}`);
        }
    }
}

// Export functions
module.exports = { checkShopifyProductBySKU, syncProductWithShopify, syncProducts };
