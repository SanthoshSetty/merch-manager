#!/usr/bin/env node

/**
 * Simple test to verify Python script output processing
 */

const { spawn } = require('child_process');
const path = require('path');

async function testPythonOutput() {
    console.log('🧪 Testing Python script output processing...\n');

    const scriptPath = path.join(__dirname, 'src', 'scripts', 'ai_content_generator.py');
    const args = [
        scriptPath,
        '--product', 'iPhone 15 Pro',
        '--brand', 'Apple',
        '--country', 'Singapore',
        '--mode', 'field',
        '--field-name', 'description',
        '--field-instructions', 'Generate a short product description',
        '--api-key', 'AIzaSyDyf3klZmEZaiqO0-VYkm7y01zlmhJK3wY'
    ];

    console.log('🐍 Executing:', 'python3', args.join(' '));

    const pythonProcess = spawn('python3', args);

    let stdout = '';
    let stderr = '';

    pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString();
    });

    pythonProcess.on('close', (code) => {
        console.log(`\n📋 Process completed with exit code: ${code}`);
        console.log(`📄 STDOUT length: ${stdout.length} bytes`);
        console.log(`📄 STDERR length: ${stderr.length} bytes`);
        
        if (stderr) {
            console.log('\n🔍 STDERR content:');
            console.log(stderr);
        }
        
        console.log('\n🔍 STDOUT content:');
        console.log(stdout);
        
        if (stdout) {
            try {
                const result = JSON.parse(stdout);
                console.log('\n✅ Successfully parsed JSON');
                console.log('📊 Grounded sources count:', result.grounded_sources?.length || 0);
                
                if (result.grounded_sources && result.grounded_sources.length > 0) {
                    console.log('\n🔗 Grounded sources:');
                    result.grounded_sources.forEach((source, index) => {
                        console.log(`  ${index + 1}. ${source.title} (${source.type})`);
                    });
                } else {
                    console.log('⚠️  No grounded sources found');
                }
            } catch (error) {
                console.error('❌ Failed to parse JSON:', error.message);
            }
        }
    });

    pythonProcess.on('error', (error) => {
        console.error('❌ Failed to start process:', error);
    });
}

testPythonOutput();
