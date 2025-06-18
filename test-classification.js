// Quick test to verify the classification logic
const { classifyOfficialWebsite } = require('./web/src/utils/officialWebsiteClassifier.ts');

console.log('Testing official website classification...\n');

const testCases = [
  { retailer: 'Mango Singapore', brand: 'Mango', url: 'https://shop.mango.com.sg' },
  { retailer: 'Apple Singapore', brand: 'Apple', url: 'https://www.apple.com.sg' },
  { retailer: 'Nike Singapore', brand: 'Nike', url: 'https://www.nike.com.sg' },
  { retailer: 'Amazon', brand: 'Mango', url: 'https://amazon.com' },
  { retailer: 'Mango', brand: 'Mango', url: 'https://shop.mango.com' },
];

testCases.forEach(({ retailer, brand, url }) => {
  const result = classifyOfficialWebsite(retailer, url, brand);
  console.log(`Retailer: "${retailer}", Brand: "${brand}"`);
  console.log(`  Result: ${result.isOfficial ? 'OFFICIAL' : 'NOT OFFICIAL'}`);
  console.log(`  Confidence: ${result.confidence}`);
  console.log(`  Match Type: ${result.matchType}`);
  console.log(`  Details: ${result.details}`);
  console.log('');
});
