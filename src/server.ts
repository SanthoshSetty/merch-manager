import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { ProductsClient } from './modules/products/ProductsClient';
import { MerchantAuth } from './auth/MerchantAuth';

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
    ...(process.env.CORS_ORIGIN ? [process.env.CORS_ORIGIN] : [])
  ]
}));
app.use(express.json());

// Initialize clients
const authManager = new MerchantAuth();
const productsClient = new ProductsClient(authManager);

// Demo mode flag
const DEMO_MODE = process.env.DEMO_MODE === 'true' || !process.env.GOOGLE_APPLICATION_CREDENTIALS;

// Field update endpoints
app.patch('/api/products/:productId/fields', async (req, res) => {
  try {
    const { productId } = req.params;
    const { updates, updateMask } = req.body;

    // Validate field updates
    const validatedUpdates = validateFieldUpdates(updates);
    
    // Generate minimal update mask
    const mask = generateUpdateMask(validatedUpdates);
    
    // Call Google Merchant API
    const result = await productsClient.updateProductFields(
      productId, 
      validatedUpdates, 
      mask
    );

    res.json({
      success: true,
      data: result,
      updatedFields: Object.keys(validatedUpdates),
      updateMask: mask
    });
  } catch (error: any) {
    console.error('Field update error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      code: error.code || 'FIELD_UPDATE_ERROR'
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
      hasCredentials: !!process.env.GOOGLE_APPLICATION_CREDENTIALS,
      credentialsPath: process.env.GOOGLE_APPLICATION_CREDENTIALS
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
    }
  }

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
