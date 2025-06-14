#!/usr/bin/env node

const axios = require('axios');

async function testAIGeneration() {
    try {
        console.log('🧪 Testing AI field generation with grounded sources...\n');
        
        const response = await axios.post('http://localhost:3001/api/ai-content/generate-field', {
            productName: 'iPhone 15 Pro',
            brand: 'Apple',
            fieldName: 'description',
            fieldInstructions: 'Generate a detailed product description highlighting key features and specifications'
        });

        console.log('✅ Response Status:', response.status);
        console.log('📄 Response Data:', JSON.stringify(response.data, null, 2));
        
        // Check for grounded sources
        if (response.data.grounded_sources) {
            console.log('\n🔗 Grounded Sources Found:');
            response.data.grounded_sources.forEach((source, index) => {
                console.log(`  ${index + 1}. ${source.title} - ${source.url}`);
            });
        } else {
            console.log('\n❌ No grounded sources found in response');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
}

testAIGeneration();
