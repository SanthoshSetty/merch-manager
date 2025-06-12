#!/usr/bin/env node

/**
 * Debug ProductForm Save Error
 * Tests the exact format that's causing the 400 error
 */

async function debugProductFormError() {
  console.log('🐛 Debugging ProductForm Save Error');
  console.log('=' .repeat(50));
  
  const productId = 'premium-product-1749307137384';
  
  // Test the exact format that ProductForm.tsx sends with typical user data
  const testData = {
    // Basic fields that users commonly fill
    title: 'Test Product with Common Data',
    description: 'A test description for debugging',
    
    // Price fields - these are often problematic
    price: {
      amountMicros: '25990000', // 25.99 * 1000000
      currencyCode: 'USD'
    },
    
    // Common fields that might have validation issues
    availability: 'in_stock',
    condition: 'new',
    brand: 'Test Brand',
    gtin: '123456789012',
    
    // Fields that might be empty or undefined
    mpn: '',
    googleProductCategory: '',
    imageLink: '',
    
    // Extended fields that ProductForm includes
    salePrice: undefined, // This could be problematic
    costOfGoodsSold: undefined,
    
    // Fields that might have various types
    identifierExists: true,
    pause: 'false',
    adsLabels: [], // Array field
    productHighlights: [] // Another array field
  };

  console.log('📊 Test data structure:');
  console.log(JSON.stringify(testData, null, 2));

  console.log('\n🔍 Checking for potential issues:');
  
  // Check for undefined values
  const undefinedFields = Object.entries(testData)
    .filter(([key, value]) => value === undefined)
    .map(([key]) => key);
  
  if (undefinedFields.length > 0) {
    console.log('⚠️  Undefined fields found:', undefinedFields);
  }
  
  // Check for empty strings
  const emptyStringFields = Object.entries(testData)
    .filter(([key, value]) => value === '')
    .map(([key]) => key);
    
  if (emptyStringFields.length > 0) {
    console.log('⚠️  Empty string fields found:', emptyStringFields);
  }
  
  // Check for array fields
  const arrayFields = Object.entries(testData)
    .filter(([key, value]) => Array.isArray(value))
    .map(([key, value]) => `${key}: [${value.length} items]`);
    
  if (arrayFields.length > 0) {
    console.log('📋 Array fields found:', arrayFields);
  }

  try {
    console.log('\n📡 Testing API call...');
    
    const response = await fetch(`http://localhost:3001/api/products/${encodeURIComponent(productId)}/fields`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        updates: testData,
        updateMask: Object.keys(testData)
          .filter(key => testData[key] !== undefined) // Exclude undefined values
          .map(key => `attributes.${key}`)
          .join(',')
      }),
    });

    const result = await response.json();
    
    console.log('📊 Response details:');
    console.log('  Status:', response.status);
    console.log('  OK:', response.ok);
    console.log('  Result:', JSON.stringify(result, null, 2));
    
    if (!response.ok) {
      console.log('\n❌ ERROR IDENTIFIED:');
      console.log('  This reproduces the ProductForm error!');
      console.log('  Check server logs for detailed validation failures');
    } else {
      console.log('\n✅ SUCCESS:');
      console.log('  Test data worked, issue might be with different data');
    }
    
  } catch (error) {
    console.error('\n💥 Network/Parse Error:', error.message);
  }
}

// Run the debug test
debugProductFormError()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Debug failed:', error);
    process.exit(1);
  });
