const { GoogleAuth } = require('google-auth-library');
const { google } = require('googleapis');

console.log('🔧 Google Cloud Project API Check');

async function checkProjectAPIs() {
    try {
        // Test with cloud resource manager API to check if basic auth works
        console.log('\n🔍 Testing basic Google Cloud authentication...');
        
        const auth = new GoogleAuth({
            keyFile: './credentials/service-account-key.json',
            scopes: ['https://www.googleapis.com/auth/cloud-platform']
        });
        
        const authClient = await auth.getClient();
        console.log('✅ Basic auth client created');
        
        // Try to get project info
        const cloudresourcemanager = google.cloudresourcemanager('v1');
        
        try {
            const projectResponse = await cloudresourcemanager.projects.get({
                auth: authClient,
                projectId: 'neon-vigil-395120'
            });
            
            console.log('✅ Project accessible:');
            console.log('- Project Name:', projectResponse.data.name);
            console.log('- Project Number:', projectResponse.data.projectNumber);
            console.log('- Lifecycle State:', projectResponse.data.lifecycleState);
            
        } catch (projectError) {
            console.log('❌ Project access failed:', projectError.message);
            console.log('- Status:', projectError.status);
            if (projectError.errors) {
                console.log('- Errors:', projectError.errors);
            }
        }
        
        // Test service usage API to check enabled APIs
        console.log('\n🔍 Checking enabled APIs...');
        try {
            const serviceusage = google.serviceusage('v1');
            const servicesResponse = await serviceusage.services.list({
                auth: authClient,
                parent: 'projects/neon-vigil-395120',
                filter: 'state:ENABLED'
            });
            
            console.log('✅ Enabled APIs found:', servicesResponse.data.services?.length || 0);
            
            const relevantAPIs = servicesResponse.data.services?.filter(service => 
                service.config.name.includes('content') || 
                service.config.name.includes('merchant') ||
                service.config.name.includes('shopping')
            );
            
            if (relevantAPIs && relevantAPIs.length > 0) {
                console.log('🛍️ Shopping/Merchant related APIs:');
                relevantAPIs.forEach(api => {
                    console.log(`- ${api.config.name}: ${api.state}`);
                });
            } else {
                console.log('⚠️ No shopping/merchant related APIs found enabled');
            }
            
        } catch (apiError) {
            console.log('❌ API listing failed:', apiError.message);
        }
        
    } catch (error) {
        console.error('❌ Overall test failed:', error.message);
        
        if (error.message.includes('Invalid JWT Signature')) {
            console.log('\n💡 JWT Signature Error - Possible Solutions:');
            console.log('1. The service account key may have been regenerated');
            console.log('2. The service account may have been deleted/disabled');
            console.log('3. The private key may be corrupted in Google\'s system');
            console.log('4. Time synchronization issues (though unlikely given crypto tests passed)');
        }
    }
}

checkProjectAPIs();
