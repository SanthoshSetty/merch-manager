const axios = require('axios');

async function testProductSave() {
  console.log('🧪 Testing Product Save with Restored ProductsClient...');
  
  try {
    // First, get the list of products to find a valid product ID
    console.log('📋 Getting product list...');
    const listResponse = await axios.get('http://localhost:3001/api/products');
    
    if (!listResponse.data?.success) {
      console.error('❌ API call failed:', listResponse.data);
      return;
    }
    
    if (!listResponse.data?.data?.products?.length) {
      console.error('❌ No products found');
      return;
    }
    
    const testProduct = listResponse.data.data.products[0];
    console.log('🎯 Using test product:', testProduct.name);
    console.log('📋 Product ID:', testProduct.name);
    console.log('📦 Current availability:', testProduct.attributes?.availability);
    
    // Test updating a simple field (availability)
    const updateData = {
      updates: {
        availability: 'in stock'
      },
      updateMask: 'availability'
    };
    
    console.log('📤 Sending update request...');
    console.log('📝 Update data:', JSON.stringify(updateData, null, 2));
    
    const productId = testProduct.name.split('/products/')[1];
    console.log('🎯 Extracted product ID:', productId);
    
    const updateResponse = await axios.patch(
      `http://localhost:3001/api/products/${encodeURIComponent(productId)}/fields`,
      updateData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Update successful!');
    console.log('📊 Response status:', updateResponse.status);
    console.log('📋 Response:', JSON.stringify(updateResponse.data, null, 2));
    
  } catch (error) {
    console.error('❌ Test failed:');
    console.error('Status:', error.response?.status);
    console.error('Status Text:', error.response?.statusText);
    console.error('Data:', JSON.stringify(error.response?.data, null, 2));
    console.error('Message:', error.message);
  }
}

testProductSave();
