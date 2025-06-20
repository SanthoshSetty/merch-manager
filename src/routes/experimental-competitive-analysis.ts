import { Router } from 'express';
import { spawn } from 'child_process';
import path from 'path';

const router = Router();

console.log('🧪 Experimental competitive analysis router created');

// Experimental competitive analysis endpoint
router.post('/analyze', (req, res) => {
  console.log('🧪 Route handler called for /analyze');
  (async () => {
    try {
    console.log('🧪 Experimental competitive analysis request received:', req.body);
    
    const { productName, brand, modelNumber, description, country } = req.body;
    
    // Validate required fields
    if (!productName || !brand) {
      return res.status(400).json({
        success: false,
        error: 'Product name and brand are required for experimental analysis',
        code: 'MISSING_REQUIRED_FIELDS'
      });
    }
    
    // Prepare arguments for the experimental Python script
    const scriptPath = path.join(process.cwd(), 'src/scripts/experimental_competitive_analyzer.py');
    const args = [
      scriptPath,
      '--product', productName,
      '--brand', brand
    ];
    
    // Add optional model number if provided
    if (modelNumber && modelNumber.trim()) {
      args.push('--model-number', modelNumber.trim());
    }
    
    // Add optional country if provided, default to 'Global'
    const searchCountry = country && country.trim() ? country.trim() : 'Global';
    args.push('--country', searchCountry);
    
    console.log('🧪 Running experimental script with args:', args);
    
    // Execute the experimental Python script
    const pythonProcess = spawn('python3', args, {
      cwd: __dirname,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let stdout = '';
    let stderr = '';
    
    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
      console.log('🧪 Experimental script stderr:', data.toString());
    });
    
    pythonProcess.on('close', (code) => {
      console.log(`🧪 Experimental script finished with code: ${code}`);
      
      if (code !== 0) {
        console.error('🧪 Experimental script failed:', stderr);
        return res.status(500).json({
          success: false,
          error: 'Experimental analysis script failed',
          code: 'SCRIPT_EXECUTION_ERROR',
          details: stderr
        });
      }
      
      try {
        // Parse the JSON output from the experimental script
        const result = JSON.parse(stdout);
        console.log('🧪 Experimental analysis completed successfully');
        
        // Extract retailers in the required format
        const retailers = result.retailers || [];
        
        // Return the experimental analysis result with standardized format
        res.json({
          success: true,
          retailers: retailers,  // Primary output: retailer, officialsite, url, price
          data: result,
          metadata: {
            endpoint: 'experimental-competitive-analysis',
            timestamp: new Date().toISOString(),
            version: '1.0.0-experimental',
            model: 'gemini-2.5-flash-preview-04-17',
            total_retailers: retailers.length
          }
        });
        
      } catch (parseError) {
        console.error('🧪 Failed to parse experimental script output:', parseError);
        console.error('🧪 Raw stdout:', stdout);
        
        res.status(500).json({
          success: false,
          error: 'Failed to parse experimental analysis results',
          code: 'PARSE_ERROR',
          details: parseError instanceof Error ? parseError.message : String(parseError),
          raw_output: stdout
        });
      }
    });
    
    pythonProcess.on('error', (error) => {
      console.error('🧪 Failed to start experimental script:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to start experimental analysis script',
        code: 'SCRIPT_START_ERROR',
        details: error instanceof Error ? error.message : String(error)
      });
    });
    
  } catch (error) {
    console.error('🧪 Experimental competitive analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during experimental analysis',
      code: 'INTERNAL_ERROR',
      details: error instanceof Error ? error.message : String(error)
    });
  }
  })();
});

console.log('🧪 Experimental competitive analysis router exporting with', router.stack.length, 'routes');

export default router;
