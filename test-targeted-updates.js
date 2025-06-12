/**
 * Test script to verify targeted field updates
 * This tests that we can update specific fields without overwriting others
 */

const axios = require('axios');

const SERVER_URL = 'http://localhost:3001';

async function testTargetedFieldUpdate() {
  console.log('🧪 Testing Targeted Field Updates');
  console.log('====================================');
  
  try {
    // First, let's get the current state of a product
    console.log('\n1️⃣ Fetching current product state...');
    const listResponse = await axios.get(`${SERVER_URL}/api/products`);
    
    if (!listResponse.data.products || listResponse.data.products.length === 0) {
      console.log('❌ No products found to test with');
      return;
    }
    
    const testProduct = listResponse.data.products[0];
    const productId = testProduct.name.split('/').pop(); // Extract ID from name
    
    console.log(`📋 Using product: ${productId}`);
    console.log(`📊 Current title: ${testProduct.attributes?.title || 'N/A'}`);
    console.log(`💰 Current price: ${testProduct.attributes?.price?.amountMicros ? 
      (testProduct.attributes.price.amountMicros / 1000000) + ' ' + testProduct.attributes.price.currencyCode : 'N/A'}`);
    console.log(`📝 Current description: ${testProduct.attributes?.description?.substring(0, 50) || 'N/A'}...`);
    
    // Now let's update just the title
    console.log('\n2️⃣ Updating ONLY the title field...');
    
    const updateData = {
      title: `Updated Title - ${new Date().toLocaleTimeString()}`
    };
    
    console.log(`🎯 Updating title to: "${updateData.title}"`);
    
    const updateResponse = await axios.patch(`${SERVER_URL}/api/products/${productId}`, {
      updates: updateData,
      updateMask: 'attributes.title'
    });
    
    console.log('✅ Update request successful');
    
    // Wait a moment for the update to propagate
    console.log('\n3️⃣ Waiting for update to propagate...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Fetch the product again to verify the update
    console.log('\n4️⃣ Verifying targeted update results...');
    const updatedProductResponse = await axios.get(`${SERVER_URL}/api/products/${productId}`);
    const updatedProduct = updatedProductResponse.data;
    
    console.log(`📋 Product after update: ${productId}`);
    console.log(`📊 NEW title: ${updatedProduct.attributes?.title || 'N/A'}`);
    console.log(`💰 Price (should be unchanged): ${updatedProduct.attributes?.price?.amountMicros ? 
      (updatedProduct.attributes.price.amountMicros / 1000000) + ' ' + updatedProduct.attributes.price.currencyCode : 'N/A'}`);
    console.log(`📝 Description (should be unchanged): ${updatedProduct.attributes?.description?.substring(0, 50) || 'N/A'}...`);
    
    // Verify the update was successful
    if (updatedProduct.attributes?.title === updateData.title) {
      console.log('\n✅ SUCCESS: Title was updated correctly');
    } else {
      console.log('\n❌ FAILED: Title was not updated');
    }
    
    // Verify other fields were preserved
    const originalPrice = testProduct.attributes?.price?.amountMicros;
    const updatedPrice = updatedProduct.attributes?.price?.amountMicros;
    
    if (originalPrice === updatedPrice) {
      console.log('✅ SUCCESS: Price was preserved (not overwritten)');
    } else {
      console.log('❌ FAILED: Price was overwritten during title update');
    }
    
    const originalDescription = testProduct.attributes?.description;
    const updatedDescription = updatedProduct.attributes?.description;
    
    if (originalDescription === updatedDescription) {
      console.log('✅ SUCCESS: Description was preserved (not overwritten)');
    } else {
      console.log('❌ FAILED: Description was overwritten during title update');
    }
    
    console.log('\n🎉 Targeted field update test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

// Run the test
testTargetedFieldUpdate();
