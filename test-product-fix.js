#!/usr/bin/env node

// Test script to verify the product ID extraction fix
async function testProductIdFix() {
  const baseUrl = 'http://localhost:3001';
  
  console.log('🧪 Testing Product ID Fix...\n');
  
  try {
    // Test 1: Get products to see current structure
    console.log('📋 Step 1: Fetching current products...');
    const productsResponse = await fetch(`${baseUrl}/api/products`);
    const productsData = await productsResponse.json();
    
    if (productsData.success && productsData.data.products.length > 0) {
      const product = productsData.data.products[0];
      console.log('✅ Product found:');
      console.log('   📌 Product Name:', product.name);
      console.log('   🔑 Offer ID:', product.offerId);
      
      // Test 2: Try to update a product field to trigger the fix
      console.log('\n🔄 Step 2: Testing product update...');
      const productId = product.name;
      const testUpdate = {
        updates: {
          title: `Test Update ${new Date().getTime()}`
        },
        updateMask: ['title']
      };
      
      console.log('   📤 Sending update request for:', productId);
      const updateResponse = await fetch(`${baseUrl}/api/products/${encodeURIComponent(productId)}/fields`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testUpdate)
      });
      
      const updateResult = await updateResponse.json();
      console.log('   📥 Update response:', updateResult.success ? '✅ SUCCESS' : '❌ FAILED');
      
      if (!updateResult.success) {
        console.log('   ⚠️  Error details:', updateResult.error);
      } else {
        console.log('   🎉 Product updated successfully!');
      }
      
    } else {
      console.log('❌ No products found or API error');
      console.log('Response:', productsData);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testProductIdFix();
