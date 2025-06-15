// Direct test of Google Merchant API with the exact same credentials
const axios = require('axios');

async function testDirectGoogleAPI() {
  console.log('🧪 Testing Direct Google Merchant API Access');
  
  try {
    // First, let's get an access token from our backend
    console.log('1. Getting access token from backend...');
    const authResponse = await axios.get('https://merch-manager-backend-361151780407.us-central1.run.app/api/auth/token');
    
    if (!authResponse.data.success) {
      console.log('❌ Failed to get token:', authResponse.data.error);
      return;
    }
    
    const token = authResponse.data.token;
    console.log('✅ Got access token (length:', token.length, ')');
    
    // Now test direct Google API calls
    const merchantId = '5591219286';
    const baseUrl = 'https://merchantapi.googleapis.com/products/v1beta';
    
    console.log('\n2. Testing direct Google Merchant API call...');
    console.log('   URL:', `${baseUrl}/accounts/${merchantId}/products`);
    console.log('   Merchant ID:', merchantId);
    
    const directResponse = await axios.get(`${baseUrl}/accounts/${merchantId}/products`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      params: {
        pageSize: 1
      }
    });
    
    console.log('✅ Direct Google API call successful!');
    console.log('   Status:', directResponse.status);
    console.log('   Data keys:', Object.keys(directResponse.data));
    
  } catch (error) {
    console.log('❌ Error in direct API test:');
    console.log('   Status:', error.response?.status);
    console.log('   Status Text:', error.response?.statusText);
    console.log('   Error Code:', error.code);
    
    if (error.response?.data) {
      console.log('   Google API Error Response:');
      console.log('  ', JSON.stringify(error.response.data, null, 4));
    }
  }
}

testDirectGoogleAPI().catch(console.error);
