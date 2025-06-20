import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Link,
  MenuItem,
  Container,
  AppBar,
  Toolbar,
  IconButton
} from '@mui/material';
import {
  Analytics as AnalyticsIcon,
  ArrowBack as ArrowBackIcon,
  OpenInNew as ExternalLinkIcon,
  Verified as VerifiedIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../config/api';
import { classifyOfficialWebsite } from '../utils/officialWebsiteClassifier';

// Country and currency mappings
const countries = [
  'Global',
  'United States',
  'Canada', 
  'United Kingdom',
  'Germany',
  'France',
  'Spain',
  'Italy',
  'Netherlands',
  'Belgium',
  'Sweden',
  'Norway',
  'Denmark',
  'Japan',
  'South Korea',
  'China',
  'Hong Kong',
  'Taiwan',
  'Australia',
  'New Zealand',
  'Singapore',
  'Malaysia',
  'Thailand',
  'Philippines',
  'Indonesia',
  'Vietnam',
  'India',
  'UAE',
  'Saudi Arabia',
  'Israel',
  'Turkey',
  'Russia',
  'Brazil',
  'Mexico',
  'Argentina',
  'Chile',
  'Colombia',
  'South Africa',
  'Nigeria',
  'Kenya',
  'Egypt'
];

const currencyMap: { [key: string]: string } = {
  'Global': '', // No default currency for global searches - user can select any
  'United States': 'USD',
  'Canada': 'CAD',
  'United Kingdom': 'GBP', 
  'Germany': 'EUR',
  'France': 'EUR',
  'Spain': 'EUR',
  'Italy': 'EUR',
  'Netherlands': 'EUR',
  'Belgium': 'EUR',
  'Sweden': 'SEK',
  'Norway': 'NOK',
  'Denmark': 'DKK',
  'Japan': 'JPY',
  'South Korea': 'KRW',
  'China': 'CNY',
  'Hong Kong': 'HKD',
  'Taiwan': 'TWD',
  'Australia': 'AUD',
  'New Zealand': 'NZD',
  'Singapore': 'SGD',
  'Malaysia': 'MYR',
  'Thailand': 'THB',
  'Philippines': 'PHP',
  'Indonesia': 'IDR',
  'Vietnam': 'VND',
  'India': 'INR',
  'UAE': 'AED',
  'Saudi Arabia': 'SAR',
  'Israel': 'ILS',
  'Turkey': 'TRY',
  'Russia': 'RUB',
  'Brazil': 'BRL',
  'Mexico': 'MXN',
  'Argentina': 'ARS',
  'Chile': 'CLP',
  'Colombia': 'COP',
  'South Africa': 'ZAR',
  'Nigeria': 'NGN',
  'Kenya': 'KES',
  'Egypt': 'EGP'
};

// Common currencies for manual selection
const commonCurrencies = [
  'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'SEK', 'NZD',
  'MXN', 'SGD', 'HKD', 'NOK', 'TRY', 'ZAR', 'BRL', 'INR', 'KRW', 'PLN',
  'TWD', 'DKK', 'CZK', 'HUF', 'ILS', 'CLP', 'PHP', 'AED', 'COP', 'SAR',
  'MYR', 'RON', 'THB', 'BGN', 'HRK', 'RUB', 'IDR', 'VND'
];

interface CompetitivePricingData {
  Retailer: string;
  [key: string]: string | undefined; // For dynamic price keys like "Price (in USD)"
  'Grounded URL': string;
  'Resolved URL': string;
  Availability?: string;
}

const CompetitiveAnalysisPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Form state
  const [productName, setProductName] = useState('');
  const [brand, setBrand] = useState('');
  const [modelNumber, setModelNumber] = useState('');
  const [country, setCountry] = useState('Global');
  const [currency, setCurrency] = useState('');
  
  // Analysis state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<CompetitivePricingData[]>([]);

  // Update currency when country changes
  const handleCountryChange = (selectedCountry: string) => {
    setCountry(selectedCountry);
    setCurrency(currencyMap[selectedCountry] || '');
  };

  // Enhanced function to check if a retailer/URL is an official brand website
  const isOfficialWebsite = (retailer: string, url: string, brandName: string): boolean => {
    const result = classifyOfficialWebsite(retailer, url, brandName);
    
    // Log detailed classification for debugging
    console.log('🔍 Official Website Classification:', {
      retailer,
      brand: brandName,
      url,
      isOfficial: result.isOfficial,
      confidence: result.confidence,
      matchType: result.matchType,
      details: result.details
    });
    
    return result.isOfficial;
  };

  // Analyze competition function
  const analyzeCompetition = async () => {
    if (!productName.trim() || !brand.trim()) {
      setError('Product name and brand are required for competitive analysis');
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysisData([]);

    try {
      // Call the backend endpoint for competitive pricing analysis
      const response = await apiClient.post('/api/competitive-pricing/analyze', {
        productName: productName.trim(),
        brand: brand.trim(),
        modelNumber: modelNumber.trim(),
        country,
        currency,
      });

      const result = response.data;
      
      if (result.success && result.data) {
        setAnalysisData(result.data);
      } else {
        throw new Error(result.error || 'Failed to analyze competition');
      }
    } catch (error: any) {
      console.error('Competitive pricing analysis error:', error);
      setError(error.message || 'Failed to analyze competition');
      
      // Fallback sample data for demonstration
      const sampleData = [
        {
          'Retailer': `${brand} Official Store`,
          [`Price (in ${currency})`]: `${currency} 1,299.00`,
          'Grounded URL': `https://www.${brand.toLowerCase()}.com`,
          'Resolved URL': `https://www.${brand.toLowerCase()}.com`,
          'Availability': 'In Stock'
        },
        {
          'Retailer': `Amazon ${country}`,
          [`Price (in ${currency})`]: `${currency} 1,250.00`,
          'Grounded URL': `https://www.amazon.com/search?k=${encodeURIComponent(productName)}`,
          'Resolved URL': `https://www.amazon.com/search?k=${encodeURIComponent(productName)}`,
          'Availability': 'In Stock'
        },
        {
          'Retailer': `Local Retailer ${country}`,
          [`Price (in ${currency})`]: `${currency} 1,275.00`,
          'Grounded URL': `https://example-retailer.com`,
          'Resolved URL': `https://example-retailer.com`,
          'Availability': 'In Stock'
        },
      ];
      setAnalysisData(sampleData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      {/* App Bar */}
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/')}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Competitive Analysis
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
          {/* Input Form */}
          <Box sx={{ flex: { xs: '1', md: '0 0 33%' } }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Product Information
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Enter product details to analyze competitive pricing across retailers.
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="Product Name"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="e.g., iPhone 15 Pro Max"
                    variant="outlined"
                    fullWidth
                    required
                  />

                  <TextField
                    label="Brand"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g., Apple"
                    variant="outlined"
                    fullWidth
                    required
                  />

                  <TextField
                    label="Model Number"
                    value={modelNumber}
                    onChange={(e) => setModelNumber(e.target.value)}
                    placeholder="e.g., A2896, MN-12345"
                    variant="outlined"
                    fullWidth
                    helperText="Optional: Manufacturer model number for more accurate matching"
                  />

                  <TextField
                    select
                    label="Target Country"
                    value={country}
                    onChange={(e) => handleCountryChange(e.target.value)}
                    variant="outlined"
                    fullWidth
                  >
                    {countries.map((countryOption) => (
                      <MenuItem key={countryOption} value={countryOption}>
                        {countryOption}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    select
                    label="Currency"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    variant="outlined"
                    fullWidth
                    helperText="Optional: Currency is automatically set based on country, or select manually. Leave empty for auto-detection."
                  >
                    <MenuItem value="">
                      <em>Auto-detect from region</em>
                    </MenuItem>
                    {commonCurrencies.map((currencyOption) => (
                      <MenuItem key={currencyOption} value={currencyOption}>
                        {currencyOption}
                      </MenuItem>
                    ))}
                  </TextField>

                  <Button
                    variant="contained"
                    size="large"
                    onClick={analyzeCompetition}
                    disabled={loading || !productName.trim() || !brand.trim()}
                    startIcon={loading ? <CircularProgress size={20} /> : <AnalyticsIcon />}
                    sx={{ mt: 2 }}
                  >
                    {loading ? 'Analyzing Competition...' : 'Analyze Competition'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Results */}
          <Box sx={{ flex: 1 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Analysis Results
                </Typography>

                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}

                {!loading && analysisData.length === 0 && !error && (
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    justifyContent: 'center',
                    py: 6,
                    color: 'text.secondary'
                  }}>
                    <AnalyticsIcon sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
                    <Typography variant="h6" gutterBottom>
                      Ready to Analyze Competition
                    </Typography>
                    <Typography variant="body2" textAlign="center">
                      Enter product details and click "Analyze Competition" to get pricing insights from major retailers.
                    </Typography>
                  </Box>
                )}

                {loading && (
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    justifyContent: 'center',
                    py: 6 
                  }}>
                    <CircularProgress size={40} sx={{ mb: 2 }} />
                    <Typography variant="body1">
                      Analyzing competitive pricing...
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      This may take a few moments
                    </Typography>
                  </Box>
                )}

                {analysisData.length > 0 && (
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Found pricing data from {analysisData.length} retailers for <strong>{productName}</strong> by <strong>{brand}</strong>
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
                          {analysisData.map((row, index) => {
                            const isOfficial = isOfficialWebsite(
                              row['Retailer'], 
                              row['Resolved URL'] || row['Grounded URL'], 
                              brand
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
                                    label={row[`Price (in ${currency})`]} 
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
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default CompetitiveAnalysisPage;
