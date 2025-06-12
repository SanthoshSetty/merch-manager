const axios = require('axios');

async function quickTest() {
    console.log('🧪 Quick Backend Connection Test');
    
    try {
        // Test basic connectivity
        const response = await axios.get('http://localhost:3001/api/health', { timeout: 5000 });
        console.log('✅ Backend is responding:', response.status);
    } catch (error) {
        console.log('❌ Backend connection failed:', error.message);
    }
    
    // Test the specific endpoint we need
    const fullProductId = 'accounts/5591219286/products/online~en~DE~shopify_DE_14982916768119_55220620951927';
    const testData = {
        productId: fullProductId,
        updates: { title: 'Quick Test' },
        updateMask: 'title'
    };
    
    console.log('\n🚀 Testing product update endpoint...');
    console.log('📋 Request:', JSON.stringify(testData, null, 2));
    
    try {
        const response = await axios.patch('http://localhost:3001/api/products/update-field', testData, { 
            timeout: 10000,
            headers: { 'Content-Type': 'application/json' }
        });
        console.log('✅ SUCCESS: Product update endpoint responded!');
        console.log('📊 Status:', response.status);
        console.log('📄 Data:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.log('❌ Product update failed:');
        console.log('🔥 Status:', error.response?.status);
        console.log('📝 Message:', error.response?.statusText);
        console.log('📊 Data:', JSON.stringify(error.response?.data, null, 2));
        console.log('🔍 Error Type:', error.code);
    }
}

quickTest().catch(console.error);
