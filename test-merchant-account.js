const axios = require('axios');

async function testMerchantAccount() {
  console.log('🔍 Testing Merchant Account Access');
  
  try {
    // Test account access endpoint
    console.log('Testing account endpoint...');
    const response = await axios.get('https://merch-manager-backend-361151780407.us-central1.run.app/api/account');
    console.log('✅ Account endpoint response:', response.data);
  } catch (error) {
    console.log('❌ Account error:', error.response?.status, error.response?.data);
  }
  
  try {
    // Test a minimal products request
    console.log('\nTesting minimal products request...');
    const response = await axios.get('https://merch-manager-backend-361151780407.us-central1.run.app/api/products?pageSize=1');
    console.log('✅ Products response:', response.data);
  } catch (error) {
    console.log('❌ Products error:', error.response?.status, error.response?.data);
  }
}

testMerchantAccount();
