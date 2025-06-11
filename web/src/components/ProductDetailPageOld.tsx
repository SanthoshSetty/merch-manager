import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Stack,
  Button,
  Breadcrumbs,
  Link,
  Alert,
  CircularProgress,
  Paper,
  Chip,
  Avatar,
  Divider,
  Card,
  CardContent,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Image as ImageIcon,
  AttachMoney as PriceIcon,
  Inventory as InventoryIcon,
  Verified as VerifiedIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProductForm from './ProductForm';
import FieldUpdateDashboard from './FieldUpdateDashboard';

interface Product {
  name: string;
  offerId: string;
  attributes: any;
  productStatus?: {
    destinationStatuses?: Array<{
      reportingContext: string;
      approvedCountries?: string[];
      disapprovedCountries?: string[];
    }>;
    itemLevelIssues?: Array<{
      code: string;
      severity: string;
      description: string;
      applicableCountries?: string[];
    }>;
  };
}

export default function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProduct = async () => {
    if (!productId) {
      setError('No product ID provided');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Loading product with ID:', productId);
      const response = await axios.get(`http://localhost:3001/api/products/${encodeURIComponent(productId)}`);
      
      if (response.data.success) {
        console.log('Product loaded successfully:', response.data.data);
        setProduct(response.data.data);
      } else {
        console.error('API returned error:', response.data.error);
        setError('Failed to load product details');
      }
    } catch (err: any) {
      console.error('Error loading product:', err);
      if (err.response?.status === 404) {
        setError(`Product '${productId}' not found. Please check the product ID and try again.`);
      } else if (err.response?.status === 500) {
        setError('Failed to load product. Please check your Google Merchant Center connection.');
      } else {
        setError('Unable to connect to backend. Make sure the server is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const handleProductUpdate = () => {
    // Reload product data after successful update
    loadProduct();
  };

  const getStatusColor = (severity: string) => {
    switch (severity) {
      case 'DISAPPROVED': return 'error';
      case 'WARNING': return 'warning';
      case 'DEMOTED': return 'warning';
      case 'NOT_IMPACTED': return 'info';
      default: return 'default';
    }
  };

  const getStatusIcon = (severity: string) => {
    switch (severity) {
      case 'DISAPPROVED': return <ErrorIcon />;
      case 'WARNING': return <WarningIcon />;
      case 'DEMOTED': return <WarningIcon />;
      case 'NOT_IMPACTED': return <VerifiedIcon />;
      default: return <InventoryIcon />;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <Stack alignItems="center" spacing={2}>
            <CircularProgress size={60} />
            <Typography variant="h6">Loading product details...</Typography>
          </Stack>
        </Box>
      </Container>
    );
  }

  if (error || !product) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack spacing={3}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/')}
            sx={{ alignSelf: 'flex-start' }}
          >
            Back to Product List
          </Button>
          
          <Alert severity="error">
            {error || 'Product not found'}
          </Alert>
          
          <Button variant="contained" onClick={loadProduct}>
            Retry
          </Button>
        </Stack>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={3}>
        {/* Header with navigation */}
        <Box>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/')}
            sx={{ mb: 2 }}
          >
            Back to Product List
          </Button>
          
          <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
            <Link 
              color="inherit" 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                navigate('/');
              }}
              sx={{ cursor: 'pointer' }}
            >
              Products
            </Link>
            <Typography color="text.primary">
              {product.attributes.title || product.offerId}
            </Typography>
          </Breadcrumbs>
        </Box>

        {/* Product Overview Card */}
        <Card>
          <CardContent>
            <Grid container spacing={3}>
              {/* Product Image */}
              <Grid item xs={12} md={3}>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  {product.attributes.imageLink ? (
                    <Avatar
                      src={product.attributes.imageLink}
                      variant="rounded"
                      sx={{ width: 200, height: 200 }}
                    />
                  ) : (
                    <Avatar
                      variant="rounded"
                      sx={{ width: 200, height: 200, bgcolor: 'grey.100' }}
                    >
                      <ImageIcon sx={{ fontSize: 60, color: 'grey.400' }} />
                    </Avatar>
                  )}
                </Box>
              </Grid>

              {/* Product Info */}
              <Grid item xs={12} md={9}>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="h4" component="h1" gutterBottom>
                      {product.attributes.title || 'Product Details'}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      {product.attributes.description || 'No description available'}
                    </Typography>
                  </Box>

                  {/* Product Attributes */}
                  <Stack direction="row" spacing={2} flexWrap="wrap">
                    {product.attributes.price && (
                      <Chip
                        icon={<PriceIcon />}
                        label={`${(parseInt(product.attributes.price.amountMicros) / 1000000).toFixed(2)} ${product.attributes.price.currencyCode}`}
                        color="success"
                        variant="outlined"
                      />
                    )}
                    {product.attributes.availability && (
                      <Chip
                        label={product.attributes.availability.replace('_', ' ')}
                        color={product.attributes.availability === 'in stock' ? 'success' : 'warning'}
                        variant="outlined"
                      />
                    )}
                    {product.attributes.condition && (
                      <Chip
                        label={product.attributes.condition}
                        color="info"
                        variant="outlined"
                      />
                    )}
                    {product.attributes.brand && (
                      <Chip
                        label={product.attributes.brand}
                        variant="outlined"
                      />
                    )}
                  </Stack>

                  {/* Product IDs */}
                  <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Product ID:</strong> {product.offerId}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Google ID:</strong> {product.name}
                    </Typography>
                    {product.attributes.gtin && (
                      <Typography variant="body2" color="text.secondary">
                        <strong>GTIN:</strong> {Array.isArray(product.attributes.gtin) ? product.attributes.gtin.join(', ') : product.attributes.gtin}
                      </Typography>
                    )}
                    {product.attributes.mpn && (
                      <Typography variant="body2" color="text.secondary">
                        <strong>MPN:</strong> {product.attributes.mpn}
                      </Typography>
                    )}
                  </Paper>
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Product Status Card */}
        {product.productStatus?.itemLevelIssues && product.productStatus.itemLevelIssues.length > 0 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Product Status & Issues
              </Typography>
              <Stack spacing={2}>
                {product.productStatus.itemLevelIssues.map((issue, index) => (
                  <Alert
                    key={index}
                    severity={getStatusColor(issue.severity) as any}
                    icon={getStatusIcon(issue.severity)}
                  >
                    <Typography variant="subtitle2" gutterBottom>
                      {issue.description}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Code: {issue.code} | Severity: {issue.severity}
                    </Typography>
                    {issue.applicableCountries && (
                      <Typography variant="body2" color="text.secondary">
                        Applicable Countries: {issue.applicableCountries.join(', ')}
                      </Typography>
                    )}
                  </Alert>
                ))}
              </Stack>
            </CardContent>
          </Card>
        )}

        <Divider />

        {/* Product Form with Dashboard */}
        <Box>
          <Typography variant="h6" gutterBottom>
            Edit Product Fields
          </Typography>
          <FieldUpdateDashboard productId={product.name}>
            <ProductForm 
              productId={product.name}
              initialData={{
                title: product.attributes.title || '',
                description: product.attributes.description || '',
                price: product.attributes.price?.amountMicros 
                  ? (parseInt(product.attributes.price.amountMicros) / 1000000).toString()
                  : '',
                availability: product.attributes.availability || 'in_stock',
                condition: product.attributes.condition || 'new',
                brand: product.attributes.brand || '',
                gtin: Array.isArray(product.attributes.gtin) 
                  ? product.attributes.gtin[0] 
                  : product.attributes.gtin || '',
                mpn: product.attributes.mpn || '',
                googleProductCategory: product.attributes.googleProductCategory || '',
                imageLink: product.attributes.imageLink || '',
                salePrice: product.attributes.salePrice?.amountMicros 
                  ? (parseInt(product.attributes.salePrice.amountMicros) / 1000000).toString()
                  : '',
                costOfGoodsSold: product.attributes.costOfGoodsSold?.amountMicros 
                  ? (parseInt(product.attributes.costOfGoodsSold.amountMicros) / 1000000).toString()
                  : '',
              }}
              onUpdate={handleProductUpdate}
            />
          </FieldUpdateDashboard>
        </Box>
      </Stack>
    </Container>
  );
}
