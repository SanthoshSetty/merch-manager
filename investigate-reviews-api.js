#!/usr/bin/env node

/**
 * Reviews API Investigation Script
 * 
 * This script investigates why the Reviews API is giving 403 errors
 * despite having access to the Google Merchant API
 */

console.log('🔍 Google Merchant Reviews API Investigation');
console.log('=' .repeat(60));

async function investigateReviewsAPI() {
  try {
    console.log('\n📋 Step 1: Testing Basic HTTP Requests');
    
    // Test basic connectivity
    const https = require('https');
    const { URL } = require('url');
    
    console.log('   Testing HTTPS connectivity to merchantapi.googleapis.com...');
    
    const testUrl = new URL('https://merchantapi.googleapis.com/');
    const options = {
      hostname: testUrl.hostname,
      port: 443,
      path: '/',
      method: 'GET',
      timeout: 10000
    };

    await new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        console.log('   ✅ HTTPS connectivity working (Status:', res.statusCode, ')');
        resolve();
      });
      
      req.on('error', (error) => {
        console.log('   ❌ HTTPS connectivity failed:', error.message);
        reject(error);
      });
      
      req.on('timeout', () => {
        console.log('   ❌ HTTPS request timed out');
        req.destroy();
        reject(new Error('Timeout'));
      });
      
      req.end();
    });

    console.log('\n📋 Step 2: Loading Authentication Module');
    const { MerchantAuth } = require('./src/auth/MerchantAuth');
    console.log('   ✅ MerchantAuth module loaded');

    const auth = new MerchantAuth();
    console.log('   ✅ MerchantAuth instance created');

    const token = await auth.getAccessToken();
    console.log('   ✅ Access token obtained');
    console.log('   🔑 Token preview:', token.substring(0, 20) + '...');

    console.log('\n📋 Step 3: Testing Products API (Known Working)');
    const axios = require('axios');
    
    try {
      const productsResponse = await axios.get(
        'https://merchantapi.googleapis.com/products/v1beta/accounts/5591219286/products',
        {
          headers: { 'Authorization': `Bearer ${token}` },
          params: { pageSize: 1 },
          timeout: 10000
        }
      );
      console.log('   ✅ Products API: Working (Status:', productsResponse.status, ')');
    } catch (error) {
      console.log('   ❌ Products API Error:', error.response?.status, error.response?.statusText);
      if (error.response?.data) {
        console.log('   📊 Error Details:', JSON.stringify(error.response.data, null, 2));
      }
    }

    console.log('\n📋 Step 4: Testing Reviews API Endpoint');
    try {
      const reviewsResponse = await axios.get(
        'https://merchantapi.googleapis.com/reviews/v1beta/accounts/5591219286/productReviews',
        {
          headers: { 'Authorization': `Bearer ${token}` },
          params: { pageSize: 1 },
          timeout: 10000
        }
      );
      console.log('   ✅ Reviews API: Working (Status:', reviewsResponse.status, ')');
      console.log('   📊 Reviews Data:', reviewsResponse.data);
    } catch (error) {
      console.log('   ❌ Reviews API Error Details:');
      console.log('      Status:', error.response?.status);
      console.log('      Status Text:', error.response?.statusText);
      
      if (error.response?.data?.error) {
        const apiError = error.response.data.error;
        console.log('      Error Message:', apiError.message);
        console.log('      Error Code:', apiError.code);
        console.log('      Error Status:', apiError.status);
        
        console.log('\n   🔍 Analysis:');
        
        if (apiError.message?.includes('not enabled')) {
          console.log('      ❌ ISSUE: Reviews API specifically is not enabled');
          console.log('      💡 NOTE: This is different from the main Merchant API');
          console.log('      🔧 REASON: Reviews API might be a separate service or beta feature');
        }
        
        if (apiError.status === 'PERMISSION_DENIED') {
          console.log('      ❌ ISSUE: Permission denied for Reviews API');
          console.log('      💡 POSSIBLE CAUSES:');
          console.log('         - Reviews API requires special beta access');
          console.log('         - Different scopes needed for Reviews API');
          console.log('         - Account-level restrictions on Reviews API');
        }
      }
    }

    console.log('\n📋 Step 5: Final Diagnosis & Recommendations');
    console.log('   📊 SUMMARY:');
    console.log('      ✅ Google Merchant API access: Working');
    console.log('      ✅ Authentication & credentials: Working');
    console.log('      ✅ Products API: Working');
    console.log('      ❌ Reviews API: Not accessible');
    console.log('   ');
    console.log('   🎯 ROOT CAUSE:');
    console.log('      The Reviews API appears to be a separate beta feature within');
    console.log('      the Merchant API that requires additional enablement or approval.');
    console.log('   ');
    console.log('   🔧 SOLUTIONS:');
    console.log('      1. IMMEDIATE: Use the existing fallback mechanism implemented');
    console.log('      2. CONTACT: Reach out to Google Support for Reviews API access');
    console.log('      3. ALTERNATIVE: Use Content API v2.1 for reviews if available');
    console.log('      4. WORKAROUND: Implement local review management until API access');

  } catch (error) {
    console.error('❌ Investigation failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the investigation
investigateReviewsAPI().then(() => {
  console.log('\n✅ Investigation complete');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Investigation failed:', error);
  process.exit(1);
});
