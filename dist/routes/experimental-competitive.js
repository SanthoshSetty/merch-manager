"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const router = (0, express_1.Router)();
// Health check for experimental competitive analysis
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Experimental Competitive Analysis API',
        description: 'Testing new AI models and approaches for competitive analysis',
        endpoints: [
            'POST /analyze - Run experimental competitive analysis'
        ],
        model: 'gemini-2.5-flash-preview-04-17',
        features: ['thinking_budget', 'streaming_response', 'experimental_prompts'],
        status: 'experimental',
        timestamp: new Date().toISOString()
    });
});
// Experimental competitive analysis endpoint
router.post('/analyze', (req, res) => {
    (async () => {
        try {
            const { productName, brand, modelNumber } = req.body;
            console.log('🧪 Experimental competitive analysis requested:', { productName, brand, modelNumber });
            // Validate required parameters
            if (!productName || !brand) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required parameters: productName, brand'
                });
            }
            // Check if we have a Gemini API key
            const geminiApiKey = process.env.GEMINI_API_KEY;
            if (!geminiApiKey) {
                console.log('⚠️ No GEMINI_API_KEY found, using experimental fallback');
                return res.json({
                    success: true,
                    data: {
                        analysis: `Experimental Analysis for ${productName} by ${brand}\n\nThis is a fallback response for testing purposes.\n\nProduct: ${productName}\nBrand: ${brand}\nModel: ${modelNumber || 'Not specified'}\n\nNote: This is experimental data. Provide a valid GEMINI_API_KEY for real analysis.`,
                        raw_response: "Fallback experimental data"
                    },
                    metadata: {
                        productName,
                        brand,
                        modelNumber: modelNumber || '',
                        model_used: "gemini-2.5-flash-preview-04-17",
                        timestamp: new Date().toISOString(),
                        source: "Experimental Fallback (No API Key)",
                        thinking_budget: 8000,
                        note: "Fallback data used - provide GEMINI_API_KEY for real analysis"
                    }
                });
            }
            console.log('🐍 Executing experimental Python analysis script...');
            // Path to the experimental Python script
            const scriptPath = path_1.default.resolve(process.cwd(), 'src', 'scripts', 'experimental_competitive_analyzer.py');
            // Execute the experimental Python script
            const pythonArgs = [
                scriptPath,
                '--product', productName,
                '--brand', brand,
                '--api-key', geminiApiKey
            ];
            // Add model number if provided
            if (modelNumber && modelNumber.trim()) {
                pythonArgs.push('--model-number', modelNumber.trim());
            }
            const pythonProcess = (0, child_process_1.spawn)('python3', pythonArgs, {
                env: { ...process.env }
            });
            let stdout = '';
            let stderr = '';
            let processCompleted = false;
            // Set timeout for 60 seconds (experimental analysis might take longer)
            const timeout = setTimeout(() => {
                if (!processCompleted) {
                    console.log('⏰ Experimental script timeout (60s)...');
                    pythonProcess.kill();
                    res.status(500).json({
                        success: false,
                        error: 'Experimental analysis timed out',
                        code: 'EXPERIMENTAL_TIMEOUT'
                    });
                }
            }, 60000); // 60 seconds
            pythonProcess.stdout.on('data', (data) => {
                const chunk = data.toString();
                stdout += chunk;
                console.log('📤 Experimental stdout chunk:', chunk.substring(0, 200) + (chunk.length > 200 ? '...' : ''));
            });
            pythonProcess.stderr.on('data', (data) => {
                const chunk = data.toString();
                stderr += chunk;
                console.log('📤 Experimental stderr chunk:', chunk);
            });
            pythonProcess.on('close', (code) => {
                processCompleted = true;
                clearTimeout(timeout);
                console.log('🧪 Experimental process closed with code:', code);
                console.log('📝 Experimental stdout length:', stdout.length);
                console.log('📝 Experimental stderr length:', stderr.length);
                if (code === 0 && stdout.trim()) {
                    try {
                        const result = JSON.parse(stdout.trim());
                        console.log('✅ Experimental analysis completed successfully');
                        res.json(result);
                    }
                    catch (parseError) {
                        console.log('❌ Failed to parse experimental JSON response:', parseError);
                        res.status(500).json({
                            success: false,
                            error: 'Failed to parse experimental analysis response',
                            code: 'EXPERIMENTAL_PARSE_ERROR',
                            raw_output: stdout.substring(0, 1000)
                        });
                    }
                }
                else {
                    console.log('❌ Experimental analysis failed');
                    res.status(500).json({
                        success: false,
                        error: 'Experimental analysis script failed',
                        code: 'EXPERIMENTAL_SCRIPT_FAILED',
                        exit_code: code,
                        stderr: stderr.substring(0, 1000)
                    });
                }
            });
            pythonProcess.on('error', (error) => {
                processCompleted = true;
                clearTimeout(timeout);
                console.log('❌ Experimental process error:', error);
                res.status(500).json({
                    success: false,
                    error: 'Failed to execute experimental analysis script',
                    code: 'EXPERIMENTAL_EXECUTION_ERROR',
                    details: error.message
                });
            });
        }
        catch (error) {
            console.error('❌ Experimental competitive analysis error:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Internal server error during experimental analysis',
                code: 'EXPERIMENTAL_INTERNAL_ERROR'
            });
        }
    })();
});
exports.default = router;
//# sourceMappingURL=experimental-competitive.js.map