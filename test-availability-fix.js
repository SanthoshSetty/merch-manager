#!/usr/bin/env node

console.log('🧪 Testing Availability Value Fix...\n');

// Test the transformation logic
const testAvailabilityValues = [
  'in stock',      // From API (with space)
  'out of stock',  // From API (with space)  
  'in_stock',      // Already normalized
  'out_of_stock',  // Already normalized
  'preorder',      // No change needed
  'backorder'      // No change needed
];

function normalizeAvailability(availability) {
  return availability?.replace(/ /g, '_');
}

function getAvailabilityColor(availability) {
  const normalizedAvailability = availability?.replace(/ /g, '_');
  switch (normalizedAvailability) {
    case 'in_stock': return 'success';
    case 'out_of_stock': return 'error';
    case 'preorder': return 'warning';
    case 'backorder': return 'info';
    default: return 'default';
  }
}

console.log('📋 Testing availability value normalization:');
testAvailabilityValues.forEach(value => {
  const normalized = normalizeAvailability(value);
  const color = getAvailabilityColor(value);
  console.log(`  Input: "${value}" → Normalized: "${normalized}" → Color: ${color}`);
});

// Test with actual API data
async function testWithRealData() {
  try {
    console.log('\n🌐 Testing with real API data...');
    const response = await fetch('http://localhost:3001/api/products');
    const data = await response.json();
    
    if (data.success && data.data.products.length > 0) {
      const productsWithAvailability = data.data.products.filter(p => p.attributes?.availability);
      console.log(`✅ Found ${productsWithAvailability.length} products with availability data:`);
      
      productsWithAvailability.slice(0, 3).forEach((product, index) => {
        const availability = product.attributes.availability;
        const normalized = normalizeAvailability(availability);
        const color = getAvailabilityColor(availability);
        console.log(`  Product ${index + 1}: "${availability}" → "${normalized}" → ${color}`);
      });
      
      // Test that no "in stock" values will cause MUI errors
      const problematicValues = productsWithAvailability
        .map(p => p.attributes.availability)
        .filter(av => av.includes(' '));
        
      if (problematicValues.length > 0) {
        console.log(`⚠️  Found ${problematicValues.length} values with spaces that need normalization`);
        console.log('   These would cause MUI select errors without the fix');
      } else {
        console.log('✅ No problematic availability values found');
      }
      
    } else {
      console.log('❌ No products found or API error');
    }
  } catch (error) {
    console.error('❌ Error testing with real data:', error.message);
  }
}

testWithRealData();
