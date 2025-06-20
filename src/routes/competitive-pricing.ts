import { Router } from 'express';
import { spawn } from 'child_process';
import path from 'path';

const router = Router();

// Health check and available endpoints for competitive pricing
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Competitive Pricing API',
    endpoints: [
      'POST /analyze - Analyze competitive pricing for a product'
    ],
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// Competitive pricing analysis endpoint
router.post('/analyze', (req, res) => {
  (async () => {
    try {
      const { productName, brand, modelNumber, country, currency } = req.body;
    
    console.log('🎯 Competitive pricing analysis requested:', { productName, brand, modelNumber, country, currency });
    
    // Validate required parameters - currency is optional
    if (!productName || !brand || !country) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: productName, brand, country'
      });
    }

    // Check if we have a Gemini API key
    const geminiApiKey = process.env.GEMINI_API_KEY;
    
    if (!geminiApiKey) {
      console.log('⚠️ No GEMINI_API_KEY found, using fallback simulation');
      return generateFallbackPricingData(productName, brand, modelNumber, country, currency || 'USD', res);
    }

    console.log('🐍 Executing Python competitive pricing analysis script...');
    
    // Path to the Python script - using absolute path to source directory
    const scriptPath = path.resolve(process.cwd(), 'src', 'scripts', 'competitive_pricing_analyzer.py');
    
    // Execute the Python script with environment variables
    const pythonArgs = [
      scriptPath,
      '--product', productName,
      '--brand', brand,
      '--country', country,
      '--api-key', geminiApiKey
    ];

    // Add currency if provided
    if (currency && currency.trim()) {
      pythonArgs.push('--currency', currency.trim());
    }

    // Add model number if provided
    if (modelNumber && modelNumber.trim()) {
      pythonArgs.push('--model-number', modelNumber.trim());
    }

    const pythonProcess = spawn('python3', pythonArgs, {
      env: { ...process.env }
    });

    let stdout = '';
    let stderr = '';
    let processCompleted = false;

    // Set timeout for 40 seconds
    const timeout = setTimeout(() => {
      if (!processCompleted) {
        console.log('⏰ Python script timeout (40s), falling back to simulation...');
        pythonProcess.kill();
        generateFallbackPricingData(productName, brand, modelNumber || '', country, currency, res);
      }
    }, 40000); // 40 seconds

    pythonProcess.stdout.on('data', (data) => {
      const chunk = data.toString();
      stdout += chunk;
      console.log('📤 Python stdout chunk:', chunk.substring(0, 200) + (chunk.length > 200 ? '...' : ''));
    });

    pythonProcess.stderr.on('data', (data) => {
      const chunk = data.toString();
      stderr += chunk;
      console.log('📤 Python stderr chunk:', chunk);
    });

    pythonProcess.on('close', (code) => {
      processCompleted = true;
      clearTimeout(timeout);
      
      console.log('🐍 Python process closed with code:', code);
      console.log('📝 Full stdout length:', stdout.length);
      console.log('📝 Full stderr length:', stderr.length);
      
      if (code !== 0) {
        console.error('❌ Python script failed with code:', code);
        console.error('❌ Stderr content:', stderr);
        
        // Fallback to simulation if Python script fails
        console.log('🔄 Falling back to simulation mode...');
        return generateFallbackPricingData(productName, brand, modelNumber || '', country, currency, res);
      }

      try {
        // Parse the JSON output from Python script
        console.log('🔍 Attempting to parse JSON output...');
        console.log('📄 Raw stdout (first 500 chars):', stdout.substring(0, 500));
        
        const result = JSON.parse(stdout);
        
        console.log('✅ Python analysis completed successfully');
        console.log('📊 Found pricing data from Gemini API:', result.data?.length || 0, 'retailers');
        
        res.json(result);
      } catch (parseError) {
        console.error('❌ Failed to parse Python script output:', parseError);
        console.log('💾 Raw output length:', stdout.length);
        console.log('💾 Raw output preview:', stdout.substring(0, 1000));
        
        // Fallback to simulation
        return generateFallbackPricingData(productName, brand, modelNumber || '', country, currency, res);
      }
    });

    pythonProcess.on('error', (error) => {
      processCompleted = true;
      clearTimeout(timeout);
      console.error('❌ Failed to start Python process:', error);
      
      // Fallback to simulation
      return generateFallbackPricingData(productName, brand, modelNumber || '', country, currency, res);
    });

  } catch (error: any) {
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
function generateFallbackPricingData(productName: string, brand: string, modelNumber: string, country: string, currency: string, res: any) {
  console.log('📊 Generating fallback competitive pricing data...');
  
  const productNameWithModel = modelNumber ? `${productName} ${modelNumber}` : productName;
  
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
      url = `https://www.amazon.com/search?k=${encodeURIComponent(productNameWithModel)}`;
    } else if (retailer.includes('Best Buy')) {
      url = `https://www.bestbuy.com/site/searchpage.jsp?st=${encodeURIComponent(productNameWithModel)}`;
    } else if (retailer.includes('Official Store')) {
      url = `https://www.${brand.toLowerCase().replace(/\s+/g, '')}.com`;
    } else {
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
      productName: productNameWithModel,
      brand,
      modelNumber,
      country,
      currency,
      analyzedRetailers: retailers.length,
      timestamp: new Date().toISOString(),
      source: 'Fallback Simulation',
      note: 'Using simulated data - set GEMINI_API_KEY environment variable for real API integration'
    }
  });
}

export default router;
