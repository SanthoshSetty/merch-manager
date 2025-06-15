const axios = require('axios');

async function testAuth() {
  console.log('🔐 Testing Google Merchant API Authentication');
  
  const backendUrl = 'https://merch-manager-backend-361151780407.us-central1.run.app';
  
  try {
    console.log('Testing products endpoint...');
    const response = await axios.get(`${backendUrl}/api/products?pageSize=1`);
    console.log('✅ SUCCESS!', response.status);
    console.log('Data:', response.data);
  } catch (error) {
    console.log('❌ ERROR:', error.response?.status, error.response?.statusText);
    console.log('Error data:', error.response?.data);
  }
}

testAuth();
