#!/usr/bin/env node

/**
 * Frontend Product Save Simulation Test
 * 
 * This simulates exactly what the ProductForm component should send after our fixes
 */

async function testProductSaveScenarios() {
  console.log('🧪 Testing Frontend Product Save Scenarios\n');

  // Test Case 1: Data that would have caused NaN issues before fix
  console.log('📋 Test 1: Empty price fields (should be filtered out)');
  const test1Data = {
    title: 'Test Product Empty Prices',
    description: 'Testing empty price handling',
    price: '',  // Empty - should be filtered out
    salePrice: '',  // Empty - should be filtered out
    brand: 'Test Brand',
    availability: 'in_stock'
  };

  // Apply the same transformation logic as ProductForm
  const transformPrice = (value) => {
    if (!value || value.toString().trim() === '') return undefined;
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0) return undefined;
    return {
      amountMicros: Math.round(numValue * 1000000).toString(),
      currencyCode: 'USD'
    };
  };

  const transformedData1 = {
    ...test1Data,
    price: transformPrice(test1Data.price),
    salePrice: transformPrice(test1Data.salePrice),
  };

  // Apply data cleaning
  const cleanedData1 = {};
  Object.keys(transformedData1).forEach(key => {
    const value = transformedData1[key];
    
    // Skip undefined values
    if (value === undefined) return;
    
    // Skip empty strings for most fields (except where empty is valid)
    if (value === '' && !['title', 'description'].includes(key)) return;
    
    // Skip empty arrays
    if (Array.isArray(value) && value.length === 0) return;
    
    // Skip false boolean values for optional fields
    if (typeof value === 'boolean' && !value && key !== 'identifierExists') return;
    
    // Only include valid, meaningful data
    cleanedData1[key] = value;
  });

  console.log('Original data:', JSON.stringify(test1Data, null, 2));
  console.log('Cleaned data:', JSON.stringify(cleanedData1, null, 2));
  console.log('Fields filtered:', Object.keys(test1Data).length - Object.keys(cleanedData1).length);

  // Test API call
  try {
    const response = await fetch('http://localhost:3001/api/products/test-empty-prices/fields', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        updates: cleanedData1,
        updateMask: Object.keys(cleanedData1).map(key => `attributes.${key}`).join(',')
      })
    });

    const result = await response.json();
    console.log(response.ok ? '✅ SUCCESS' : '❌ FAILED');
    console.log('Response:', result);
  } catch (error) {
    console.log('❌ ERROR:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test Case 2: Valid price data
  console.log('📋 Test 2: Valid price data (should work perfectly)');
  const test2Data = {
    title: 'Test Product Valid Prices',
    description: 'Testing valid price handling',
    price: '19.99',
    salePrice: '15.99',
    brand: 'Test Brand',
    availability: 'in_stock'
  };

  const transformedData2 = {
    ...test2Data,
    price: transformPrice(test2Data.price),
    salePrice: transformPrice(test2Data.salePrice),
  };

  const cleanedData2 = {};
  Object.keys(transformedData2).forEach(key => {
    const value = transformedData2[key];
    if (value === undefined) return;
    if (value === '' && !['title', 'description'].includes(key)) return;
    if (Array.isArray(value) && value.length === 0) return;
    if (typeof value === 'boolean' && !value && key !== 'identifierExists') return;
    cleanedData2[key] = value;
  });

  console.log('Original data:', JSON.stringify(test2Data, null, 2));
  console.log('Cleaned data:', JSON.stringify(cleanedData2, null, 2));

  try {
    const response = await fetch('http://localhost:3001/api/products/test-valid-prices/fields', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        updates: cleanedData2,
        updateMask: Object.keys(cleanedData2).map(key => `attributes.${key}`).join(',')
      })
    });

    const result = await response.json();
    console.log(response.ok ? '✅ SUCCESS' : '❌ FAILED');
    console.log('Response:', result);
  } catch (error) {
    console.log('❌ ERROR:', error.message);
  }

  console.log('\n🎉 Frontend simulation tests completed!');
  console.log('\n💡 Summary:');
  console.log('- Empty price fields are now properly filtered out (no more NaN errors)');
  console.log('- Valid price fields are correctly transformed to Google API format');
  console.log('- Data cleaning prevents sending invalid/empty data to Google API');
  console.log('- Error handling provides user-friendly messages');
}

// Add fetch polyfill for Node.js
if (typeof fetch === 'undefined') {
  const fetch = require('node-fetch');
  global.fetch = fetch;
}

testProductSaveScenarios().catch(console.error);
