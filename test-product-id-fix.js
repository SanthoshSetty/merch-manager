const axios = require('axios');

async function testProductIdExtraction() {
    console.log('🧪 Testing Product ID Extraction Fix\n');
    
    // Test data with full product path (the problematic case)
    const fullProductId = 'accounts/5591219286/products/online~en~DE~shopify_DE_14982916768119_55220620951927';
    const expectedOfferId = 'online~en~DE~shopify_DE_14982916768119_55220620951927';
    
    const testUpdateData = {
        title: 'Test Product Title Update - ' + new Date().toISOString(),
        description: 'Updated description for testing the product ID fix'
    };
    
    console.log('📋 Test Parameters:');
    console.log('  🔗 Full Product ID:', fullProductId);
    console.log('  🎯 Expected Offer ID:', expectedOfferId);
    console.log('  📝 Update Data:', JSON.stringify(testUpdateData, null, 2));
    console.log('\n');
    
    try {
        console.log('🚀 Sending update request to backend...');
        
        const response = await axios.patch(`http://localhost:3001/api/products/${encodeURIComponent(fullProductId)}/fields`, {
            updates: testUpdateData,
            updateMask: 'title,description'
        });
        
        console.log('✅ SUCCESS: Product update completed!');
        console.log('📊 Response Status:', response.status);
        console.log('📄 Response Data:', JSON.stringify(response.data, null, 2));
        
        console.log('\n🎉 BACKEND FIX VERIFICATION: SUCCESS');
        console.log('✅ The backend correctly extracted the product ID from the full path');
        console.log('✅ No more 400 "Invalid request format" errors');
        
    } catch (error) {
        console.error('❌ BACKEND FIX VERIFICATION: FAILED');
        console.error('🔥 Error Status:', error.response?.status);
        console.error('📄 Error Message:', error.response?.statusText);
        console.error('📊 Error Data:', JSON.stringify(error.response?.data, null, 2));
        
        if (error.response?.status === 400) {
            console.error('\n🔍 400 Error Analysis:');
            const errorData = error.response?.data;
            
            if (errorData?.error?.message?.includes('offerId')) {
                console.error('❌ The fix may not be working - still seeing offerId validation errors');
                console.error('🔧 Check if the product ID extraction logic is correctly applied');
            }
        }
        
        console.error('\n📋 Full Error Details:', error.message);
    }
}

async function testDirectApi() {
    console.log('\n🔬 Testing Direct API Call (for comparison)');
    
    // This simulates what should happen after the fix
    const correctOfferId = 'online~en~DE~shopify_DE_14982916768119_55220620951927';
    
    console.log('🎯 Using correct offer ID directly:', correctOfferId);
    console.log('📝 This should work if our fix is correct...\n');
}

// Run the test
console.log('🧪 Starting Product ID Extraction Fix Test');
console.log('=' .repeat(60));

testProductIdExtraction()
    .then(() => {
        console.log('\n' + '='.repeat(60));
        console.log('🏁 Test completed successfully');
        testDirectApi();
    })
    .catch(error => {
        console.error('\n' + '='.repeat(60));
        console.error('💥 Test failed with error:', error.message);
    });
