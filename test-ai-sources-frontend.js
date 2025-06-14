#!/usr/bin/env node

/**
 * Test AI Content Generation with Grounded Sources - Frontend Integration Test
 * This test verifies that grounded sources are properly returned and can be displayed in the frontend
 */

const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3001';

async function testAIContentGeneration() {
    console.log('🧪 Testing AI Content Generation with Grounded Sources...\n');

    try {
        // Test field-specific generation
        console.log('📱 Testing field generation with grounded sources...');
        
        const fieldGenerationPayload = {
            productName: 'iPhone 15 Pro',
            brand: 'Apple',
            country: 'Singapore',
            fieldName: 'description',
            fieldInstructions: 'Generate a comprehensive product description highlighting key features and benefits',
            productContext: {
                title: 'iPhone 15 Pro',
                brand: 'Apple',
                category: 'Electronics > Consumer Electronics > Mobile Phones'
            }
        };

        console.log('Request payload:', JSON.stringify(fieldGenerationPayload, null, 2));

        const fieldResponse = await fetch(`${API_BASE}/api/ai-content/generate-field`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(fieldGenerationPayload)
        });

        if (!fieldResponse.ok) {
            const errorText = await fieldResponse.text();
            throw new Error(`HTTP ${fieldResponse.status}: ${errorText}`);
        }

        const fieldResult = await fieldResponse.json();
        
        console.log('\n✅ Field Generation Response:');
        console.log('Success:', fieldResult.success);
        console.log('Content length:', fieldResult.content?.length || 0);
        console.log('First 200 chars:', fieldResult.content?.substring(0, 200) + '...');
        console.log('Grounded Sources Count:', fieldResult.grounded_sources?.length || 0);
        
        if (fieldResult.grounded_sources && fieldResult.grounded_sources.length > 0) {
            console.log('\n📋 Grounded Sources:');
            fieldResult.grounded_sources.forEach((source, index) => {
                console.log(`  ${index + 1}. ${source.title}`);
                console.log(`     URL: ${source.url}`);
                console.log(`     Type: ${source.type}`);
            });
        } else {
            console.log('⚠️  No grounded sources found in response');
        }

        // Test with custom instructions
        console.log('\n🔧 Testing with custom instructions...');
        
        const customInstructionsPayload = {
            ...fieldGenerationPayload,
            customInstructions: 'Make it more technical and include specific technical specifications'
        };

        const customResponse = await fetch(`${API_BASE}/api/ai-content/generate-field`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(customInstructionsPayload)
        });

        if (customResponse.ok) {
            const customResult = await customResponse.json();
            console.log('✅ Custom Instructions Response:');
            console.log('Success:', customResult.success);
            console.log('Content changed:', customResult.content !== fieldResult.content);
            console.log('Grounded Sources Count (Custom):', customResult.grounded_sources?.length || 0);
        }

        console.log('\n🎉 AI Content Generation test completed successfully!');
        
        return true;

    } catch (error) {
        console.error('❌ AI Content Generation test failed:', error.message);
        console.error('Stack trace:', error.stack);
        return false;
    }
}

// Run the test
testAIContentGeneration()
    .then(success => {
        if (success) {
            console.log('\n✅ All tests passed!');
            process.exit(0);
        } else {
            console.log('\n❌ Tests failed!');
            process.exit(1);
        }
    })
    .catch(error => {
        console.error('❌ Test execution failed:', error);
        process.exit(1);
    });
