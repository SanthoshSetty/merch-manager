import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Alert,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Stack,
  FormControlLabel,
  Checkbox,
  TextField,
  MenuItem,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  CloudDownload as DownloadIcon,
  Error as ErrorIcon,
  CheckCircle as SuccessIcon,
  GetApp as TemplateIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import {
  exportToCSV,
  importFromCSV,
  generateCSVTemplate,
  validateCSVFile,
  previewCSV,
  type CSVField,
  type CSVImportResult,
} from '../utils/csvUtils';

interface CSVManagerProps {
  fields: CSVField[];
  data?: Record<string, any>[];
  onImportComplete?: (data: Record<string, any>[]) => void;
  onExportComplete?: () => void;
  exportFilename?: string;
  templateFilename?: string;
}

const steps = ['Select File', 'Preview Data', 'Validate & Import'];

export default function CSVManager({
  fields,
  data = [],
  onImportComplete,
  onExportComplete,
  exportFilename = 'export.csv',
  templateFilename = 'template.csv',
}: CSVManagerProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'import' | 'export' | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<{ headers: string[]; rows: string[][] } | null>(null);
  const [importResult, setImportResult] = useState<CSVImportResult | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [includeHeaders, setIncludeHeaders] = useState(true);
  const [delimiter, setDelimiter] = useState(',');
  const [validateData, setValidateData] = useState(true);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpen = (selectedMode: 'import' | 'export') => {
    setMode(selectedMode);
    setOpen(true);
    setActiveStep(0);
    setErrors([]);
    setSelectedFile(null);
    setPreviewData(null);
    setImportResult(null);
  };

  const handleClose = () => {
    setOpen(false);
    setMode(null);
    setActiveStep(0);
    setErrors([]);
    setSelectedFile(null);
    setPreviewData(null);
    setImportResult(null);
    setLoading(false);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validationError = validateCSVFile(file);
    if (validationError) {
      setErrors([validationError]);
      return;
    }

    setSelectedFile(file);
    setErrors([]);
    handlePreview(file);
  };

  const handlePreview = async (file: File) => {
    setLoading(true);
    try {
      const preview = await previewCSV(file, 5);
      setPreviewData(preview);
      setActiveStep(1);
    } catch (error) {
      setErrors([`Preview failed: ${error instanceof Error ? error.message : 'Unknown error'}`]);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setActiveStep(2);

    try {
      const result = await importFromCSV(selectedFile, {
        fields,
        skipFirstRow: includeHeaders,
        delimiter,
        validateData,
      });

      setImportResult(result);

      if (result.errors.length === 0 || !validateData) {
        if (onImportComplete) {
          onImportComplete(result.data);
        }
      }
    } catch (error) {
      setErrors([`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`]);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    setLoading(true);
    try {
      exportToCSV(data, {
        filename: exportFilename,
        fields,
        includeHeaders,
        delimiter,
      });
      
      if (onExportComplete) {
        onExportComplete();
      }
      
      handleClose();
    } catch (error) {
      setErrors([`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateTemplate = () => {
    generateCSVTemplate(fields, templateFilename);
  };

  const renderImportDialog = () => (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Import CSV Data</Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {loading && <LinearProgress sx={{ mb: 2 }} />}

        {errors.length > 0 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.map((error, index) => (
              <Typography key={index}>{error}</Typography>
            ))}
          </Alert>
        )}

        {/* Step 1: File Selection */}
        {activeStep === 0 && (
          <Box>
            <Stack spacing={2}>
              <Typography variant="body2" color="text.secondary">
                Select a CSV file to import. The file should contain the following columns:
              </Typography>
              
              <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {fields.map((field) => (
                    <Chip
                      key={field.key}
                      label={`${field.label}${field.required ? ' *' : ''}`}
                      size="small"
                      color={field.required ? 'primary' : 'default'}
                    />
                  ))}
                </Stack>
              </Paper>

              <Stack direction="row" spacing={2}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={includeHeaders}
                      onChange={(e) => setIncludeHeaders(e.target.checked)}
                    />
                  }
                  label="First row contains headers"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={validateData}
                      onChange={(e) => setValidateData(e.target.checked)}
                    />
                  }
                  label="Validate data types"
                />
              </Stack>

              <TextField
                select
                label="Delimiter"
                value={delimiter}
                onChange={(e) => setDelimiter(e.target.value)}
                size="small"
                sx={{ width: 120 }}
              >
                <MenuItem value=",">,  (Comma)</MenuItem>
                <MenuItem value=";">; (Semicolon)</MenuItem>
                <MenuItem value="\t">Tab</MenuItem>
              </TextField>

              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              
              <Button
                variant="outlined"
                startIcon={<UploadIcon />}
                onClick={() => fileInputRef.current?.click()}
                fullWidth
              >
                Select CSV File
              </Button>

              <Button
                variant="text"
                startIcon={<TemplateIcon />}
                onClick={handleGenerateTemplate}
                size="small"
              >
                Download CSV Template
              </Button>
            </Stack>
          </Box>
        )}

        {/* Step 2: Preview */}
        {activeStep === 1 && previewData && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Preview Data
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Showing first 5 rows of your CSV file:
            </Typography>
            
            <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    {previewData.headers.map((header, index) => (
                      <TableCell key={index}>
                        <Typography variant="subtitle2">{header}</Typography>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {previewData.rows.map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <TableCell key={cellIndex}>
                          <Typography variant="body2" noWrap>
                            {cell}
                          </Typography>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Step 3: Results */}
        {activeStep === 2 && importResult && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Import Results
            </Typography>
            
            <Stack spacing={2}>
              <Alert 
                severity={importResult.errors.length === 0 ? 'success' : 'warning'}
                icon={importResult.errors.length === 0 ? <SuccessIcon /> : <ErrorIcon />}
              >
                <Typography variant="subtitle2">
                  {importResult.errors.length === 0 
                    ? `Successfully imported ${importResult.validRowCount} rows`
                    : `Imported ${importResult.validRowCount} rows with ${importResult.errors.length} validation errors`
                  }
                </Typography>
              </Alert>

              {importResult.errors.length > 0 && (
                <Paper sx={{ p: 2, maxHeight: 300, overflow: 'auto' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Validation Errors:
                  </Typography>
                  {importResult.errors.map((error, index) => (
                    <Typography key={index} variant="body2" color="error" sx={{ mb: 1 }}>
                      Row {error.row}, Column "{error.field}": {error.message}
                    </Typography>
                  ))}
                </Paper>
              )}
            </Stack>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        {activeStep === 1 && (
          <Button
            variant="contained"
            onClick={handleImport}
            disabled={loading}
          >
            Import Data
          </Button>
        )}
        {activeStep === 2 && importResult && importResult.errors.length === 0 && (
          <Button
            variant="contained"
            onClick={handleClose}
            color="success"
          >
            Complete
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );

  const renderExportDialog = () => (
    <Dialog open={open} onClose={handleClose} maxWidth="sm">
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Export CSV Data</Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      
      <DialogContent>
        <Stack spacing={3}>
          <Typography variant="body2" color="text.secondary">
            Export {data.length} records to CSV format.
          </Typography>

          <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
            <Typography variant="subtitle2" gutterBottom>
              Fields to export:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {fields.map((field) => (
                <Chip key={field.key} label={field.label} size="small" />
              ))}
            </Stack>
          </Paper>

          <Stack spacing={2}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={includeHeaders}
                  onChange={(e) => setIncludeHeaders(e.target.checked)}
                />
              }
              label="Include column headers"
            />

            <TextField
              select
              label="Delimiter"
              value={delimiter}
              onChange={(e) => setDelimiter(e.target.value)}
              size="small"
              sx={{ width: 150 }}
            >
              <MenuItem value=",">,  (Comma)</MenuItem>
              <MenuItem value=";">; (Semicolon)</MenuItem>
              <MenuItem value="\t">Tab</MenuItem>
            </TextField>
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleExport}
          disabled={loading || data.length === 0}
          startIcon={<DownloadIcon />}
        >
          Export CSV
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Box>
      <Stack direction="row" spacing={2}>
        <Button
          variant="outlined"
          startIcon={<UploadIcon />}
          onClick={() => handleOpen('import')}
        >
          Import CSV
        </Button>
        
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={() => handleOpen('export')}
          disabled={data.length === 0}
        >
          Export CSV ({data.length} records)
        </Button>

        <Button
          variant="text"
          startIcon={<TemplateIcon />}
          onClick={handleGenerateTemplate}
          size="small"
        >
          Download Template
        </Button>
      </Stack>

      {mode === 'import' && renderImportDialog()}
      {mode === 'export' && renderExportDialog()}
    </Box>
  );
}
