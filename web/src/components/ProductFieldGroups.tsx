import { memo, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Stack,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  FormControlLabel,
  Divider,
  InputAdornment,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Chip,
  Link,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Info as InfoIcon,
  Image as ImageIcon,
  AttachMoney as PriceIcon,
  Inventory as InventoryIcon,
  Category as CategoryIcon,
  Search as SEOIcon,
  Analytics as AnalyticsIcon,
  Nature as EcoIcon,
  Straighten as StraightenIcon,
  LocalShipping as LocalShippingIcon,
  Verified as VerifiedIcon,
  Public as PublicIcon,
  Extension as ExtensionIcon,
  Settings as SettingsIcon,
  TrendingUp as CompetitiveIcon,
  OpenInNew as ExternalLinkIcon,
} from '@mui/icons-material';
import CustomFieldBuilder, { type CustomField } from './CustomFieldBuilder';
import CustomFieldManager from './CustomFieldManager';
import { useCustomFields } from '../hooks/useCustomFields';

interface ProductFieldGroupsProps {
  productData: any;
  onFieldChange: (field: string, value: any) => void;
  productId?: string;
}

// Validation functions
const validateTitle = (title: string): string | null => {
  if (!title || title.trim().length === 0) return 'Title is required';
  if (title.length > 150) return 'Title must be 150 characters or less';
  return null;
};

const validatePrice = (price: string): string | null => {
  if (!price || price.trim().length === 0) return 'Price is required';
  const numPrice = parseFloat(price);
  if (isNaN(numPrice) || numPrice < 0) return 'Price must be a valid positive number';
  return null;
};

const validateGTIN = (gtin: string): string | null => {
  if (gtin && gtin.length !== 12 && gtin.length !== 13 && gtin.length !== 14) {
    return 'GTIN must be 12, 13, or 14 digits';
  }
  if (gtin && !/^\d+$/.test(gtin)) {
    return 'GTIN must contain only numbers';
  }
  return null;
};

const validateImageLink = (url: string): string | null => {
  if (url && !url.match(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i)) {
    return 'Must be a valid image URL (jpg, jpeg, png, gif, webp)';
  }
  return null;
};

// Stable TextField component to prevent cursor focus loss during re-renders
const StableTextField = memo(({ ...props }: any) => {
  return <TextField {...props} />;
});

function ProductFieldGroups({ productData, onFieldChange, productId }: ProductFieldGroupsProps) {
  const [customFieldBuilderOpen, setCustomFieldBuilderOpen] = useState(false);
  const [editingCustomField, setEditingCustomField] = useState<CustomField | undefined>();

  // Custom fields hook
  const {
    customFields,
    customFieldValues,
    addCustomField,
    updateCustomField,
    removeCustomField,
    setCustomFieldValue,
  } = useCustomFields(productId);

  // Competitive pricing state
  const [competitivePricingCountry, setCompetitivePricingCountry] = useState('Singapore');
  const [competitivePricingCurrency, setCompetitivePricingCurrency] = useState('SGD');
  const [competitivePricingLoading, setCompetitivePricingLoading] = useState(false);
  const [competitivePricingData, setCompetitivePricingData] = useState<any[]>([]);
  const [competitivePricingError, setCompetitivePricingError] = useState<string | null>(null);

  // Country and currency options
  const countryOptions = [
    { value: 'Singapore', label: 'Singapore' },
    { value: 'Malaysia', label: 'Malaysia' },
    { value: 'Thailand', label: 'Thailand' },
    { value: 'Indonesia', label: 'Indonesia' },
    { value: 'Philippines', label: 'Philippines' },
    { value: 'Vietnam', label: 'Vietnam' },
    { value: 'United States', label: 'United States' },
    { value: 'United Kingdom', label: 'United Kingdom' },
    { value: 'Germany', label: 'Germany' },
    { value: 'France', label: 'France' },
    { value: 'Japan', label: 'Japan' },
    { value: 'Australia', label: 'Australia' },
    { value: 'Canada', label: 'Canada' },
    { value: 'India', label: 'India' },
  ];

  const currencyOptions = [
    { value: 'SGD', label: 'SGD - Singapore Dollar' },
    { value: 'MYR', label: 'MYR - Malaysian Ringgit' },
    { value: 'THB', label: 'THB - Thai Baht' },
    { value: 'IDR', label: 'IDR - Indonesian Rupiah' },
    { value: 'PHP', label: 'PHP - Philippine Peso' },
    { value: 'VND', label: 'VND - Vietnamese Dong' },
    { value: 'USD', label: 'USD - US Dollar' },
    { value: 'GBP', label: 'GBP - British Pound' },
    { value: 'EUR', label: 'EUR - Euro' },
    { value: 'JPY', label: 'JPY - Japanese Yen' },
    { value: 'AUD', label: 'AUD - Australian Dollar' },
    { value: 'CAD', label: 'CAD - Canadian Dollar' },
    { value: 'INR', label: 'INR - Indian Rupee' },
  ];

  // Competitive pricing analysis function
  const analyzeCompetition = async () => {
    if (!productData.title || !productData.brand) {
      setCompetitivePricingError('Product title and brand are required for competitive analysis');
      return;
    }

    setCompetitivePricingLoading(true);
    setCompetitivePricingError(null);
    setCompetitivePricingData([]);

    try {
      // Call the backend endpoint for competitive pricing analysis
      const response = await fetch('/api/competitive-pricing/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productName: productData.title,
          brand: productData.brand,
          country: competitivePricingCountry,
          currency: competitivePricingCurrency,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        setCompetitivePricingData(result.data);
      } else {
        throw new Error(result.error || 'Failed to analyze competition');
      }
    } catch (error: any) {
      console.error('Competitive pricing analysis error:', error);
      setCompetitivePricingError(error.message || 'Failed to analyze competition');
      
      // Fallback sample data for demonstration
      const sampleData = [
        {
          'Retailer': `${productData.brand || 'Brand'} Official Store`,
          [`Price (in ${competitivePricingCurrency})`]: `${competitivePricingCurrency} 1,299.00`,
          'Grounded URL': `https://www.${(productData.brand || 'brand').toLowerCase()}.com`,
          'Resolved URL': `https://www.${(productData.brand || 'brand').toLowerCase()}.com`,
        },
        {
          'Retailer': `Amazon ${competitivePricingCountry}`,
          [`Price (in ${competitivePricingCurrency})`]: `${competitivePricingCurrency} 1,250.00`,
          'Grounded URL': `https://www.amazon.com/search?k=${encodeURIComponent(productData.title || '')}`,
          'Resolved URL': `https://www.amazon.com/search?k=${encodeURIComponent(productData.title || '')}`,
        },
        {
          'Retailer': `Local Retailer ${competitivePricingCountry}`,
          [`Price (in ${competitivePricingCurrency})`]: `${competitivePricingCurrency} 1,275.00`,
          'Grounded URL': `https://example-retailer.com`,
          'Resolved URL': `https://example-retailer.com`,
        },
      ];
      setCompetitivePricingData(sampleData);
    } finally {
      setCompetitivePricingLoading(false);
    }
  };

  // Handle custom field changes
  const handleCustomFieldChange = (fieldId: string, value: any) => {
    setCustomFieldValue(fieldId, value);
    // Also notify parent component about custom field changes
    onFieldChange('customFields', { ...customFieldValues, [fieldId]: value });
  };

  const handleAddCustomField = () => {
    setEditingCustomField(undefined);
    setCustomFieldBuilderOpen(true);
  };

  const handleEditCustomField = (field: CustomField) => {
    setEditingCustomField(field);
    setCustomFieldBuilderOpen(true);
  };

  const handleRemoveCustomField = (fieldId: string) => {
    removeCustomField(fieldId);
  };

  const handleSaveCustomField = (field: CustomField) => {
    if (editingCustomField) {
      updateCustomField(field);
    } else {
      addCustomField(field);
    }
    setCustomFieldBuilderOpen(false);
    setEditingCustomField(undefined);
  };
  
  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Stack spacing={2}>
        {/* Basic Information Group */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <InfoIcon color="primary" />
              <Typography variant="h6">Basic Information</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={3}>
              <StableTextField
                fullWidth
                label="Product Title"
                value={productData.title || ''}
                onChange={(e: any) => onFieldChange('title', e.target.value)}
                required
                error={!!validateTitle(productData.title)}
                helperText={validateTitle(productData.title) || "Clear, descriptive product title (max 150 characters)"}
              />
              
              <StableTextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                value={productData.description || ''}
                onChange={(e: any) => onFieldChange('description', e.target.value)}
                helperText="Detailed product description (max 5000 characters)"
              />

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <StableTextField
                  fullWidth
                  label="Brand"
                  value={productData.brand || ''}
                  onChange={(e: any) => onFieldChange('brand', e.target.value)}
                  required
                  helperText="Product brand name"
                />
                <FormControl fullWidth required>
                  <InputLabel>Condition</InputLabel>
                  <Select
                    value={productData.condition || 'new'}
                    onChange={(e) => onFieldChange('condition', e.target.value)}
                    label="Condition"
                  >
                    <MenuItem value="new">New</MenuItem>
                    <MenuItem value="refurbished">Refurbished</MenuItem>
                    <MenuItem value="used">Used</MenuItem>
                  </Select>
                </FormControl>
              </Stack>

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <StableTextField
                  fullWidth
                  label="GTIN"
                  value={productData.gtin || ''}
                  onChange={(e: any) => onFieldChange('gtin', e.target.value)}
                  error={!!validateGTIN(productData.gtin)}
                  helperText={validateGTIN(productData.gtin) || "Global Trade Item Number (UPC/EAN)"}
                />
                <StableTextField
                  fullWidth
                  label="MPN"
                  value={productData.mpn || ''}
                  onChange={(e: any) => onFieldChange('mpn', e.target.value)}
                  helperText="Manufacturer Part Number"
                />
              </Stack>

              <StableTextField
                fullWidth
                label="Item Group ID"
                value={productData.itemGroupId || ''}
                onChange={(e: any) => onFieldChange('itemGroupId', e.target.value)}
                helperText="Groups product variants together"
              />
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* Images & Media Group */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ImageIcon color="primary" />
              <Typography variant="h6">Images & Media</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={3}>
              <StableTextField
                fullWidth
                label="Main Image URL"
                value={productData.imageLink || ''}
                onChange={(e: any) => onFieldChange('imageLink', e.target.value)}
                required
                error={!!validateImageLink(productData.imageLink)}
                helperText={validateImageLink(productData.imageLink) || "Primary product image URL"}
                type="url"
              />

              <StableTextField
                fullWidth
                multiline
                rows={3}
                label="Additional Image URLs"
                value={productData.additionalImageLinks?.join('\n') || ''}
                onChange={(e: any) => onFieldChange('additionalImageLinks', e.target.value.split('\n').filter((url: string) => url.trim()))}
                helperText="Additional product images (one URL per line, max 10)"
                type="url"
              />

              <StableTextField
                fullWidth
                label="Virtual Model Link"
                value={productData.virtualModelLink || ''}
                onChange={(e: any) => onFieldChange('virtualModelLink', e.target.value)}
                helperText="3D model or AR experience link"
                type="url"
              />
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* Pricing Group */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PriceIcon color="primary" />
              <Typography variant="h6">Pricing & Costs</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={3}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <StableTextField
                  fullWidth
                  label="Price"
                  type="number"
                  value={productData.price || ''}
                  onChange={(e: any) => onFieldChange('price', e.target.value)}
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>
                  }}
                  required
                  error={!!validatePrice(productData.price)}
                  helperText={validatePrice(productData.price) || "Regular selling price"}
                />
                <StableTextField
                  fullWidth
                  label="Sale Price"
                  type="number"
                  value={productData.salePrice || ''}
                  onChange={(e: any) => onFieldChange('salePrice', e.target.value)}
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>
                  }}
                  helperText="Discounted price (if on sale)"
                />
              </Stack>

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <StableTextField
                  fullWidth
                  label="Cost of Goods Sold"
                  type="number"
                  value={productData.costOfGoodsSold || ''}
                  onChange={(e: any) => onFieldChange('costOfGoodsSold', e.target.value)}
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>
                  }}
                  helperText="Product cost for profit reporting"
                />
                <StableTextField
                  fullWidth
                  label="Auto Pricing Min Price"
                  type="number"
                  value={productData.autoPricingMinPrice || ''}
                  onChange={(e: any) => onFieldChange('autoPricingMinPrice', e.target.value)}
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>
                  }}
                  helperText="Minimum price for automated discounts"
                />
              </Stack>

              <StableTextField
                fullWidth
                label="Sale Price Effective Date"
                value={productData.salePriceEffectiveDate || ''}
                onChange={(e: any) => onFieldChange('salePriceEffectiveDate', e.target.value)}
                helperText="Date range for sale price (format: 2024-01-01T00:00+00:00/2024-01-31T23:59+00:00)"
              />
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* Inventory Group */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <InventoryIcon color="primary" />
              <Typography variant="h6">Inventory & Availability</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={3}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <FormControl fullWidth>
                  <InputLabel>Availability</InputLabel>
                  <Select
                    value={productData.availability || 'in_stock'}
                    onChange={(e) => onFieldChange('availability', e.target.value)}
                    label="Availability"
                  >
                    <MenuItem value="in_stock">In Stock</MenuItem>
                    <MenuItem value="out_of_stock">Out of Stock</MenuItem>
                    <MenuItem value="preorder">Preorder</MenuItem>
                    <MenuItem value="backorder">Backorder</MenuItem>
                  </Select>
                </FormControl>
                <StableTextField
                  fullWidth
                  label="Sell on Google Quantity"
                  type="number"
                  value={productData.sellOnGoogleQuantity || ''}
                  onChange={(e: any) => onFieldChange('sellOnGoogleQuantity', e.target.value)}
                  helperText="Quantity available for Google Shopping"
                />
              </Stack>

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <StableTextField
                  fullWidth
                  label="Availability Date"
                  type="datetime-local"
                  value={productData.availabilityDate || ''}
                  onChange={(e: any) => onFieldChange('availabilityDate', e.target.value)}
                  helperText="When product becomes available"
                />
                <StableTextField
                  fullWidth
                  label="Expiration Date"
                  type="datetime-local"
                  value={productData.expirationDate || ''}
                  onChange={(e: any) => onFieldChange('expirationDate', e.target.value)}
                  helperText="Product expiration date"
                />
              </Stack>

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <StableTextField
                  fullWidth
                  label="Min Handling Time (days)"
                  type="number"
                  value={productData.minHandlingTime || ''}
                  onChange={(e: any) => onFieldChange('minHandlingTime', e.target.value)}
                  helperText="Minimum processing time"
                />
                <StableTextField
                  fullWidth
                  label="Max Handling Time (days)"
                  type="number"
                  value={productData.maxHandlingTime || ''}
                  onChange={(e: any) => onFieldChange('maxHandlingTime', e.target.value)}
                  helperText="Maximum processing time"
                />
              </Stack>
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* Enhanced Product Details Group */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ExtensionIcon color="primary" />
              <Typography variant="h6">Enhanced Product Details</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={3}>
              {/* Demographics */}
              <Typography variant="subtitle2" color="text.secondary">
                Demographics & Target Audience
              </Typography>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <FormControl fullWidth>
                  <InputLabel>Gender</InputLabel>
                  <Select
                    value={productData.gender || ''}
                    onChange={(e) => onFieldChange('gender', e.target.value)}
                    label="Gender"
                  >
                    <MenuItem value="">Not Specified</MenuItem>
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                    <MenuItem value="unisex">Unisex</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Age Group</InputLabel>
                  <Select
                    value={productData.ageGroup || ''}
                    onChange={(e) => onFieldChange('ageGroup', e.target.value)}
                    label="Age Group"
                  >
                    <MenuItem value="">Not Specified</MenuItem>
                    <MenuItem value="newborn">Newborn (0-3 months)</MenuItem>
                    <MenuItem value="infant">Infant (3-12 months)</MenuItem>
                    <MenuItem value="toddler">Toddler (1-5 years)</MenuItem>
                    <MenuItem value="kids">Kids (5-13 years)</MenuItem>
                    <MenuItem value="adult">Adult (13+ years)</MenuItem>
                  </Select>
                </FormControl>
              </Stack>

              <FormControlLabel
                control={
                  <Switch
                    checked={productData.adult === true}
                    onChange={(e) => onFieldChange('adult', e.target.checked)}
                  />
                }
                label="Adult content (requires age verification)"
              />

              <Divider />

              {/* Physical Attributes */}
              <Typography variant="subtitle2" color="text.secondary">
                Physical Attributes
              </Typography>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <StableTextField
                  fullWidth
                  label="Color"
                  value={productData.color || ''}
                  onChange={(e: any) => onFieldChange('color', e.target.value)}
                  helperText="Primary color(s)"
                />
                <StableTextField
                  fullWidth
                  label="Material"
                  value={productData.material || ''}
                  onChange={(e: any) => onFieldChange('material', e.target.value)}
                  helperText="Primary material"
                />
              </Stack>

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <StableTextField
                  fullWidth
                  label="Pattern"
                  value={productData.pattern || ''}
                  onChange={(e: any) => onFieldChange('pattern', e.target.value)}
                  helperText="Pattern or design"
                />
                <StableTextField
                  fullWidth
                  label="Size"
                  value={productData.size || ''}
                  onChange={(e: any) => onFieldChange('size', e.target.value)}
                  helperText="Product size"
                />
              </Stack>

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <FormControl fullWidth>
                  <InputLabel>Size System</InputLabel>
                  <Select
                    value={productData.sizeSystem || ''}
                    onChange={(e) => onFieldChange('sizeSystem', e.target.value)}
                    label="Size System"
                  >
                    <MenuItem value="">Not Specified</MenuItem>
                    <MenuItem value="US">US</MenuItem>
                    <MenuItem value="UK">UK</MenuItem>
                    <MenuItem value="EU">EU</MenuItem>
                    <MenuItem value="DE">DE (Germany)</MenuItem>
                    <MenuItem value="FR">FR (France)</MenuItem>
                    <MenuItem value="IT">IT (Italy)</MenuItem>
                    <MenuItem value="JP">JP (Japan)</MenuItem>
                    <MenuItem value="CN">CN (China)</MenuItem>
                    <MenuItem value="BR">BR (Brazil)</MenuItem>
                    <MenuItem value="MEX">MEX (Mexico)</MenuItem>
                    <MenuItem value="AU">AU (Australia)</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Size Type</InputLabel>
                  <Select
                    value={productData.sizeType || ''}
                    onChange={(e) => onFieldChange('sizeType', e.target.value)}
                    label="Size Type"
                  >
                    <MenuItem value="">Not Specified</MenuItem>
                    <MenuItem value="regular">Regular</MenuItem>
                    <MenuItem value="petite">Petite</MenuItem>
                    <MenuItem value="plus">Plus</MenuItem>
                    <MenuItem value="big_and_tall">Big & Tall</MenuItem>
                    <MenuItem value="maternity">Maternity</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* Physical Dimensions Group */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <StraightenIcon color="primary" />
              <Typography variant="h6">Physical Dimensions & Weight</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={3}>
              {/* Product Dimensions */}
              <Typography variant="subtitle2" color="text.secondary">
                Product Dimensions
              </Typography>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <StableTextField
                  fullWidth
                  label="Length"
                  type="number"
                  value={productData.productLength || ''}
                  onChange={(e: any) => onFieldChange('productLength', e.target.value)}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">
                      <Select
                        value={productData.productLengthUnit || 'in'}
                        onChange={(e) => onFieldChange('productLengthUnit', e.target.value)}
                        variant="standard"
                        size="small"
                      >
                        <MenuItem value="in">in</MenuItem>
                        <MenuItem value="cm">cm</MenuItem>
                      </Select>
                    </InputAdornment>
                  }}
                />
                <StableTextField
                  fullWidth
                  label="Width"
                  type="number"
                  value={productData.productWidth || ''}
                  onChange={(e: any) => onFieldChange('productWidth', e.target.value)}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">
                      <Select
                        value={productData.productWidthUnit || 'in'}
                        onChange={(e) => onFieldChange('productWidthUnit', e.target.value)}
                        variant="standard"
                        size="small"
                      >
                        <MenuItem value="in">in</MenuItem>
                        <MenuItem value="cm">cm</MenuItem>
                      </Select>
                    </InputAdornment>
                  }}
                />
                <StableTextField
                  fullWidth
                  label="Height"
                  type="number"
                  value={productData.productHeight || ''}
                  onChange={(e: any) => onFieldChange('productHeight', e.target.value)}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">
                      <Select
                        value={productData.productHeightUnit || 'in'}
                        onChange={(e) => onFieldChange('productHeightUnit', e.target.value)}
                        variant="standard"
                        size="small"
                      >
                        <MenuItem value="in">in</MenuItem>
                        <MenuItem value="cm">cm</MenuItem>
                      </Select>
                    </InputAdornment>
                  }}
                />
              </Stack>

              <StableTextField
                fullWidth
                label="Product Weight"
                type="number"
                value={productData.productWeight || ''}
                onChange={(e: any) => onFieldChange('productWeight', e.target.value)}
                InputProps={{
                  endAdornment: <InputAdornment position="end">
                    <Select
                      value={productData.productWeightUnit || 'lb'}
                      onChange={(e) => onFieldChange('productWeightUnit', e.target.value)}
                      variant="standard"
                      size="small"
                    >
                      <MenuItem value="lb">lb</MenuItem>
                      <MenuItem value="kg">kg</MenuItem>
                      <MenuItem value="g">g</MenuItem>
                      <MenuItem value="oz">oz</MenuItem>
                    </Select>
                  </InputAdornment>
                }}
              />

              <Divider />

              {/* Shipping Dimensions */}
              <Typography variant="subtitle2" color="text.secondary">
                Shipping Dimensions
              </Typography>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <StableTextField
                  fullWidth
                  label="Shipping Length"
                  type="number"
                  value={productData.shippingLength || ''}
                  onChange={(e: any) => onFieldChange('shippingLength', e.target.value)}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">
                      <Select
                        value={productData.shippingLengthUnit || 'in'}
                        onChange={(e) => onFieldChange('shippingLengthUnit', e.target.value)}
                        variant="standard"
                        size="small"
                      >
                        <MenuItem value="in">in</MenuItem>
                        <MenuItem value="cm">cm</MenuItem>
                      </Select>
                    </InputAdornment>
                  }}
                />
                <StableTextField
                  fullWidth
                  label="Shipping Width"
                  type="number"
                  value={productData.shippingWidth || ''}
                  onChange={(e: any) => onFieldChange('shippingWidth', e.target.value)}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">
                      <Select
                        value={productData.shippingWidthUnit || 'in'}
                        onChange={(e) => onFieldChange('shippingWidthUnit', e.target.value)}
                        variant="standard"
                        size="small"
                      >
                        <MenuItem value="in">in</MenuItem>
                        <MenuItem value="cm">cm</MenuItem>
                      </Select>
                    </InputAdornment>
                  }}
                />
                <StableTextField
                  fullWidth
                  label="Shipping Height"
                  type="number"
                  value={productData.shippingHeight || ''}
                  onChange={(e: any) => onFieldChange('shippingHeight', e.target.value)}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">
                      <Select
                        value={productData.shippingHeightUnit || 'in'}
                        onChange={(e) => onFieldChange('shippingHeightUnit', e.target.value)}
                        variant="standard"
                        size="small"
                      >
                        <MenuItem value="in">in</MenuItem>
                        <MenuItem value="cm">cm</MenuItem>
                      </Select>
                    </InputAdornment>
                  }}
                />
              </Stack>

              <StableTextField
                fullWidth
                label="Shipping Weight"
                type="number"
                value={productData.shippingWeight || ''}
                onChange={(e: any) => onFieldChange('shippingWeight', e.target.value)}
                InputProps={{
                  endAdornment: <InputAdornment position="end">
                    <Select
                      value={productData.shippingWeightUnit || 'lb'}
                      onChange={(e) => onFieldChange('shippingWeightUnit', e.target.value)}
                      variant="standard"
                      size="small"
                    >
                      <MenuItem value="lb">lb</MenuItem>
                      <MenuItem value="kg">kg</MenuItem>
                      <MenuItem value="g">g</MenuItem>
                      <MenuItem value="oz">oz</MenuItem>
                    </Select>
                  </InputAdornment>
                }}
              />
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* Energy & Sustainability Group */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EcoIcon color="primary" />
              <Typography variant="h6">Energy & Sustainability</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={3}>
              {/* Energy Efficiency */}
              <Typography variant="subtitle2" color="text.secondary">
                Energy Efficiency Ratings
              </Typography>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <FormControl fullWidth>
                  <InputLabel>Energy Efficiency Class</InputLabel>
                  <Select
                    value={productData.energyEfficiencyClass || ''}
                    onChange={(e) => onFieldChange('energyEfficiencyClass', e.target.value)}
                    label="Energy Efficiency Class"
                  >
                    <MenuItem value="">Not Applicable</MenuItem>
                    <MenuItem value="A+++">A+++</MenuItem>
                    <MenuItem value="A++">A++</MenuItem>
                    <MenuItem value="A+">A+</MenuItem>
                    <MenuItem value="A">A</MenuItem>
                    <MenuItem value="B">B</MenuItem>
                    <MenuItem value="C">C</MenuItem>
                    <MenuItem value="D">D</MenuItem>
                    <MenuItem value="E">E</MenuItem>
                    <MenuItem value="F">F</MenuItem>
                    <MenuItem value="G">G</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Min Energy Efficiency</InputLabel>
                  <Select
                    value={productData.minEnergyEfficiencyClass || ''}
                    onChange={(e) => onFieldChange('minEnergyEfficiencyClass', e.target.value)}
                    label="Min Energy Efficiency"
                  >
                    <MenuItem value="">Not Applicable</MenuItem>
                    <MenuItem value="A+++">A+++</MenuItem>
                    <MenuItem value="A++">A++</MenuItem>
                    <MenuItem value="A+">A+</MenuItem>
                    <MenuItem value="A">A</MenuItem>
                    <MenuItem value="B">B</MenuItem>
                    <MenuItem value="C">C</MenuItem>
                    <MenuItem value="D">D</MenuItem>
                    <MenuItem value="E">E</MenuItem>
                    <MenuItem value="F">F</MenuItem>
                    <MenuItem value="G">G</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Max Energy Efficiency</InputLabel>
                  <Select
                    value={productData.maxEnergyEfficiencyClass || ''}
                    onChange={(e) => onFieldChange('maxEnergyEfficiencyClass', e.target.value)}
                    label="Max Energy Efficiency"
                  >
                    <MenuItem value="">Not Applicable</MenuItem>
                    <MenuItem value="A+++">A+++</MenuItem>
                    <MenuItem value="A++">A++</MenuItem>
                    <MenuItem value="A+">A+</MenuItem>
                    <MenuItem value="A">A</MenuItem>
                    <MenuItem value="B">B</MenuItem>
                    <MenuItem value="C">C</MenuItem>
                    <MenuItem value="D">D</MenuItem>
                    <MenuItem value="E">E</MenuItem>
                    <MenuItem value="F">F</MenuItem>
                    <MenuItem value="G">G</MenuItem>
                  </Select>
                </FormControl>
              </Stack>

              <Divider />

              {/* Sustainability Attributes */}
              <Typography variant="subtitle2" color="text.secondary">
                Sustainability Attributes
              </Typography>
              <StableTextField
                fullWidth
                multiline
                rows={2}
                label="Sustainability Features"
                value={productData.sustainabilityFeatures?.join('\n') || ''}
                onChange={(e: any) => onFieldChange('sustainabilityFeatures', e.target.value.split('\n').filter((f: string) => f.trim()))}
                helperText="Environmental benefits or certifications (one per line)"
              />

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <StableTextField
                  fullWidth
                  label="Recycled Content (%)"
                  type="number"
                  value={productData.recycledContentPercentage || ''}
                  onChange={(e: any) => onFieldChange('recycledContentPercentage', e.target.value)}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>
                  }}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={productData.isRecyclable === true}
                      onChange={(e) => onFieldChange('isRecyclable', e.target.checked)}
                    />
                  }
                  label="Recyclable Product"
                />
              </Stack>
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* Advanced Shipping Group */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocalShippingIcon color="primary" />
              <Typography variant="h6">Advanced Shipping</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={3}>
              <StableTextField
                fullWidth
                label="Shipping Label"
                value={productData.shippingLabel || ''}
                onChange={(e: any) => onFieldChange('shippingLabel', e.target.value)}
                helperText="Special shipping requirements or restrictions"
              />

              {/* Tax Information */}
              <Typography variant="subtitle2" color="text.secondary">
                Tax Information
              </Typography>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <StableTextField
                  fullWidth
                  label="Tax Category"
                  value={productData.taxCategory || ''}
                  onChange={(e: any) => onFieldChange('taxCategory', e.target.value)}
                  helperText="Product tax classification"
                />
                <StableTextField
                  fullWidth
                  label="VAT ID"
                  value={productData.vatId || ''}
                  onChange={(e: any) => onFieldChange('vatId', e.target.value)}
                  helperText="VAT identification number"
                />
              </Stack>

              {/* Shipping Restrictions */}
              <Typography variant="subtitle2" color="text.secondary">
                Shipping Restrictions
              </Typography>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={productData.freeShipping === true}
                      onChange={(e) => onFieldChange('freeShipping', e.target.checked)}
                    />
                  }
                  label="Free Shipping Eligible"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={productData.shippingRestricted === true}
                      onChange={(e) => onFieldChange('shippingRestricted', e.target.checked)}
                    />
                  }
                  label="Shipping Restricted"
                />
              </Stack>

              <StableTextField
                fullWidth
                multiline
                rows={2}
                label="Shipping Restrictions"
                value={productData.shippingRestrictions || ''}
                onChange={(e: any) => onFieldChange('shippingRestrictions', e.target.value)}
                helperText="Countries or regions where shipping is restricted"
              />
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* Product Certifications Group */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <VerifiedIcon color="primary" />
              <Typography variant="h6">Product Certifications</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={3}>
              <StableTextField
                fullWidth
                multiline
                rows={2}
                label="Certifications"
                value={productData.certifications?.join('\n') || ''}
                onChange={(e: any) => onFieldChange('certifications', e.target.value.split('\n').filter((c: string) => c.trim()))}
                helperText="Product certifications (CE, FCC, UL, etc.) - one per line"
              />

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <StableTextField
                  fullWidth
                  label="Safety Warning"
                  value={productData.safetyWarning || ''}
                  onChange={(e: any) => onFieldChange('safetyWarning', e.target.value)}
                  helperText="Required safety warnings"
                />
                <StableTextField
                  fullWidth
                  label="Compliance Standards"
                  value={productData.complianceStandards || ''}
                  onChange={(e: any) => onFieldChange('complianceStandards', e.target.value)}
                  helperText="Industry compliance standards"
                />
              </Stack>

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={productData.organicCertified === true}
                      onChange={(e) => onFieldChange('organicCertified', e.target.checked)}
                    />
                  }
                  label="Organic Certified"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={productData.fairTradeCertified === true}
                      onChange={(e) => onFieldChange('fairTradeCertified', e.target.checked)}
                    />
                  }
                  label="Fair Trade Certified"
                />
              </Stack>
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* International Trade Group */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PublicIcon color="primary" />
              <Typography variant="h6">International Trade</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={3}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <StableTextField
                  fullWidth
                  label="Country of Origin"
                  value={productData.countryOfOrigin || ''}
                  onChange={(e: any) => onFieldChange('countryOfOrigin', e.target.value)}
                  helperText="Manufacturing country (ISO 3166-1 alpha-2)"
                />
                <StableTextField
                  fullWidth
                  label="HS Code"
                  value={productData.hsCode || ''}
                  onChange={(e: any) => onFieldChange('hsCode', e.target.value)}
                  helperText="Harmonized System tariff code"
                />
              </Stack>

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <StableTextField
                  fullWidth
                  label="Import/Export Classification"
                  value={productData.importExportClassification || ''}
                  onChange={(e: any) => onFieldChange('importExportClassification', e.target.value)}
                  helperText="Trade classification code"
                />
                <StableTextField
                  fullWidth
                  label="Customs Value"
                  type="number"
                  value={productData.customsValue || ''}
                  onChange={(e: any) => onFieldChange('customsValue', e.target.value)}
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>
                  }}
                  helperText="Declared customs value"
                />
              </Stack>

              <StableTextField
                fullWidth
                multiline
                rows={2}
                label="Export Restrictions"
                value={productData.exportRestrictions || ''}
                onChange={(e: any) => onFieldChange('exportRestrictions', e.target.value)}
                helperText="Countries or regions where export is restricted"
              />
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* Categories Group */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CategoryIcon color="primary" />
              <Typography variant="h6">Categories & Classification</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={3}>
              <StableTextField
                fullWidth
                label="Google Product Category"
                value={productData.googleProductCategory || ''}
                onChange={(e: any) => onFieldChange('googleProductCategory', e.target.value)}
                helperText="Google's product taxonomy ID"
              />

              <StableTextField
                fullWidth
                multiline
                rows={3}
                label="Product Types"
                value={productData.productTypes?.join('\n') || ''}
                onChange={(e: any) => onFieldChange('productTypes', e.target.value.split('\n').filter((type: string) => type.trim()))}
                helperText="Custom product categories (one per line)"
              />
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* SEO & Marketing Group */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SEOIcon color="primary" />
              <Typography variant="h6">SEO & Marketing</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={3}>
              <StableTextField
                fullWidth
                label="Product Link"
                value={productData.link || ''}
                onChange={(e: any) => onFieldChange('link', e.target.value)}
                helperText="Direct link to product page"
                type="url"
              />

              <StableTextField
                fullWidth
                label="Mobile Link"
                value={productData.mobileLink || ''}
                onChange={(e: any) => onFieldChange('mobileLink', e.target.value)}
                helperText="Mobile-optimized product page link"
                type="url"
              />

              <StableTextField
                fullWidth
                label="Product Highlights"
                value={productData.productHighlights?.join('\n') || ''}
                onChange={(e: any) => onFieldChange('productHighlights', e.target.value.split('\n').filter((h: string) => h.trim()))}
                helperText="Key selling points (one per line, max 10)"
                multiline
                rows={3}
              />

              {/* Promotion Integration */}
              <Typography variant="subtitle2" color="text.secondary">
                Promotion Integration
              </Typography>
              <StableTextField
                fullWidth
                multiline
                rows={2}
                label="Promotion IDs"
                value={productData.promotionIds?.join('\n') || ''}
                onChange={(e: any) => onFieldChange('promotionIds', e.target.value.split('\n').filter((id: string) => id.trim()))}
                helperText="Associated Google Ads promotion IDs (one per line)"
              />

              <StableTextField
                fullWidth
                label="Loyalty Program"
                value={productData.loyaltyProgram || ''}
                onChange={(e: any) => onFieldChange('loyaltyProgram', e.target.value)}
                helperText="Loyalty program information"
              />

              <Divider />
              <Typography variant="subtitle2" color="text.secondary">
                Custom Labels (for campaign grouping)
              </Typography>

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                {[0, 1, 2, 3, 4].map((index) => (
                  <StableTextField
                    key={`customLabel${index}`}
                    fullWidth
                    label={`Custom Label ${index}`}
                    value={productData[`customLabel${index}`] || ''}
                    onChange={(e: any) => onFieldChange(`customLabel${index}`, e.target.value)}
                    helperText={`Label ${index} for campaigns`}
                  />
                ))}
              </Stack>
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* Advanced Features Group */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AnalyticsIcon color="primary" />
              <Typography variant="h6">Advanced Features</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={3}>
              <StableTextField
                fullWidth
                label="External Seller ID"
                value={productData.externalSellerId || ''}
                onChange={(e: any) => onFieldChange('externalSellerId', e.target.value)}
                helperText="For multi-seller marketplace accounts"
              />

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <StableTextField
                  fullWidth
                  label="Display Ads ID"
                  value={productData.displayAdsId || ''}
                  onChange={(e: any) => onFieldChange('displayAdsId', e.target.value)}
                  helperText="ID for dynamic remarketing"
                />
                <StableTextField
                  fullWidth
                  label="Ads Grouping"
                  value={productData.adsGrouping || ''}
                  onChange={(e: any) => onFieldChange('adsGrouping', e.target.value)}
                  helperText="Group items for ads (CPA% only)"
                />
              </Stack>

              <FormControlLabel
                control={
                  <Switch
                    checked={productData.pause === 'true'}
                    onChange={(e) => onFieldChange('pause', e.target.checked ? 'true' : 'false')}
                  />
                }
                label="Pause product publication temporarily"
              />

              <Divider />

              {/* Marketplace Integration */}
              <Typography variant="subtitle2" color="text.secondary">
                Marketplace Integration
              </Typography>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={productData.identifierExists !== false}
                      onChange={(e) => onFieldChange('identifierExists', e.target.checked)}
                    />
                  }
                  label="Product has unique identifiers"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={productData.multipack === true}
                      onChange={(e) => onFieldChange('multipack', e.target.checked)}
                    />
                  }
                  label="Multipack Item"
                />
              </Stack>

              <StableTextField
                fullWidth
                label="Bundle"
                value={productData.bundle || ''}
                onChange={(e: any) => onFieldChange('bundle', e.target.value)}
                helperText="Bundle description if product is part of a bundle"
              />
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* Competitive Pricing Group */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AnalyticsIcon color="primary" />
              <Typography variant="h6">Competitive Pricing</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={3}>
              <Typography variant="body2" color="text.secondary">
                Analyze competitor pricing for this product across different retailers and regions.
              </Typography>

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <FormControl fullWidth>
                  <InputLabel>Country</InputLabel>
                  <Select
                    value={competitivePricingCountry}
                    onChange={(e) => setCompetitivePricingCountry(e.target.value)}
                    label="Country"
                  >
                    {countryOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Currency</InputLabel>
                  <Select
                    value={competitivePricingCurrency}
                    onChange={(e) => setCompetitivePricingCurrency(e.target.value)}
                    label="Currency"
                  >
                    {currencyOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Product: <strong>{productData.title || 'Not specified'}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Brand: <strong>{productData.brand || 'Not specified'}</strong>
                </Typography>
              </Box>

              <Button
                variant="contained"
                onClick={analyzeCompetition}
                disabled={competitivePricingLoading || !productData.title || !productData.brand}
                startIcon={competitivePricingLoading ? <CircularProgress size={20} /> : <AnalyticsIcon />}
                sx={{ alignSelf: 'flex-start' }}
              >
                {competitivePricingLoading ? 'Analyzing Competition...' : 'Analyze Competition'}
              </Button>

              {competitivePricingError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {competitivePricingError}
                </Alert>
              )}

              {competitivePricingData.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Competitive Pricing Results
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Retailer</strong></TableCell>
                          <TableCell><strong>Price</strong></TableCell>
                          <TableCell><strong>Website</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {competitivePricingData.map((row, index) => (
                          <TableRow key={index}>
                            <TableCell>{row['Retailer']}</TableCell>
                            <TableCell>
                              <Chip 
                                label={row[`Price (in ${competitivePricingCurrency})`]} 
                                color="primary" 
                                variant="outlined" 
                              />
                            </TableCell>
                            <TableCell>
                              <Link
                                href={row['Resolved URL'] || row['Grounded URL']}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                              >
                                Visit Store
                                <ExternalLinkIcon fontSize="small" />
                              </Link>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Analysis Summary
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Found {competitivePricingData.length} pricing data points for <strong>{productData.title}</strong> in {competitivePricingCountry}.
                      Use this data to optimize your pricing strategy and stay competitive in the market.
                    </Typography>
                  </Box>
                </Box>
              )}
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* Custom Fields Group */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SettingsIcon color="primary" />
              <Typography variant="h6">Custom Fields</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <CustomFieldManager
              productData={{ ...productData, customFields: customFieldValues }}
              customFields={customFields}
              onCustomFieldChange={handleCustomFieldChange}
              onAddCustomField={handleAddCustomField}
              onEditCustomField={handleEditCustomField}
              onRemoveCustomField={handleRemoveCustomField}
            />
          </AccordionDetails>
        </Accordion>
      </Stack>
      
      {/* Custom Field Builder Dialog */}
      <CustomFieldBuilder
        open={customFieldBuilderOpen}
        onClose={() => setCustomFieldBuilderOpen(false)}
        onSave={handleSaveCustomField}
        existingField={editingCustomField}
      />
    </Box>
  );
}

export default memo(ProductFieldGroups);