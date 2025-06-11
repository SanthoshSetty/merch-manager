import { useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  Alert,
  Button,
  Stack,
} from '@mui/material';
import {
  Save as SaveIcon,
  Sync as SyncIcon,
} from '@mui/icons-material';
import ProductFieldGroups from './ProductFieldGroups';

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
    // Extended fields from Google Merchant API
    imageLink: '',
    additionalImageLinks: [],
    lifestyleImageLinks: [],
    virtualModelLink: '',
    salePrice: '',
    costOfGoodsSold: '',
    autoPricingMinPrice: '',
    unitPricingMeasure: '',
    unitPricingBaseMeasure: '',
    sellOnGoogleQuantity: '',
    minHandlingTime: '',
    maxHandlingTime: '',
    availabilityDate: '',
    expirationDate: '',
    googleProductCategory: '',
    productTypes: [],
    ageGroup: '',
    gender: '',
    adult: false,
    color: '',
    material: '',
    pattern: '',
    size: '',
    sizeSystem: '',
    sizeTypes: [],
    productLength: '',
    productWidth: '',
    productHeight: '',
    productWeight: '',
    multipack: '',
    shippingLabel: '',
    transitTimeLabel: '',
    shippingLength: '',
    shippingWidth: '',
    shippingHeight: '',
    shippingWeight: '',
    pickupMethod: '',
    pickupSla: '',
    link: '',
    mobileLink: '',
    canonicalLink: '',
    productHighlights: [],
    customLabel0: '',
    customLabel1: '',
    customLabel2: '',
    customLabel3: '',
    customLabel4: '',
    externalSellerId: '',
    displayAdsId: '',
    adsGrouping: '',
    adsLabels: [],
    structuredTitle: '',
    digitalSourceType: '',
    pause: 'false',
    identifierExists: true,
    itemGroupId: '',
  });
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'success' | 'error' | null>(null);

  const handleFieldChange = (field: string, value: any) => {
    setProductData((prev: any) => ({
      ...prev,
      [field]: value
    }));
    
    // Auto-save field changes
    handleSaveField(field, value);
  };

  const handleSaveField = async (field: string, value: any) => {
    try {
      console.log(`Field ${field} updating to:`, value);
      
      // Call field update API
      const response = await fetch(`http://localhost:3001/api/products/${encodeURIComponent(productId)}/fields`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          updates: { [field]: value },
          updateMask: `attributes.${field}`
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        console.log(`Field ${field} updated successfully:`, result.data);
      } else {
        throw new Error(result.error || 'Update failed');
      }
      
      // Call onUpdate callback if provided
      if (onUpdate) {
        onUpdate();
      }
    } catch (error: any) {
      console.error('Error updating field:', error);
      // You could show a toast notification here for better UX
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setSaveStatus(null);
    
    try {
      // Transform data to match Google Merchant API format
      const transformedData = {
        ...productData,
        price: productData.price ? {
          amountMicros: Math.round(parseFloat(productData.price) * 1000000).toString(),
          currencyCode: 'USD'
        } : undefined,
        salePrice: productData.salePrice ? {
          amountMicros: Math.round(parseFloat(productData.salePrice) * 1000000).toString(),
          currencyCode: 'USD'
        } : undefined,
        costOfGoodsSold: productData.costOfGoodsSold ? {
          amountMicros: Math.round(parseFloat(productData.costOfGoodsSold) * 1000000).toString(),
          currencyCode: 'USD'
        } : undefined,
      };

      // Call bulk update API
      console.log('Saving all product data:', transformedData);
      
      const response = await fetch(`http://localhost:3001/api/products/${encodeURIComponent(productId)}/fields`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          updates: transformedData,
          updateMask: Object.keys(transformedData).map(key => `attributes.${key}`).join(',')
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        console.log('Bulk save successful:', result.data);
        setSaveStatus('success');
      } else {
        throw new Error(result.error || 'Bulk save failed');
      }
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error saving product:', error);
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box>
          <Typography variant="h4" gutterBottom>
            Product Management
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Product ID: {productId}
          </Typography>
          
          {/* Save Status */}
          {saveStatus === 'success' && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Product saved successfully!
            </Alert>
          )}
          {saveStatus === 'error' && (
            <Alert severity="error" sx={{ mt: 2 }}>
              Error saving product. Please try again.
            </Alert>
          )}
        </Box>

        {/* Action Buttons */}
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSaveAll}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save All Changes'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<SyncIcon />}
            onClick={() => onUpdate?.()}
          >
            Sync with Google
          </Button>
        </Stack>

        {/* Grouped Product Fields */}
        <ProductFieldGroups 
          productData={productData}
          onFieldChange={handleFieldChange}
        />

        {/* Status Information */}
        <Box sx={{ mt: 4, p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
          <Stack spacing={2}>
            <Typography variant="h6">Sync Status</Typography>
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
        </Box>
      </Stack>
    </Box>
  );
}