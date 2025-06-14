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
import { useCustomFields } from '../hooks/useCustomFields';
import { type CustomField } from './CustomFieldBuilder';
import { config } from '../config/api';

interface ProductFormProps {
  productId: string;
  initialData?: any;
  onUpdate?: () => void;
}

export default function ProductForm({ productId, initialData, onUpdate }: ProductFormProps) {
  // State management for preserving user changes vs server data
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
  const [saveError, setSaveError] = useState<string | null>(null);
  // const [lastSavedData, setLastSavedData] = useState<any>(null); // Track last successfully saved state
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false); // Track if user has unsaved changes

  // Custom fields integration
  const { customFields, customFieldValues } = useCustomFields(productId);

  // Function to map custom fields to Google Merchant API custom attributes
  const mapCustomFieldsToGoogleAttributes = () => {
    const googleCustomAttributes: Record<string, any> = {};
    
    // Google Merchant API supports 5 custom attributes (custom_attribute_0 to custom_attribute_4)
    const mappedFields: CustomField[] = customFields
      .filter(field => field.googleMerchantMapping && customFieldValues[field.id] !== undefined && customFieldValues[field.id] !== '')
      .slice(0, 5); // Limit to 5 as per Google's API limit
    
    mappedFields.forEach((fieldDef, index) => {
      const value = customFieldValues[fieldDef.id];
      if (value !== undefined && value !== '') {
        googleCustomAttributes[`custom_attribute_${index}`] = {
          name: fieldDef.googleMerchantMapping,
          value: String(value)
        };
      }
    });
    
    return googleCustomAttributes;
  };

  const handleFieldChange = (field: string, value: any) => {
    setProductData((prev: any) => ({
      ...prev,
      [field]: value
    }));
    
    // Mark as having unsaved changes
    setHasUnsavedChanges(true);
    
    // Clear any existing save status when user makes changes
    if (saveStatus) {
      setSaveStatus(null);
      setSaveError(null);
    }
    
    // Remove auto-save - only update local state
    // User will save manually using the Save button
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setSaveStatus(null);
    setSaveError(null);
    
    try {
      // Transform data to match Google Merchant API format with proper validation
      const transformPrice = (value: string) => {
        if (!value || value.trim() === '') return undefined;
        const numValue = parseFloat(value);
        if (isNaN(numValue) || numValue < 0) return undefined;
        return {
          amountMicros: Math.round(numValue * 1000000).toString(),
          currencyCode: 'USD'
        };
      };

      const transformedData = {
        ...productData,
        price: transformPrice(productData.price),
        salePrice: transformPrice(productData.salePrice),
        costOfGoodsSold: transformPrice(productData.costOfGoodsSold),
        // Add Google Merchant custom attributes from custom fields
        ...mapCustomFieldsToGoogleAttributes(),
      };

      // Clean up problematic data before sending to API
      const cleanedData: Record<string, any> = {};
      Object.keys(transformedData).forEach(key => {
        const value = (transformedData as any)[key];
        
        // Skip undefined values
        if (value === undefined) return;
        
        // Skip empty strings for most fields (except where empty is valid)
        if (value === '' && !['title', 'description'].includes(key)) return;
        
        // Skip empty arrays
        if (Array.isArray(value) && value.length === 0) return;
        
        // Skip false boolean values for optional fields
        if (typeof value === 'boolean' && !value && key !== 'identifierExists') return;
        
        // Only include valid, meaningful data
        cleanedData[key] = value;
      });

      // Call bulk update API
      const customAttributes = mapCustomFieldsToGoogleAttributes();
      const hasCustomFields = Object.keys(customAttributes).length > 0;
      
      console.log('🔍 Saving product data...');
      console.log('📊 Original data keys:', Object.keys(transformedData).length);
      console.log('📊 Cleaned data keys:', Object.keys(cleanedData).length);
      console.log('📊 Cleaned data:', cleanedData);
      
      if (hasCustomFields) {
        console.log('🎯 Custom fields mapped to Google attributes:', customAttributes);
        console.log('📝 Custom fields being synced:', Object.keys(customAttributes).length);
      } else {
        console.log('ℹ️ No custom fields with Google Merchant mapping found');
      }
      
      console.log('📋 Update mask:', Object.keys(cleanedData).map(key => `attributes.${key}`).join(','));
      
      const requestBody = {
        updates: cleanedData,
        updateMask: Object.keys(cleanedData).map(key => `attributes.${key}`).join(',')
      };
      
      const response = await fetch(`${config.API_BASE_URL}/api/products/${encodeURIComponent(productId)}/fields`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();
      
      console.log('📡 API Response:', {
        status: response.status,
        ok: response.ok,
        result: result
      });

      if (!response.ok) {
        console.error('❌ HTTP Error Details:', {
          status: response.status,
          statusText: response.statusText,
          responseBody: result
        });
        throw new Error(`Save failed: ${result.error || response.statusText || `HTTP ${response.status}`}`);
      }

      if (result.success) {
        const customAttributesCount = Object.keys(customAttributes).length;
        console.log('✅ Bulk save successful!');
        if (customAttributesCount > 0) {
          console.log(`🎯 ${customAttributesCount} custom fields synced to Google Merchant custom attributes!`);
        }
        setSaveStatus('success');
        
        // Track the saved state
        setHasUnsavedChanges(false);
        
        // Notify parent component but don't refetch immediately
        // Google Merchant Center API takes time to propagate changes
        if (onUpdate) {
          onUpdate();
        }
      } else {
        console.error('❌ API returned failure:', result);
        throw new Error(result.error || 'API returned failure status');
      }
    } catch (error: any) {
      // Enhanced error logging to debug the issue
      console.error('💥 Error saving product:', error);
      console.error('💥 Error details:', {
        message: error?.message,
        stack: error?.stack,
        name: error?.name,
        type: typeof error,
        constructor: error?.constructor?.name,
        fullError: JSON.stringify(error, Object.getOwnPropertyNames(error))
      });
      
      setSaveStatus('error');
      
      // Better error message extraction
      let errorMessage = 'Unknown error occurred';
      if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error?.error) {
        errorMessage = error.error;
      } else if (error?.statusText) {
        errorMessage = error.statusText;
      }
      
      setSaveError(errorMessage);
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
          
          {/* Unsaved Changes Indicator */}
          {hasUnsavedChanges && (
            <Alert severity="warning" sx={{ mt: 1 }}>
              <Typography variant="body2">
                You have unsaved changes. Click "Save Changes" to persist your edits.
              </Typography>
            </Alert>
          )}
          
          {/* Save Status */}
          {saveStatus === 'success' && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Product saved successfully!
            </Alert>
          )}
          {saveStatus === 'error' && (
            <Alert severity="error" sx={{ mt: 2 }}>
              <Typography variant="body2" gutterBottom>
                <strong>Error saving product.</strong>
              </Typography>
              {saveError && (
                <Typography variant="body2" gutterBottom sx={{ mt: 1, p: 1, bgcolor: 'grey.100', borderRadius: 1, fontFamily: 'monospace', fontSize: '0.85em' }}>
                  {saveError}
                </Typography>
              )}
              <Typography variant="body2">
                Please check the browser console for detailed error information. 
                Common issues include invalid price formats or network connectivity problems.
              </Typography>
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
            color={hasUnsavedChanges ? "primary" : "success"}
          >
            {saving ? 'Saving...' : hasUnsavedChanges ? 'Save Changes' : 'All Saved'}
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
          productId={productId}
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