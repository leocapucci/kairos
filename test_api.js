const axios = require('axios');

const BASE_URL = 'https://kairos-backend-vjdp.onrender.com';

async function testConnection() {
  try {
    const response = await axios.get(`${BASE_URL}/daily`, { timeout: 60000 });
    console.log('Sucesso:', response.data);
  } catch (error) {
    console.log('Erro:', error.message);
    console.log('Detalhes:', error);
  }
}

testConnection();