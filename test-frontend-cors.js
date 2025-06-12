#!/usr/bin/env node

/**
 * Test Frontend-to-Backend CORS Connection
 * This simulates the exact request that the frontend would make
 */

const axios = require('axios');

async function testFrontendRequest() {
  console.log('🔗 Testing Frontend-to-Backend CORS Connection...\n');
  
  const frontendPort = 5178;
  const backendPort = 3001;
  
  try {
    // Test 1: OPTIONS preflight request (what browsers send for CORS)
    console.log('📋 Step 1: Testing CORS preflight request...');
    try {
      const preflightResponse = await axios.options('http://localhost:3001/api/products', {
        headers: {
          'Origin': `http://localhost:${frontendPort}`,
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'content-type,authorization'
        }
      });
      console.log('✅ CORS preflight successful');
      console.log(`📊 Access-Control-Allow-Origin: ${preflightResponse.headers['access-control-allow-origin']}`);
    } catch (error) {
      console.log(`❌ CORS preflight failed: ${error.message}`);
    }
    
    // Test 2: Actual GET request with Origin header (simulating frontend)
    console.log('\n📦 Step 2: Testing GET request with frontend origin...');
    try {
      const getResponse = await axios.get('http://localhost:3001/api/products', {
        headers: {
          'Origin': `http://localhost:${frontendPort}`,
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });
      console.log(`✅ GET request successful: ${getResponse.status}`);
      console.log(`📊 Products returned: ${getResponse.data.data.products.length}`);
      console.log(`📊 CORS headers: ${getResponse.headers['access-control-allow-origin']}`);
    } catch (error) {
      console.log(`❌ GET request failed: ${error.message}`);
      if (error.response) {
        console.log(`📊 Status: ${error.response.status}`);
        console.log(`📊 Headers: ${JSON.stringify(error.response.headers, null, 2)}`);
      }
    }
    
    // Test 3: Test a specific product field update (what ProductForm does)
    console.log('\n🔧 Step 3: Testing product field update...');
    try {
      const updateResponse = await axios.patch('http://localhost:3001/api/products/online~en~DE~shopify_DE_14982916768119_55220620951927/fields', {
        updates: { title: 'Test Frontend Connection' },
        updateMask: 'attributes.title'
      }, {
        headers: {
          'Origin': `http://localhost:${frontendPort}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      console.log(`✅ Update request successful: ${updateResponse.status}`);
      console.log(`📊 Response: ${JSON.stringify(updateResponse.data, null, 2)}`);
    } catch (error) {
      console.log(`❌ Update request failed: ${error.message}`);
      if (error.response) {
        console.log(`📊 Status: ${error.response.status}`);
        console.log(`📊 Response: ${JSON.stringify(error.response.data, null, 2)}`);
      }
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

// Run the test
testFrontendRequest().then(() => {
  console.log('\n🎉 Frontend CORS test completed!');
}).catch(error => {
  console.error('💥 Test script error:', error.message);
});
