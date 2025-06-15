#!/usr/bin/env node
/**
 * Detailed Google Merchant API test to diagnose the 400 error
 */

const axios = require('axios');

async function testGoogleMerchantAPI() {
  console.log('🔍 Detailed Google Merchant API Test\n');
  
  const backendUrl = 'https://merch-manager-backend-361151780407.us-central1.run.app';
  
  try {
    // Test 1: Check API health with detailed logging
    console.log('1. Testing API health endpoint...');
    const healthResponse = await axios.get(`${backendUrl}/api/health`, {
      timeout: 10000
    });
    
    console.log('✅ API Health Response:');
    console.log('   - Status:', healthResponse.status);
    console.log('   - Data:', JSON.stringify(healthResponse.data, null, 2));
    
    // Test 2: Test products endpoint with more detail
    console.log('\n2. Testing products endpoint with detailed error handling...');
    try {
      const productsResponse = await axios.get(`${backendUrl}/api/products?pageSize=1`, {
        timeout: 15000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Products API successful!');
      console.log('   - Status:', productsResponse.status);
      console.log('   - Data keys:', Object.keys(productsResponse.data));
      
    } catch (productsError) {
      console.log('❌ Products API Error Details:');
      console.log('   - Status:', productsError.response?.status);
      console.log('   - Status Text:', productsError.response?.statusText);
      console.log('   - Headers:', JSON.stringify(productsError.response?.headers, null, 2));
      
      if (productsError.response?.data) {
        console.log('   - Response Data:', JSON.stringify(productsError.response.data, null, 2));
        
        // Check if it's specifically a Google API authentication error
        const responseData = productsError.response.data;
        if (responseData.error && typeof responseData.error === 'string') {
          if (responseData.error.includes('authentication') || responseData.error.includes('credentials')) {
            console.log('   🚨 DIAGNOSIS: Google API Authentication Issue');
            console.log('   💡 Likely cause: Service account credentials not properly mounted or invalid');
          } else if (responseData.error.includes('permission') || responseData.error.includes('access')) {
            console.log('   🚨 DIAGNOSIS: Google API Permission Issue'); 
            console.log('   💡 Likely cause: Service account missing required permissions');
          } else if (responseData.error.includes('merchant') || responseData.error.includes('account')) {
            console.log('   🚨 DIAGNOSIS: Merchant Account Issue');
            console.log('   💡 Likely cause: Merchant account ID invalid or not accessible');
          }
        }
      }
      
      console.log('   - Error Code:', productsError.code);
      console.log('   - Error Message:', productsError.message);
    }
    
  } catch (error) {
    console.log('💥 Test failed completely:', error.message);
  }
}

// Run the test
testGoogleMerchantAPI().catch(console.error);
