#!/usr/bin/env node

/**
 * Test Product Save Fix
 * 
 * This script tests the product saving functionality to verify that the
 * "Error saving product. Please try again." issue has been resolved.
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🧪 Testing Product Save Fix\n');

// Test data that previously caused issues
const testCases = [
  {
    name: 'Empty Price Fields',
    data: {
      title: 'Test Product',
      description: 'Test Description',
      price: '',  // Empty price - should not cause NaN
      salePrice: '',
      costOfGoodsSold: ''
    }
  },
  {
    name: 'Invalid Price Values',
    data: {
      title: 'Test Product 2',
      description: 'Test Description 2',
      price: 'invalid',  // Invalid price - should be filtered out
      salePrice: 'abc',
      costOfGoodsSold: '-10'  // Negative price - should be filtered out
    }
  },
  {
    name: 'Empty Arrays and Undefined Values',
    data: {
      title: 'Test Product 3',
      description: 'Test Description 3',
      price: '19.99',
      additionalImageLinks: [],  // Empty array - should be filtered out
      productTypes: [],
      brand: undefined,
      gtin: '',
      adult: false  // Should be filtered out for optional fields
    }
  },
  {
    name: 'Valid Complete Data',
    data: {
      title: 'Complete Test Product',
      description: 'Complete Test Description',
      price: '29.99',
      salePrice: '24.99',
      brand: 'Test Brand',
      gtin: '1234567890123',
      availability: 'in_stock',
      condition: 'new'
    }
  }
];

async function testProductSave(testCase, productId = 'test-product-123') {
  console.log(`\n📋 Testing: ${testCase.name}`);
  console.log('📊 Test data:', JSON.stringify(testCase.data, null, 2));
  
  try {
    // Simulate the data transformation logic from ProductForm
    const transformPrice = (value) => {
      if (!value || value.toString().trim() === '') return undefined;
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue < 0) return undefined;
      return {
        amountMicros: Math.round(numValue * 1000000).toString(),
        currencyCode: 'USD'
      };
    };

    const transformedData = {
      ...testCase.data,
      price: transformPrice(testCase.data.price),
      salePrice: transformPrice(testCase.data.salePrice),
      costOfGoodsSold: transformPrice(testCase.data.costOfGoodsSold),
    };

    // Apply the same data cleaning logic as ProductForm
    const cleanedData = {};
    Object.keys(transformedData).forEach(key => {
      const value = transformedData[key];
      
      // Skip undefined values
      if (value === undefined) return;
      
      // Skip empty strings for most fields (except where empty is valid)
      if (value === '' && !['title', 'description'].includes(key)) return;
      
      // Skip empty arrays
      if (Array.isArray(value) && value.length === 0) return;
      
      // Skip false boolean values for optional fields
      if (typeof value === 'boolean' && !value && key !== 'identifierExists') return;
      
      // Only include valid, meaningful data
      cleanedData[key] = value;
    });

    console.log('🔄 Transformed data:', JSON.stringify(transformedData, null, 2));
    console.log('✅ Cleaned data:', JSON.stringify(cleanedData, null, 2));
    console.log('📈 Original fields:', Object.keys(testCase.data).length);
    console.log('📉 Cleaned fields:', Object.keys(cleanedData).length);

    // Test the actual API call
    const requestBody = {
      updates: cleanedData,
      updateMask: Object.keys(cleanedData).map(key => `attributes.${key}`).join(',')
    };

    console.log('🌐 Making API request...');
    
    const response = await fetch(`http://localhost:3001/api/products/${encodeURIComponent(productId)}/fields`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ SUCCESS: Product save test passed');
      console.log('📋 Response:', result);
    } else {
      console.log('❌ FAILED: Product save test failed');
      console.log('📋 Error response:', result);
      console.log('📋 Status:', response.status, response.statusText);
    }

    return { success: response.ok, response: result, status: response.status };

  } catch (error) {
    console.log('❌ ERROR: Exception during test');
    console.log('📋 Error:', error.message);
    return { success: false, error: error.message };
  }
}

async function runAllTests() {
  console.log('🚀 Starting comprehensive product save tests...\n');
  
  const results = [];
  
  for (const testCase of testCases) {
    const result = await testProductSave(testCase);
    results.push({ testCase: testCase.name, ...result });
    
    // Wait a bit between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n📊 TEST SUMMARY');
  console.log('================');
  
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`✅ Passed: ${passed}/${results.length}`);
  console.log(`❌ Failed: ${failed}/${results.length}`);
  
  if (failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`- ${r.testCase}: ${r.error || r.response?.error || 'Unknown error'}`);
    });
  }
  
  if (passed === results.length) {
    console.log('\n🎉 ALL TESTS PASSED! The product save fix is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Review the errors above.');
  }
  
  return results;
}

// Check if server is running
async function checkServerHealth() {
  try {
    const response = await fetch('http://localhost:3001/api/products');
    if (response.ok) {
      console.log('✅ Backend server is running');
      return true;
    } else {
      console.log('❌ Backend server returned error:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Backend server is not accessible:', error.message);
    return false;
  }
}

// Run the tests
async function main() {
  const serverHealthy = await checkServerHealth();
  
  if (!serverHealthy) {
    console.log('\n⚠️  Make sure the backend server is running on port 3001');
    console.log('Run: npm run dev (in the root directory)');
    process.exit(1);
  }
  
  await runAllTests();
}

// Add fetch polyfill for Node.js
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch');
}

main().catch(console.error);
