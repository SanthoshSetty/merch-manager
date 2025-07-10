import { Router } from 'express';
import multer from 'multer';
import csv from 'csv-parser';
import { Readable } from 'stream';

const router = Router();

// Configure multer for file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
});

// Interface for CSV row data
interface CSVRow {
  [key: string]: any;
}

// Field mapping configuration
const fieldMappings: Record<string, string> = {
  'title': 'title',
  'product title': 'title',
  'name': 'title',
  'description': 'description',
  'product description': 'description',
  'price': 'price',
  'sale price': 'salePrice',
  'availability': 'availability',
  'condition': 'condition',
  'brand': 'brand',
  'gtin': 'gtin',
  'mpn': 'mpn',
  'google product category': 'googleProductCategory',
  'category': 'googleProductCategory',
  'image link': 'imageLink',
  'image url': 'imageLink',
  'color': 'color',
  'material': 'material',
  'size': 'size',
  'age group': 'ageGroup',
  'gender': 'gender',
  'item group id': 'itemGroupId',
  'product weight': 'productWeight',
  'weight': 'productWeight',
  'product length': 'productLength',
  'length': 'productLength',
  'product width': 'productWidth',
  'width': 'productWidth',
  'product height': 'productHeight',
  'height': 'productHeight',
};

// Validate CSV data
function validateCSVData(rows: CSVRow[], mappings: Record<string, string>) {
  const errors: string[] = [];
  const warnings: string[] = [];

  rows.forEach((row, index) => {
    const rowNumber = index + 1;

    // Check for required fields
    if (!row.title && !getValueByMapping(row, 'title', mappings)) {
      errors.push(`Row ${rowNumber}: Missing required field 'title'`);
    }

    // Validate price fields
    ['price', 'salePrice'].forEach(priceField => {
      const value = getValueByMapping(row, priceField, mappings);
      if (value && isNaN(parseFloat(value))) {
        errors.push(`Row ${rowNumber}: Invalid ${priceField} format: ${value}`);
      }
    });

    // Validate availability
    const availability = getValueByMapping(row, 'availability', mappings);
    if (availability) {
      const validAvailabilities = ['in_stock', 'out_of_stock', 'preorder', 'backorder'];
      if (!validAvailabilities.includes(availability.toLowerCase())) {
        warnings.push(`Row ${rowNumber}: Unknown availability value: ${availability}`);
      }
    }

    // Validate condition
    const condition = getValueByMapping(row, 'condition', mappings);
    if (condition) {
      const validConditions = ['new', 'refurbished', 'used'];
      if (!validConditions.includes(condition.toLowerCase())) {
        warnings.push(`Row ${rowNumber}: Unknown condition value: ${condition}`);
      }
    }
  });

  return { errors, warnings };
}

// Get value using field mapping
function getValueByMapping(row: CSVRow, field: string, mappings: Record<string, string>): any {
  const mappedKey = Object.keys(mappings).find(key => mappings[key] === field);
  return mappedKey ? row[mappedKey] : row[field];
}

// Auto-detect field mappings from CSV headers
function autoDetectMappings(headers: string[]): Record<string, string> {
  const detectedMappings: Record<string, string> = {};

  headers.forEach(header => {
    const normalizedHeader = header.toLowerCase().trim();
    const mappedField = fieldMappings[normalizedHeader];
    
    if (mappedField) {
      detectedMappings[header] = mappedField;
    } else {
      // Try partial matching
      for (const [key, value] of Object.entries(fieldMappings)) {
        if (normalizedHeader.includes(key) || key.includes(normalizedHeader)) {
          detectedMappings[header] = value;
          break;
        }
      }
    }
  });

  return detectedMappings;
}

// Transform CSV row to product data
function transformRowToProductData(row: CSVRow, mappings: Record<string, string>): any {
  const productData: any = {};

  Object.entries(mappings).forEach(([csvHeader, fieldKey]) => {
    const value = row[csvHeader];
    
    if (value !== undefined && value !== '') {
      // Transform specific field types
      switch (fieldKey) {
        case 'price':
        case 'salePrice':
          const numValue = parseFloat(value);
          if (!isNaN(numValue)) {
            productData[fieldKey] = {
              amountMicros: Math.round(numValue * 1000000).toString(),
              currencyCode: 'USD'
            };
          }
          break;
          
        case 'availability':
          productData[fieldKey] = value.toLowerCase();
          break;
          
        case 'condition':
          productData[fieldKey] = value.toLowerCase();
          break;
          
        case 'adult':
          productData[fieldKey] = value.toLowerCase() === 'true' || value.toLowerCase() === 'yes';
          break;
          
        default:
          productData[fieldKey] = value;
      }
    }
  });

  return productData;
}

// Parse CSV file from buffer
async function parseCSVFromBuffer(buffer: Buffer): Promise<CSVRow[]> {
  return new Promise((resolve, reject) => {
    const results: CSVRow[] = [];
    const stream = Readable.from(buffer);

    stream
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
}

// Export product data to CSV format
router.post('/export', async (req, res) => {
  try {
    const { products, selectedFields, includeCustomFields } = req.body;

    if (!Array.isArray(products)) {
      res.status(400).json({
        success: false,
        error: 'Products must be an array'
      });
      return;
    }

    // Prepare CSV headers
    const headers: string[] = [];
    const fieldLabels: Record<string, string> = {
      title: 'Product Title',
      description: 'Description',
      price: 'Price',
      salePrice: 'Sale Price',
      availability: 'Availability',
      condition: 'Condition',
      brand: 'Brand',
      gtin: 'GTIN',
      mpn: 'MPN',
      googleProductCategory: 'Google Product Category',
      imageLink: 'Image Link',
      color: 'Color',
      material: 'Material',
      size: 'Size',
      ageGroup: 'Age Group',
      gender: 'Gender',
      itemGroupId: 'Item Group ID',
      productWeight: 'Product Weight',
      productLength: 'Product Length',
      productWidth: 'Product Width',
      productHeight: 'Product Height',
    };

    // Add selected fields to headers
    if (selectedFields && Array.isArray(selectedFields)) {
      selectedFields.forEach(field => {
        if (fieldLabels[field]) {
          headers.push(fieldLabels[field]);
        }
      });
    } else {
      // Include all available fields if none selected
      headers.push(...Object.values(fieldLabels));
    }

    // Convert products to CSV rows
    const csvRows = products.map(product => {
      const row: Record<string, any> = {};
      
      headers.forEach(header => {
        const fieldKey = Object.keys(fieldLabels).find(key => fieldLabels[key] === header);
        if (fieldKey) {
          let value = product[fieldKey] || product.attributes?.[fieldKey] || '';
          
          // Handle special field types
          if (fieldKey === 'price' || fieldKey === 'salePrice') {
            if (typeof value === 'object' && value.amountMicros) {
              value = (parseInt(value.amountMicros) / 1000000).toString();
            }
          }
          
          row[header] = value;
        }
      });
      
      return row;
    });

    // Generate CSV content
    const csvContent = [
      headers.join(','),
      ...csvRows.map(row => 
        headers.map(header => `"${(row[header] || '').toString().replace(/"/g, '""')}"`).join(',')
      )
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="products_export_${Date.now()}.csv"`);
    res.send(csvContent);

  } catch (error) {
    console.error('CSV export error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export CSV'
    });
  }
});

// Import CSV file and return preview data
router.post('/import/preview', upload.single('csvFile'), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: 'No CSV file uploaded'
      });
      return;
    }

    // Parse CSV data
    const csvData = await parseCSVFromBuffer(req.file.buffer);
    
    if (csvData.length === 0) {
      res.status(400).json({
        success: false,
        error: 'CSV file is empty'
      });
      return;
    }

    // Get headers and auto-detect mappings
    const headers = Object.keys(csvData[0]);
    const detectedMappings = autoDetectMappings(headers);

    // Validate data
    const validation = validateCSVData(csvData.slice(0, 100), detectedMappings); // Validate first 100 rows

    // Return preview data
    res.json({
      success: true,
      data: {
        headers,
        rowCount: csvData.length,
        previewRows: csvData.slice(0, 5), // First 5 rows for preview
        detectedMappings,
        validation: {
          errors: validation.errors,
          warnings: validation.warnings,
          isValid: validation.errors.length === 0
        }
      }
    });

  } catch (error) {
    console.error('CSV import preview error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process CSV file'
    });
  }
});

// Execute CSV import with confirmed mappings
router.post('/import/execute', upload.single('csvFile'), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: 'No CSV file uploaded'
      });
      return;
    }

    const { fieldMappings: confirmedMappings, options } = req.body;
    
    if (!confirmedMappings) {
      res.status(400).json({
        success: false,
        error: 'Field mappings are required'
      });
      return;
    }

    // Parse CSV data
    const csvData = await parseCSVFromBuffer(req.file.buffer);

    // Transform each row to product data
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
      processedProducts: [] as any[]
    };

    for (let i = 0; i < csvData.length; i++) {
      try {
        const row = csvData[i];
        const productData = transformRowToProductData(row, confirmedMappings);
        
        // Add to processed products
        results.processedProducts.push({
          rowNumber: i + 1,
          data: productData,
          originalRow: row
        });
        
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Processing failed'}`);
      }
    }

    res.json({
      success: true,
      data: results
    });

  } catch (error) {
    console.error('CSV import execution error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process CSV import'
    });
  }
});

// Generate CSV template
router.get('/template', (req, res) => {
  try {
    const templateHeaders = [
      'Product Title',
      'Description',
      'Price',
      'Sale Price',
      'Availability',
      'Condition',
      'Brand',
      'GTIN',
      'MPN',
      'Google Product Category',
      'Image Link',
      'Color',
      'Material',
      'Size',
      'Age Group',
      'Gender',
      'Item Group ID',
      'Product Weight',
      'Product Length',
      'Product Width',
      'Product Height'
    ];

    // Create sample data
    const sampleData = {
      'Product Title': 'Sample Product Name',
      'Description': 'Sample product description',
      'Price': '29.99',
      'Sale Price': '24.99',
      'Availability': 'in_stock',
      'Condition': 'new',
      'Brand': 'Sample Brand',
      'GTIN': '1234567890123',
      'MPN': 'SAMPLE-001',
      'Google Product Category': 'Electronics',
      'Image Link': 'https://example.com/image.jpg',
      'Color': 'Blue',
      'Material': 'Cotton',
      'Size': 'M',
      'Age Group': 'adult',
      'Gender': 'unisex',
      'Item Group ID': 'GROUP-001',
      'Product Weight': '1.5',
      'Product Length': '10.0',
      'Product Width': '8.0',
      'Product Height': '2.0'
    };

    const csvContent = [
      templateHeaders.join(','),
      templateHeaders.map(header => `"${sampleData[header as keyof typeof sampleData] || ''}"`).join(',')
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="product_import_template.csv"');
    res.send(csvContent);

  } catch (error) {
    console.error('CSV template generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate CSV template'
    });
  }
});

export default router;
