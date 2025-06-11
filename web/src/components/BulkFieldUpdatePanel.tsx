import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Chip,
  LinearProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  BatchPrediction as BatchIcon,
  PlayArrow as PlayIcon,
} from '@mui/icons-material';
import axios from 'axios';

interface BulkOperation {
  field: string;
  value: any;
  products: string[];
}

interface BulkFieldUpdatePanelProps {
  productId: string;
  onBulkUpdate: () => void;
}

export default function BulkFieldUpdatePanel({ 
  productId, 
  onBulkUpdate 
}: BulkFieldUpdatePanelProps) {
  const [operations, setOperations] = useState<BulkOperation[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const availableFields = [
    { value: 'title', label: 'Title' },
    { value: 'description', label: 'Description' },
    { value: 'price', label: 'Price' },
    { value: 'availability', label: 'Availability' },
    { value: 'condition', label: 'Condition' },
    { value: 'brand', label: 'Brand' },
    { value: 'gtin', label: 'GTIN' },
    { value: 'mpn', label: 'MPN' },
    { value: 'googleProductCategory', label: 'Google Product Category' },
    { value: 'imageLink', label: 'Image Link' },
  ];

  const addOperation = () => {
    setOperations([...operations, {
      field: '',
      value: '',
      products: [productId]
    }]);
  };

  const updateOperation = (index: number, updates: Partial<BulkOperation>) => {
    const newOperations = [...operations];
    newOperations[index] = { ...newOperations[index], ...updates };
    setOperations(newOperations);
  };

  const removeOperation = (index: number) => {
    setOperations(operations.filter((_, i) => i !== index));
  };

  const executeBulkUpdate = async () => {
    if (operations.length === 0) return;

    setIsUpdating(true);
    setError(null);

    try {
      const bulkOperations = operations.map(op => ({
        productId,
        updates: { [op.field]: op.value },
        updateMask: `attributes.${op.field}`
      }));

      const response = await axios.patch('http://localhost:3001/api/products/bulk-fields', {
        operations: bulkOperations
      });

      setResults(response.data.results);
      onBulkUpdate();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Bulk update failed');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          <BatchIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Bulk Field Updates
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Update multiple fields at once for better efficiency
        </Typography>
      </Box>

      {operations.map((operation, index) => (
        <Accordion key={index} sx={{ mb: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>
              Operation {index + 1}: {operation.field || 'Select Field'}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={2}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <FormControl fullWidth>
                  <InputLabel>Field</InputLabel>
                  <Select
                    value={operation.field}
                    onChange={(e) => updateOperation(index, { field: e.target.value })}
                    label="Field"
                  >
                    {availableFields.map(field => (
                      <MenuItem key={field.value} value={field.value}>
                        {field.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  label="Value"
                  value={operation.value}
                  onChange={(e) => updateOperation(index, { value: e.target.value })}
                />
              </Stack>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Chip 
                    label={`Products: ${operation.products.length}`} 
                    color="primary" 
                    variant="outlined" 
                  />
                  <Button 
                    color="error" 
                    onClick={() => removeOperation(index)}
                  >
                    Remove
                  </Button>
                </Box>
            </Stack>
          </AccordionDetails>
        </Accordion>
      ))}

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button variant="outlined" onClick={addOperation}>
          Add Operation
        </Button>
        <Button 
          variant="contained" 
          onClick={executeBulkUpdate}
          disabled={isUpdating || operations.length === 0}
          startIcon={<PlayIcon />}
        >
          Execute Bulk Update
        </Button>
      </Box>

      {isUpdating && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" gutterBottom>
            Processing bulk update...
          </Typography>
          <LinearProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {results.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Bulk Update Results
            </Typography>
            {results.map((result, index) => (
              <Box key={index} sx={{ mb: 1 }}>
                <Chip
                  label={`Product ${result.productId}: ${result.success ? 'Success' : 'Failed'}`}
                  color={result.success ? 'success' : 'error'}
                  size="small"
                />
                {result.error && (
                  <Typography variant="caption" color="error" sx={{ ml: 1 }}>
                    {result.error}
                  </Typography>
                )}
              </Box>
            ))}
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
