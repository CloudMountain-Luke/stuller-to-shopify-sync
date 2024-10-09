const express = require('express');
const dotenv = require('dotenv').config();  // Load environment variables

const app = express();

// Middleware to parse incoming JSON
app.use(express.json()); 

// Ensure the correct path to routes.js
let productRoutes;
try {
  productRoutes = require('./api/routes'); // If routes.js is inside the 'api' folder
} catch (error) {
  console.error("Unable to load productRoutes. Check the path to 'routes.js'.", error);
  process.exit(1);  // Exit the server if routes cannot be loaded
}

// Debugging to verify environment variables without logging sensitive data
console.log('Stuller Username:', process.env.STULLER_API_USERNAME ? 'Loaded' : 'Not set');
console.log('Stuller Password:', process.env.STULLER_API_PASSWORD ? 'Loaded' : 'Not set');
console.log('Shopify API Key:', process.env.SHOPIFY_API_KEY ? 'Loaded' : 'Not set');
console.log('Shopify Shop Name:', process.env.SHOPIFY_STORE_URL ? 'Loaded' : 'Not set');

const PORT = process.env.PORT || 3000;

// Mount the product routes under /api
app.use('/api', productRoutes);

// Default route to verify the server is running
app.get('/', (req, res) => {
  res.send('Stuller to Shopify Sync Service is running');
});

// Catch-all 404 route if no other route matches
app.use((req, res, next) => {
  res.status(404).send("Sorry, the route you are trying to access does not exist.");
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});