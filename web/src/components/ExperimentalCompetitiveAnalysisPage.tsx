import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Stack,
  Button,
  TextField,
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
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  Store as StoreIcon,
  Launch as LaunchIcon,
  ExpandMore as ExpandMoreIcon,
  Science as ScienceIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as AttachMoneyIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface Retailer {
  retailer: string;
  officialsite: boolean;
  url: string;
  price: string;
}

interface AnalysisResponse {
  success: boolean;
  retailers: Retailer[];
  data: {
    analysis?: string;
    raw_response?: string;
    sources?: any[];
  };
  metadata: {
    endpoint: string;
    timestamp: string;
    version: string;
    model: string;
    total_retailers: number;
  };
}

function ExperimentalCompetitiveAnalysisPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisResponse | null>(null);
  
  // Form state
  const [productName, setProductName] = useState('');
  const [brand, setBrand] = useState('');
  const [modelNumber, setModelNumber] = useState('');
  const [brandWebsiteUrl, setBrandWebsiteUrl] = useState('');
  const [country, setCountry] = useState('Global');

  const handleAnalyze = async () => {
    if (!productName.trim() || !brand.trim()) {
      setError('Product name and brand are required');
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysisData(null);

    try {
      const payload: any = {
        productName: productName.trim(),
        brand: brand.trim(),
        country: country.trim(),
      };
      
      if (modelNumber.trim()) {
        payload.modelNumber = modelNumber.trim();
      }

      if (brandWebsiteUrl.trim()) {
        payload.brandWebsiteUrl = brandWebsiteUrl.trim();
      }

      const response = await fetch('https://merch-manager-backend-361151780407.us-central1.run.app/api/experimental-competitive/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        console.log('API Response:', data);
        console.log('Retailers:', data.retailers);
        setAnalysisData(data);
      } else {
        setError(data.error || 'Analysis failed');
      }
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err.message || 'Failed to connect to analysis service');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !loading) {
      handleAnalyze();
    }
  };

  const formatPrice = (price: string) => {
    // Handle various price formats
    if (price.includes('USD') || price.includes('$')) {
      return price;
    } else if (price.includes('EUR') || price.includes('€')) {
      return price;
    } else if (price.includes('INR') || price.includes('₹')) {
      return price;
    } else if (!isNaN(Number(price))) {
      return `$${price}`;
    }
    return price;
  };

  const getRetailerIcon = (_retailer: string, isOfficial: boolean) => {
    if (isOfficial) {
      return <StoreIcon color="primary" fontSize="small" />;
    }
    return <StoreIcon color="action" fontSize="small" />;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <IconButton onClick={() => navigate('/')} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <ScienceIcon color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
            Advanced Competitive Analysis
          </Typography>
          <Chip 
            label="Experimental" 
            color="warning" 
            variant="outlined"
            icon={<ScienceIcon />}
          />
        </Stack>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>🧪 Experimental Feature:</strong> This advanced analysis uses Google Gemini 2.5 Flash Preview 
            to provide comprehensive market research with detailed product information, specifications, and competitive insights.
          </Typography>
        </Alert>
      </Box>

      {/* Analysis Form */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUpIcon color="primary" />
            Product Analysis Configuration
          </Typography>
          
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ mt: 1 }}>
            <Box sx={{ flex: 1 }}>
              <TextField
                fullWidth
                label="Product Name *"
                placeholder="e.g. iPhone 15"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                variant="outlined"
                helperText="Enter the exact product name"
              />
            </Box>
            
            <Box sx={{ flex: 1 }}>
              <TextField
                fullWidth
                label="Brand *"
                placeholder="e.g. Apple"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                variant="outlined"
                helperText="Enter the brand name"
              />
            </Box>
            
            <Box sx={{ flex: 1 }}>
              <TextField
                fullWidth
                label="Model Number (Optional)"
                placeholder="e.g. 128GB, Pro Max"
                value={modelNumber}
                onChange={(e) => setModelNumber(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                variant="outlined"
                helperText="Specific model or variant"
              />
            </Box>
            
            <Box sx={{ flex: 1 }}>
              <TextField
                fullWidth
                label="Brand Website URL (Optional)"
                placeholder="e.g. https://www.apple.com"
                value={brandWebsiteUrl}
                onChange={(e) => setBrandWebsiteUrl(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                variant="outlined"
                helperText="Official brand website for better search results"
              />
            </Box>
            
            <Box sx={{ flex: 1 }}>
              <TextField
                fullWidth
                label="Country"
                placeholder="e.g. USA, UK, Global"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                variant="outlined"
                helperText="Focus on specific country or Global"
              />
            </Box>
          </Stack>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              onClick={handleAnalyze}
              disabled={loading || !productName.trim() || !brand.trim()}
              startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
              size="large"
              sx={{ 
                minWidth: 200,
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)',
                }
              }}
            >
              {loading ? 'Analyzing...' : 'Start Advanced Analysis'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Analysis Results */}
      {analysisData && (
        <Stack spacing={3}>
          {/* Summary Card */}
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                <AttachMoneyIcon color="primary" />
                <Typography variant="h6">
                  Analysis Summary
                </Typography>
                <Chip 
                  label={`${analysisData.metadata.total_retailers} retailers found`} 
                  color="success" 
                  size="small"
                />
              </Stack>
              
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Box sx={{ flex: 1, textAlign: 'center', p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                  <Typography variant="h4" color="primary">
                    {analysisData.metadata.total_retailers}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Retailers
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, textAlign: 'center', p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                  <Typography variant="h4" color="success.main">
                    {analysisData.retailers.filter(r => r.officialsite).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Official Stores
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, textAlign: 'center', p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                  <Typography variant="h6" color="info.main">
                    Gemini 2.5
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    AI Model
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, textAlign: 'center', p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                  <Typography variant="body1" color="text.primary">
                    {new Date(analysisData.metadata.timestamp).toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Analysis Time
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Retailer Results Table */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <StoreIcon color="primary" />
                Retailer Pricing Comparison
              </Typography>
              
              <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'primary.main' }}>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                        Retailer
                      </TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">
                        Store Type
                      </TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">
                        Product Link
                      </TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">
                        Price
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {analysisData.retailers.map((retailer, index) => (
                      <TableRow 
                        key={index}
                        hover
                        sx={{ 
                          '&:nth-of-type(odd)': { bgcolor: 'action.hover' },
                          '&:hover': { bgcolor: 'action.selected' }
                        }}
                      >
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            {getRetailerIcon(retailer.retailer, retailer.officialsite)}
                            <Typography variant="body1" fontWeight="medium">
                              {retailer.retailer}
                            </Typography>
                          </Stack>
                        </TableCell>
                        
                        <TableCell align="center">
                          <Chip
                            label={retailer.officialsite ? 'Official Store' : 'Third Party'}
                            color={retailer.officialsite ? 'success' : 'default'}
                            size="small"
                            variant={retailer.officialsite ? 'filled' : 'outlined'}
                          />
                        </TableCell>
                        
                        <TableCell align="center">
                          {retailer.url && retailer.url.trim() ? (
                            <Link
                              href={retailer.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              underline="none"
                            >
                              <Button
                                variant="outlined"
                                size="small"
                                endIcon={<LaunchIcon />}
                                sx={{ minWidth: 100 }}
                              >
                                Visit Store
                              </Button>
                            </Link>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              No direct link
                            </Typography>
                          )}
                        </TableCell>
                        
                        <TableCell align="right">
                          <Typography variant="h6" color="primary" fontWeight="bold">
                            {formatPrice(retailer.price)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* Detailed Analysis */}
          {analysisData.data.analysis && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <InfoIcon color="primary" />
                  <Typography variant="h6">
                    Detailed Market Analysis
                  </Typography>
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ bgcolor: 'background.paper', p: 3, borderRadius: 1 }}>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      whiteSpace: 'pre-wrap',
                      lineHeight: 1.6,
                      '& h1, & h2, & h3': { color: 'primary.main', mt: 2, mb: 1 },
                      '& ul, & ol': { pl: 2 },
                      '& li': { mb: 0.5 }
                    }}
                  >
                    {analysisData.data.analysis}
                  </Typography>
                </Box>
              </AccordionDetails>
            </Accordion>
          )}

          {/* Technical Details */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <ScienceIcon color="primary" />
                <Typography variant="h6">
                  Technical Details
                </Typography>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Analysis Endpoint:
                  </Typography>
                  <Typography variant="body2" fontFamily="monospace">
                    {analysisData.metadata.endpoint}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    AI Model:
                  </Typography>
                  <Typography variant="body2">
                    {analysisData.metadata.model}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Version:
                  </Typography>
                  <Typography variant="body2">
                    {analysisData.metadata.version}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Analysis Timestamp:
                  </Typography>
                  <Typography variant="body2">
                    {new Date(analysisData.metadata.timestamp).toLocaleString()}
                  </Typography>
                </Box>
              </Stack>
            </AccordionDetails>
          </Accordion>
        </Stack>
      )}
    </Container>
  );
}

export default ExperimentalCompetitiveAnalysisPage;
