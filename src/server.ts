import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { ProductsClientFixed as ProductsClient } from './modules/products/ProductsClientFixed';
import { ReviewsClient } from './modules/reviews/ReviewsClient';
import { MerchantAuth } from './auth/MerchantAuth';
import competitivePricingRouter from './routes/competitive-pricing';
import aiContentRouter from './routes/ai-content';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({ 
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176',
    'http://localhost:5177',
    'http://localhost:5178',
    'http://localhost:5179',
    'http://localhost:5180',
    'http://localhost:5181',
    'http://localhost:5182',
    'http://localhost:5183',
    'http://localhost:5184',
    'http://localhost:5185',
    'https://merch-manager-frontend-361151780407.us-central1.run.app',
    ...(process.env.CORS_ORIGIN ? [process.env.CORS_ORIGIN] : [])
  ]
}));
app.use(express.json());

// Health check endpoint for Cloud Run
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'merch-manager-backend'
  });
});

// Readiness check endpoint for Cloud Run
app.get('/ready', (req, res) => {
  res.status(200).json({ 
    status: 'ready', 
    timestamp: new Date().toISOString(),
    service: 'merch-manager-backend'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Merch Manager Backend API',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET /health - Health check',
      'GET /api/health - Detailed health check',
      'GET /api/products - List products',
      'PATCH /api/products/:id/fields - Update product fields'
    ]
  });
});

// Mount routes
app.use('/api/competitive-pricing', competitivePricingRouter);
app.use('/api/ai-content', aiContentRouter);

// Initialize clients
const authManager = new MerchantAuth();
const productsClient = new ProductsClient(authManager);
const reviewsClient = new ReviewsClient(authManager);

// Demo mode flag
const DEMO_MODE = process.env.DEMO_MODE === 'true' || !process.env.GOOGLE_APPLICATION_CREDENTIALS;

// Field update endpoints
app.patch('/api/products/:productId/fields', async (req, res) => {
  try {
    const { productId } = req.params;
    const { updates, updateMask } = req.body;

    console.log('🔄 Field Update Request:');
    console.log('  📋 Product ID:', productId);
    console.log('  🔄 Updates:', JSON.stringify(updates, null, 2));
    console.log('  🎯 Update Mask:', updateMask);

    // Validate field updates
    const validatedUpdates = validateFieldUpdates(updates);
    
    // Generate minimal update mask
    const mask = generateUpdateMask(validatedUpdates);

    console.log('  ✅ Validated Updates:', JSON.stringify(validatedUpdates, null, 2));
    console.log('  ✅ Generated Mask:', mask);
    
    // Check if we should use demo mode
    if (DEMO_MODE) {
      console.log('🎭 Demo Mode: Simulating field update...');
      console.log('Product ID:', productId);
      console.log('Updates:', validatedUpdates);
      console.log('Update Mask:', mask);
      
      // Simulate API response
      const demoResult = {
        name: `accounts/5591219286/productInputs/${Date.now()}`,
        product: {
          offerId: productId,
          attributes: validatedUpdates
        },
        channel: "ONLINE",
        contentLanguage: "en",
        targetCountry: "US"
      };
      
      res.json({
        success: true,
        data: demoResult,
        updatedFields: Object.keys(validatedUpdates),
        updateMask: mask,
        mode: 'demo',
        message: 'Field update simulated successfully (Demo Mode)'
      });
      return;
    }
    
    // Call Google Merchant API (Production Mode)
    const result = await productsClient.updateProductFields(
      productId, 
      validatedUpdates, 
      mask
    );

    res.json({
      success: true,
      data: result,
      updatedFields: Object.keys(validatedUpdates),
      updateMask: mask,
      mode: 'production'
    });
  } catch (error: any) {
    console.error('Field update error:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Field update failed';
    let errorCode = error.code || 'FIELD_UPDATE_ERROR';
    
    if (error.response?.status === 404) {
      errorMessage = 'Product not found in Google Merchant Center. This could be due to incorrect product ID format or the product may not exist in your Merchant Center account.';
      errorCode = 'PRODUCT_NOT_FOUND';
    } else if (error.response?.status === 401 || error.response?.status === 403) {
      errorMessage = 'Authentication failed. Please check your Google Cloud credentials and ensure the service account has proper permissions.';
      errorCode = 'AUTHENTICATION_ERROR';
    } else if (error.response?.status === 400) {
      errorMessage = 'Invalid request format. Please check that all field values are correctly formatted.';
      errorCode = 'INVALID_REQUEST';
    }
    
    res.status(500).json({
      success: false,
      error: errorMessage,
      code: errorCode,
      originalError: error.message,
      suggestion: 'Try enabling Demo Mode by setting DEMO_MODE=true in your environment variables to test the interface without Google API calls.'
    });
  }
});

// Bulk field updates
app.patch('/api/products/bulk-fields', async (req, res) => {
  try {
    const { operations } = req.body;
    
    const results = await Promise.allSettled(
      operations.map((op: any) => 
        productsClient.updateProductFields(op.productId, op.updates, op.updateMask)
      )
    );

    res.json({
      success: true,
      results: results.map((result, index) => ({
        productId: operations[index].productId,
        success: result.status === 'fulfilled',
        data: result.status === 'fulfilled' ? result.value : null,
        error: result.status === 'rejected' ? (result.reason as Error).message : null
      }))
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get product endpoint
app.get('/api/products/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const result = await productsClient.getProduct(productId);
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      code: error.code || 'GET_PRODUCT_ERROR'
    });
  }
});

// List products endpoint
app.get('/api/products', async (req, res) => {
  try {
    const pageSize = parseInt(req.query.pageSize as string) || 25;
    const pageToken = req.query.pageToken as string;
    
    const result = await productsClient.listProducts(pageSize, pageToken);
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('List products error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      code: error.code || 'LIST_PRODUCTS_ERROR'
    });
  }
});

// Create product input endpoint (for new products)
app.post('/api/products', async (req, res) => {
  try {
    const { productData } = req.body;
    
    // Validate product data
    const validatedData = validateFieldUpdates(productData);
    
    const result = await productsClient.createProductInput(validatedData);
    
    res.json({
      success: true,
      data: result,
      message: 'Product input created successfully'
    });
  } catch (error: any) {
    console.error('Create product input error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      code: error.code || 'CREATE_PRODUCT_ERROR'
    });
  }
});

// Delete product input endpoint
app.delete('/api/products/inputs/:productInputId', async (req, res) => {
  try {
    const { productInputId } = req.params;
    
    const result = await productsClient.deleteProductInput(productInputId);
    
    res.json({
      success: true,
      data: result,
      message: 'Product input deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete product input error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      code: error.code || 'DELETE_PRODUCT_ERROR'
    });
  }
});

// ============================================
// REVIEWS API ENDPOINTS
// ============================================

// List product reviews
app.get('/api/reviews', async (req: Request, res: Response) => {
  try {
    const { pageSize = 25, pageToken, productId } = req.query;
    
    console.log('📋 Listing product reviews:', { pageSize, pageToken, productId });
    
    const result = await reviewsClient.listProductReviews(
      parseInt(pageSize as string), 
      pageToken as string,
      productId as string
    );
    
    res.json({
      success: true,
      data: result,
      totalReviews: result.productReviews?.length || 0
    });
  } catch (error: any) {
    console.error('List reviews error:', error.message);
    
    // Handle specific API access errors gracefully
    if (error.response?.status === 403) {
      const errorData = error.response?.data?.error;
      
      if (errorData?.message?.includes('not enabled')) {
        console.warn('⚠️ Google Merchant Reviews API not enabled');
        
        // Return successful response with API not enabled flag
        res.json({
          success: true,
          code: 'API_NOT_ENABLED',
          message: 'The Google Merchant Reviews API is not enabled for your Google Cloud project.',
          data: {
            productReviews: [],
            totalReviews: 0,
            mockData: true
          },
          instructions: {
            step1: 'Go to Google Cloud Console: https://console.cloud.google.com/apis/library',
            step2: 'Search for "Google Merchant API" or "merchantapi.googleapis.com"',
            step3: 'Enable the API and wait 5-10 minutes for propagation',
            step4: 'Retry the request'
          }
        });
        return;
      }
    }
    
    // For any other error (including auth issues), return graceful response
    console.log('📋 Reviews API unavailable, returning empty reviews list');
    res.json({
      success: true,
      code: 'API_NOT_ENABLED',
      message: 'Reviews API not available',
      data: {
        productReviews: [],
        totalReviews: 0,
        mockData: true
      }
    });
  }
});

// Get specific product review
app.get('/api/reviews/:productReviewId', async (req: Request, res: Response) => {
  try {
    const { productReviewId } = req.params;
    
    const result = await reviewsClient.getProductReview(productReviewId);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('Get review error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get review',
      code: error.code || 'GET_REVIEW_ERROR'
    });
  }
});

// Create product review
app.post('/api/reviews', async (req: Request, res: Response) => {
  try {
    const { productId, reviewData } = req.body;
    
    console.log('📝 Creating product review for product:', productId);
    console.log('📝 Review data:', reviewData);
    
    const result = await reviewsClient.createProductReview(productId, reviewData);
    
    res.json({
      success: true,
      data: result,
      message: 'Review created successfully'
    });
  } catch (error: any) {
    console.error('Create review error:', error.message);
    
    // Handle specific API access errors
    if (error.response?.status === 403) {
      const errorData = error.response?.data?.error;
      
      if (errorData?.message?.includes('not enabled')) {
        console.warn('⚠️ Google Merchant Reviews API not enabled');
        
        res.status(503).json({
          success: false,
          error: 'Google Merchant Reviews API not enabled',
          code: 'API_NOT_ENABLED',
          message: 'Cannot create reviews because the Google Merchant Reviews API is not enabled for your Google Cloud project.',
          instructions: {
            step1: 'Go to Google Cloud Console: https://console.cloud.google.com/apis/library',
            step2: 'Search for "Google Merchant API" or "merchantapi.googleapis.com"',
            step3: 'Enable the API and wait 5-10 minutes for propagation',
            step4: 'Retry creating the review'
          }
        });
        return;
      }
    }
    
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create review',
      code: error.code || 'CREATE_REVIEW_ERROR'
    });
  }
});

// Delete product review
app.delete('/api/reviews/:productReviewId', async (req: Request, res: Response) => {
  try {
    const { productReviewId } = req.params;
    
    await reviewsClient.deleteProductReview(productReviewId);
    
    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete review',
      code: error.code || 'DELETE_REVIEW_ERROR'
    });
  }
});

// Health check and authentication test endpoint
app.get('/api/health', async (req, res) => {
  try {
    console.log('🔍 Health check requested...');
    
    // Basic server health
    const health: any = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      server: 'running',
      merchantId: process.env.GOOGLE_MERCHANT_ID,
      hasCredentials: !!process.env.GOOGLE_APPLICATION_CREDENTIALS || !!(process.env.GOOGLE_CLOUD_PROJECT_ID || process.env.GCLOUD_PROJECT),
      credentialsPath: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      authMethod: process.env.GOOGLE_APPLICATION_CREDENTIALS ? 'service-account-key' : 'cloud-run-service-account'
    };

    // Test authentication
    try {
      console.log('Testing authentication...');
      const token = await authManager.getAccessToken();
      health.authentication = {
        status: 'success',
        tokenLength: token ? token.length : 0,
        tokenPresent: !!token
      };
      console.log('✅ Authentication successful');
    } catch (authError: any) {
      console.log('❌ Authentication failed:', authError.message);
      health.authentication = {
        status: 'failed',
        error: authError.message,
        errorCode: authError.code
      };
    }

    res.json({
      success: true,
      data: health
    });
  } catch (error: any) {
    console.error('Health check error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Check account access
app.get('/api/account', async (req, res) => {
  try {
    const result = await productsClient.getAccount();
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Account access error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      code: error.code || 'ACCOUNT_ACCESS_ERROR'
    });
  }
});

function validateFieldUpdates(updates: any) {
  // Check if updates is null or undefined
  if (!updates || typeof updates !== 'object') {
    console.warn('⚠️ Invalid updates object:', updates);
    return {};
  }

  console.log('🔍 Validating field updates:', JSON.stringify(updates, null, 2));

  const validFields = [
    'title', 'description', 'price', 'availability', 'condition',
    'brand', 'gtin', 'mpn', 'googleProductCategory', 'imageLink',
    'salePrice', 'salePriceEffectiveDate', 'costOfGoodsSold',
    'shippingWeight', 'shippingLength', 'shippingWidth', 'shippingHeight',
    'productWeight', 'productLength', 'productWidth', 'productHeight',
    'energyEfficiencyClass', 'taxCategory', 'shippingLabel'
  ];

  const validated: any = {};
  for (const [key, value] of Object.entries(updates)) {
    if (validFields.includes(key)) {
      validated[key] = value;
      console.log(`✅ Field '${key}' validated with value:`, value);
    } else {
      console.log(`❌ Field '${key}' is not valid, skipping`);
    }
  }

  console.log('🎯 Final validated updates:', JSON.stringify(validated, null, 2));
  return validated;
}

function generateUpdateMask(updates: any): string {
  const paths = [];
  
  for (const key of Object.keys(updates)) {
    // Convert form field names to API field paths
    if (key === 'title') paths.push('attributes.title');
    else if (key === 'description') paths.push('attributes.description');
    else if (key === 'price') paths.push('attributes.price');
    else if (key === 'salePrice') paths.push('attributes.salePrice');
    else if (key === 'availability') paths.push('attributes.availability');
    else if (key === 'condition') paths.push('attributes.condition');
    else if (key === 'brand') paths.push('attributes.brand');
    else if (key === 'gtin') paths.push('attributes.gtin');
    else if (key === 'mpn') paths.push('attributes.mpn');
    else if (key === 'googleProductCategory') paths.push('attributes.googleProductCategory');
    else if (key === 'imageLink') paths.push('attributes.imageLink');
    else if (key === 'costOfGoodsSold') paths.push('attributes.costOfGoodsSold');
    else if (key === 'salePriceEffectiveDate') paths.push('attributes.salePriceEffectiveDate');
    else if (key === 'energyEfficiencyClass') paths.push('attributes.energyEfficiencyClass');
    else if (key === 'taxCategory') paths.push('attributes.taxCategory');
    else if (key === 'shippingLabel') paths.push('attributes.shippingLabel');
    else if (key.startsWith('shipping') || key.startsWith('product')) {
      paths.push(`attributes.${key}`);
    }
  }

  return paths.join(',');
}

app.listen(PORT, () => {
  console.log(`🚀 Merchant API Server running on port ${PORT}`);
});
