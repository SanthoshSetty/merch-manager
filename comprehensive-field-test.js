/**
 * Comprehensive test script for targeted field updates
 * Tests our field preservation logic end-to-end
 */

const axios = require('axios');

const SERVER_URL = 'http://localhost:3001';

async function testFieldUpdateFunctionality() {
  console.log('🧪 COMPREHENSIVE FIELD UPDATE TEST');
  console.log('=====================================');
  
  try {
    // Test 1: Verify API is working
    console.log('\n1️⃣ Testing API connectivity...');
    const healthCheck = await axios.get(`${SERVER_URL}/api/products?pageSize=1`);
    console.log('✅ API is responsive');
    
    // Find a product with good data to test with
    const products = healthCheck.data.data.products;
    if (!products || products.length === 0) {
      throw new Error('No products found for testing');
    }
    
    // Find the premium product with the most attributes
    const testProduct = products.find(p => p.offerId.includes('premium')) || products[0];
    const productId = testProduct.offerId;
    
    console.log(`📋 Using product: ${productId}`);
    console.log('📊 Current attributes:', Object.keys(testProduct.attributes || {}));
    
    // Test 2: Test field validation endpoint directly
    console.log('\n2️⃣ Testing field update endpoint...');
    
    const updatePayload = {
      updates: {
        title: `TEST TITLE UPDATE ${Date.now()}`,
        description: `TEST DESCRIPTION UPDATE ${Date.now()}`
      },
      updateMask: 'attributes.title,attributes.description'
    };
    
    console.log('📤 Sending update request:', JSON.stringify(updatePayload, null, 2));
    
    const updateResponse = await axios.patch(
      `${SERVER_URL}/api/products/${productId}/fields`,
      updatePayload,
      { headers: { 'Content-Type': 'application/json' } }
    );
    
    console.log('📥 Update response:', JSON.stringify(updateResponse.data, null, 2));
    
    // Test 3: Verify the update
    console.log('\n3️⃣ Verifying update results...');
    
    if (updateResponse.data.success) {
      console.log('✅ Update request succeeded');
      console.log('🔍 Updated fields:', updateResponse.data.updatedFields);
      console.log('🎯 Update mask:', updateResponse.data.updateMask);
      console.log('⚙️ Mode:', updateResponse.data.mode);
      
      // Check if fields were actually updated
      const updatedFields = updateResponse.data.updatedFields || [];
      const expectedFields = ['title', 'description'];
      
      const fieldsMatch = expectedFields.every(field => updatedFields.includes(field));
      if (fieldsMatch) {
        console.log('✅ All expected fields were updated');
      } else {
        console.log('❌ Field mismatch:');
        console.log('  Expected:', expectedFields);
        console.log('  Actual:', updatedFields);
      }
      
    } else {
      console.log('❌ Update request failed:', updateResponse.data.error);
    }
    
    // Test 4: Check field preservation by getting current product state
    console.log('\n4️⃣ Testing field preservation...');
    
    // Wait a moment for update to process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const currentState = await axios.get(`${SERVER_URL}/api/products?pageSize=25`);
    const updatedProduct = currentState.data.data.products.find(p => p.offerId === productId);
    
    if (updatedProduct) {
      console.log('📋 Product found after update');
      console.log('📊 Current attributes:', Object.keys(updatedProduct.attributes || {}));
      console.log('🔍 Current title:', updatedProduct.attributes?.title || 'N/A');
      console.log('🔍 Current description:', (updatedProduct.attributes?.description || 'N/A').substring(0, 50) + '...');
      
      // Check if other fields were preserved
      const originalFields = Object.keys(testProduct.attributes || {});
      const currentFields = Object.keys(updatedProduct.attributes || {});
      
      console.log('\n📈 Field preservation analysis:');
      console.log('  Original field count:', originalFields.length);
      console.log('  Current field count:', currentFields.length);
      
      const preservedFields = originalFields.filter(field => 
        currentFields.includes(field) || ['title', 'description'].includes(field)
      );
      
      console.log('  Preserved fields:', preservedFields.length);
      
      if (preservedFields.length >= originalFields.length) {
        console.log('✅ Field preservation working correctly');
      } else {
        console.log('⚠️ Some fields may have been lost');
        console.log('  Lost fields:', originalFields.filter(f => !currentFields.includes(f)));
      }
      
    } else {
      console.log('❌ Product not found after update');
    }
    
    console.log('\n🎉 Comprehensive test completed!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the comprehensive test
testFieldUpdateFunctionality();
