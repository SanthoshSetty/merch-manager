const fs = require('fs');
const crypto = require('crypto');

console.log('🔧 Service Account Key Validation Test');

try {
    // Load credentials
    const credentialsContent = fs.readFileSync('./credentials/service-account-key.json', 'utf8');
    const credentials = JSON.parse(credentialsContent);
    
    console.log('✅ Credentials file structure:');
    console.log('- Type:', credentials.type);
    console.log('- Project ID:', credentials.project_id);
    console.log('- Private Key ID:', credentials.private_key_id);
    console.log('- Client Email:', credentials.client_email);
    console.log('- Client ID:', credentials.client_id);
    console.log('- Auth URI:', credentials.auth_uri);
    console.log('- Token URI:', credentials.token_uri);
    console.log('- Universe Domain:', credentials.universe_domain);
    
    // Validate private key
    console.log('\n🔍 Private Key Validation:');
    const privateKey = credentials.private_key;
    
    try {
        // Try to create a crypto key object
        const keyObject = crypto.createPrivateKey(privateKey);
        console.log('✅ Private key is valid');
        console.log('- Key type:', keyObject.asymmetricKeyType);
        console.log('- Key size:', keyObject.asymmetricKeySize);
        console.log('- Key format:', keyObject.format);
        
        // Test signing
        const testData = 'test data for signing';
        const signature = crypto.sign('sha256', Buffer.from(testData), keyObject);
        console.log('✅ Private key can sign data');
        console.log('- Signature length:', signature.length);
        
    } catch (keyError) {
        console.error('❌ Private key validation failed:', keyError.message);
    }
    
    // Check key format details
    console.log('\n🔍 Private Key Format Analysis:');
    const lines = privateKey.split('\n');
    console.log('- Total lines:', lines.length);
    console.log('- First line:', lines[0]);
    console.log('- Last line:', lines[lines.length - 1]);
    console.log('- Empty lines count:', lines.filter(line => line.trim() === '').length);
    
    // Check for common issues
    console.log('\n🔍 Common Issues Check:');
    const hasCarriageReturns = privateKey.includes('\r');
    const hasTabCharacters = privateKey.includes('\t');
    const hasExtraSpaces = privateKey.includes('  '); // double spaces
    
    console.log('- Has carriage returns (\\r):', hasCarriageReturns);
    console.log('- Has tab characters:', hasTabCharacters);
    console.log('- Has extra spaces:', hasExtraSpaces);
    
    // Check timestamps
    console.log('\n🕐 Timestamp Analysis:');
    const now = Math.floor(Date.now() / 1000);
    console.log('- Current timestamp:', now);
    console.log('- Current time:', new Date().toISOString());
    
    // Extract key creation info if possible
    if (credentials.private_key_id) {
        console.log('- Private key ID format appears valid:', credentials.private_key_id.length === 40);
    }
    
} catch (error) {
    console.error('❌ Error during validation:', error.message);
}
