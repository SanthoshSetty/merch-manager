#!/usr/bin/env node

// Load environment variables
require('dotenv').config();

const axios = require('axios');

async function testGoogleMerchantAPI() {
  console.log('🔍 Google Merchant API Direct Test\n');
  
  console.log('Environment Check:');
  console.log('  GOOGLE_MERCHANT_ID:', process.env.GOOGLE_MERCHANT_ID);
  console.log('  GOOGLE_APPLICATION_CREDENTIALS:', process.env.GOOGLE_APPLICATION_CREDENTIALS);
  console.log('  DEMO_MODE:', process.env.DEMO_MODE);
  
  try {
    // Test authentication
    console.log('\n1. Testing authentication...');
    const { MerchantAuth } = require('./src/auth/MerchantAuth');
    const auth = new MerchantAuth();
    
    const token = await auth.getAccessToken();
    console.log('✅ Authentication successful');
    console.log('   Token length:', token.length);
    
    // Test direct API call
    console.log('\n2. Testing direct Google API call...');
    const merchantId = process.env.GOOGLE_MERCHANT_ID;
    const apiUrl = `https://merchantapi.googleapis.com/products/v1beta/accounts/${merchantId}/products`;
    
    console.log('   URL:', apiUrl);
    
    const response = await axios.get(apiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      params: {
        pageSize: 1
      },
      timeout: 15000
    });
    
    console.log('✅ API call successful!');
    console.log('   Status:', response.status);
    console.log('   Data keys:', Object.keys(response.data));
    
  } catch (error) {
    console.log('❌ Error occurred:');
    console.log('   Message:', error.message);
    
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Status Text:', error.response.statusText);
      console.log('   Data:', JSON.stringify(error.response.data, null, 2));
      
      // Specific error analysis
      if (error.response.status === 400) {
        console.log('\n🔍 400 Error Analysis:');
        const errorData = error.response.data;
        if (errorData.error) {
          console.log('   Error Code:', errorData.error.code);
          console.log('   Error Message:', errorData.error.message);
          console.log('   Error Status:', errorData.error.status);
          
          if (errorData.error.details) {
            console.log('   Error Details:', JSON.stringify(errorData.error.details, null, 2));
          }
        }
        
        // Common 400 error causes for Google Merchant API
        console.log('\n💡 Common causes of 400 errors:');
        console.log('   1. Invalid merchant account ID');
        console.log('   2. Service account not added to merchant account');
        console.log('   3. Incorrect API endpoint or parameters');
        console.log('   4. Missing required permissions');
      }
      
      if (error.response.status === 403) {
        console.log('\n🔍 403 Error Analysis:');
        console.log('   This typically means the service account lacks permission');
        console.log('   Solution: Add service account email to Google Merchant Center with admin access');
      }
    }
  }
}

testGoogleMerchantAPI().catch(console.error);
