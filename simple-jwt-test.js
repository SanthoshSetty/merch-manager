const fs = require('fs');
const jwt = require('jsonwebtoken');

console.log('🔧 Simple JWT Test');

try {
    // Load credentials
    const credentialsContent = fs.readFileSync('./credentials/service-account-key.json', 'utf8');
    const credentials = JSON.parse(credentialsContent);
    
    console.log('✅ Credentials loaded');
    console.log('Service Account:', credentials.client_email);
    
    // Test JWT creation
    const now = Math.floor(Date.now() / 1000);
    const payload = {
        iss: credentials.client_email,
        scope: 'https://www.googleapis.com/auth/content',
        aud: 'https://oauth2.googleapis.com/token',
        exp: now + 3600,
        iat: now
    };
    
    const token = jwt.sign(payload, credentials.private_key, { 
        algorithm: 'RS256'
    });
    
    console.log('✅ JWT created successfully');
    console.log('Token length:', token.length);
    
    // Decode token
    const decoded = jwt.decode(token, { complete: true });
    console.log('Token header:', decoded.header);
    console.log('Token payload iss:', decoded.payload.iss);
    console.log('Token payload aud:', decoded.payload.aud);
    
} catch (error) {
    console.error('❌ Error:', error.message);
}
