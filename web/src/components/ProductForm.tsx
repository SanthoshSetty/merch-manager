import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Stack,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
} from '@mui/material';

interface ProductFormProps {
  productId: string;
  initialData?: any;
  onUpdate?: () => void;
}

export default function ProductForm({ productId, initialData, onUpdate }: ProductFormProps) {
  const [productData, setProductData] = useState(initialData || {
    title: '',
    description: '',
    price: '',
    availability: 'in_stock',
    condition: 'new',
    brand: '',
    gtin: '',
    mpn: '',
  });

  const handleFieldChange = (field: string, value: any) => {
    setProductData((prev: any) => ({
      ...prev,
      [field]: value
    }));
    
    // Here you would normally call your field update API
    console.log(`Field ${field} updated to:`, value);
    
    // Call onUpdate callback if provided
    if (onUpdate) {
      onUpdate();
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Product Management
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Product ID: {productId}
      </Typography>

      <Stack spacing={3}>
        {/* Basic Information */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Product Title"
                value={productData.title}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                helperText="Clear, descriptive product title"
              />
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                value={productData.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                helperText="Detailed product description"
              />
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  label="Brand"
                  value={productData.brand}
                  onChange={(e) => handleFieldChange('brand', e.target.value)}
                />
                <TextField
                  fullWidth
                  label="Price"
                  type="number"
                  value={productData.price}
                  onChange={(e) => handleFieldChange('price', e.target.value)}
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>
                  }}
                />
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
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
                    value={productData.availability}
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
                    value={productData.condition}
                    onChange={(e) => handleFieldChange('condition', e.target.value)}
                    label="Condition"
                  >
                    <MenuItem value="new">New</MenuItem>
                    <MenuItem value="refurbished">Refurbished</MenuItem>
                    <MenuItem value="used">Used</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  label="GTIN"
                  value={productData.gtin}
                  onChange={(e) => handleFieldChange('gtin', e.target.value)}
                  helperText="Global Trade Item Number"
                />
                <TextField
                  fullWidth
                  label="MPN"
                  value={productData.mpn}
                  onChange={(e) => handleFieldChange('mpn', e.target.value)}
                  helperText="Manufacturer Part Number"
                />
              </Stack>
            </CardContent>
          </Card>

          {/* Status */}
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Sync Status
              </Typography>
              <Stack spacing={2}>
                <Chip
                  label="Ready to Sync"
                  color="success"
                  variant="outlined"
                />
                <Typography variant="body2" color="text.secondary">
                  Field updates will be synchronized with Google Merchant Center when the backend is properly configured.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Configure your Google Cloud credentials and start the backend server to enable real-time synchronization.
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Stack>
    </Box>
  );
}