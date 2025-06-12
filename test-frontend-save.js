#!/usr/bin/env node

/**
 * Frontend Save Error Diagnostic Script
 * Tests the exact same format the frontend sends to identify the issue
 */

async function testFrontendSaveFormat() {
  const productId = 'premium-product-1749307137384';
  
  // Simulate problematic frontend data that might cause errors
  const testCases = [
    {
      name: 'Empty price field',
      data: {
        title: 'Test Product',
        price: '', // Empty string - could cause parseFloat(NaN)
        description: 'Test description'
      }
    },
    {
      name: 'Invalid price format',
      data: {
        title: 'Test Product', 
        price: 'invalid', // Non-numeric string
        description: 'Test description'
      }
    },
    {
      name: 'Missing required fields',
      data: {
        // Minimal data that might be missing required fields
        title: 'Test Product'
      }
    },
    {
      name: 'Large dataset like frontend sends',
      data: {
        title: 'Test Product Updated',
        description: 'Test description',
        price: '25.99',
        availability: 'in_stock',
        condition: 'new',
        brand: 'Test Brand',
        gtin: '123456789012',
        mpn: 'TEST-MPN-001',
        googleProductCategory: '1234',
        imageLink: 'https://example.com/image.jpg',
        salePrice: '', // Empty sale price
        costOfGoodsSold: '', // Empty COGS
        // Many other fields that frontend might send...
        customLabel0: '',
        customLabel1: '',
        customLabel2: '',
        customLabel3: '',
        customLabel4: '',
        externalSellerId: '',
        displayAdsId: '',
        adsGrouping: '',
        adsLabels: [],
        structuredTitle: '',
        digitalSourceType: '',
        pause: 'false',
        identifierExists: true,
        itemGroupId: '',
      }
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n🧪 Testing: ${testCase.name}`);
    console.log('=' .repeat(50));
    
    try {
      // Transform data exactly like frontend does
      const transformedData = {
        ...testCase.data,
        price: testCase.data.price ? {
          amountMicros: Math.round(parseFloat(testCase.data.price) * 1000000).toString(),
          currencyCode: 'USD'
        } : undefined,
        salePrice: testCase.data.salePrice ? {
          amountMicros: Math.round(parseFloat(testCase.data.salePrice) * 1000000).toString(),
          currencyCode: 'USD'
        } : undefined,
        costOfGoodsSold: testCase.data.costOfGoodsSold ? {
          amountMicros: Math.round(parseFloat(testCase.data.costOfGoodsSold) * 1000000).toString(),
          currencyCode: 'USD'
        } : undefined,
      };

      console.log('📊 Transformed data sample:');
      console.log('  Price field:', transformedData.price);
      console.log('  Sale Price field:', transformedData.salePrice);
      console.log('  COGS field:', transformedData.costOfGoodsSold);
      
      // Check for NaN values that could cause issues
      if (transformedData.price && isNaN(parseInt(transformedData.price.amountMicros))) {
        console.log('❌ PROBLEM: Price amountMicros is NaN!');
      }
      if (transformedData.salePrice && isNaN(parseInt(transformedData.salePrice.amountMicros))) {
        console.log('❌ PROBLEM: SalePrice amountMicros is NaN!');
      }
      if (transformedData.costOfGoodsSold && isNaN(parseInt(transformedData.costOfGoodsSold.amountMicros))) {
        console.log('❌ PROBLEM: COGS amountMicros is NaN!');
      }

      const response = await fetch(`http://localhost:3001/api/products/${encodeURIComponent(productId)}/fields`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          updates: transformedData,
          updateMask: Object.keys(transformedData).map(key => `attributes.${key}`).join(',')
        }),
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        console.log('✅ SUCCESS: Test case passed');
      } else {
        console.log('❌ FAILED: Test case failed');
        console.log('   Status:', response.status);
        console.log('   Error:', result.error || 'Unknown error');
        console.log('   Full response:', JSON.stringify(result, null, 2));
      }
    } catch (error) {
      console.log('❌ EXCEPTION during test:');
      console.log('   Error:', error.message);
    }
  }
}

// Run the diagnostic
testFrontendSaveFormat()
  .then(() => {
    console.log('\n🏁 Diagnostic complete!');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Diagnostic failed:', error);
    process.exit(1);
  });
