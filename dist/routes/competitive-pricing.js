"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const router = (0, express_1.Router)();
// Competitive pricing analysis endpoint
router.post('/analyze', (req, res) => {
    (async () => {
        try {
            const { productName, brand, country, currency } = req.body;
            console.log('🎯 Competitive pricing analysis requested:', { productName, brand, country, currency });
            // Validate required parameters
            if (!productName || !brand || !country || !currency) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required parameters: productName, brand, country, currency'
                });
            }
            // Check if we have a Gemini API key
            const geminiApiKey = process.env.GEMINI_API_KEY;
            if (!geminiApiKey) {
                console.log('⚠️ No GEMINI_API_KEY found, using fallback simulation');
                return generateFallbackPricingData(productName, brand, country, currency, res);
            }
            console.log('🐍 Executing Python competitive pricing analysis script...');
            // Path to the Python script
            const scriptPath = path_1.default.join(__dirname, '..', 'scripts', 'competitive_pricing_analyzer.py');
            // Execute the Python script
            const pythonProcess = (0, child_process_1.spawn)('python3', [
                scriptPath,
                '--product', productName,
                '--brand', brand,
                '--country', country,
                '--currency', currency,
                '--api-key', geminiApiKey
            ]);
            let stdout = '';
            let stderr = '';
            pythonProcess.stdout.on('data', (data) => {
                stdout += data.toString();
            });
            pythonProcess.stderr.on('data', (data) => {
                stderr += data.toString();
            });
            pythonProcess.on('close', (code) => {
                if (code !== 0) {
                    console.error('❌ Python script failed:', stderr);
                    // Fallback to simulation if Python script fails
                    console.log('🔄 Falling back to simulation mode...');
                    return generateFallbackPricingData(productName, brand, country, currency, res);
                }
                try {
                    // Parse the JSON output from Python script
                    const result = JSON.parse(stdout);
                    console.log('✅ Python analysis completed successfully');
                    console.log('📊 Found pricing data from Gemini API:', result.data?.length || 0, 'retailers');
                    res.json(result);
                }
                catch (parseError) {
                    console.error('❌ Failed to parse Python script output:', parseError);
                    console.log('Raw output:', stdout);
                    // Fallback to simulation
                    return generateFallbackPricingData(productName, brand, country, currency, res);
                }
            });
            pythonProcess.on('error', (error) => {
                console.error('❌ Failed to start Python process:', error);
                // Fallback to simulation
                return generateFallbackPricingData(productName, brand, country, currency, res);
            });
        }
        catch (error) {
            console.error('❌ Competitive pricing analysis error:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to analyze competitive pricing',
                code: 'COMPETITIVE_PRICING_ERROR'
            });
        }
    })();
});
// Fallback function to generate simulation data
function generateFallbackPricingData(productName, brand, country, currency, res) {
    console.log('📊 Generating fallback competitive pricing data...');
    const retailers = [
        `${brand} Official Store`,
        `Amazon ${country}`,
        `Best Buy ${country}`,
        `Local Electronics ${country}`,
        `Online Marketplace ${country}`
    ];
    const basePrice = 1200; // Base price for simulation
    const pricingData = retailers.map((retailer, index) => {
        const variation = (Math.random() - 0.5) * 200; // ±100 price variation
        const price = Math.max(basePrice + variation, basePrice * 0.8); // Minimum 80% of base price
        const formattedPrice = `${currency} ${price.toFixed(2)}`;
        let url = '';
        if (retailer.includes('Amazon')) {
            url = `https://www.amazon.com/search?k=${encodeURIComponent(productName)}`;
        }
        else if (retailer.includes('Best Buy')) {
            url = `https://www.bestbuy.com/site/searchpage.jsp?st=${encodeURIComponent(productName)}`;
        }
        else if (retailer.includes('Official Store')) {
            url = `https://www.${brand.toLowerCase().replace(/\s+/g, '')}.com`;
        }
        else {
            url = `https://example-retailer-${index}.com`;
        }
        return {
            'Retailer': retailer,
            [`Price (in ${currency})`]: formattedPrice,
            'Grounded URL': url,
            'Resolved URL': url,
            'Availability': index < 3 ? 'In Stock' : 'Limited Stock'
        };
    });
    console.log('✅ Fallback competitive pricing analysis completed');
    res.json({
        success: true,
        data: pricingData,
        metadata: {
            productName,
            brand,
            country,
            currency,
            analyzedRetailers: retailers.length,
            timestamp: new Date().toISOString(),
            source: 'Fallback Simulation',
            note: 'Using simulated data - set GEMINI_API_KEY environment variable for real API integration'
        }
    });
}
exports.default = router;
//# sourceMappingURL=competitive-pricing.js.map