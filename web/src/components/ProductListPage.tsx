import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Stack,
  Button,
  Chip,
  Avatar,
  Alert,
  CircularProgress,
  Pagination,
  TextField,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Inventory as InventoryIcon,
  AttachMoney as PriceIcon,
  Image as ImageIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../config/api';

interface Product {
  name: string;
  offerId: string;
  attributes: {
    title?: string;
    description?: string;
    price?: { value: string; currency: string };
    availability?: string;
    condition?: string;
    brand?: string;
    imageLink?: string;
    gtin?: string;
    mpn?: string;
  };
}

export default function ProductListPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);

  const loadProducts = async (pageToken?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const params: any = { pageSize: 12 };
      if (pageToken) params.pageToken = pageToken;
      
      const response = await apiClient.get('/api/products', { params });
      
      if (response.data.success) {
        setProducts(response.data.data.products || []);
        setNextPageToken(response.data.data.nextPageToken || null);
        // Calculate total pages based on available data
        setTotalPages(Math.max(1, response.data.data.nextPageToken ? page + 1 : page));
      } else {
        setError('Failed to load products');
      }
    } catch (err: any) {
      console.error('Error loading products:', err);
      if (err.response?.status === 500) {
        setError('Backend connection established, but Google Merchant Center credentials need verification. Check that your service account has proper permissions.');
      } else {
        setError('Unable to connect to backend. Make sure the server is running on port 3001.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handlePageChange = (_event: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
    if (newPage > page && nextPageToken) {
      loadProducts(nextPageToken);
    } else if (newPage === 1) {
      loadProducts();
    }
  };

  const handleProductEdit = (productId: string) => {
    navigate(`/product/${encodeURIComponent(productId)}`);
  };

  const filteredProducts = products.filter(product =>
    product.attributes.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.attributes.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.offerId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAvailabilityColor = (availability?: string) => {
    const normalizedAvailability = availability?.replace(/ /g, '_');
    switch (normalizedAvailability) {
      case 'in_stock': return 'success';
      case 'out_of_stock': return 'error';
      case 'preorder': return 'warning';
      case 'backorder': return 'info';
      default: return 'default';
    }
  };

  const getConditionColor = (condition?: string) => {
    switch (condition) {
      case 'new': return 'success';
      case 'refurbished': return 'warning';
      case 'used': return 'info';
      default: return 'default';
    }
  };

  if (loading && products.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <Stack alignItems="center" spacing={2}>
            <CircularProgress size={60} />
            <Typography variant="h6">Loading products from Google Merchant Center...</Typography>
            <Typography variant="body2" color="text.secondary">
              This may take a moment if it's the first request
            </Typography>
          </Stack>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h4" component="h1">
            Product Catalog
          </Typography>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => loadProducts()}
            disabled={loading}
          >
            Refresh
          </Button>
        </Stack>
        
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Manage your Google Merchant Center products with real-time synchronization
        </Typography>

        {/* Search */}
        <TextField
          fullWidth
          placeholder="Search products by title, brand, or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mt: 2, maxWidth: 500 }}
        />
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} action={
          <IconButton color="inherit" size="small" onClick={() => loadProducts()}>
            <RefreshIcon />
          </IconButton>
        }>
          {error}
        </Alert>
      )}

      {/* Products Grid */}
      {!loading && products.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <InventoryIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            No Products Found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {error ? 
              'Unable to load products. Please check your connection and try again.' :
              'Your product catalog is empty. Add products to your Google Merchant Center to see them here.'
            }
          </Typography>
          <Button variant="contained" onClick={() => loadProducts()}>
            Retry Loading
          </Button>
        </Box>
      ) : (
        <>
          <Stack spacing={3}>
            {filteredProducts.map((product, index) => (
              <Card key={product.name || index} sx={{ 
                transition: 'all 0.2s ease',
                '&:hover': { 
                  transform: 'translateY(-2px)', 
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)' 
                }
              }}>
                <CardContent>
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                    {/* Product Image */}
                    <Box sx={{ flexShrink: 0 }}>
                      {product.attributes.imageLink ? (
                        <Avatar
                          src={product.attributes.imageLink}
                          variant="rounded"
                          sx={{ width: 120, height: 120 }}
                        />
                      ) : (
                        <Avatar
                          variant="rounded"
                          sx={{ width: 120, height: 120, bgcolor: 'grey.200' }}
                        >
                          <ImageIcon sx={{ fontSize: 40, color: 'grey.500' }} />
                        </Avatar>
                      )}
                    </Box>

                    {/* Product Info */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="h6" component="h2" gutterBottom sx={{ 
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {product.attributes.title || 'Untitled Product'}
                      </Typography>
                      
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ 
                          mb: 2,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {product.attributes.description || 'No description available'}
                      </Typography>

                      <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
                        {product.attributes.availability && (
                          <Chip 
                            label={product.attributes.availability.replace('_', ' ')} 
                            color={getAvailabilityColor(product.attributes.availability) as any}
                            size="small" 
                          />
                        )}
                        {product.attributes.condition && (
                          <Chip 
                            label={product.attributes.condition} 
                            color={getConditionColor(product.attributes.condition) as any}
                            variant="outlined"
                            size="small" 
                          />
                        )}
                        {product.attributes.brand && (
                          <Chip 
                            label={product.attributes.brand} 
                            variant="outlined"
                            size="small" 
                          />
                        )}
                      </Stack>

                      <Stack direction="row" spacing={3} alignItems="center">
                        {product.attributes.price && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <PriceIcon sx={{ fontSize: 16, color: 'success.main' }} />
                            <Typography variant="h6" color="success.main">
                              {product.attributes.price.value} {product.attributes.price.currency}
                            </Typography>
                          </Box>
                        )}
                        
                        <Typography variant="body2" color="text.secondary">
                          ID: {product.offerId}
                        </Typography>
                      </Stack>
                    </Box>

                    {/* Actions */}
                    <Box sx={{ flexShrink: 0, alignSelf: 'flex-start' }}>
                      <Button
                        variant="contained"
                        startIcon={<EditIcon />}
                        onClick={() => handleProductEdit(product.name)}
                        sx={{ minWidth: 120 }}
                      >
                        Edit
                      </Button>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          )}

          {/* Loading overlay for pagination */}
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <CircularProgress />
            </Box>
          )}
        </>
      )}

      {/* Stats Footer */}
      <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
        <Typography variant="body2" color="text.secondary" align="center">
          {filteredProducts.length !== products.length && 
            `Showing ${filteredProducts.length} of ${products.length} products ${searchTerm ? `(filtered by "${searchTerm}")` : ''}`
          }
          {filteredProducts.length === products.length && 
            `Showing ${products.length} product${products.length !== 1 ? 's' : ''}`
          }
        </Typography>
      </Box>
    </Container>
  );
}
