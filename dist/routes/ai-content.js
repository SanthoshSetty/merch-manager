"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const router = (0, express_1.Router)();
// Comprehensive product analysis endpoint
router.post('/analyze-product', (req, res) => {
    (async () => {
        try {
            const { productName, brand, country = 'Global' } = req.body;
            console.log('🤖 AI comprehensive product analysis requested:', { productName, brand, country });
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
                console.log('⚠️ No GEMINI_API_KEY found, using fallback data');
                return generateFallbackProductData(productName, brand, country, res);
            }
            console.log('🐍 Executing AI comprehensive product analysis...');
            // Path to the Python script
            const scriptPath = path_1.default.join(__dirname, '..', 'scripts', 'ai_content_generator.py');
            // Execute the Python script
            const pythonProcess = (0, child_process_1.spawn)('python3', [
                scriptPath,
                '--product', productName,
                '--brand', brand,
                '--country', country,
                '--mode', 'comprehensive',
                '--api-key', geminiApiKey
            ]);
            let stdout = '';
            let stderr = '';
            let processCompleted = false;
            // Set timeout for 40 seconds
            const timeout = setTimeout(() => {
                if (!processCompleted) {
                    console.log('⏰ AI analysis timeout (40s), falling back...');
                    pythonProcess.kill();
                    generateFallbackProductData(productName, brand, country, res);
                }
            }, 40000);
            pythonProcess.stdout.on('data', (data) => {
                stdout += data.toString();
            });
            pythonProcess.stderr.on('data', (data) => {
                stderr += data.toString();
            });
            pythonProcess.on('close', (code) => {
                processCompleted = true;
                clearTimeout(timeout);
                if (code !== 0) {
                    console.error('❌ AI analysis script failed:', stderr);
                    return generateFallbackProductData(productName, brand, country, res);
                }
                try {
                    const result = JSON.parse(stdout);
                    console.log('✅ AI comprehensive analysis completed successfully');
                    res.json(result);
                }
                catch (parseError) {
                    console.error('❌ Failed to parse AI analysis output:', parseError);
                    return generateFallbackProductData(productName, brand, country, res);
                }
            });
            pythonProcess.on('error', (error) => {
                processCompleted = true;
                clearTimeout(timeout);
                console.error('❌ Failed to start AI analysis process:', error);
                return generateFallbackProductData(productName, brand, country, res);
            });
        }
        catch (error) {
            console.error('❌ AI comprehensive analysis error:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to analyze product',
                code: 'AI_ANALYSIS_ERROR'
            });
        }
    })();
});
// Field-specific content generation endpoint
router.post('/generate-field', (req, res) => {
    (async () => {
        try {
            const { productName, brand, fieldName, fieldInstructions, productContext } = req.body;
            console.log('🤖 AI field generation requested:', { productName, brand, fieldName });
            // Validate required parameters
            if (!productName || !brand || !fieldName || !fieldInstructions) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required parameters: productName, brand, fieldName, fieldInstructions'
                });
            }
            // Check if we have a Gemini API key
            const geminiApiKey = process.env.GEMINI_API_KEY;
            if (!geminiApiKey) {
                console.log('⚠️ No GEMINI_API_KEY found, using fallback content');
                return generateFallbackFieldContent(fieldName, fieldInstructions, productName, brand, res);
            }
            console.log('🐍 Executing AI field content generation...');
            // Path to the Python script
            const scriptPath = path_1.default.join(__dirname, '..', 'scripts', 'ai_content_generator.py');
            // Prepare arguments
            const args = [
                scriptPath,
                '--product', productName,
                '--brand', brand,
                '--mode', 'field',
                '--field-name', fieldName,
                '--field-instructions', fieldInstructions,
                '--api-key', geminiApiKey
            ];
            // Add product context if provided
            if (productContext) {
                args.push('--product-context', JSON.stringify(productContext));
            }
            // Execute the Python script
            const pythonProcess = (0, child_process_1.spawn)('python3', args);
            let stdout = '';
            let stderr = '';
            let processCompleted = false;
            // Set timeout for 30 seconds
            const timeout = setTimeout(() => {
                if (!processCompleted) {
                    console.log('⏰ AI field generation timeout (30s), falling back...');
                    pythonProcess.kill();
                    generateFallbackFieldContent(fieldName, fieldInstructions, productName, brand, res);
                }
            }, 30000);
            pythonProcess.stdout.on('data', (data) => {
                stdout += data.toString();
            });
            pythonProcess.stderr.on('data', (data) => {
                stderr += data.toString();
            });
            pythonProcess.on('close', (code) => {
                processCompleted = true;
                clearTimeout(timeout);
                if (code !== 0) {
                    console.error('❌ AI field generation script failed:', stderr);
                    return generateFallbackFieldContent(fieldName, fieldInstructions, productName, brand, res);
                }
                try {
                    const result = JSON.parse(stdout);
                    console.log('✅ AI field generation completed successfully');
                    res.json(result);
                }
                catch (parseError) {
                    console.error('❌ Failed to parse AI field generation output:', parseError);
                    return generateFallbackFieldContent(fieldName, fieldInstructions, productName, brand, res);
                }
            });
            pythonProcess.on('error', (error) => {
                processCompleted = true;
                clearTimeout(timeout);
                console.error('❌ Failed to start AI field generation process:', error);
                return generateFallbackFieldContent(fieldName, fieldInstructions, productName, brand, res);
            });
        }
        catch (error) {
            console.error('❌ AI field generation error:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to generate field content',
                code: 'AI_FIELD_GENERATION_ERROR'
            });
        }
    })();
});
// Fallback function for comprehensive product data
function generateFallbackProductData(productName, brand, country, res) {
    console.log('📊 Generating fallback comprehensive product data...');
    const fallbackData = {
        title: `${brand} ${productName}`,
        description: `The ${brand} ${productName} is a high-quality product designed to meet your needs. This product combines innovative technology with reliable performance, making it an excellent choice for consumers seeking quality and value.`,
        brand: brand,
        category: "Electronics > Consumer Electronics",
        condition: "new",
        availability: "in stock",
        age_group: "adult",
        gender: "unisex",
        custom_label_0: "High Quality",
        custom_label_1: "Reliable Performance",
        custom_label_2: "Innovative Design",
        custom_label_3: "User Friendly",
        custom_label_4: "Excellent Value"
    };
    res.json({
        success: true,
        data: fallbackData,
        metadata: {
            productName,
            brand,
            country,
            source: 'Fallback Product Data',
            timestamp: new Date().toISOString(),
            note: 'Fallback data used - set GEMINI_API_KEY environment variable for AI integration'
        }
    });
}
// Fallback function for field-specific content
function generateFallbackFieldContent(fieldName, fieldInstructions, productName, brand, res) {
    console.log('📊 Generating fallback field content...');
    let fallbackContent = `Generated content for ${fieldName}`;
    // Generate field-specific fallback content based on field name
    switch (fieldName.toLowerCase()) {
        case 'title':
            fallbackContent = `${brand} ${productName} - Premium Quality`;
            break;
        case 'description':
            fallbackContent = `Discover the exceptional ${brand} ${productName}, designed with precision and built to last. This product offers outstanding performance and reliability for all your needs.`;
            break;
        case 'condition':
            fallbackContent = 'new';
            break;
        case 'availability':
            fallbackContent = 'in stock';
            break;
        case 'age_group':
            fallbackContent = 'adult';
            break;
        case 'gender':
            fallbackContent = 'unisex';
            break;
        default:
            if (fieldName.includes('custom_label')) {
                fallbackContent = 'Premium Feature';
            }
            else if (fieldName.includes('price')) {
                fallbackContent = '0.00';
            }
            else {
                fallbackContent = `Generated ${fieldName} for ${brand} ${productName}`;
            }
    }
    res.json({
        success: true,
        content: fallbackContent,
        metadata: {
            fieldName,
            productName,
            brand,
            source: 'Fallback Field Content',
            timestamp: new Date().toISOString(),
            note: 'Fallback content used - set GEMINI_API_KEY environment variable for AI integration'
        }
    });
}
exports.default = router;
//# sourceMappingURL=ai-content.js.map