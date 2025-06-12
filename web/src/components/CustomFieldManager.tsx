import { memo } from 'react';
import {
  Box,
  Typography,
  TextField,
  Stack,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Switch,
  FormControlLabel,
  Button,
  IconButton,
  Card,
  CardContent,
  Chip,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { type CustomField } from './CustomFieldBuilder';

// Stable TextField component to prevent cursor focus loss
const StableTextField = memo(({ ...props }: any) => {
  return <TextField {...props} />;
});

interface CustomFieldManagerProps {
  productData: any;
  customFields: CustomField[];
  onCustomFieldChange: (fieldId: string, value: any) => void;
  onAddCustomField: () => void;
  onEditCustomField: (field: CustomField) => void;
  onRemoveCustomField: (fieldId: string) => void;
}

export default function CustomFieldManager({
  productData,
  customFields,
  onCustomFieldChange,
  onAddCustomField,
  onEditCustomField,
  onRemoveCustomField,
}: CustomFieldManagerProps) {

  const renderCustomField = (field: CustomField) => {
    const value = productData.customFields?.[field.id];
    const onChange = (newValue: any) => onCustomFieldChange(field.id, newValue);

    switch (field.type) {
      case 'text':
        return (
          <StableTextField
            fullWidth
            label={field.label}
            value={value || ''}
            onChange={(e: any) => onChange(e.target.value)}
            required={field.required}
            helperText={field.description}
            inputProps={{
              minLength: field.validation?.minLength,
              maxLength: field.validation?.maxLength,
              pattern: field.validation?.pattern,
            }}
          />
        );

      case 'textarea':
        return (
          <StableTextField
            fullWidth
            multiline
            rows={3}
            label={field.label}
            value={value || ''}
            onChange={(e: any) => onChange(e.target.value)}
            required={field.required}
            helperText={field.description}
            inputProps={{
              minLength: field.validation?.minLength,
              maxLength: field.validation?.maxLength,
            }}
          />
        );

      case 'number':
        return (
          <StableTextField
            fullWidth
            type="number"
            label={field.label}
            value={value || ''}
            onChange={(e: any) => onChange(parseFloat(e.target.value) || null)}
            required={field.required}
            helperText={field.description}
            inputProps={{
              min: field.validation?.min,
              max: field.validation?.max,
            }}
          />
        );

      case 'boolean':
        return (
          <FormControlLabel
            control={
              <Switch
                checked={value === true}
                onChange={(e) => onChange(e.target.checked)}
              />
            }
            label={field.label}
          />
        );

      case 'select':
        return (
          <FormControl fullWidth required={field.required}>
            <InputLabel>{field.label}</InputLabel>
            <Select
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              label={field.label}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {field.options?.map(option => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
            {field.description && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                {field.description}
              </Typography>
            )}
          </FormControl>
        );

      case 'multiselect':
        return (
          <FormControl fullWidth>
            <InputLabel>{field.label}</InputLabel>
            <Select
              multiple
              value={value || []}
              onChange={(e) => onChange(e.target.value)}
              label={field.label}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((val: string) => (
                    <Chip key={val} label={val} size="small" />
                  ))}
                </Box>
              )}
            >
              {field.options?.map(option => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
            {field.description && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                {field.description}
              </Typography>
            )}
          </FormControl>
        );

      case 'date':
        return (
          <StableTextField
            fullWidth
            type="date"
            label={field.label}
            value={value || ''}
            onChange={(e: any) => onChange(e.target.value)}
            required={field.required}
            helperText={field.description}
            InputLabelProps={{ shrink: true }}
          />
        );

      case 'url':
        return (
          <StableTextField
            fullWidth
            type="url"
            label={field.label}
            value={value || ''}
            onChange={(e: any) => onChange(e.target.value)}
            required={field.required}
            helperText={field.description}
          />
        );

      default:
        return null;
    }
  };

  // Group fields by category
  const fieldsByCategory = customFields.reduce((acc, field) => {
    const category = field.category || 'custom';
    if (!acc[category]) acc[category] = [];
    acc[category].push(field);
    return acc;
  }, {} as Record<string, CustomField[]>);

  const categoryLabels = {
    custom: 'Custom Fields',
    marketing: 'Marketing',
    inventory: 'Inventory',
    shipping: 'Shipping',
    internal: 'Internal Use',
  };

  if (customFields.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <SettingsIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No Custom Fields Yet
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Create custom fields to capture additional product information
          beyond the standard Google Merchant API fields.
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAddCustomField}
        >
          Create Your First Custom Field
        </Button>
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
      {/* Add New Field Button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle2" color="text.secondary">
          {customFields.length} custom field{customFields.length !== 1 ? 's' : ''} defined
        </Typography>
        <Button
          variant="outlined"
          size="small"
          startIcon={<AddIcon />}
          onClick={onAddCustomField}
        >
          Add Custom Field
        </Button>
      </Box>

      {/* Fields by Category */}
      {Object.entries(fieldsByCategory).map(([category, fields]) => (
        <Box key={category}>
          <Typography variant="subtitle1" color="primary" gutterBottom>
            {categoryLabels[category as keyof typeof categoryLabels] || category}
          </Typography>
          
          <Stack spacing={2}>
            {fields.map((field) => (
              <Card key={field.id} variant="outlined">
                <CardContent sx={{ pb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        {field.label}
                        {field.required && (
                          <Chip label="Required" size="small" color="error" sx={{ ml: 1 }} />
                        )}
                      </Typography>
                      {field.description && (
                        <Typography variant="caption" color="text.secondary">
                          {field.description}
                        </Typography>
                      )}
                    </Box>
                    <Box>
                      <Tooltip title="Edit Field">
                        <IconButton 
                          size="small" 
                          onClick={() => onEditCustomField(field)}
                          sx={{ mr: 1 }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Field">
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => onRemoveCustomField(field.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                  
                  {/* Render the actual field */}
                  {renderCustomField(field)}
                  
                  {/* Field metadata */}
                  <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip label={field.type} size="small" variant="outlined" />
                    {field.googleMerchantMapping && (
                      <Chip 
                        label={`Maps to: ${field.googleMerchantMapping}`} 
                        size="small" 
                        color="success" 
                        variant="outlined" 
                      />
                    )}
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Box>
      ))}

      {/* Info Alert */}
      <Alert severity="info">
        <Typography variant="body2">
          <strong>Custom Fields:</strong> These fields are stored separately from Google Merchant API data. 
          Fields with Google API mapping will sync to Google Merchant Center when possible.
        </Typography>
      </Alert>
    </Stack>
  );
}
