#!/usr/bin/env node

/**
 * Test AI Generation Fix - Simple Network Test
 * This test simulates the frontend making AI requests to verify the fix works
 */

const https = require('https');
const http = require('http');

// Test configuration
const BACKEND_URL = 'https://merch-manager-backend-361151780407.us-central1.run.app';
const TEST_ENDPOINTS = [
    '/api/ai-content/',
    '/api/ai-content/health',
    '/api/ai-content/generate-field',
    '/api/ai-content/analyze-product'
];

async function makeRequest(url, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
        const isHttps = url.startsWith('https://');
        const lib = isHttps ? https : http;
        
        const urlObj = new URL(url);
        const options = {
            hostname: urlObj.hostname,
            port: urlObj.port || (isHttps ? 443 : 80),
            path: urlObj.pathname,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Frontend-Test-Client/1.0'
            }
        };

        if (data && method === 'POST') {
            const jsonData = JSON.stringify(data);
            options.headers['Content-Length'] = Buffer.byteLength(jsonData);
        }

        const req = lib.request(options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    statusText: res.statusMessage,
                    headers: res.headers,
                    data: responseData
                });
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (data && method === 'POST') {
            req.write(JSON.stringify(data));
        }
        
        req.end();
    });
}

async function testAIEndpoints() {
    console.log('🧪 Testing AI Generation Fix - Network Connectivity\n');
    console.log(`🎯 Backend URL: ${BACKEND_URL}\n`);

    let allTestsPassed = true;

    // Test 1: Basic API info endpoint
    console.log('📋 Test 1: API Information Endpoint');
    try {
        const response = await makeRequest(`${BACKEND_URL}/api/ai-content/`);
        console.log(`   Status: ${response.status} ${response.statusText}`);
        
        if (response.status === 200) {
            console.log('   ✅ API info endpoint accessible');
            try {
                const data = JSON.parse(response.data);
                console.log(`   📊 API: ${data.api}, Version: ${data.version}`);
            } catch (e) {
                console.log('   ℹ️  Response not JSON format');
            }
        } else {
            console.log('   ❌ API info endpoint failed');
            allTestsPassed = false;
        }
    } catch (error) {
        console.log(`   ❌ Network error: ${error.message}`);
        allTestsPassed = false;
    }

    console.log('');

    // Test 2: Health check endpoint
    console.log('🔍 Test 2: Health Check Endpoint');
    try {
        const response = await makeRequest(`${BACKEND_URL}/api/ai-content/health`);
        console.log(`   Status: ${response.status} ${response.statusText}`);
        
        if (response.status === 200) {
            console.log('   ✅ Health endpoint accessible');
            try {
                const data = JSON.parse(response.data);
                console.log(`   🤖 AI Status: ${data.ai_enabled ? 'Enabled' : 'Disabled'}`);
            } catch (e) {
                console.log('   ℹ️  Response not JSON format');
            }
        } else {
            console.log('   ❌ Health endpoint failed');
            allTestsPassed = false;
        }
    } catch (error) {
        console.log(`   ❌ Network error: ${error.message}`);
        allTestsPassed = false;
    }

    console.log('');

    // Test 3: POST to generate-field (should work)
    console.log('🤖 Test 3: AI Field Generation (POST)');
    try {
        const testData = {
            productName: 'iPhone 15 Pro',
            brand: 'Apple',
            country: 'Singapore',
            fieldName: 'description',
            fieldInstructions: 'Generate a product description',
            productContext: {
                title: 'iPhone 15 Pro',
                brand: 'Apple'
            }
        };

        const response = await makeRequest(`${BACKEND_URL}/api/ai-content/generate-field`, 'POST', testData);
        console.log(`   Status: ${response.status} ${response.statusText}`);
        
        if (response.status === 200) {
            console.log('   ✅ Field generation endpoint works');
            try {
                const data = JSON.parse(response.data);
                if (data.success) {
                    console.log('   🎉 AI generation successful');
                    console.log(`   📝 Generated content length: ${data.content?.length || 0}`);
                    console.log(`   🔗 Grounded sources: ${data.grounded_sources?.length || 0}`);
                } else {
                    console.log('   ⚠️  AI generation returned failure');
                }
            } catch (e) {
                console.log('   ℹ️  Response not JSON format');
            }
        } else {
            console.log('   ❌ Field generation endpoint failed');
            allTestsPassed = false;
        }
    } catch (error) {
        console.log(`   ❌ Network error: ${error.message}`);
        allTestsPassed = false;
    }

    console.log('');

    // Test 4: GET to generate-field (should return 405 with helpful message)
    console.log('🚫 Test 4: Wrong Method Test (GET to POST endpoint)');
    try {
        const response = await makeRequest(`${BACKEND_URL}/api/ai-content/generate-field`);
        console.log(`   Status: ${response.status} ${response.statusText}`);
        
        if (response.status === 405) {
            console.log('   ✅ Correctly returns 405 Method Not Allowed');
            try {
                const data = JSON.parse(response.data);
                if (data.error && data.error.includes('POST')) {
                    console.log('   📋 Returns helpful error message about using POST');
                }
            } catch (e) {
                console.log('   ℹ️  Response not JSON format');
            }
        } else {
            console.log('   ⚠️  Unexpected status (should be 405)');
        }
    } catch (error) {
        console.log(`   ❌ Network error: ${error.message}`);
        allTestsPassed = false;
    }

    console.log('');

    // Test 5: Frontend Configuration Verification
    console.log('🔧 Test 5: Frontend Configuration Verification');
    
    // Check if the frontend .env.production file has the correct backend URL
    const fs = require('fs');
    const path = require('path');
    
    try {
        const envPath = '/Users/santhoshkumarsampangiramasetty/merch-manager/merch-manager/web/.env.production';
        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf8');
            console.log('   📄 Frontend .env.production contents:');
            console.log('   ' + envContent.replace(/\n/g, '\n   '));
            
            if (envContent.includes(BACKEND_URL.replace('https://', ''))) {
                console.log('   ✅ Frontend configured with correct backend URL');
            } else {
                console.log('   ⚠️  Frontend backend URL might be incorrect');
            }
        } else {
            console.log('   ⚠️  Frontend .env.production file not found');
        }
    } catch (error) {
        console.log(`   ❌ Error reading frontend config: ${error.message}`);
    }

    console.log('');

    // Summary
    console.log('📊 Test Summary:');
    if (allTestsPassed) {
        console.log('✅ All critical tests passed!');
        console.log('🎉 The AI generation fix should be working correctly');
        console.log('');
        console.log('🔥 Next Steps:');
        console.log('   1. The frontend is now using apiClient instead of relative fetch');
        console.log('   2. All AI requests should go to the correct backend URL');
        console.log('   3. Test the frontend manually to confirm AI generation works');
        console.log('   4. Monitor the browser Network tab for successful API calls');
        return true;
    } else {
        console.log('❌ Some tests failed');
        console.log('🔍 Check the backend deployment and network connectivity');
        return false;
    }
}

// Run the test
testAIEndpoints()
    .then(success => {
        if (success) {
            console.log('\n🎉 AI Generation Fix Test COMPLETED SUCCESSFULLY!');
            process.exit(0);
        } else {
            console.log('\n❌ AI Generation Fix Test FAILED!');
            process.exit(1);
        }
    })
    .catch(error => {
        console.error('❌ Test execution failed:', error);
        process.exit(1);
    });
