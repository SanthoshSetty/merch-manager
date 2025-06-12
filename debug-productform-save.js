#!/usr/bin/env node

console.log('🧪 Testing ProductForm Save API...\n');

async function testProductFormSave() {
  try {
    // Get a product first
    console.log('📋 Step 1: Getting product data...');
    const productsResponse = await fetch('http://localhost:3001/api/products');
    const productsData = await productsResponse.json();
    
    if (!productsData.success || productsData.data.products.length === 0) {
      console.log('❌ No products available for testing');
      return;
    }
    
    const product = productsData.data.products[0];
    console.log('✅ Using product:', product.name);
    console.log('📊 Product attributes available:', Object.keys(product.attributes).length);
    
    // Test the save API endpoint
    console.log('\n🔄 Step 2: Testing save API...');
    
    const testData = {
      title: `Test Title ${new Date().getTime()}`,
      description: 'Test description for save functionality',
      availability: 'in_stock'
    };
    
    const requestBody = {
      updates: testData,
      updateMask: Object.keys(testData).map(key => `attributes.${key}`).join(',')
    };
    
    console.log('📤 Sending request:', {
      url: `http://localhost:3001/api/products/${encodeURIComponent(product.name)}/fields`,
      method: 'PATCH',
      body: requestBody
    });
    
    const saveResponse = await fetch(`http://localhost:3001/api/products/${encodeURIComponent(product.name)}/fields`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    console.log('📥 Response status:', saveResponse.status, saveResponse.statusText);
    console.log('📥 Response headers:', Object.fromEntries(saveResponse.headers.entries()));
    
    const responseText = await saveResponse.text();
    console.log('📥 Raw response text:', responseText);
    
    let result;
    try {
      result = JSON.parse(responseText);
      console.log('📥 Parsed response:', result);
    } catch (parseError) {
      console.error('❌ Failed to parse response as JSON:', parseError.message);
      console.log('📄 Response was:', responseText);
      return;
    }
    
    if (!saveResponse.ok) {
      console.error('❌ HTTP Error:', {
        status: saveResponse.status,
        statusText: saveResponse.statusText,
        body: result
      });
      return;
    }
    
    if (result.success) {
      console.log('✅ Save test successful!');
    } else {
      console.log('❌ Save test failed:', result.error);
    }
    
  } catch (error) {
    console.error('💥 Test failed with error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      type: typeof error,
      fullError: JSON.stringify(error, Object.getOwnPropertyNames(error))
    });
  }
}

testProductFormSave();
