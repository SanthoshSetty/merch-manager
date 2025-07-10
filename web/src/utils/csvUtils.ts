import Papa from 'papaparse';

export interface CSVField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'date' | 'email' | 'url';
  required?: boolean;
  validation?: (value: any) => string | null;
}

export interface CSVExportOptions {
  filename?: string;
  fields: CSVField[];
  includeHeaders?: boolean;
  delimiter?: string;
}

export interface CSVImportOptions {
  fields: CSVField[];
  skipFirstRow?: boolean;
  delimiter?: string;
  validateData?: boolean;
}

export interface CSVValidationError {
  row: number;
  field: string;
  value: any;
  message: string;
}

export interface CSVImportResult {
  data: Record<string, any>[];
  errors: CSVValidationError[];
  rowCount: number;
  validRowCount: number;
}

/**
 * Export data to CSV format
 */
export function exportToCSV(data: Record<string, any>[], options: CSVExportOptions): void {
  const { filename = 'export.csv', fields, includeHeaders = true, delimiter = ',' } = options;

  // Filter and order data based on fields
  const filteredData = data.map(row => {
    const filteredRow: Record<string, any> = {};
    fields.forEach(field => {
      filteredRow[field.label] = formatValueForExport(row[field.key], field.type);
    });
    return filteredRow;
  });

  // Convert to CSV
  const csv = Papa.unparse(filteredData, {
    header: includeHeaders,
    delimiter: delimiter,
    quotes: true,
    quoteChar: '"',
    escapeChar: '"',
    newline: '\n'
  });

  // Download file
  downloadCSV(csv, filename);
}

/**
 * Import data from CSV file
 */
export function importFromCSV(
  file: File,
  options: CSVImportOptions
): Promise<CSVImportResult> {
  return new Promise((resolve, reject) => {
    const { fields, skipFirstRow = true, delimiter = ',', validateData = true } = options;

    Papa.parse(file, {
      header: skipFirstRow,
      delimiter: delimiter,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.trim(),
      complete: (results) => {
        try {
          const importResult = processImportData(results.data, fields, validateData);
          resolve(importResult);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(new Error(`CSV parsing error: ${error.message}`));
      }
    });
  });
}

/**
 * Validate CSV data against field definitions
 */
function processImportData(
  data: any[],
  fields: CSVField[],
  validateData: boolean
): CSVImportResult {
  const errors: CSVValidationError[] = [];
  const processedData: Record<string, any>[] = [];

  data.forEach((row, index) => {
    const processedRow: Record<string, any> = {};
    let rowHasErrors = false;

    fields.forEach(field => {
      const rawValue = row[field.label];
      const processedValue = parseValueFromCSV(rawValue, field.type);

      // Validate required fields
      if (field.required && (processedValue === null || processedValue === undefined || processedValue === '')) {
        errors.push({
          row: index + 1,
          field: field.label,
          value: rawValue,
          message: `${field.label} is required`
        });
        rowHasErrors = true;
      }

      // Custom validation
      if (validateData && field.validation && processedValue !== null && processedValue !== undefined) {
        const validationError = field.validation(processedValue);
        if (validationError) {
          errors.push({
            row: index + 1,
            field: field.label,
            value: rawValue,
            message: validationError
          });
          rowHasErrors = true;
        }
      }

      processedRow[field.key] = processedValue;
    });

    if (!rowHasErrors || !validateData) {
      processedData.push(processedRow);
    }
  });

  return {
    data: processedData,
    errors,
    rowCount: data.length,
    validRowCount: processedData.length
  };
}

/**
 * Format value for CSV export based on field type
 */
function formatValueForExport(value: any, type: CSVField['type']): string {
  if (value === null || value === undefined) {
    return '';
  }

  switch (type) {
    case 'boolean':
      return value ? 'true' : 'false';
    case 'date':
      if (value instanceof Date) {
        return value.toISOString().split('T')[0]; // YYYY-MM-DD format
      }
      return String(value);
    case 'number':
      return String(value);
    default:
      return String(value);
  }
}

/**
 * Parse value from CSV based on field type
 */
function parseValueFromCSV(value: any, type: CSVField['type']): any {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const stringValue = String(value).trim();

  switch (type) {
    case 'number':
      const num = Number(stringValue);
      return isNaN(num) ? null : num;
    case 'boolean':
      const lower = stringValue.toLowerCase();
      if (lower === 'true' || lower === '1' || lower === 'yes') return true;
      if (lower === 'false' || lower === '0' || lower === 'no') return false;
      return null;
    case 'date':
      const date = new Date(stringValue);
      return isNaN(date.getTime()) ? null : date;
    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(stringValue) ? stringValue : null;
    case 'url':
      try {
        new URL(stringValue);
        return stringValue;
      } catch {
        return null;
      }
    default:
      return stringValue;
  }
}

/**
 * Download CSV content as file
 */
function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

/**
 * Generate CSV template with headers
 */
export function generateCSVTemplate(fields: CSVField[], filename = 'template.csv'): void {
  const headers = fields.map(field => field.label);
  const csv = Papa.unparse([headers], {
    header: false,
    delimiter: ',',
    quotes: true
  });
  
  downloadCSV(csv, filename);
}

/**
 * Validate CSV file before processing
 */
export function validateCSVFile(file: File): string | null {
  // Check file type
  if (!file.type.includes('csv') && !file.name.endsWith('.csv')) {
    return 'Please select a valid CSV file';
  }
  
  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return 'File size must be less than 10MB';
  }
  
  return null;
}

/**
 * Preview CSV file content
 */
export function previewCSV(
  file: File,
  maxRows = 5
): Promise<{ headers: string[]; rows: string[][] }> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: false,
      preview: maxRows + 1, // +1 for header row
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data.length === 0) {
          reject(new Error('CSV file is empty'));
          return;
        }
        
        const data = results.data as string[][];
        const headers = data[0] || [];
        const rows = data.slice(1);
        
        resolve({ headers, rows });
      },
      error: (error) => {
        reject(new Error(`CSV preview error: ${error.message}`));
      }
    });
  });
}
