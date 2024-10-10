const axios = require('axios');

// Place an order in Stuller
async function placeOrder(orderDetails) {
  try {
    const response = await axios.post(`${process.env.STULLER_API_URL}/order`, orderDetails, { headers });
    return response.data;
  } catch (error) {
    console.error('Error placing order:', error.message);
    throw error;
  }
}

module.exports = { placeOrder };
