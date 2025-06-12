#!/usr/bin/env node

/**
 * Comprehensive Product Field Update Test
 * Tests the complete field update flow including authentication
 */

const https = require('https');
const { URL } = require('url');

async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const requestOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const protocol = parsedUrl.protocol === 'https:' ? https : require('http');
    const req = protocol.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = {
            status: res.statusCode,
            headers: res.headers,
            data: data ? JSON.parse(data) : null
          };
          resolve(result);
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data,
            parseError: e.message
          });
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

async function testProductFieldUpdate() {
  console.log('🧪 Testing Product Field Update Flow\n');

  // Test 1: Check backend health
  console.log('1️⃣ Testing backend health...');
  try {
    const healthResponse = await makeRequest('http://localhost:3001/api/health');
    console.log(`   Status: ${healthResponse.status}`);
    if (healthResponse.status === 200) {
      console.log('   ✅ Backend is healthy');
      if (healthResponse.data?.auth?.authenticated) {
        console.log('   ✅ Google API authentication working');
      } else {
        console.log('   ⚠️ Google API authentication may have issues');
      }
    } else {
      console.log('   ❌ Backend health check failed');
      return;
    }
  } catch (error) {
    console.log('   ❌ Backend not responding:', error.message);
    return;
  }

  // Test 2: List products
  console.log('\n2️⃣ Fetching available products...');
  try {
    const productsResponse = await makeRequest('http://localhost:3001/api/products');
    console.log(`   Status: ${productsResponse.status}`);
    
    if (productsResponse.status === 200 && productsResponse.data?.data?.products) {
      const products = productsResponse.data.data.products;
      console.log(`   ✅ Found ${products.length} products`);
      
      if (products.length > 0) {
        const testProduct = products.find(p => p.offerId.includes('test-product')) || products[0];
        console.log(`   📦 Selected test product: ${testProduct.offerId}`);
        console.log(`   📝 Current title: "${testProduct.attributes.title}"`);
        
        // Test 3: Update product field
        console.log('\n3️⃣ Testing field update...');
        const updateData = {
          updates: {
            title: `${testProduct.attributes.title} - Updated ${new Date().toLocaleTimeString()}`
          },
          updateMask: 'attributes.title'
        };
        
        const updateResponse = await makeRequest(
          `http://localhost:3001/api/products/${encodeURIComponent(testProduct.offerId)}/fields`,
          {
            method: 'PATCH',
            body: updateData
          }
        );
        
        console.log(`   Status: ${updateResponse.status}`);
        
        if (updateResponse.status === 200) {
          console.log('   ✅ Field update successful!');
          console.log('   📊 Response:', JSON.stringify(updateResponse.data, null, 2));
        } else {
          console.log('   ❌ Field update failed');
          console.log('   📊 Error Response:', JSON.stringify(updateResponse.data, null, 2));
          
          // Common error explanations
          if (updateResponse.status === 404) {
            console.log('\n   💡 404 Error typically means:');
            console.log('      - Product not found in Google Merchant Center');
            console.log('      - Incorrect product ID format');
            console.log('      - Authentication issues with Google API');
          } else if (updateResponse.status === 401 || updateResponse.status === 403) {
            console.log('\n   💡 Authentication Error:');
            console.log('      - Check Google Cloud credentials');
            console.log('      - Verify service account permissions');
            console.log('      - Ensure Merchant Center API is enabled');
          }
        }
        
      } else {
        console.log('   ⚠️ No products found to test with');
      }
    } else {
      console.log('   ❌ Failed to fetch products');
      console.log('   📊 Response:', JSON.stringify(productsResponse.data, null, 2));
    }
  } catch (error) {
    console.log('   ❌ Error fetching products:', error.message);
  }

  // Test 4: Frontend integration test
  console.log('\n4️⃣ Testing frontend integration...');
  try {
    const frontendResponse = await makeRequest('http://localhost:5176');
    console.log(`   Status: ${frontendResponse.status}`);
    if (frontendResponse.status === 200) {
      console.log('   ✅ Frontend is accessible');
      console.log('   🌐 You can test the UI at: http://localhost:5176');
    } else {
      console.log('   ❌ Frontend not accessible');
    }
  } catch (error) {
    console.log('   ⚠️ Frontend not running or not accessible');
    console.log('   💡 Start frontend with: cd web && npm run dev');
  }

  console.log('\n🏁 Test Summary:');
  console.log('   • Backend API: Available on port 3001');
  console.log('   • Frontend UI: Available on port 5176 (if running)');
  console.log('   • Field Updates: See results above');
  console.log('\n   Next steps:');
  console.log('   1. If field updates failed, check Google Cloud credentials');
  console.log('   2. Test field updates through the web UI');
  console.log('   3. Check backend logs for detailed error information');
}

// Run the test
testProductFieldUpdate().catch(console.error);
