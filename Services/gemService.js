const axios = require('axios');

// Fetch gem details
async function fetchGemDetails(gemCode) {
  try {
    const response = await axios.post(`${process.env.STULLER_API_URL}/gem`, {
      "GemCode": gemCode
    }, { headers });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching gem details:', error.message);
    throw error;
  }
}

module.exports = { fetchGemDetails };
