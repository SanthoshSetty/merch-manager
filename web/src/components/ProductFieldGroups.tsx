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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  FormControlLabel,
  Divider,
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
} from '@mui/icons-material';

interface ProductFieldGroupsProps {
  productData: any;
  onFieldChange: (field: string, value: any) => void;
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

function ProductFieldGroups({ productData, onFieldChange }: ProductFieldGroupsProps) {
  
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
                  helperText="Product brand name"
                />
                <FormControl fullWidth>
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
                  helperText={validateGTIN(productData.gtin) || "Global Trade Item Number"}
                />
                <StableTextField
                  fullWidth
                  label="MPN"
                  value={productData.mpn || ''}
                  onChange={(e: any) => onFieldChange('mpn', e.target.value)}
                  helperText="Manufacturer Part Number"
                />
                <StableTextField
                  fullWidth
                  label="Item Group ID"
                  value={productData.itemGroupId || ''}
                  onChange={(e: any) => onFieldChange('itemGroupId', e.target.value)}
                  helperText="Shared ID for product variants"
                />
              </Stack>

              <FormControlLabel
                control={
                  <Switch
                    checked={productData.identifierExists !== false}
                    onChange={(e) => onFieldChange('identifierExists', e.target.checked)}
                  />
                }
                label="Product has unique identifiers (GTIN, MPN, Brand)"
              />
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* Images Group */}
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
                type="url"
                error={!!validateImageLink(productData.imageLink)}
                helperText={validateImageLink(productData.imageLink) || "Primary product image (URL)"}
              />
              
              <StableTextField
                fullWidth
                label="Additional Image URLs"
                value={productData.additionalImageLinks?.join('\n') || ''}
                onChange={(e: any) => onFieldChange('additionalImageLinks', e.target.value.split('\n').filter((url: string) => url.trim()))}
                helperText="One URL per line (max 10 additional images)"
                multiline
                rows={3}
              />

              <StableTextField
                fullWidth
                label="3D Model URL"
                value={productData.virtualModelLink || ''}
                onChange={(e: any) => onFieldChange('virtualModelLink', e.target.value)}
                helperText="URL to 3D model of the product"
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
                  helperText="Available quantity for Google shopping"
                />
              </Stack>

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <StableTextField
                  fullWidth
                  label="Min Handling Time (days)"
                  type="number"
                  value={productData.minHandlingTime || ''}
                  onChange={(e: any) => onFieldChange('minHandlingTime', e.target.value)}
                  helperText="Minimum days to process order"
                />
                <StableTextField
                  fullWidth
                  label="Max Handling Time (days)"
                  type="number"
                  value={productData.maxHandlingTime || ''}
                  onChange={(e: any) => onFieldChange('maxHandlingTime', e.target.value)}
                  helperText="Maximum days to process order"
                />
              </Stack>

              <StableTextField
                fullWidth
                label="Availability Date"
                type="date"
                value={productData.availabilityDate || ''}
                onChange={(e: any) => onFieldChange('availabilityDate', e.target.value)}
                helperText="When pre-ordered product becomes available"
                InputLabelProps={{ shrink: true }}
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
                helperText="Google's category taxonomy ID"
              />

              <StableTextField
                fullWidth
                label="Product Types"
                value={productData.productTypes?.join(' > ') || ''}
                onChange={(e: any) => onFieldChange('productTypes', e.target.value.split(' > ').filter((type: string) => type.trim()))}
                helperText="Your custom product categories (use ' > ' to separate levels)"
              />

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <FormControl fullWidth>
                  <InputLabel>Age Group</InputLabel>
                  <Select
                    value={productData.ageGroup || ''}
                    onChange={(e) => onFieldChange('ageGroup', e.target.value)}
                    label="Age Group"
                  >
                    <MenuItem value="">Not specified</MenuItem>
                    <MenuItem value="newborn">Newborn</MenuItem>
                    <MenuItem value="infant">Infant</MenuItem>
                    <MenuItem value="toddler">Toddler</MenuItem>
                    <MenuItem value="kids">Kids</MenuItem>
                    <MenuItem value="adult">Adult</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Gender</InputLabel>
                  <Select
                    value={productData.gender || ''}
                    onChange={(e) => onFieldChange('gender', e.target.value)}
                    label="Gender"
                  >
                    <MenuItem value="">Not specified</MenuItem>
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                    <MenuItem value="unisex">Unisex</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* SEO Group */}
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
            </Stack>
          </AccordionDetails>
        </Accordion>
      </Stack>
    </Box>
  );
}

export default memo(ProductFieldGroups);