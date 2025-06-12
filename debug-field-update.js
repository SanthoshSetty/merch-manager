// Debug script to test field updates with detailed logging
const axios = require('axios');

async function debugFieldUpdate() {
  console.log('🔍 Debug: Testing field update with detailed logging...\n');

  try {
    // 1. First get a product to test with
    console.log('1️⃣ Getting products list...');
    const productsResponse = await axios.get('http://localhost:3001/api/products');
    const products = productsResponse.data.data.products || [];
    
    if (products.length === 0) {
      console.log('❌ No products found');
      return;
    }

    const testProduct = products[0];
    const productId = testProduct.offerId;
    console.log(`📦 Testing with product: ${productId}`);
    console.log(`📝 Current title: "${testProduct.attributes?.title || 'N/A'}"`);
    console.log('');

    // 2. Test field update with detailed request logging
    console.log('2️⃣ Testing field update...');
    const updatePayload = {
      updates: { title: `Updated Test Title ${Date.now()}` },
      updateMask: 'attributes.title'
    };
    
    console.log('📤 Request payload:', JSON.stringify(updatePayload, null, 2));
    console.log('🔗 URL:', `http://localhost:3001/api/products/${encodeURIComponent(productId)}/fields`);
    console.log('');

    const updateResponse = await axios.patch(
      `http://localhost:3001/api/products/${encodeURIComponent(productId)}/fields`,
      updatePayload,
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );

    console.log('✅ Update successful!');
    console.log('📥 Response:', JSON.stringify(updateResponse.data, null, 2));

  } catch (error) {
    console.log('❌ Update failed');
    console.log('📥 Status:', error.response?.status);
    console.log('📥 Response:', JSON.stringify(error.response?.data, null, 2));
    
    if (error.response?.data?.originalError) {
      console.log('🔍 Original error:', error.response.data.originalError);
    }
  }
}

debugFieldUpdate().catch(console.error);
