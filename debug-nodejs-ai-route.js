#!/usr/bin/env node

/**
 * Debug Node.js AI Content Generation Route
 * This script tests the exact same flow as the Node.js server
 */

const { spawn } = require('child_process');
const path = require('path');

async function testNodeJSAIRoute() {
    console.log('🔍 Testing Node.js AI Route Debug...\n');

    const productName = 'iPhone 15 Pro';
    const brand = 'Apple';
    const country = 'Singapore';
    const fieldName = 'description';
    const fieldInstructions = 'Generate a short product description';
    const geminiApiKey = 'AIzaSyDyf3klZmEZaiqO0-VYkm7y01zlmhJK3wY';

    console.log('📋 Request parameters:');
    console.log({ productName, brand, country, fieldName, fieldInstructions });

    // Path to the Python script (same as Node.js server)
    const scriptPath = path.join(__dirname, 'src', 'scripts', 'ai_content_generator.py');
    console.log('🐍 Python script path:', scriptPath);

    // Prepare arguments (same as Node.js server)
    const args = [
        scriptPath,
        '--product', productName,
        '--brand', brand,
        '--country', country,
        '--mode', 'field',
        '--field-name', fieldName,
        '--field-instructions', fieldInstructions,
        '--api-key', geminiApiKey
    ];

    console.log('📝 Python arguments:', args);

    return new Promise((resolve, reject) => {
        // Execute the Python script (same as Node.js server)
        const pythonProcess = spawn('python3', args);

        let stdout = '';
        let stderr = '';
        let processCompleted = false;

        // Set timeout for 30 seconds
        const timeout = setTimeout(() => {
            if (!processCompleted) {
                console.log('⏰ Timeout (30s)');
                pythonProcess.kill();
                reject(new Error('Timeout'));
            }
        }, 30000);

        pythonProcess.stdout.on('data', (data) => {
            const chunk = data.toString();
            console.log('📤 STDOUT chunk:', chunk.length, 'bytes');
            stdout += chunk;
        });

        pythonProcess.stderr.on('data', (data) => {
            const chunk = data.toString();
            console.log('📥 STDERR chunk:', chunk.length, 'bytes');
            stderr += chunk;
        });

        pythonProcess.on('close', (code) => {
            processCompleted = true;
            clearTimeout(timeout);
            
            console.log('\n🏁 Process completed with code:', code);
            console.log('📄 Full STDOUT length:', stdout.length);
            console.log('📄 Full STDERR length:', stderr.length);
            
            if (code !== 0) {
                console.error('❌ Python script failed with code:', code);
                console.error('❌ STDERR:', stderr);
                reject(new Error(`Python script failed with code ${code}`));
                return;
            }

            try {
                console.log('🔍 Parsing JSON from stdout...');
                console.log('📝 Raw STDOUT:', stdout);
                
                const result = JSON.parse(stdout);
                console.log('✅ JSON parsed successfully');
                console.log('📊 Result summary:');
                console.log('  - Success:', result.success);
                console.log('  - Content length:', result.content?.length || 0);
                console.log('  - Grounded sources count:', result.grounded_sources?.length || 0);
                console.log('  - Sources count in metadata:', result.metadata?.sources_count || 0);
                
                if (result.grounded_sources && result.grounded_sources.length > 0) {
                    console.log('\n🔗 Grounded Sources:');
                    result.grounded_sources.forEach((source, index) => {
                        console.log(`  ${index + 1}. ${source.title} (${source.type})`);
                        console.log(`     ${source.url}`);
                    });
                } else {
                    console.log('⚠️  No grounded sources found');
                }
                
                resolve(result);
            } catch (parseError) {
                console.error('❌ Failed to parse JSON from stdout:', parseError);
                console.error('📄 Raw stdout:', stdout);
                reject(parseError);
            }
        });

        pythonProcess.on('error', (error) => {
            processCompleted = true;
            clearTimeout(timeout);
            console.error('❌ Failed to start Python process:', error);
            reject(error);
        });
    });
}

// Run the test
testNodeJSAIRoute()
    .then(result => {
        console.log('\n🎉 Test completed successfully!');
        console.log('🔗 Final grounded sources count:', result.grounded_sources?.length || 0);
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Test failed:', error.message);
        process.exit(1);
    });
