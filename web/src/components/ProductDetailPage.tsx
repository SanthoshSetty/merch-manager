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
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProductForm from './ProductForm';
import FieldUpdateDashboard from './FieldUpdateDashboard';

interface Product {
  name: string;
  offerId: string;
  attributes: any;
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
      {/* Header with navigation */}
      <Stack spacing={3}>
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
          
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                {product.attributes.title || 'Product Details'}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Product ID: {product.offerId}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Google ID: {product.name}
              </Typography>
            </Box>
            
            <Button
              variant="outlined"
              startIcon={<DashboardIcon />}
              onClick={() => {
                // This will open the dashboard when implemented
              }}
            >
              Analytics
            </Button>
          </Stack>
        </Box>

        {/* Product Form with Dashboard */}
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
      </Stack>
    </Container>
  );
}
