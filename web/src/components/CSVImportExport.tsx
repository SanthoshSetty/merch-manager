import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Stack,
  Alert,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
  Divider,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Upload as UploadIcon,
  GetApp as ExportIcon,
  Visibility as PreviewIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

interface CSVImportExportProps {
  productData: any;
  onDataUpdate: (updates: any) => void;
  customFields?: any[];
  customFieldValues?: Record<string, any>;
  onCustomFieldUpdate?: (fieldId: string, value: any) => void;
}

interface CSVRow {
  [key: string]: any;
}

interface ImportPreview {
  headers: string[];
  rows: CSVRow[];
  fieldMappings: Record<string, string>;
  validationErrors: string[];
}

export default function CSVImportExport({
  productData,
  onDataUpdate,
  customFields = [],
  customFieldValues = {},
  onCustomFieldUpdate,
}: CSVImportExportProps) {
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [importResults, setImportResults] = useState<any>(null);
  const [selectedFields, setSelectedFields] = useState<Record<string, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Available field mappings for products
  const availableFields = [
    { key: 'title', label: 'Product Title', required: true },
    { key: 'description', label: 'Description', required: false },
    { key: 'price', label: 'Price', required: false },
    { key: 'salePrice', label: 'Sale Price', required: false },
    { key: 'availability', label: 'Availability', required: false },
    { key: 'condition', label: 'Condition', required: false },
    { key: 'brand', label: 'Brand', required: false },
    { key: 'gtin', label: 'GTIN', required: false },
    { key: 'mpn', label: 'MPN', required: false },
    { key: 'googleProductCategory', label: 'Google Product Category', required: false },
    { key: 'imageLink', label: 'Image Link', required: false },
    { key: 'color', label: 'Color', required: false },
    { key: 'material', label: 'Material', required: false },
    { key: 'size', label: 'Size', required: false },
    { key: 'ageGroup', label: 'Age Group', required: false },
    { key: 'gender', label: 'Gender', required: false },
    { key: 'itemGroupId', label: 'Item Group ID', required: false },
    { key: 'productWeight', label: 'Product Weight', required: false },
    { key: 'productLength', label: 'Product Length', required: false },
    { key: 'productWidth', label: 'Product Width', required: false },
    { key: 'productHeight', label: 'Product Height', required: false },
    // Add custom fields
    ...customFields.map(field => ({
      key: `custom_${field.id}`,
      label: `Custom: ${field.label}`,
      required: field.required || false
    }))
  ];

  // Export data to CSV
  const handleExport = async () => {
    setExporting(true);
    
    try {
      // Prepare data for export
      const exportData: Record<string, any> = {};
      
      // Include selected standard fields
      availableFields.forEach(field => {
        if (selectedFields[field.key] !== false) { // Default to include unless explicitly unchecked
          if (field.key.startsWith('custom_')) {
            const customFieldId = field.key.replace('custom_', '');
            exportData[field.label] = customFieldValues[customFieldId] || '';
          } else {
            exportData[field.label] = productData[field.key] || '';
          }
        }
      });

      // Convert to CSV format
      const csvContent = convertToCSV([exportData]);
      
      // Download file
      downloadCSV(csvContent, `product_${productData.title || 'export'}_${Date.now()}.csv`);
      
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setExporting(false);
    }
  };

  // Handle file selection for import
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      parseCSVFile(file);
    }
  };

  // Parse CSV file and show preview
  const parseCSVFile = async (file: File) => {
    setImporting(true);
    
    try {
      const text = await file.text();
      const rows = parseCSV(text);
      
      if (rows.length === 0) {
        throw new Error('CSV file is empty');
      }

      const headers = Object.keys(rows[0]);
      const fieldMappings = autoMapFields(headers);
      const validationErrors = validateImportData(rows, fieldMappings);

      setImportPreview({
        headers,
        rows: rows.slice(0, 5), // Show first 5 rows for preview
        fieldMappings,
        validationErrors
      });
      setShowPreviewDialog(true);
      
    } catch (error) {
      console.error('CSV parsing error:', error);
      alert(`Error parsing CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setImporting(false);
    }
  };

  // Auto-map CSV headers to product fields
  const autoMapFields = (headers: string[]): Record<string, string> => {
    const mappings: Record<string, string> = {};
    
    headers.forEach(header => {
      const normalizedHeader = header.toLowerCase().trim();
      
      // Try to find matching field
      const matchedField = availableFields.find(field => {
        const normalizedLabel = field.label.toLowerCase();
        const normalizedKey = field.key.toLowerCase();
        
        return normalizedHeader === normalizedLabel ||
               normalizedHeader === normalizedKey ||
               normalizedHeader.includes(normalizedKey) ||
               normalizedKey.includes(normalizedHeader);
      });

      if (matchedField) {
        mappings[header] = matchedField.key;
      }
    });

    return mappings;
  };

  // Validate import data
  const validateImportData = (rows: CSVRow[], mappings: Record<string, string>): string[] => {
    const errors: string[] = [];
    
    // Check for required fields
    const requiredFields = availableFields.filter(f => f.required);
    const mappedFields = Object.values(mappings);
    
    requiredFields.forEach(field => {
      if (!mappedFields.includes(field.key)) {
        errors.push(`Required field '${field.label}' is not mapped`);
      }
    });

    // Validate data types and formats
    rows.forEach((row, index) => {
      Object.entries(mappings).forEach(([csvHeader, fieldKey]) => {
        const value = row[csvHeader];
        
        if (fieldKey === 'price' || fieldKey === 'salePrice') {
          if (value && isNaN(parseFloat(value))) {
            errors.push(`Row ${index + 1}: Invalid price format in '${csvHeader}'`);
          }
        }
        
        if (fieldKey === 'availability') {
          const validAvailabilities = ['in_stock', 'out_of_stock', 'preorder', 'backorder'];
          if (value && !validAvailabilities.includes(value.toLowerCase())) {
            errors.push(`Row ${index + 1}: Invalid availability '${value}' in '${csvHeader}'`);
          }
        }
      });
    });

    return errors;
  };

  // Execute import after preview approval
  const executeImport = async () => {
    if (!importPreview) return;

    setImporting(true);
    
    try {
      const results = {
        success: 0,
        failed: 0,
        errors: [] as string[]
      };

      // Process each field update
      const updates: Record<string, any> = {};
      
      Object.entries(importPreview.fieldMappings).forEach(([csvHeader, fieldKey]) => {
        const value = importPreview.rows[0]?.[csvHeader]; // Use first row for single product update
        
        if (value !== undefined && value !== '') {
          if (fieldKey.startsWith('custom_')) {
            const customFieldId = fieldKey.replace('custom_', '');
            if (onCustomFieldUpdate) {
              onCustomFieldUpdate(customFieldId, value);
            }
          } else {
            updates[fieldKey] = value;
          }
        }
      });

      // Update product data
      if (Object.keys(updates).length > 0) {
        onDataUpdate(updates);
        results.success++;
      }

      setImportResults(results);
      setShowPreviewDialog(false);
      
    } catch (error) {
      console.error('Import execution error:', error);
    } finally {
      setImporting(false);
    }
  };

  // Utility functions
  const parseCSV = (text: string): CSVRow[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const rows = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const row: CSVRow = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      return row;
    });

    return rows;
  };

  const convertToCSV = (data: any[]): string => {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');
    const csvRows = data.map(row => 
      headers.map(header => `"${(row[header] || '').toString().replace(/"/g, '""')}"`).join(',')
    );

    return [csvHeaders, ...csvRows].join('\n');
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const toggleFieldSelection = (fieldKey: string) => {
    setSelectedFields(prev => ({
      ...prev,
      [fieldKey]: !prev[fieldKey]
    }));
  };

  return (
    <Box>
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ExportIcon />
            CSV Import/Export
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Import and export product data at the field level using CSV files. 
            Supports both standard product fields and custom fields.
          </Typography>

          <Stack spacing={3}>
            {/* Export Section */}
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Export Product Data
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Export current product data to CSV file. Select which fields to include:
              </Typography>
              
              <Box sx={{ mb: 2, maxHeight: 200, overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2 }}>
                <Stack spacing={1}>
                  {availableFields.map(field => (
                    <FormControlLabel
                      key={field.key}
                      control={
                        <Checkbox
                          checked={selectedFields[field.key] !== false}
                          onChange={() => toggleFieldSelection(field.key)}
                          size="small"
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2">{field.label}</Typography>
                          {field.required && <Chip label="Required" size="small" color="error" />}
                        </Box>
                      }
                    />
                  ))}
                </Stack>
              </Box>

              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={handleExport}
                disabled={exporting}
                color="primary"
              >
                {exporting ? 'Exporting...' : 'Export to CSV'}
              </Button>
            </Box>

            <Divider />

            {/* Import Section */}
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Import Product Data
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Import product data from CSV file. The system will auto-map columns to fields and show a preview before importing.
              </Typography>

              <input
                type="file"
                accept=".csv"
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={handleFileSelect}
              />

              <Stack direction="row" spacing={2}>
                <Button
                  variant="outlined"
                  startIcon={<UploadIcon />}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={importing}
                >
                  {importing ? 'Processing...' : 'Select CSV File'}
                </Button>

                <Button
                  variant="text"
                  startIcon={<InfoIcon />}
                  onClick={() => {
                    const template = convertToCSV([
                      Object.fromEntries(availableFields.map(f => [f.label, f.key === 'title' ? 'Sample Product Title' : '']))
                    ]);
                    downloadCSV(template, 'product_import_template.csv');
                  }}
                >
                  Download Template
                </Button>
              </Stack>

              {importing && (
                <Box sx={{ mt: 2 }}>
                  <LinearProgress />
                  <Typography variant="caption" color="text.secondary">
                    Processing CSV file...
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Import Results */}
            {importResults && (
              <Alert severity="success" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  Import completed: {importResults.success} fields updated
                  {importResults.failed > 0 && `, ${importResults.failed} failed`}
                </Typography>
              </Alert>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* Import Preview Dialog */}
      <Dialog 
        open={showPreviewDialog} 
        onClose={() => setShowPreviewDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PreviewIcon />
          Import Preview
        </DialogTitle>
        <DialogContent>
          {importPreview && (
            <Stack spacing={3}>
              {/* Field Mappings */}
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Field Mappings
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>CSV Column</TableCell>
                        <TableCell>Maps to Field</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {importPreview.headers.map(header => {
                        const mappedField = importPreview.fieldMappings[header];
                        const field = availableFields.find(f => f.key === mappedField);
                        
                        return (
                          <TableRow key={header}>
                            <TableCell>{header}</TableCell>
                            <TableCell>
                              {field ? field.label : 'Not mapped'}
                            </TableCell>
                            <TableCell>
                              {field ? (
                                <Chip 
                                  icon={<CheckIcon />} 
                                  label="Mapped" 
                                  color="success" 
                                  size="small" 
                                />
                              ) : (
                                <Chip 
                                  icon={<CloseIcon />} 
                                  label="Unmapped" 
                                  color="warning" 
                                  size="small" 
                                />
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              {/* Data Preview */}
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Data Preview (First 5 rows)
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        {importPreview.headers.map(header => (
                          <TableCell key={header}>{header}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {importPreview.rows.map((row, index) => (
                        <TableRow key={index}>
                          {importPreview.headers.map(header => (
                            <TableCell key={header}>
                              {row[header] || <Typography variant="caption" color="text.secondary">—</Typography>}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              {/* Validation Errors */}
              {importPreview.validationErrors.length > 0 && (
                <Alert severity="warning">
                  <Typography variant="body2" gutterBottom>
                    <strong>Validation Issues:</strong>
                  </Typography>
                  <ul>
                    {importPreview.validationErrors.map((error, index) => (
                      <li key={index}>
                        <Typography variant="caption">{error}</Typography>
                      </li>
                    ))}
                  </ul>
                </Alert>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPreviewDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={executeImport}
            variant="contained"
            disabled={importing || (importPreview?.validationErrors.length || 0) > 0}
            startIcon={<CheckIcon />}
          >
            {importing ? 'Importing...' : 'Import Data'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
