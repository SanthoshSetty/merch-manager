require('dotenv').config();
const { MerchantAuth } = require('./dist/auth/MerchantAuth');
const { ProductsClient } = require('./dist/modules/products/ProductsClient');

async function testCredentials() {
  try {
    console.log('🔑 Testing new credentials...');
    console.log('🔍 Environment check:');
    console.log('  - GOOGLE_APPLICATION_CREDENTIALS:', process.env.GOOGLE_APPLICATION_CREDENTIALS);
    console.log('  - GOOGLE_MERCHANT_ID:', process.env.GOOGLE_MERCHANT_ID);
    
    // Test authentication
    console.log('\n📋 Creating MerchantAuth instance...');
    const auth = new MerchantAuth();
    console.log('📋 Getting access token...');
    const token = await auth.getAccessToken();
    console.log('✅ Access token obtained successfully');
    console.log('🏷️  Token preview:', token ? token.substring(0, 20) + '...' : 'No token');
    
    // Test ProductsClient
    console.log('\n🛍️  Creating ProductsClient...');
    const productsClient = new ProductsClient(auth);
    
    // Test getting account info
    console.log('🏢 Getting account information...');
    const accountInfo = await productsClient.getAccount();
    console.log('✅ Account info retrieved successfully');
    console.log('📊 Account Name:', accountInfo.name);
    console.log('🆔 Account ID:', accountInfo.accountId);
    
    // Test listing products (but don't fail if no products)
    console.log('\n📦 Testing product listing...');
    try {
      const products = await productsClient.listProducts(5);
      console.log('✅ Products listed successfully');
      console.log('📈 Number of products:', products.products ? products.products.length : 0);
      if (products.products && products.products.length > 0) {
        console.log('📋 First product ID:', products.products[0].name);
      }
    } catch (productError) {
      console.log('⚠️  Product listing failed (this may be normal if no products exist):', productError.message);
    }
    
    console.log('\n🎉 Authentication test passed! New credentials are working correctly.');
    
  } catch (error) {
    console.error('\n❌ Credential test failed:', error.message);
    console.error('💡 Details:', error.response?.data || error.stack);
    console.error('🔍 Error type:', error.constructor.name);
    process.exit(1);
  }
}

console.log('🚀 Starting credential test...');
testCredentials().then(() => {
  console.log('✅ Test completed successfully');
}).catch((error) => {
  console.error('💥 Unhandled error:', error);
  process.exit(1);
});
