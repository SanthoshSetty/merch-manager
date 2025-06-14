import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  Chip,
} from '@mui/material';
import SyncableField from './SyncableField';
import { useFieldUpdate } from '../hooks/useFieldUpdate';

interface ProductFormProps {
  productId: string;
  initialData?: any;
}

export default function ProductForm({ productId, initialData }: ProductFormProps) {
  const [productData, setProductData] = useState(initialData || {
    title: '',
    description: '',
    price: { value: '', currency: 'USD' },
    availability: '',
    condition: '',
    brand: '',
    gtin: '',
    mpn: '',
    googleProductCategory: '',
    imageLink: '',
    salePrice: { value: '', currency: 'USD' },
    costOfGoodsSold: { value: '', currency: 'USD' },
  });

  const fieldUpdate = useFieldUpdate(productId, () => {
    console.log('Field updated successfully');
  });

  const [debounceTimers, setDebounceTimers] = useState<Record<string, any>>({});

  const handleFieldChange = (fieldPath: string, value: any) => {
    // Update local state immediately
    setProductData((prev: any) => {
      const newData = { ...prev };
      const keys = fieldPath.split('.');
      let current = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      
      return newData;
    });

    // Clear existing timer
    if (debounceTimers[fieldPath]) {
      clearTimeout(debounceTimers[fieldPath]);
    }

    // Set new debounced update
    const timer = setTimeout(() => {
      fieldUpdate.updateField(fieldPath, value);
      setDebounceTimers(prev => {
        const { [fieldPath]: removed, ...rest } = prev;
        return rest;
      });
    }, 1000);

    setDebounceTimers(prev => ({
      ...prev,
      [fieldPath]: timer
    }));
  };

  const getFieldValue = (fieldPath: string) => {
    const keys = fieldPath.split('.');
    let current = productData;
    for (const key of keys) {
      current = current?.[key];
    }
    return current || '';
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Product Management
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Edit product fields with real-time synchronization to Google Merchant Center
      </Typography>

      {fieldUpdate.isAnyFieldUpdating && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Chip icon={<div>⏳</div>} label="Syncing fields..." color="primary" size="small" />
          {' '}Fields are being synchronized with Google Merchant Center...
        </Alert>
      )}

      <Stack spacing={3}>
        {/* Basic Information */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>
            <Stack spacing={2}>
              <SyncableField
                fullWidth
                label="Product Title"
                fieldPath="title"
                value={getFieldValue('title')}
                onChange={(value) => handleFieldChange('title', value)}
                fieldState={fieldUpdate.getFieldState('title')}
                syncLabel="Title"
                helperText="Clear, descriptive product title"
              />
              <SyncableField
                fullWidth
                multiline
                rows={4}
                label="Description"
                fieldPath="description"
                value={getFieldValue('description')}
                onChange={(value) => handleFieldChange('description', value)}
                fieldState={fieldUpdate.getFieldState('description')}
                syncLabel="Description"
                helperText="Detailed product description"
              />
              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
                <SyncableField
                  fullWidth
                  label="Brand"
                  fieldPath="brand"
                  value={getFieldValue('brand')}
                  onChange={(value) => handleFieldChange('brand', value)}
                  fieldState={fieldUpdate.getFieldState('brand')}
                  syncLabel="Brand"
                />
                <SyncableField
                  fullWidth
                  label="Google Product Category"
                  fieldPath="googleProductCategory"
                  value={getFieldValue('googleProductCategory')}
                  onChange={(value) => handleFieldChange('googleProductCategory', value)}
                  fieldState={fieldUpdate.getFieldState('googleProductCategory')}
                  syncLabel="Category"
                  helperText="Google product category ID"
                />
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Pricing and Product Details */}
        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
          {/* Pricing */}
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Pricing
              </Typography>
              <Stack spacing={2}>
                <SyncableField
                  fullWidth
                  label="Price"
                  type="number"
                  fieldPath="price.value"
                  value={getFieldValue('price.value')}
                  onChange={(value) => handleFieldChange('price.value', value)}
                  fieldState={fieldUpdate.getFieldState('price.value')}
                  syncLabel="Price"
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>
                  }}
                />
                <SyncableField
                  fullWidth
                  label="Sale Price"
                  type="number"
                  fieldPath="salePrice.value"
                  value={getFieldValue('salePrice.value')}
                  onChange={(value) => handleFieldChange('salePrice.value', value)}
                  fieldState={fieldUpdate.getFieldState('salePrice.value')}
                  syncLabel="Sale Price"
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>
                  }}
                />
                <SyncableField
                  fullWidth
                  label="Cost of Goods Sold"
                  type="number"
                  fieldPath="costOfGoodsSold.value"
                  value={getFieldValue('costOfGoodsSold.value')}
                  onChange={(value) => handleFieldChange('costOfGoodsSold.value', value)}
                  fieldState={fieldUpdate.getFieldState('costOfGoodsSold.value')}
                  syncLabel="COGS"
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>
                  }}
                />
              </Stack>
            </CardContent>
          </Card>

          {/* Product Details */}
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Product Details
              </Typography>
              <Stack spacing={2}>
                <FormControl fullWidth>
                  <InputLabel>Availability</InputLabel>
                  <Select
                    value={getFieldValue('availability')}
                    onChange={(e) => handleFieldChange('availability', e.target.value)}
                    label="Availability"
                  >
                    <MenuItem value="in_stock">In Stock</MenuItem>
                    <MenuItem value="out_of_stock">Out of Stock</MenuItem>
                    <MenuItem value="preorder">Preorder</MenuItem>
                    <MenuItem value="backorder">Backorder</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Condition</InputLabel>
                  <Select
                    value={getFieldValue('condition')}
                    onChange={(e) => handleFieldChange('condition', e.target.value)}
                    label="Condition"
                  >
                    <MenuItem value="new">New</MenuItem>
                    <MenuItem value="refurbished">Refurbished</MenuItem>
                    <MenuItem value="used">Used</MenuItem>
                  </Select>
                </FormControl>
                <SyncableField
                  fullWidth
                  label="GTIN"
                  fieldPath="gtin"
                  value={getFieldValue('gtin')}
                  onChange={(value) => handleFieldChange('gtin', value)}
                  fieldState={fieldUpdate.getFieldState('gtin')}
                  syncLabel="GTIN"
                  helperText="Global Trade Item Number"
                />
                <SyncableField
                  fullWidth
                  label="MPN"
                  fieldPath="mpn"
                  value={getFieldValue('mpn')}
                  onChange={(value) => handleFieldChange('mpn', value)}
                  fieldState={fieldUpdate.getFieldState('mpn')}
                  syncLabel="MPN"
                  helperText="Manufacturer Part Number"
                />
              </Stack>
            </CardContent>
          </Card>
        </Box>

        {/* Images */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Product Images
            </Typography>
            <SyncableField
              fullWidth
              label="Main Image URL"
              fieldPath="imageLink"
              value={getFieldValue('imageLink')}
              onChange={(value) => handleFieldChange('imageLink', value)}
              fieldState={fieldUpdate.getFieldState('imageLink')}
              syncLabel="Image Link"
              helperText="URL to the main product image"
            />
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
