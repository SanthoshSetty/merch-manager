#!/usr/bin/env node

/**
 * Quick Python script test with timeout
 */

const { spawn } = require('child_process');
const path = require('path');

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

console.log('🧪 Quick Python test with 20s timeout...');

const pythonProcess = spawn('python3', args);
let stdout = '';
let stderr = '';
let completed = false;

const timeout = setTimeout(() => {
    if (!completed) {
        console.log('⏰ Timeout reached, killing process');
        pythonProcess.kill();
        completed = true;
        process.exit(1);
    }
}, 20000);

pythonProcess.stdout.on('data', (data) => {
    stdout += data.toString();
});

pythonProcess.stderr.on('data', (data) => {
    stderr += data.toString();
});

pythonProcess.on('close', (code) => {
    if (completed) return;
    completed = true;
    clearTimeout(timeout);
    
    console.log(`✅ Process completed with code: ${code}`);
    console.log(`📊 STDOUT: ${stdout.length} bytes`);
    console.log(`📊 STDERR: ${stderr.length} bytes`);
    
    if (stdout) {
        try {
            const result = JSON.parse(stdout);
            console.log(`🔗 Grounded sources: ${result.grounded_sources?.length || 0}`);
        } catch (e) {
            console.log('❌ JSON parse failed');
        }
    }
    
    process.exit(0);
});

pythonProcess.on('error', (error) => {
    if (completed) return;
    completed = true;
    clearTimeout(timeout);
    console.error('❌ Process error:', error.message);
    process.exit(1);
});
