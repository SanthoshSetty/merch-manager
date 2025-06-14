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
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  OpenInNew as ExternalLinkIcon,
  AutoAwesome as AIIcon,
  Psychology as BrainIcon,
  AutoAwesome,
  OpenInNew,
} from '@mui/icons-material';
import CustomFieldBuilder, { type CustomField } from './CustomFieldBuilder';
import CustomFieldManager from './CustomFieldManager';
import { useCustomFields } from '../hooks/useCustomFields';

// AI-Enhanced Components (inline for now to avoid export issues)
const AIEnhancedSelect = memo(({
  fieldName,
  fieldInstructions,
  productData,
  onFieldChange,
  aiGenerating,
  setAiGenerating,
  country = 'Singapore',
  children,
  ...selectProps
}: any) => {
  const [showRefinement, setShowRefinement] = useState(false);
  const [customInstructions, setCustomInstructions] = useState('');
  const [lastGeneratedContent, setLastGeneratedContent] = useState('');
  const [groundedSources, setGroundedSources] = useState<any[]>([]);

  const generateContent = async (useCustomInstructions = false) => {
    if (!productData.title || !productData.brand) {
      alert('Please fill in product title and brand first');
      return;
    }

    setAiGenerating(fieldName, true);
    
    try {
      const requestBody: any = {
        productName: productData.title,
        brand: productData.brand,
        country: country,
        fieldName,
        fieldInstructions,
        productContext: productData
      };

      if (useCustomInstructions && customInstructions.trim()) {
        requestBody.customInstructions = customInstructions.trim();
      }

      const response = await fetch('/api/ai-content/generate-field', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setLastGeneratedContent(result.content);
        setGroundedSources(result.grounded_sources || []);
        
        if (useCustomInstructions) {
          onFieldChange(fieldName, result.content);
          setShowRefinement(false);
        } else {
          setShowRefinement(true);
        }
      } else {
        throw new Error(result.error || 'Failed to generate content');
      }
    } catch (error: any) {
      console.error('AI generation error:', error);
      alert(`Failed to generate content: ${error.message}`);
    } finally {
      setAiGenerating(fieldName, false);
    }
  };

  const acceptGeneration = () => {
    onFieldChange(fieldName, lastGeneratedContent);
    setShowRefinement(false);
  };

  const isGenerating = aiGenerating[fieldName];

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
        <FormControl {...selectProps} sx={{ flex: 1 }}>
          <InputLabel>{selectProps.label}</InputLabel>
          <Select {...selectProps}>
            {children}
          </Select>
        </FormControl>
        
        <Tooltip title={`Generate ${fieldName} with AI`}>
          <IconButton
            onClick={() => generateContent()}
            disabled={isGenerating}
            sx={{ 
              color: 'primary.main',
              '&:hover': { 
                backgroundColor: 'primary.light',
                color: 'white'
              }
            }}
          >
            {isGenerating ? (
              <CircularProgress size={20} />
            ) : (
              <AutoAwesome />
            )}
          </IconButton>
        </Tooltip>
      </Box>

      <Dialog 
        open={showRefinement} 
        onClose={() => setShowRefinement(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AutoAwesome color="primary" />
          AI Generated {fieldName}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3}>
            <Alert severity="info">
              <Typography variant="body2">
                <strong>Generated Content:</strong>
              </Typography>
              <Typography variant="h6" sx={{ mt: 1 }}>
                {lastGeneratedContent}
              </Typography>
            </Alert>

            {groundedSources.length > 0 && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Sources:
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {groundedSources.map((source, index) => (
                    <Chip
                      key={index}
                      label={source.title || `Source ${index + 1}`}
                      component={Link}
                      href={source.uri}
                      target="_blank"
                      clickable
                      icon={<OpenInNew />}
                      variant="outlined"
                      size="small"
                    />
                  ))}
                </Stack>
              </Box>
            )}

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Refine with custom instructions:
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                placeholder="Add specific instructions to refine the generated content..."
                variant="outlined"
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowRefinement(false)}>
            Cancel
          </Button>
          <Button 
            onClick={() => generateContent(true)}
            disabled={!customInstructions.trim() || isGenerating}
            variant="outlined"
          >
            {isGenerating ? <CircularProgress size={20} /> : 'Refine'}
          </Button>
          <Button 
            onClick={acceptGeneration}
            variant="contained"
          >
            Accept
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
});

const AIEnhancedSwitch = memo(({
  fieldName,
  fieldInstructions,
  productData,
  onFieldChange,
  aiGenerating,
  setAiGenerating,
  country = 'Singapore',
  ...switchProps
}: any) => {
  const [showRefinement, setShowRefinement] = useState(false);
  const [customInstructions, setCustomInstructions] = useState('');
  const [lastGeneratedContent, setLastGeneratedContent] = useState('');
  const [predictedValue, setPredictedValue] = useState<boolean | null>(null);
  const [groundedSources, setGroundedSources] = useState<any[]>([]);

  const generateContent = async (useCustomInstructions = false) => {
    if (!productData.title || !productData.brand) {
      alert('Please fill in product title and brand first');
      return;
    }

    setAiGenerating(fieldName, true);
    
    try {
      const requestBody: any = {
        productName: productData.title,
        brand: productData.brand,
        country: country,
        fieldName,
        fieldInstructions,
        productContext: productData
      };

      if (useCustomInstructions && customInstructions.trim()) {
        requestBody.customInstructions = customInstructions.trim();
      }

      const response = await fetch('/api/ai-content/generate-field', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setLastGeneratedContent(result.content);
        setGroundedSources(result.grounded_sources || []);
        
        // Convert AI response to boolean
        const booleanValue = convertToBooleanValue(result.content);
        setPredictedValue(booleanValue);
        
        if (useCustomInstructions) {
          onFieldChange(fieldName, booleanValue);
          setShowRefinement(false);
        } else {
          setShowRefinement(true);
        }
      } else {
        throw new Error(result.error || 'Failed to generate content');
      }
    } catch (error: any) {
      console.error('AI generation error:', error);
      alert(`Failed to generate content: ${error.message}`);
    } finally {
      setAiGenerating(fieldName, false);
    }
  };

  const convertToBooleanValue = (content: string): boolean => {
    const lowerContent = content.toLowerCase().trim();
    const positiveWords = ['true', 'yes', 'on', 'enabled', 'active', 'available', 'recommended'];
    const negativeWords = ['false', 'no', 'off', 'disabled', 'inactive', 'unavailable', 'not recommended'];
    
    for (const word of positiveWords) {
      if (lowerContent.includes(word)) return true;
    }
    
    for (const word of negativeWords) {
      if (lowerContent.includes(word)) return false;
    }
    
    return true; // Default to true if unclear
  };

  const acceptGeneration = () => {
    onFieldChange(fieldName, predictedValue);
    setShowRefinement(false);
  };

  const isGenerating = aiGenerating[fieldName];

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <FormControlLabel {...switchProps} />
        
        <Tooltip title={`Generate ${fieldName} with AI`}>
          <IconButton
            onClick={() => generateContent()}
            disabled={isGenerating}
            size="small"
            sx={{ 
              color: 'primary.main',
              '&:hover': { 
                backgroundColor: 'primary.light',
                color: 'white'
              }
            }}
          >
            {isGenerating ? (
              <CircularProgress size={16} />
            ) : (
              <AutoAwesome fontSize="small" />
            )}
          </IconButton>
        </Tooltip>
      </Box>

      <Dialog 
        open={showRefinement} 
        onClose={() => setShowRefinement(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AutoAwesome color="primary" />
          AI Generated {fieldName}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3}>
            <Alert severity="info">
              <Typography variant="body2">
                <strong>AI Analysis:</strong>
              </Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                {lastGeneratedContent}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold' }}>
                Predicted Setting: {predictedValue ? 'ON' : 'OFF'}
              </Typography>
            </Alert>

            {groundedSources.length > 0 && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Sources:
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {groundedSources.map((source, index) => (
                    <Chip
                      key={index}
                      label={source.title || `Source ${index + 1}`}
                      component={Link}
                      href={source.uri}
                      target="_blank"
                      clickable
                      icon={<OpenInNew />}
                      variant="outlined"
                      size="small"
                    />
                  ))}
                </Stack>
              </Box>
            )}

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Refine with custom instructions:
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                placeholder="Add specific instructions to refine the AI analysis..."
                variant="outlined"
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowRefinement(false)}>
            Cancel
          </Button>
          <Button 
            onClick={() => generateContent(true)}
            disabled={!customInstructions.trim() || isGenerating}
            variant="outlined"
          >
            {isGenerating ? <CircularProgress size={20} /> : 'Refine'}
          </Button>
          <Button 
            onClick={acceptGeneration}
            variant="contained"
          >
            Accept
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
});

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

// AI-Enhanced TextField component with custom instructions support
const AIEnhancedTextField = memo(({ 
  fieldName, 
  fieldInstructions,
  productData,
  onFieldChange,
  aiGenerating,
  setAiGenerating,
  country = 'Singapore',
  ...textFieldProps 
}: any) => {
  const [showRefinement, setShowRefinement] = useState(false);
  const [customInstructions, setCustomInstructions] = useState('');
  const [lastGeneratedContent, setLastGeneratedContent] = useState('');
  const [groundedSources, setGroundedSources] = useState<any[]>([]);
  const [hasGenerated, setHasGenerated] = useState(false);

  const generateContent = async (useCustomInstructions = false) => {
    if (!productData.title || !productData.brand) {
      alert('Please fill in product title and brand first');
      return;
    }

    setAiGenerating(fieldName, true);
    
    try {
      const requestBody: any = {
        productName: productData.title,
        brand: productData.brand,
        country: country,
        fieldName,
        fieldInstructions,
        productContext: productData
      };

      if (useCustomInstructions && customInstructions.trim()) {
        requestBody.customInstructions = customInstructions.trim();
      }

      console.log('🤖 AI Content Request:', { 
        fieldName, 
        country, 
        hasCustomInstructions: !!requestBody.customInstructions 
      });

      const response = await fetch('/api/ai-content/generate-field', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('🤖 AI Content Response:', { 
        success: result.success, 
        contentLength: result.content?.length, 
        sourcesCount: result.grounded_sources?.length || 0,
        sources: result.grounded_sources 
      });
      
      if (result.success) {
        setLastGeneratedContent(result.content);
        setGroundedSources(result.grounded_sources || []);
        setHasGenerated(true);
        
        if (useCustomInstructions) {
          // Apply directly when using custom instructions
          onFieldChange(fieldName, result.content);
          setShowRefinement(false);
        } else {
          // Show refinement option for first generation
          setShowRefinement(true);
        }
      } else {
        throw new Error(result.error || 'Failed to generate content');
      }
    } catch (error: any) {
      console.error('AI generation error:', error);
      alert(`Failed to generate content: ${error.message}`);
    } finally {
      setAiGenerating(fieldName, false);
    }
  };

  const acceptGeneration = () => {
    onFieldChange(fieldName, lastGeneratedContent);
    setShowRefinement(false);
  };

  const refineWithCustomInstructions = () => {
    // Keep refinement open but focus on custom instructions
    setCustomInstructions('');
  };

  return (
    <Box>
      <StableTextField
        {...textFieldProps}
        InputProps={{
          ...textFieldProps.InputProps,
          endAdornment: (
            <InputAdornment position="end">
              <Button
                size="small"
                onClick={() => generateContent(false)}
                disabled={aiGenerating[fieldName] || !productData.title || !productData.brand}
                startIcon={aiGenerating[fieldName] ? <CircularProgress size={16} /> : <AIIcon />}
                sx={{ minWidth: 'auto', px: 1 }}
              >
                {aiGenerating[fieldName] ? 'AI...' : 'AI'}
              </Button>
            </InputAdornment>
          ),
        }}
      />

      {/* Refinement Dialog */}
      {showRefinement && lastGeneratedContent && (
        <Box sx={{ mt: 2, p: 2, border: '1px solid', borderColor: 'primary.main', borderRadius: 1, bgcolor: 'primary.50' }}>
          <Typography variant="subtitle2" gutterBottom color="primary">
            <BrainIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
            AI Generated Content
          </Typography>
          
          <Box sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {lastGeneratedContent}
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <Button
              variant="contained"
              size="small"
              onClick={acceptGeneration}
            >
              ✓ Accept
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={refineWithCustomInstructions}
            >
              ✏️ Refine
            </Button>
            <Button
              variant="text"
              size="small"
              onClick={() => setShowRefinement(false)}
            >
              Cancel
            </Button>
          </Stack>

          {/* Custom Instructions */}
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              multiline
              rows={2}
              placeholder="Enter custom instructions to refine the content (e.g., 'Make it more formal', 'Add technical details', 'Shorter', etc.)"
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              size="small"
            />
            <Button
              variant="contained"
              size="small"
              onClick={() => generateContent(true)}
              disabled={!customInstructions.trim() || aiGenerating[fieldName]}
              startIcon={aiGenerating[fieldName] ? <CircularProgress size={16} /> : <BrainIcon />}
              sx={{ mt: 1 }}
            >
              {aiGenerating[fieldName] ? 'Refining...' : 'Generate with Instructions'}
            </Button>
          </Box>

          {/* Grounded Sources */}
          {groundedSources && groundedSources.length > 0 && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <PublicIcon sx={{ fontSize: 14 }} />
                Sources referenced ({groundedSources.length}):
              </Typography>
              <Stack spacing={0.5} sx={{ maxHeight: 200, overflowY: 'auto' }}>
                {groundedSources.map((source, index) => (
                  <Link
                    key={index}
                    href={source.url && source.url !== 'N/A' ? source.url : undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 0.5, 
                      fontSize: '0.75rem',
                      color: source.url && source.url !== 'N/A' ? 'primary.main' : 'text.secondary',
                      textDecoration: 'none',
                      cursor: source.url && source.url !== 'N/A' ? 'pointer' : 'default',
                      '&:hover': { 
                        textDecoration: source.url && source.url !== 'N/A' ? 'underline' : 'none',
                        color: source.url && source.url !== 'N/A' ? 'primary.dark' : 'text.secondary'
                      }
                    }}
                  >
                    <ExternalLinkIcon sx={{ fontSize: 12 }} />
                    {source.title || 'Web Source'}
                    {source.type === 'search_reference' && (
                      <Chip label="Search" size="small" variant="outlined" sx={{ height: 16, fontSize: '0.65rem' }} />
                    )}
                  </Link>
                ))}
              </Stack>
            </Box>
          )}
          
          {/* Debug info (only in development) */}
          {typeof window !== 'undefined' && window.location.hostname === 'localhost' && (
            <Box sx={{ mt: 1, p: 1, bgcolor: 'warning.50', borderRadius: 1, fontSize: '0.7rem' }}>
              <Typography variant="caption" color="text.secondary">
                Debug: Country={country}, Sources={groundedSources?.length || 0}, HasGenerated={hasGenerated}
              </Typography>
            </Box>
          )}
        </Box>
      )}

      {/* Sources indicator when content is applied */}
      {hasGenerated && !showRefinement && groundedSources && groundedSources.length > 0 && (
        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip 
            icon={<PublicIcon />}
            label={`AI-generated from ${groundedSources.length} source${groundedSources.length !== 1 ? 's' : ''}`}
            size="small"
            variant="outlined"
            color="primary"
            sx={{ fontSize: '0.7rem' }}
          />
          <Typography variant="caption" color="text.secondary">
            (Market: {country})
          </Typography>
        </Box>
      )}
    </Box>
  );
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

  // Global Market/Country state for both AI content and competitive pricing
  const [selectedCountry, setSelectedCountry] = useState('Singapore');

  // Competitive pricing state
  const [competitivePricingCountry, setCompetitivePricingCountry] = useState('Singapore');
  const [competitivePricingCurrency, setCompetitivePricingCurrency] = useState('SGD');
  const [competitivePricingLoading, setCompetitivePricingLoading] = useState(false);
  const [competitivePricingData, setCompetitivePricingData] = useState<any[]>([]);
  const [competitivePricingError, setCompetitivePricingError] = useState<string | null>(null);

  // Sync competitive pricing country with global selection
  const handleCountryChange = (country: string) => {
    setSelectedCountry(country);
    setCompetitivePricingCountry(country);
    setAiMarketCountry(country); // Sync AI market country as well
    
    // Set appropriate currency based on country - Enhanced mapping for all 40+ countries
    const currencyMap: Record<string, string> = {
      // Global
      'Global': 'USD',
      
      // Asia Pacific
      'Singapore': 'SGD',
      'Malaysia': 'MYR', 
      'Thailand': 'THB',
      'Indonesia': 'IDR',
      'Philippines': 'PHP',
      'Vietnam': 'VND',
      'Japan': 'JPY',
      'South Korea': 'KRW',
      'Taiwan': 'TWD',
      'Hong Kong': 'HKD',
      'China': 'CNY',
      'India': 'INR',
      'Australia': 'AUD',
      'New Zealand': 'NZD',
      
      // North America
      'United States': 'USD',
      'Canada': 'CAD',
      'Mexico': 'MXN',
      
      // Europe
      'United Kingdom': 'GBP',
      'Germany': 'EUR',
      'France': 'EUR',
      'Italy': 'EUR',
      'Spain': 'EUR',
      'Netherlands': 'EUR',
      'Belgium': 'EUR',
      'Switzerland': 'CHF',
      'Austria': 'EUR',
      'Sweden': 'SEK',
      'Norway': 'NOK',
      'Denmark': 'DKK',
      'Finland': 'EUR',
      'Poland': 'PLN',
      'Czech Republic': 'CZK',
      
      // Middle East & Africa
      'UAE': 'AED',
      'Saudi Arabia': 'SAR',
      'Israel': 'ILS',
      'South Africa': 'ZAR',
      'Egypt': 'EGP',
      
      // South America
      'Brazil': 'BRL',
      'Argentina': 'ARS',
      'Chile': 'CLP',
      'Colombia': 'COP',
    };
    setCompetitivePricingCurrency(currencyMap[country] || 'USD');
  };

  // AI Content Generation state
  const [aiGenerating, setAiGenerating] = useState<Record<string, boolean>>({});
  const setAiGeneratingField = (fieldName: string, loading: boolean) => {
    setAiGenerating(prev => ({ ...prev, [fieldName]: loading }));
  };
  const [aiGenerationError, setAiGenerationError] = useState<string | null>(null);
  const [comprehensiveAnalysisLoading, setComprehensiveAnalysisLoading] = useState(false);
  const [comprehensiveAnalysisData, setComprehensiveAnalysisData] = useState<any>(null);
  const [aiMarketCountry, setAiMarketCountry] = useState('Singapore');

  // Country and currency options
  const countryOptions = [
    { value: 'Global', label: 'Global Market' },
    
    // Asia Pacific
    { value: 'Singapore', label: 'Singapore' },
    { value: 'Malaysia', label: 'Malaysia' },
    { value: 'Thailand', label: 'Thailand' },
    { value: 'Indonesia', label: 'Indonesia' },
    { value: 'Philippines', label: 'Philippines' },
    { value: 'Vietnam', label: 'Vietnam' },
    { value: 'Japan', label: 'Japan' },
    { value: 'South Korea', label: 'South Korea' },
    { value: 'Taiwan', label: 'Taiwan' },
    { value: 'Hong Kong', label: 'Hong Kong' },
    { value: 'China', label: 'China' },
    { value: 'India', label: 'India' },
    { value: 'Australia', label: 'Australia' },
    { value: 'New Zealand', label: 'New Zealand' },
    
    // North America
    { value: 'United States', label: 'United States' },
    { value: 'Canada', label: 'Canada' },
    { value: 'Mexico', label: 'Mexico' },
    
    // Europe
    { value: 'United Kingdom', label: 'United Kingdom' },
    { value: 'Germany', label: 'Germany' },
    { value: 'France', label: 'France' },
    { value: 'Italy', label: 'Italy' },
    { value: 'Spain', label: 'Spain' },
    { value: 'Netherlands', label: 'Netherlands' },
    { value: 'Belgium', label: 'Belgium' },
    { value: 'Switzerland', label: 'Switzerland' },
    { value: 'Austria', label: 'Austria' },
    { value: 'Sweden', label: 'Sweden' },
    { value: 'Norway', label: 'Norway' },
    { value: 'Denmark', label: 'Denmark' },
    { value: 'Finland', label: 'Finland' },
    { value: 'Poland', label: 'Poland' },
    { value: 'Czech Republic', label: 'Czech Republic' },
    
    // Middle East & Africa
    { value: 'UAE', label: 'United Arab Emirates' },
    { value: 'Saudi Arabia', label: 'Saudi Arabia' },
    { value: 'Israel', label: 'Israel' },
    { value: 'South Africa', label: 'South Africa' },
    { value: 'Egypt', label: 'Egypt' },
    
    // South America
    { value: 'Brazil', label: 'Brazil' },
    { value: 'Argentina', label: 'Argentina' },
    { value: 'Chile', label: 'Chile' },
    { value: 'Colombia', label: 'Colombia' },
  ];

  // Future use: currency options for international expansion
    // const currencyOptions = [
  //   // Asia Pacific
  //   { value: 'SGD', label: 'SGD - Singapore Dollar' },
  //   { value: 'MYR', label: 'MYR - Malaysian Ringgit' },
  //   { value: 'THB', label: 'THB - Thai Baht' },
  //   { value: 'IDR', label: 'IDR - Indonesian Rupiah' },
  //   { value: 'PHP', label: 'PHP - Philippine Peso' },
  //   { value: 'VND', label: 'VND - Vietnamese Dong' },
  //   { value: 'JPY', label: 'JPY - Japanese Yen' },
  //   { value: 'KRW', label: 'KRW - South Korean Won' },
  //   { value: 'TWD', label: 'TWD - Taiwan Dollar' },
  //   { value: 'HKD', label: 'HKD - Hong Kong Dollar' },
  //   { value: 'CNY', label: 'CNY - Chinese Yuan' },
  //   { value: 'INR', label: 'INR - Indian Rupee' },
  //   { value: 'AUD', label: 'AUD - Australian Dollar' },
  //   { value: 'NZD', label: 'NZD - New Zealand Dollar' },
  //   
  //   // North America
  //   { value: 'USD', label: 'USD - US Dollar' },
  //   { value: 'CAD', label: 'CAD - Canadian Dollar' },
  //   { value: 'MXN', label: 'MXN - Mexican Peso' },
  //   
  //   // Europe
  //   { value: 'GBP', label: 'GBP - British Pound' },
  //   { value: 'EUR', label: 'EUR - Euro' },
  //   { value: 'CHF', label: 'CHF - Swiss Franc' },
  //   { value: 'SEK', label: 'SEK - Swedish Krona' },
  //   { value: 'NOK', label: 'NOK - Norwegian Krone' },
  //   { value: 'DKK', label: 'DKK - Danish Krone' },
  //   { value: 'PLN', label: 'PLN - Polish Zloty' },
  //   { value: 'CZK', label: 'CZK - Czech Koruna' },
  //   
  //   // Middle East & Africa
  //   { value: 'AED', label: 'AED - UAE Dirham' },
  //   { value: 'SAR', label: 'SAR - Saudi Riyal' },
  //   { value: 'ILS', label: 'ILS - Israeli Shekel' },
  //   { value: 'ZAR', label: 'ZAR - South African Rand' },
  //   { value: 'EGP', label: 'EGP - Egyptian Pound' },
  //   
  //   // South America
  //   { value: 'BRL', label: 'BRL - Brazilian Real' },
  //   { value: 'ARS', label: 'ARS - Argentine Peso' },
  //   { value: 'CLP', label: 'CLP - Chilean Peso' },
  //   { value: 'COP', label: 'COP - Colombian Peso' },
  // ];

  // Helper function to detect if a retailer is an official website
  const isOfficialWebsite = (retailerName: string, url: string, brand: string) => {
    if (!retailerName || !brand) return false;
    
    const retailerLower = retailerName.toLowerCase();
    const brandLower = brand.toLowerCase();
    const urlLower = url?.toLowerCase() || '';
    
    // Check if retailer name contains "official", "store", or brand name
    const isOfficialByName = (
      retailerLower.includes('official') ||
      retailerLower.includes(`${brandLower} store`) ||
      retailerLower.includes(`${brandLower} official`) ||
      retailerLower === brandLower ||
      retailerLower === `${brandLower} store`
    );
    
    // Check if URL is brand's official domain
    const isOfficialByUrl = (
      urlLower.includes(`${brandLower}.com`) ||
      urlLower.includes(`www.${brandLower}.com`) ||
      urlLower.includes(`${brandLower}.net`) ||
      urlLower.includes(`${brandLower}.org`)
    );
    
    return isOfficialByName || isOfficialByUrl;
  };

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

  // AI Content Generation functions
  const generateComprehensiveAnalysis = async () => {
    if (!productData.title || !productData.brand) {
      setAiGenerationError('Product title and brand are required for comprehensive analysis');
      return;
    }

    setComprehensiveAnalysisLoading(true);
    setAiGenerationError(null);
    
    try {
      const response = await fetch('/api/ai-content/analyze-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productName: productData.title,
          brand: productData.brand,
          country: aiMarketCountry
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        setComprehensiveAnalysisData(result.data);
        
        // Auto-fill multiple fields from comprehensive analysis
        const fieldsToUpdate = [
          'description',
          'category', 
          'googleProductCategory',
          'gtin',
          'mpn',
          'condition',
          'availability',
          'color',
          'material',
          'size',
          'customLabel0',
          'customLabel1',
          'customLabel2',
          'customLabel3',
          'customLabel4'
        ];

        fieldsToUpdate.forEach(field => {
          if (result.data[field] && result.data[field] !== 'N/A') {
            onFieldChange(field, result.data[field]);
          }
        });
        
      } else {
        throw new Error(result.error || 'Failed to analyze product');
      }
    } catch (error: any) {
      console.error('Comprehensive analysis error:', error);
      setAiGenerationError(error.message || 'Failed to analyze product');
    } finally {
      setComprehensiveAnalysisLoading(false);
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
        {/* Market Settings */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PublicIcon color="primary" />
              <Typography variant="h6">Market Settings</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Select your target market to customize AI content generation and competitive pricing for local preferences.
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Target Market</InputLabel>
                <Select
                  value={selectedCountry}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  label="Target Market"
                >
                  {countryOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* AI Content Generation Group */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <BrainIcon color="primary" />
              <Typography variant="h6">AI Content Generation</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={3}>
              <Typography variant="body2" color="text.secondary">
                Use AI to automatically generate product information based on your product name and brand. 
                Choose comprehensive analysis to fill multiple fields at once, or use individual field generation buttons throughout the form.
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Typography variant="body2" color="text.secondary">
                  Product: <strong>{productData.title || 'Not specified'}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Brand: <strong>{productData.brand || 'Not specified'}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Market: <strong>{aiMarketCountry}</strong>
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>AI Market Context</InputLabel>
                  <Select
                    value={aiMarketCountry}
                    onChange={(e) => setAiMarketCountry(e.target.value)}
                    label="AI Market Context"
                    size="small"
                  >
                    {countryOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                  Choose the target market for AI content generation
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  onClick={generateComprehensiveAnalysis}
                  disabled={comprehensiveAnalysisLoading || !productData.title || !productData.brand}
                  startIcon={comprehensiveAnalysisLoading ? <CircularProgress size={20} /> : <BrainIcon />}
                  sx={{ bgcolor: 'secondary.main', '&:hover': { bgcolor: 'secondary.dark' } }}
                >
                  {comprehensiveAnalysisLoading ? 'Analyzing Product...' : 'Generate All Fields with AI'}
                </Button>
                
                {comprehensiveAnalysisData && (
                  <Chip 
                    label="AI Analysis Complete" 
                    color="success" 
                    variant="outlined"
                    icon={<BrainIcon />}
                  />
                )}
              </Box>

              {aiGenerationError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {aiGenerationError}
                </Alert>
              )}

              {comprehensiveAnalysisData && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    AI Analysis Results
                  </Typography>
                  <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Generated Title:</strong> {comprehensiveAnalysisData.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Generated Description:</strong> {comprehensiveAnalysisData.description?.substring(0, 200)}...
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Category:</strong> {comprehensiveAnalysisData.category}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Stack>
          </AccordionDetails>
        </Accordion>

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
              <AIEnhancedTextField
                fullWidth
                label="Product Title"
                value={productData.title || ''}
                onChange={(e: any) => onFieldChange('title', e.target.value)}
                required
                error={!!validateTitle(productData.title)}
                helperText={validateTitle(productData.title) || "Clear, descriptive product title (max 150 characters)"}
                fieldName="title"
                fieldInstructions="Generate a compelling, SEO-optimized product title for e-commerce that includes key features and brand name"
                productData={productData}
                onFieldChange={onFieldChange}
                aiGenerating={aiGenerating}
                setAiGenerating={setAiGeneratingField}
                country={selectedCountry}
              />
              
              <AIEnhancedTextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                value={productData.description || ''}
                onChange={(e: any) => onFieldChange('description', e.target.value)}
                helperText="Detailed product description (max 5000 characters)"
                fieldName="description"
                fieldInstructions="Generate a comprehensive, engaging product description highlighting key features, benefits, and specifications for e-commerce"
                productData={productData}
                onFieldChange={onFieldChange}
                aiGenerating={aiGenerating}
                setAiGenerating={setAiGeneratingField}
                country={selectedCountry}
              />

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <AIEnhancedTextField
                  fullWidth
                  label="Brand"
                  value={productData.brand || ''}
                  onChange={(e: any) => onFieldChange('brand', e.target.value)}
                  required
                  helperText="Product brand name"
                  fieldName="brand"
                  fieldInstructions="Identify and provide the correct brand name for this product"
                  productData={productData}
                  onFieldChange={onFieldChange}
                  aiGenerating={aiGenerating}
                  setAiGenerating={setAiGeneratingField}
                  country={selectedCountry}
                />
                <AIEnhancedSelect
                  fullWidth
                  required
                  label="Condition"
                  value={productData.condition || 'new'}
                  onChange={(e: any) => onFieldChange('condition', e.target.value)}
                  fieldName="condition"
                  fieldInstructions="Determine the appropriate condition for this product based on its description and typical retail status"
                  productData={productData}
                  onFieldChange={onFieldChange}
                  aiGenerating={aiGenerating}
                  setAiGenerating={setAiGenerating}
                  country={aiMarketCountry}
                >
                  <MenuItem value="new">New</MenuItem>
                  <MenuItem value="refurbished">Refurbished</MenuItem>
                  <MenuItem value="used">Used</MenuItem>
                </AIEnhancedSelect>
              </Stack>

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <AIEnhancedTextField
                  fullWidth
                  label="GTIN"
                  value={productData.gtin || ''}
                  onChange={(e: any) => onFieldChange('gtin', e.target.value)}
                  error={!!validateGTIN(productData.gtin)}
                  helperText={validateGTIN(productData.gtin) || "Global Trade Item Number (UPC/EAN)"}
                  fieldName="gtin"
                  fieldInstructions="Identify and provide the correct GTIN/UPC/EAN barcode number for this product"
                  productData={productData}
                  onFieldChange={onFieldChange}
                  aiGenerating={aiGenerating}
                  setAiGenerating={setAiGeneratingField}
                  country={selectedCountry}
                />
                <AIEnhancedTextField
                  fullWidth
                  label="MPN"
                  value={productData.mpn || ''}
                  onChange={(e: any) => onFieldChange('mpn', e.target.value)}
                  helperText="Manufacturer Part Number"
                  fieldName="mpn"
                  fieldInstructions="Identify and provide the correct Manufacturer Part Number (MPN) for this product"
                  productData={productData}
                  onFieldChange={onFieldChange}
                  aiGenerating={aiGenerating}
                  setAiGenerating={setAiGeneratingField}
                  country={selectedCountry}
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
                <AIEnhancedSelect
                  fullWidth
                  label="Availability"
                  value={productData.availability || 'in_stock'}
                  onChange={(e: any) => onFieldChange('availability', e.target.value)}
                  fieldName="availability"
                  fieldInstructions="Determine the current availability status for this product based on inventory and market conditions"
                  productData={productData}
                  onFieldChange={onFieldChange}
                  aiGenerating={aiGenerating}
                  setAiGenerating={setAiGenerating}
                  country={aiMarketCountry}
                >
                  <MenuItem value="in_stock">In Stock</MenuItem>
                  <MenuItem value="out_of_stock">Out of Stock</MenuItem>
                  <MenuItem value="preorder">Preorder</MenuItem>
                  <MenuItem value="backorder">Backorder</MenuItem>
                </AIEnhancedSelect>
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
                <AIEnhancedSelect
                  fullWidth
                  label="Gender"
                  value={productData.gender || ''}
                  onChange={(e: any) => onFieldChange('gender', e.target.value)}
                  fieldName="gender"
                  fieldInstructions="Determine the target gender demographic for this product based on its design, marketing, and typical usage"
                  productData={productData}
                  onFieldChange={onFieldChange}
                  aiGenerating={aiGenerating}
                  setAiGenerating={setAiGenerating}
                  country={aiMarketCountry}
                >
                  <MenuItem value="">Not Specified</MenuItem>
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="unisex">Unisex</MenuItem>
                </AIEnhancedSelect>
                <AIEnhancedSelect
                  fullWidth
                  label="Age Group"
                  value={productData.ageGroup || ''}
                  onChange={(e: any) => onFieldChange('ageGroup', e.target.value)}
                  fieldName="ageGroup"
                  fieldInstructions="Determine the target age group for this product based on its design, safety requirements, and typical usage patterns"
                  productData={productData}
                  onFieldChange={onFieldChange}
                  aiGenerating={aiGenerating}
                  setAiGenerating={setAiGenerating}
                  country={aiMarketCountry}
                >
                  <MenuItem value="">Not Specified</MenuItem>
                  <MenuItem value="newborn">Newborn (0-3 months)</MenuItem>
                  <MenuItem value="infant">Infant (3-12 months)</MenuItem>
                  <MenuItem value="toddler">Toddler (1-5 years)</MenuItem>
                  <MenuItem value="kids">Kids (5-13 years)</MenuItem>
                  <MenuItem value="adult">Adult (13+ years)</MenuItem>
                </AIEnhancedSelect>
              </Stack>

              <AIEnhancedSwitch
                control={
                  <Switch
                    checked={productData.adult === true}
                    onChange={(e: any) => onFieldChange('adult', e.target.checked)}
                  />
                }
                label="Adult content (requires age verification)"
                fieldName="adult"
                fieldInstructions="Determine if this product contains adult content or requires age verification based on its nature, intended use, and regulatory requirements"
                productData={productData}
                onFieldChange={onFieldChange}
                aiGenerating={aiGenerating}
                setAiGenerating={setAiGenerating}
                country={aiMarketCountry}
              />

              <Divider />

              {/* Physical Attributes */}
              <Typography variant="subtitle2" color="text.secondary">
                Physical Attributes
              </Typography>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <AIEnhancedTextField
                  fullWidth
                  label="Color"
                  value={productData.color || ''}
                  onChange={(e: any) => onFieldChange('color', e.target.value)}
                  helperText="Primary color(s)"
                  fieldName="color"
                  fieldInstructions="Identify and provide the primary color or color combination of this product"
                  productData={productData}
                  onFieldChange={onFieldChange}
                  aiGenerating={aiGenerating}
                  setAiGenerating={setAiGeneratingField}
                  country={selectedCountry}
                />
                <AIEnhancedTextField
                  fullWidth
                  label="Material"
                  value={productData.material || ''}
                  onChange={(e: any) => onFieldChange('material', e.target.value)}
                  helperText="Primary material"
                  fieldName="material"
                  fieldInstructions="Identify and provide the primary material or materials used in this product"
                  productData={productData}
                  onFieldChange={onFieldChange}
                  aiGenerating={aiGenerating}
                  setAiGenerating={setAiGeneratingField}
                  country={selectedCountry}
                />
              </Stack>

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <AIEnhancedTextField
                  fullWidth
                  label="Pattern"
                  value={productData.pattern || ''}
                  onChange={(e: any) => onFieldChange('pattern', e.target.value)}
                  helperText="Pattern or design"
                  fieldName="pattern"
                  fieldInstructions="Describe the pattern, design, or visual style of this product"
                  productData={productData}
                  onFieldChange={onFieldChange}
                  aiGenerating={aiGenerating}
                  setAiGenerating={setAiGeneratingField}
                  country={selectedCountry}
                />
                <AIEnhancedTextField
                  fullWidth
                  label="Size"
                  value={productData.size || ''}
                  onChange={(e: any) => onFieldChange('size', e.target.value)}
                  helperText="Product size"
                  fieldName="size"
                  fieldInstructions="Provide the size specification for this product (e.g., Small, Medium, Large, or specific dimensions)"
                  productData={productData}
                  onFieldChange={onFieldChange}
                  aiGenerating={aiGenerating}
                  setAiGenerating={setAiGeneratingField}
                  country={selectedCountry}
                />
              </Stack>

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <AIEnhancedSelect
                  fullWidth
                  label="Size System"
                  value={productData.sizeSystem || ''}
                  onChange={(e: any) => onFieldChange('sizeSystem', e.target.value)}
                  fieldName="sizeSystem"
                  fieldInstructions="Determine the appropriate size system for this product based on its category, target market, and regional preferences"
                  productData={productData}
                  onFieldChange={onFieldChange}
                  aiGenerating={aiGenerating}
                  setAiGenerating={setAiGenerating}
                  country={aiMarketCountry}
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
                </AIEnhancedSelect>
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
                <AIEnhancedSelect
                  fullWidth
                  label="Energy Efficiency Class"
                  value={productData.energyEfficiencyClass || ''}
                  onChange={(e: any) => onFieldChange('energyEfficiencyClass', e.target.value)}
                  fieldName="energyEfficiencyClass"
                  fieldInstructions="Determine the appropriate energy efficiency class for this product based on its power consumption, category, and regulatory standards"
                  productData={productData}
                  onFieldChange={onFieldChange}
                  aiGenerating={aiGenerating}
                  setAiGenerating={setAiGenerating}
                  country={aiMarketCountry}
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
                </AIEnhancedSelect>
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
              <AIEnhancedTextField
                fullWidth
                multiline
                rows={2}
                label="Sustainability Features"
                value={productData.sustainabilityFeatures?.join('\n') || ''}
                onChange={(e: any) => onFieldChange('sustainabilityFeatures', e.target.value.split('\n').filter((f: string) => f.trim()))}
                helperText="Environmental benefits or certifications (one per line)"
                fieldName="sustainabilityFeatures"
                fieldInstructions="Generate a list of environmental benefits, sustainability features, and eco-certifications for this product, one per line"
                productData={productData}
                onFieldChange={onFieldChange}
                aiGenerating={aiGenerating}
                setAiGenerating={setAiGeneratingField}
                country={selectedCountry}
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
                <AIEnhancedSwitch
                  control={
                    <Switch
                      checked={productData.isRecyclable === true}
                      onChange={(e: any) => onFieldChange('isRecyclable', e.target.checked)}
                    />
                  }
                  label="Recyclable Product"
                  fieldName="isRecyclable"
                  fieldInstructions="Determine if this product is recyclable based on its materials, construction, and environmental impact"
                  productData={productData}
                  onFieldChange={onFieldChange}
                  aiGenerating={aiGenerating}
                  setAiGenerating={setAiGenerating}
                  country={aiMarketCountry}
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
              <AIEnhancedTextField
                fullWidth
                multiline
                rows={2}
                label="Certifications"
                value={productData.certifications?.join('\n') || ''}
                onChange={(e: any) => onFieldChange('certifications', e.target.value.split('\n').filter((c: string) => c.trim()))}
                helperText="Product certifications (CE, FCC, UL, etc.) - one per line"
                fieldName="certifications"
                fieldInstructions="Generate a list of relevant product certifications, safety standards, and compliance markings for this product, one per line"
                productData={productData}
                onFieldChange={onFieldChange}
                aiGenerating={aiGenerating}
                setAiGenerating={setAiGeneratingField}
                country={selectedCountry}
              />

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <AIEnhancedTextField
                  fullWidth
                  label="Safety Warning"
                  value={productData.safetyWarning || ''}
                  onChange={(e: any) => onFieldChange('safetyWarning', e.target.value)}
                  helperText="Required safety warnings"
                  fieldName="safetyWarning"
                  fieldInstructions="Generate appropriate safety warnings and precautions for this product"
                  productData={productData}
                  onFieldChange={onFieldChange}
                  aiGenerating={aiGenerating}
                  setAiGenerating={setAiGeneratingField}
                  country={selectedCountry}
                />
                <AIEnhancedTextField
                  fullWidth
                  label="Compliance Standards"
                  value={productData.complianceStandards || ''}
                  onChange={(e: any) => onFieldChange('complianceStandards', e.target.value)}
                  helperText="Industry compliance standards"
                  fieldName="complianceStandards"
                  fieldInstructions="Identify relevant industry compliance standards and regulations for this product"
                  productData={productData}
                  onFieldChange={onFieldChange}
                  aiGenerating={aiGenerating}
                  setAiGenerating={setAiGeneratingField}
                  country={selectedCountry}
                />
              </Stack>

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <AIEnhancedSwitch
                  control={
                    <Switch
                      checked={productData.organicCertified === true}
                      onChange={(e: any) => onFieldChange('organicCertified', e.target.checked)}
                    />
                  }
                  label="Organic Certified"
                  fieldName="organicCertified"
                  fieldInstructions="Determine if this product has organic certification based on its ingredients, materials, and manufacturing process"
                  productData={productData}
                  onFieldChange={onFieldChange}
                  aiGenerating={aiGenerating}
                  setAiGenerating={setAiGenerating}
                  country={aiMarketCountry}
                />
                <AIEnhancedSwitch
                  control={
                    <Switch
                      checked={productData.fairTradeCertified === true}
                      onChange={(e: any) => onFieldChange('fairTradeCertified', e.target.checked)}
                    />
                  }
                  label="Fair Trade Certified"
                  fieldName="fairTradeCertified"
                  fieldInstructions="Determine if this product has fair trade certification based on its sourcing, manufacturing, and supply chain practices"
                  productData={productData}
                  onFieldChange={onFieldChange}
                  aiGenerating={aiGenerating}
                  setAiGenerating={setAiGenerating}
                  country={aiMarketCountry}
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
              <AIEnhancedTextField
                fullWidth
                label="Google Product Category"
                value={productData.googleProductCategory || ''}
                onChange={(e: any) => onFieldChange('googleProductCategory', e.target.value)}
                helperText="Google's product taxonomy ID"
                fieldName="googleProductCategory"
                fieldInstructions="Identify the most appropriate Google Product Category ID for this product based on Google's taxonomy"
                productData={productData}
                onFieldChange={onFieldChange}
                aiGenerating={aiGenerating}
                setAiGenerating={setAiGeneratingField}
                country={selectedCountry}
              />

              <AIEnhancedTextField
                fullWidth
                multiline
                rows={3}
                label="Product Types"
                value={productData.productTypes?.join('\n') || ''}
                onChange={(e: any) => onFieldChange('productTypes', e.target.value.split('\n').filter((type: string) => type.trim()))}
                helperText="Custom product categories (one per line)"
                fieldName="productTypes"
                fieldInstructions="Generate relevant product type categories and subcategories for this product, one per line"
                productData={productData}
                onFieldChange={onFieldChange}
                aiGenerating={aiGenerating}
                setAiGenerating={setAiGeneratingField}
                country={selectedCountry}
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

              <AIEnhancedTextField
                fullWidth
                label="Product Highlights"
                value={productData.productHighlights?.join('\n') || ''}
                onChange={(e: any) => onFieldChange('productHighlights', e.target.value.split('\n').filter((h: string) => h.trim()))}
                helperText="Key selling points (one per line, max 10)"
                multiline
                rows={3}
                fieldName="productHighlights"
                fieldInstructions="Generate compelling bullet-point highlights showcasing the key features and benefits of this product, one per line"
                productData={productData}
                onFieldChange={onFieldChange}
                aiGenerating={aiGenerating}
                setAiGenerating={setAiGeneratingField}
                country={selectedCountry}
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
                <AIEnhancedTextField
                  key="customLabel0"
                  fullWidth
                  label="Custom Label 0"
                  value={productData.customLabel0 || ''}
                  onChange={(e: any) => onFieldChange('customLabel0', e.target.value)}
                  helperText="Label 0 for campaigns"
                  fieldName="customLabel0"
                  fieldInstructions="Generate a primary campaign label highlighting the main category or key feature of this product"
                  productData={productData}
                  onFieldChange={onFieldChange}
                  aiGenerating={aiGenerating}
                  setAiGenerating={setAiGeneratingField}
                  country={selectedCountry}
                />
                <AIEnhancedTextField
                  key="customLabel1"
                  fullWidth
                  label="Custom Label 1"
                  value={productData.customLabel1 || ''}
                  onChange={(e: any) => onFieldChange('customLabel1', e.target.value)}
                  helperText="Label 1 for campaigns"
                  fieldName="customLabel1"
                  fieldInstructions="Generate a secondary campaign label highlighting the target audience or use case for this product"
                  productData={productData}
                  onFieldChange={onFieldChange}
                  aiGenerating={aiGenerating}
                  setAiGenerating={setAiGeneratingField}
                  country={selectedCountry}
                />
                {[2, 3, 4].map((index) => (
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

              <AIEnhancedSwitch
                control={
                  <Switch
                    checked={productData.pause === 'true'}
                    onChange={(e: any) => onFieldChange('pause', e.target.checked ? 'true' : 'false')}
                  />
                }
                label="Pause product publication temporarily"
                fieldName="pause"
                fieldInstructions="Determine if this product should be temporarily paused from publication based on availability, quality issues, or other business factors"
                productData={productData}
                onFieldChange={onFieldChange}
                aiGenerating={aiGenerating}
                setAiGenerating={setAiGenerating}
                country={aiMarketCountry}
              />

              <Divider />

              {/* Marketplace Integration */}
              <Typography variant="subtitle2" color="text.secondary">
                Marketplace Integration
              </Typography>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <AIEnhancedSwitch
                  control={
                    <Switch
                      checked={productData.identifierExists !== false}
                      onChange={(e: any) => onFieldChange('identifierExists', e.target.checked)}
                    />
                  }
                  label="Product has unique identifiers"
                  fieldName="identifierExists"
                  fieldInstructions="Determine if this product has unique identifiers like UPC, EAN, ISBN, or other standardized product codes"
                  productData={productData}
                  onFieldChange={onFieldChange}
                  aiGenerating={aiGenerating}
                  setAiGenerating={setAiGenerating}
                  country={aiMarketCountry}
                />
                <AIEnhancedSwitch
                  control={
                    <Switch
                      checked={productData.multipack === true}
                      onChange={(e: any) => onFieldChange('multipack', e.target.checked)}
                    />
                  }
                  label="Multipack Item"
                  fieldName="multipack"
                  fieldInstructions="Determine if this product is sold as a multipack or bundle containing multiple individual items"
                  productData={productData}
                  onFieldChange={onFieldChange}
                  aiGenerating={aiGenerating}
                  setAiGenerating={setAiGenerating}
                  country={aiMarketCountry}
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

              <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Market Settings
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Target Market: <strong>{selectedCountry}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Currency: <strong>{competitivePricingCurrency}</strong>
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Market settings are configured in the "Market Settings" section above. Changes will automatically apply to competitive pricing analysis.
                </Typography>
              </Box>

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
                          <TableCell><strong>Official Website</strong></TableCell>
                          <TableCell><strong>Price</strong></TableCell>
                          <TableCell><strong>Website</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {competitivePricingData.map((row, index) => {
                          const isOfficial = isOfficialWebsite(
                            row['Retailer'], 
                            row['Resolved URL'] || row['Grounded URL'], 
                            productData.brand || ''
                          );
                          
                          return (
                            <TableRow key={index}>
                              <TableCell>{row['Retailer']}</TableCell>
                              <TableCell>
                                {isOfficial ? (
                                  <Chip 
                                    label="Official" 
                                    color="success" 
                                    size="small"
                                    icon={<VerifiedIcon />}
                                  />
                                ) : (
                                  <Chip 
                                    label="Third-party" 
                                    color="default" 
                                    size="small"
                                    variant="outlined"
                                  />
                                )}
                              </TableCell>
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
                          );
                        })}
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
              aiGenerating={aiGenerating}
              setAiGenerating={setAiGeneratingField}
              country={aiMarketCountry}
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