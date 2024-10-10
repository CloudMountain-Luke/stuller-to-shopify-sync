const axios = require('axios');

// Fetch invoice details by order number
async function fetchInvoice(orderNumber) {
  try {
    const response = await axios.post(`${process.env.STULLER_API_URL}/invoice`, {
      "OrderNumber": orderNumber
    }, { headers });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching invoice:', error.message);
    throw error;
  }
}

module.exports = { fetchInvoice };
