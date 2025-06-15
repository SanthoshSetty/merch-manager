// Test script to verify frontend-backend communication
const axios = require('axios');

async function testConnection() {
  const frontendUrl = 'https://merch-manager-frontend-361151780407.us-central1.run.app';
  const backendUrl = 'https://merch-manager-backend-361151780407.us-central1.run.app';
  
  console.log('🔍 Testing frontend-backend connection...\n');
  console.log('Frontend URL:', frontendUrl);
  console.log('Backend URL:', backendUrl);
  console.log('---');
  
  try {
    // Test 1: Backend health check
    console.log('1. Testing backend health endpoint...');
    const healthResponse = await axios.get(`${backendUrl}/health`);
    console.log('✅ Backend health check successful:', healthResponse.data);
    
    // Test 2: CORS preflight for a typical API endpoint
    console.log('\n2. Testing CORS preflight...');
    const corsResponse = await axios({
      method: 'OPTIONS',
      url: `${backendUrl}/api/analyze-image`,
      headers: {
        'Origin': frontendUrl,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    console.log('✅ CORS preflight successful');
    console.log('   - Status:', corsResponse.status);
    console.log('   - Access-Control-Allow-Origin:', corsResponse.headers['access-control-allow-origin']);
    console.log('   - Access-Control-Allow-Methods:', corsResponse.headers['access-control-allow-methods']);
    
    // Test 3: Test actual API endpoint that exists
    console.log('\n3. Testing actual API endpoint...');
    const rootResponse = await axios.get(`${backendUrl}/`);
    console.log('✅ Root endpoint successful');
    console.log('   - Response:', rootResponse.data);
    
    // Test 4: Test products endpoint
    console.log('\n4. Testing products endpoint...');
    const productsResponse = await axios({
      method: 'GET',
      url: `${backendUrl}/api/products`,
      headers: {
        'Origin': frontendUrl,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Products API call successful');
    console.log('   - Response status:', productsResponse.status);
    
  } catch (error) {
    console.error('❌ Error during testing:');
    console.error('   - Message:', error.message);
    console.error('   - Status:', error.response?.status);
    console.error('   - Status Text:', error.response?.statusText);
    if (error.response?.data) {
      console.error('   - Response data:', error.response.data);
    }
    console.error('   - Full error:', error.code || error.errno || 'Unknown error');
  }
}

console.log('Starting connection test...');
testConnection().then(() => {
  console.log('\n✅ Test completed');
}).catch(err => {
  console.error('\n❌ Test failed:', err);
});
