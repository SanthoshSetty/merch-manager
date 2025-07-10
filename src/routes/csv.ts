import express from 'express';
import csvParser from 'csv-parser';
import * as csvWriter from 'csv-writer';
import { Readable } from 'stream';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { ProductsClient } from '../modules/products/ProductsClient';
import { MerchantAuth } from '../auth/MerchantAuth';

const router = express.Router();
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

interface CSVField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'date' | 'email' | 'url';
  required?: boolean;
}

// Product field definitions
const PRODUCT_FIELDS: CSVField[] = [
  { key: 'title', label: 'Title', type: 'text', required: true },
  { key: 'description', label: 'Description', type: 'text' },
  { key: 'price', label: 'Price', type: 'number' },
  { key: 'currency', label: 'Currency', type: 'text' },
  { key: 'availability', label: 'Availability', type: 'text' },
  { key: 'condition', label: 'Condition', type: 'text' },
  { key: 'brand', label: 'Brand', type: 'text' },
  { key: 'imageLink', label: 'Image URL', type: 'url' },
  { key: 'gtin', label: 'GTIN', type: 'text' },
  { key: 'mpn', label: 'MPN', type: 'text' },
];

/**
 * Export products to CSV
 */
router.get('/export', async (req, res) => {
  try {
    const auth = new MerchantAuth();
    const productsClient = new ProductsClient(auth);
    const products = await productsClient.listProducts();

    // Create CSV writer
    const csvFilePath = path.join(__dirname, '../../tmp', `products_export_${Date.now()}.csv`);
    
    // Ensure tmp directory exists
    await fs.mkdir(path.dirname(csvFilePath), { recursive: true });

    const writer = csvWriter.createObjectCsvWriter({
      path: csvFilePath,
      header: PRODUCT_FIELDS.map(field => ({
        id: field.key,
        title: field.label
      }))
    });

    // Transform products data for CSV
    const csvData = products.map((product: any) => {
      const flatProduct: any = {
        title: product.attributes?.title || '',
        description: product.attributes?.description || '',
        price: product.attributes?.price?.value || '',
        currency: product.attributes?.price?.currency || '',
        availability: product.attributes?.availability || '',
        condition: product.attributes?.condition || '',
        brand: product.attributes?.brand || '',
        imageLink: product.attributes?.imageLink || '',
        gtin: product.attributes?.gtin || '',
        mpn: product.attributes?.mpn || '',
      };
      return flatProduct;
    });

    await writer.writeRecords(csvData);

    // Send file as download
    res.download(csvFilePath, 'products_export.csv', async (err) => {
      if (err) {
        console.error('Error sending file:', err);
      }
      // Clean up temporary file
      try {
        await fs.unlink(csvFilePath);
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
    });

  } catch (error) {
    console.error('CSV export error:', error);
    res.status(500).json({ 
      error: 'Failed to export CSV',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get CSV template
 */
router.get('/template', async (req, res) => {
  try {
    const csvFilePath = path.join(__dirname, '../../tmp', `product_template_${Date.now()}.csv`);
    
    // Ensure tmp directory exists
    await fs.mkdir(path.dirname(csvFilePath), { recursive: true });

    const writer = csvWriter.createObjectCsvWriter({
      path: csvFilePath,
      header: PRODUCT_FIELDS.map(field => ({
        id: field.key,
        title: field.label
      }))
    });

    // Write empty template with just headers
    await writer.writeRecords([]);

    res.download(csvFilePath, 'product_template.csv', async (err) => {
      if (err) {
        console.error('Error sending template:', err);
      }
      // Clean up temporary file
      try {
        await fs.unlink(csvFilePath);
      } catch (cleanupError) {
        console.error('Error cleaning up template:', cleanupError);
      }
    });

  } catch (error) {
    console.error('Template generation error:', error);
    res.status(500).json({
      error: 'Failed to generate template',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get field definitions
 */
router.get('/fields', (req, res) => {
  res.json({
    fields: PRODUCT_FIELDS,
    validation: {
      required: PRODUCT_FIELDS.filter(f => f.required).map(f => f.label),
      types: PRODUCT_FIELDS.reduce((acc, f) => {
        acc[f.label] = f.type;
        return acc;
      }, {} as Record<string, string>)
    }
  });
});

export default router;
