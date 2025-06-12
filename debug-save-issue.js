#!/usr/bin/env node

console.log('🧪 Testing ProductForm Save Issue...\n');

async function testProductSave() {
  const baseUrl = 'http://localhost:3001';
  
  try {
    // 1. Get products first
    console.log('📋 Step 1: Getting products...');
    const productsResponse = await fetch(`${baseUrl}/api/products`);
    const productsData = await productsResponse.json();
    
    if (!productsData.success || !productsData.data.products.length) {
      console.log('❌ No products available for testing');
      return;
    }
    
    const product = productsData.data.products[0];
    console.log('✅ Test product selected:');
    console.log(`   📌 Name: ${product.name}`);
    console.log(`   🔑 Offer ID: ${product.offerId}`);
    
    // 2. Simulate ProductForm save with minimal data
    console.log('\n🔄 Step 2: Testing product save...');
    
    const savePayload = {
      updates: {
        title: `Test Update ${new Date().getTime()}`,
        description: 'Test description update from debug script'
      },
      updateMask: 'attributes.title,attributes.description'
    };
    
    console.log('📤 Sending save request:');
    console.log('   🎯 Product ID:', product.name);
    console.log('   📝 Updates:', savePayload.updates);
    console.log('   🎯 Update Mask:', savePayload.updateMask);
    
    const saveResponse = await fetch(`${baseUrl}/api/products/${encodeURIComponent(product.name)}/fields`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(savePayload),
    });

    const saveResult = await saveResponse.json();
    
    console.log('\n📡 Save Response:');
    console.log('   📊 Status:', saveResponse.status);
    console.log('   ✅ Success:', saveResult.success);
    
    if (saveResult.success) {
      console.log('🎉 Save operation successful!');
      console.log('   🔧 Mode:', saveResult.mode);
      console.log('   📋 Updated Fields:', saveResult.updatedFields);
    } else {
      console.log('❌ Save operation failed:');
      console.log('   ⚠️  Error:', saveResult.error);
      console.log('   📋 Full Response:', JSON.stringify(saveResult, null, 2));
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

testProductSave();
