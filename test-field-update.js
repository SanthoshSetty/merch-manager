#!/usr/bin/env node

// Test script to verify field update functionality
const fetch = require('node-fetch');

async function testFieldUpdate() {
  const productId = 'premium-product-1749307137384';
  const testUpdate = {
    title: 'Premium Integration Test Product - Updated'
  };

  try {
    console.log('🧪 Testing field update API...');
    console.log('Product ID:', productId);
    console.log('Update data:', testUpdate);

    const response = await fetch(`http://localhost:3001/api/products/${encodeURIComponent(productId)}/fields`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        updates: testUpdate,
        updateMask: 'attributes.title'
      }),
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Field update successful!');
      console.log('Response:', JSON.stringify(result, null, 2));
    } else {
      console.log('❌ Field update failed!');
      console.log('Status:', response.status);
      console.log('Error:', JSON.stringify(result, null, 2));
    }
  } catch (error) {
    console.error('💥 Test error:', error.message);
  }
}

testFieldUpdate();
