#!/usr/bin/env node

console.log('🧪 Testing Product Save Fix...\n');

async function runTest() {
  const baseUrl = 'http://localhost:3001';
  
  try {
    // 1. Get current products
    console.log('📋 Step 1: Fetching products...');
    const response = await fetch(`${baseUrl}/api/products`);
    const data = await response.json();
    
    if (!data.success) {
      console.log('❌ Failed to fetch products:', data.error);
      return;
    }
    
    console.log(`✅ Found ${data.data.products.length} products`);
    
    if (data.data.products.length === 0) {
      console.log('⚠️  No products to test with');
      return;
    }
    
    const product = data.data.products[0];
    console.log('📦 Testing with product:');
    console.log(`   📌 Name: ${product.name}`);
    console.log(`   🔑 Offer ID: ${product.offerId}`);
    console.log(`   📝 Title: ${product.title}`);
    
    // 2. Test product update
    console.log('\n🔄 Step 2: Testing product update...');
    const updatePayload = {
      updates: {
        title: `Test Update ${new Date().getTime()}`
      },
      updateMask: ['title']
    };
    
    const productId = product.name;
    console.log(`   📤 Updating product: ${productId}`);
    
    const updateResponse = await fetch(`${baseUrl}/api/products/${encodeURIComponent(productId)}/fields`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatePayload)
    });
    
    const updateResult = await updateResponse.json();
    
    if (updateResult.success) {
      console.log('✅ Product update successful!');
      console.log('   🎉 The product ID extraction fix is working correctly');
    } else {
      console.log('❌ Product update failed:');
      console.log(`   ⚠️  Error: ${updateResult.error}`);
      console.log('   🔍 This may indicate the fix needs adjustment');
    }
    
    // 3. Test the specific ID extraction logic
    console.log('\n🔍 Step 3: Testing ID extraction logic...');
    const fullPath = product.name;
    const extractedId = fullPath.startsWith('accounts/') 
      ? fullPath.split('/products/')[1] 
      : fullPath;
    
    console.log(`   📋 Full path: ${fullPath}`);
    console.log(`   🎯 Extracted ID: ${extractedId}`);
    console.log(`   ✓ Current offer ID: ${product.offerId}`);
    
    if (extractedId === product.offerId) {
      console.log('   ✅ ID extraction is working correctly!');
    } else {
      console.log('   ⚠️  ID extraction may need adjustment');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

runTest();
