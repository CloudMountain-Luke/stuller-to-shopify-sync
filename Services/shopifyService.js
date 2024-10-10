const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Error log file path
const errorLogFilePath = path.join(__dirname, 'sync_errors.log');

// Function to log errors to a file
function logErrorToFile(errorMessage) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${errorMessage}\n`;
    
    // Append error message to the log file
    fs.appendFile(errorLogFilePath, logMessage, (err) => {
        if (err) {
            console.error('Failed to write to log file:', err.message);
        }
    });
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
            return response.data.products[0];
        }
        return null; // Product not found on Shopify
    } catch (error) {
        console.error(`Error fetching product with SKU ${stullerSKU} from Shopify: ${error.message}`);
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
                        id: shopifyProduct.variants[0].id, // Shopify product variant ID
                        option1: stullerProduct.RingSize || "Default", // Map Ring Size to Option1 (Size)
                        price: price ? price.toString() : shopifyProduct.variants[0].price,
                        inventory_quantity: stullerProduct.OnHand || shopifyProduct.variants[0].inventory_quantity,
                        sku: stullerProduct.SKU, // Use Stuller SKU for this size variant
                        grams: stullerProduct.GramWeight, // Weight in grams
                        weight: stullerProduct.Weight || shopifyProduct.variants[0].weight, // Map weight
                        fulfillment_service: "manual", // Default to manual fulfillment
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
        const errorMessage = `Error syncing product with SKU ${stullerProduct.SKU}: ${error.response ? JSON.stringify(error.response.data, null, 2) : error.message}`;
        
        console.error(errorMessage);
        
        // Log the error to a file
        logErrorToFile(errorMessage);
    }
}

// Function to sync all products
async function syncAllProducts(stullerProducts) {
    for (const stullerProduct of stullerProducts) {
        try {
            const shopifyProduct = await checkShopifyProductBySKU(stullerProduct.SKU);
            if (shopifyProduct) {
                await syncProductWithShopify(stullerProduct, shopifyProduct);
            } else {
                console.log(`Skipping product with SKU: ${stullerProduct.SKU} (not found on Shopify)`);
            }
        } catch (error) {
            // Log any error during the syncing process and move to the next SKU
            const errorMessage = `Failed to process SKU: ${stullerProduct.SKU}. Error: ${error.message}`;
            console.error(errorMessage);
            logErrorToFile(errorMessage);
        }
    }
}

// Export the functions for use in other files
module.exports = { checkShopifyProductBySKU, syncProductWithShopify, syncAllProducts };
