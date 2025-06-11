const fs = require('fs');
const jwt = require('jsonwebtoken');
const https = require('https');
const querystring = require('querystring');

console.log('🔧 Google Token Exchange Test');

async function testTokenExchange() {
    try {
        // Load credentials
        const credentialsContent = fs.readFileSync('./credentials/service-account-key.json', 'utf8');
        const credentials = JSON.parse(credentialsContent);
        
        console.log('✅ Credentials loaded');
        console.log('Service Account:', credentials.client_email);
        
        // Create JWT
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
        
        console.log('✅ JWT created, length:', token.length);
        
        // Prepare token exchange request
        const postData = querystring.stringify({
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion: token
        });
        
        const options = {
            hostname: 'oauth2.googleapis.com',
            port: 443,
            path: '/token',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postData)
            }
        };
        
        console.log('🔍 Making token exchange request...');
        
        return new Promise((resolve, reject) => {
            const req = https.request(options, (res) => {
                let data = '';
                
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    console.log('Response status:', res.statusCode);
                    console.log('Response headers:', res.headers);
                    
                    try {
                        const responseData = JSON.parse(data);
                        if (res.statusCode === 200) {
                            console.log('✅ Token exchange successful!');
                            console.log('Access token length:', responseData.access_token ? responseData.access_token.length : 'N/A');
                            console.log('Token type:', responseData.token_type);
                            console.log('Expires in:', responseData.expires_in);
                            resolve(responseData);
                        } else {
                            console.log('❌ Token exchange failed');
                            console.log('Error:', responseData.error);
                            console.log('Error description:', responseData.error_description);
                            reject(new Error(responseData.error_description || responseData.error));
                        }
                    } catch (parseError) {
                        console.log('❌ Failed to parse response:', data);
                        reject(parseError);
                    }
                });
            });
            
            req.on('error', (error) => {
                console.error('❌ Request error:', error.message);
                reject(error);
            });
            
            req.write(postData);
            req.end();
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        throw error;
    }
}

testTokenExchange().catch(console.error);
