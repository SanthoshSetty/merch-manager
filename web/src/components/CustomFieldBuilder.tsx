import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Stack,
  Chip,
  Box,
  Typography,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

export interface CustomField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'multiselect' | 'date' | 'url' | 'textarea';
  required: boolean;
  options?: string[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    min?: number;
    max?: number;
  };
  category: string;
  description?: string;
  defaultValue?: any;
  googleMerchantMapping?: string;
}

interface CustomFieldBuilderProps {
  open: boolean;
  onClose: () => void;
  onSave: (field: CustomField) => void;
  existingField?: CustomField;
}

export default function CustomFieldBuilder({
  open,
  onClose,
  onSave,
  existingField
}: CustomFieldBuilderProps) {
  const [field, setField] = useState<Partial<CustomField>>(
    existingField || {
      name: '',
      label: '',
      type: 'text',
      required: false,
      category: 'custom',
      description: '',
      options: [],
      validation: {},
    }
  );

  const [newOption, setNewOption] = useState('');

  const handleSave = () => {
    if (!field.name || !field.label) return;

    const customField: CustomField = {
      id: existingField?.id || `custom_${Date.now()}`,
      name: field.name!,
      label: field.label!,
      type: field.type!,
      required: field.required!,
      category: field.category!,
      description: field.description,
      options: field.options,
      validation: field.validation,
      defaultValue: field.defaultValue,
      googleMerchantMapping: field.googleMerchantMapping,
    };

    onSave(customField);
    onClose();
    
    // Reset form
    if (!existingField) {
      setField({
        name: '',
        label: '',
        type: 'text',
        required: false,
        category: 'custom',
        description: '',
        options: [],
        validation: {},
      });
    }
  };

  const addOption = () => {
    if (newOption.trim()) {
      setField(prev => ({
        ...prev,
        options: [...(prev.options || []), newOption.trim()]
      }));
      setNewOption('');
    }
  };

  const removeOption = (index: number) => {
    setField(prev => ({
      ...prev,
      options: prev.options?.filter((_, i) => i !== index)
    }));
  };

  const fieldTypes = [
    { value: 'text', label: 'Text' },
    { value: 'textarea', label: 'Long Text' },
    { value: 'number', label: 'Number' },
    { value: 'boolean', label: 'Yes/No Switch' },
    { value: 'select', label: 'Dropdown' },
    { value: 'multiselect', label: 'Multiple Choice' },
    { value: 'date', label: 'Date' },
    { value: 'url', label: 'URL' },
  ];

  const categories = [
    { value: 'custom', label: 'Custom Fields' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'inventory', label: 'Inventory' },
    { value: 'shipping', label: 'Shipping' },
    { value: 'internal', label: 'Internal Use' },
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {existingField ? 'Edit Custom Field' : 'Create Custom Field'}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {/* Basic Information */}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              fullWidth
              label="Field Name"
              value={field.name || ''}
              onChange={(e) => setField(prev => ({ ...prev, name: e.target.value }))}
              helperText="Internal field name (no spaces, lowercase)"
              required
            />
            <TextField
              fullWidth
              label="Display Label"
              value={field.label || ''}
              onChange={(e) => setField(prev => ({ ...prev, label: e.target.value }))}
              helperText="Label shown to users"
              required
            />
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <FormControl fullWidth>
              <InputLabel>Field Type</InputLabel>
              <Select
                value={field.type || 'text'}
                onChange={(e) => setField(prev => ({ ...prev, type: e.target.value as any }))}
                label="Field Type"
              >
                {fieldTypes.map(type => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={field.category || 'custom'}
                onChange={(e) => setField(prev => ({ ...prev, category: e.target.value }))}
                label="Category"
              >
                {categories.map(cat => (
                  <MenuItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          <TextField
            fullWidth
            multiline
            rows={2}
            label="Description"
            value={field.description || ''}
            onChange={(e) => setField(prev => ({ ...prev, description: e.target.value }))}
            helperText="Help text shown to users"
          />

          <FormControlLabel
            control={
              <Switch
                checked={field.required || false}
                onChange={(e) => setField(prev => ({ ...prev, required: e.target.checked }))}
              />
            }
            label="Required Field"
          />

          {/* Options for select/multiselect */}
          {(field.type === 'select' || field.type === 'multiselect') && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Options
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  label="Add Option"
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addOption()}
                />
                <Button variant="outlined" onClick={addOption} startIcon={<AddIcon />}>
                  Add
                </Button>
              </Stack>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {field.options?.map((option, index) => (
                  <Chip
                    key={index}
                    label={option}
                    onDelete={() => removeOption(index)}
                    deleteIcon={<DeleteIcon />}
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Validation Rules */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Validation Rules
            </Typography>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              {(field.type === 'text' || field.type === 'textarea') && (
                <>
                  <TextField
                    type="number"
                    label="Min Length"
                    value={field.validation?.minLength || ''}
                    onChange={(e) => setField(prev => ({
                      ...prev,
                      validation: {
                        ...prev.validation,
                        minLength: parseInt(e.target.value) || undefined
                      }
                    }))}
                  />
                  <TextField
                    type="number"
                    label="Max Length"
                    value={field.validation?.maxLength || ''}
                    onChange={(e) => setField(prev => ({
                      ...prev,
                      validation: {
                        ...prev.validation,
                        maxLength: parseInt(e.target.value) || undefined
                      }
                    }))}
                  />
                </>
              )}
              {field.type === 'number' && (
                <>
                  <TextField
                    type="number"
                    label="Minimum Value"
                    value={field.validation?.min || ''}
                    onChange={(e) => setField(prev => ({
                      ...prev,
                      validation: {
                        ...prev.validation,
                        min: parseFloat(e.target.value) || undefined
                      }
                    }))}
                  />
                  <TextField
                    type="number"
                    label="Maximum Value"
                    value={field.validation?.max || ''}
                    onChange={(e) => setField(prev => ({
                      ...prev,
                      validation: {
                        ...prev.validation,
                        max: parseFloat(e.target.value) || undefined
                      }
                    }))}
                  />
                </>
              )}
            </Stack>
          </Box>

          <Divider />

          {/* Advanced Options */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Advanced Options
            </Typography>
            <TextField
              fullWidth
              label="Google Merchant API Mapping"
              value={field.googleMerchantMapping || ''}
              onChange={(e) => setField(prev => ({ ...prev, googleMerchantMapping: e.target.value }))}
              helperText="Optional: Map to Google Merchant API custom attribute"
            />
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSave} 
          variant="contained"
          disabled={!field.name || !field.label}
        >
          {existingField ? 'Update' : 'Create'} Field
        </Button>
      </DialogActions>
    </Dialog>
  );
}
