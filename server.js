// server.js
const express = require('express');
const dotenv = require('dotenv');
const axios = require('axios');
const productRoutes = require('./routes'); // Import routes

dotenv.config(); // Load .env file

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.use('/api', productRoutes); // Use the product routes

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.get('/', (req, res) => {
  res.send('Stuller to Shopify Sync Service is running');
});
