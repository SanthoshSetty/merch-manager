#!/usr/bin/env node

/**
 * Comprehensive Google Merchant API diagnostic
 */

const https = require('https');

async function testMerchantAccess() {
  console.log('🔍 Google Merchant API Access Test\n');
  
  // Test 1: Check if we can access the backend health endpoint
  console.log('1. Testing backend health...');
  try {
    const healthResponse = await fetch('https://merch-manager-backend-361151780407.us-central1.run.app/api/health');
    const healthData = await healthResponse.json();
    
    console.log('✅ Backend health check:');
    console.log('   Status:', healthData.data.status);
    console.log('   Has credentials:', healthData.data.hasCredentials);
    console.log('   Auth status:', healthData.data.authentication.status);
    console.log('   Token present:', healthData.data.authentication.tokenPresent);
    
    if (healthData.data.authentication.status !== 'success') {
      console.log('❌ Authentication is not working properly');
      return;
    }
    
  } catch (error) {
    console.log('❌ Backend health check failed:', error.message);
    return;
  }
  
  // Test 2: Check the specific API endpoints we're calling
  console.log('\n2. Testing products API endpoint...');
  try {
    const productsResponse = await fetch('https://merch-manager-backend-361151780407.us-central1.run.app/api/products?pageSize=1');
    const productsData = await productsResponse.json();
    
    if (productsData.success) {
      console.log('✅ Products API working!');
      console.log('   Products found:', productsData.data.products?.length || 0);
    } else {
      console.log('❌ Products API failed:');
      console.log('   Error:', productsData.error);
      console.log('   Code:', productsData.code);
      
      // Analyze the error
      if (productsData.error.includes('400')) {
        console.log('\n🔍 400 Error Analysis:');
        console.log('   This suggests Google Merchant API is rejecting our request');
        console.log('   Common causes:');
        console.log('   1. Service account not added to Google Merchant Center');
        console.log('   2. Incorrect merchant account ID (5591219286)');
        console.log('   3. Missing permissions on the merchant account');
        console.log('   4. Merchant account not properly configured');
        
        console.log('\n💡 Solution Steps:');
        console.log('   1. Go to https://merchants.google.com/');
        console.log('   2. Select merchant account ID: 5591219286');
        console.log('   3. Go to Settings → Account Access');
        console.log('   4. Add user: merchant-api-service@neon-vigil-395120.iam.gserviceaccount.com');
        console.log('   5. Grant "Admin" access');
        console.log('   6. Wait 5-10 minutes for changes to propagate');
      }
    }
    
  } catch (error) {
    console.log('❌ Products API test failed:', error.message);
  }
  
  // Test 3: Test a simple endpoint that should work
  console.log('\n3. Testing simple backend endpoint...');
  try {
    const testResponse = await fetch('https://merch-manager-backend-361151780407.us-central1.run.app/');
    if (testResponse.ok) {
      console.log('✅ Backend is responsive');
    } else {
      console.log('❌ Backend not responding properly');
    }
  } catch (error) {
    console.log('❌ Backend connectivity issue:', error.message);
  }
  
  console.log('\n🎯 Diagnosis Summary:');
  console.log('   The backend is properly deployed and authenticated');
  console.log('   The issue is likely with Google Merchant Center account access');
  console.log('   The service account needs to be added to the merchant account');
  
  console.log('\n📋 Next Steps:');
  console.log('   1. Verify merchant account ID: 5591219286');
  console.log('   2. Add service account to merchant center with admin access');
  console.log('   3. Wait for permission changes to propagate');
  console.log('   4. Test the API again');
}

// Use node-fetch if available, otherwise use a simple HTTP request
async function fetch(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'User-Agent': 'MerchManager-Diagnostic/1.0'
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const response = {
          ok: res.statusCode >= 200 && res.statusCode < 300,
          status: res.statusCode,
          statusText: res.statusMessage,
          json: () => Promise.resolve(JSON.parse(data))
        };
        resolve(response);
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.end();
  });
}

testMerchantAccess().catch(console.error);
