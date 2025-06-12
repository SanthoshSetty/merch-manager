import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  TextField,
  Rating,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Star as StarIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import axios from 'axios';

interface ProductReview {
  name?: string;
  productReviewId?: string;
  attributes?: {
    title?: string;
    content?: string;
    starRating?: number;
    reviewerName?: string;
    reviewTime?: string;
    collectionMethod?: string;
    reviewLanguage?: string;
    reviewCountry?: string;
    isAnonymous?: boolean;
  };
}

interface ProductReviewsProps {
  productId: string;
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiNotEnabled, setApiNotEnabled] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedReview, setSelectedReview] = useState<ProductReview | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [newReview, setNewReview] = useState({
    title: '',
    content: '',
    starRating: 5,
    reviewerName: '',
    isAnonymous: false,
  });

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      setApiNotEnabled(false);
      
      const response = await axios.get('http://localhost:3001/api/reviews', {
        params: { productId }
      });
      
      if (response.data.success) {
        setReviews(response.data.data.productReviews || []);
        if (response.data.code === 'API_NOT_ENABLED') {
          setApiNotEnabled(true);
        }
      } else {
        setError('Failed to load reviews');
      }
    } catch (err: any) {
      console.error('Error loading reviews:', err);
      
      if (err.response?.data?.code === 'API_NOT_ENABLED') {
        setApiNotEnabled(true);
        setReviews([]);
        // Don't set error, show the API_NOT_ENABLED alert instead
      } else if (err.response?.status === 500) {
        // Handle general server errors gracefully
        setApiNotEnabled(true);
        setReviews([]);
        console.log('Reviews API not available, showing demo interface');
      } else {
        setError(err.response?.data?.error || 'Failed to load reviews');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddReview = async () => {
    if (!newReview.content.trim() || newReview.starRating < 1) {
      setError('Please provide review content and rating');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const response = await axios.post('http://localhost:3001/api/reviews', {
        productId,
        reviewData: {
          title: newReview.title.trim() || undefined,
          content: newReview.content.trim(),
          starRating: newReview.starRating,
          reviewerName: newReview.isAnonymous ? 'Anonymous' : (newReview.reviewerName.trim() || 'Anonymous'),
          isAnonymous: newReview.isAnonymous,
          collectionMethod: 'UNSOLICITED',
          reviewLanguage: 'en',
          reviewCountry: 'US',
        }
      });

      if (response.data.success) {
        await loadReviews();
        setNewReview({ title: '', content: '', starRating: 5, reviewerName: '', isAnonymous: false });
        setAddDialogOpen(false);
        console.log('Review created successfully:', response.data.data);
      } else {
        setError(response.data.error || 'Failed to create review');
      }
    } catch (err: any) {
      console.error('Error adding review:', err);
      
      // Check if it's an API not enabled error
      if (err.response?.data?.code === 'API_NOT_ENABLED' || err.response?.status === 500) {
        setApiNotEnabled(true);
        console.log('Reviews API not available, using demo mode');
        // Don't set error, just enable demo mode and continue with simulation
      }
      
      // Fallback to local simulation for other errors
      const simulatedReview: ProductReview = {
        productReviewId: `temp-${Date.now()}`,
        attributes: {
          title: newReview.title.trim() || undefined,
          content: newReview.content.trim(),
          starRating: newReview.starRating,
          reviewerName: newReview.isAnonymous ? 'Anonymous' : (newReview.reviewerName.trim() || 'Anonymous'),
          isAnonymous: newReview.isAnonymous,
          reviewTime: new Date().toISOString(),
          collectionMethod: 'UNSOLICITED',
          reviewLanguage: 'en',
          reviewCountry: 'US',
        }
      };

      setReviews(prev => [simulatedReview, ...prev]);
      setNewReview({ title: '', content: '', starRating: 5, reviewerName: '', isAnonymous: false });
      setAddDialogOpen(false);
      console.log('API call failed, using local simulation. Error:', err.response?.data?.error || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (review: ProductReview) => {
    if (!review.productReviewId) return;

    try {
      if (review.productReviewId.startsWith('temp-')) {
        setReviews(prev => prev.filter(r => r.productReviewId !== review.productReviewId));
        console.log('Review removed locally');
      } else {
        const response = await axios.delete(`http://localhost:3001/api/reviews/${review.productReviewId}`);
        if (response.data.success) {
          await loadReviews();
        } else {
          setError('Failed to delete review');
        }
      }
    } catch (err: any) {
      console.error('Error deleting review:', err);
      setError(err.response?.data?.error || 'Failed to delete review');
    }
    
    setMenuAnchor(null);
    setSelectedReview(null);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown date';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Invalid date';
    }
  };

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + (review.attributes?.starRating || 0), 0) / reviews.length
    : 0;

  useEffect(() => {
    loadReviews();
  }, [productId]);

  return (
    <Box>
      <Stack spacing={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" component="h2">
            Product Reviews
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAddDialogOpen(true)}
          >
            Add Review
          </Button>
        </Box>

        {reviews.length > 0 && (
          <Card>
            <CardContent>
              <Stack direction="row" spacing={3} alignItems="center">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Rating value={averageRating} precision={0.1} readOnly />
                  <Typography variant="h6">
                    {averageRating.toFixed(1)}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        )}

        {apiNotEnabled && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Reviews API Demo Mode
            </Typography>
            <Typography variant="body2" paragraph>
              The Google Merchant Reviews API is not enabled for this project. You can still test the interface with demo functionality.
            </Typography>
            <Typography variant="body2">
              To enable real reviews: Go to <a href="https://console.cloud.google.com/apis/library" target="_blank" rel="noopener noreferrer">Google Cloud Console</a> → Enable "Google Merchant API" → Wait 5-10 minutes → Refresh
            </Typography>
          </Alert>
        )}

        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {loading && reviews.length === 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {!loading && reviews.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <StarIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No reviews yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Be the first to add a review for this product!
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Stack spacing={2}>
            {reviews.map((review) => (
              <Card key={review.productReviewId}>
                <CardContent>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <PersonIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1">
                            {review.attributes?.reviewerName || 'Anonymous'}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Rating 
                              value={review.attributes?.starRating || 0} 
                              size="small" 
                              readOnly 
                            />
                            <Typography variant="body2" color="text.secondary">
                              {formatDate(review.attributes?.reviewTime)}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      
                      <Box>
                        <IconButton
                          onClick={(e) => {
                            setMenuAnchor(e.currentTarget);
                            setSelectedReview(review);
                          }}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Box>
                    </Box>

                    {review.attributes?.title && (
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {review.attributes.title}
                      </Typography>
                    )}
                    
                    <Typography variant="body1">
                      {review.attributes?.content}
                    </Typography>

                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {review.attributes?.isAnonymous && (
                        <Chip label="Anonymous" size="small" variant="outlined" />
                      )}
                      {review.productReviewId?.startsWith('temp-') && (
                        <Chip label="Local (Demo)" size="small" color="warning" variant="outlined" />
                      )}
                      <Chip 
                        label={review.attributes?.collectionMethod || 'N/A'} 
                        size="small" 
                        variant="outlined" 
                      />
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </Stack>

      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Product Review</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Review Title (Optional)"
              fullWidth
              value={newReview.title}
              onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
              placeholder="Summary of your experience..."
            />
            
            <Box>
              <Typography variant="body2" gutterBottom>
                Rating *
              </Typography>
              <Rating
                value={newReview.starRating}
                onChange={(_, value) => setNewReview({ ...newReview, starRating: value || 1 })}
                size="large"
              />
            </Box>

            <TextField
              label="Review Content"
              multiline
              rows={4}
              fullWidth
              required
              value={newReview.content}
              onChange={(e) => setNewReview({ ...newReview, content: e.target.value })}
              placeholder="Share your thoughts about this product..."
            />

            <FormControlLabel
              control={
                <Switch
                  checked={newReview.isAnonymous}
                  onChange={(e) => setNewReview({ ...newReview, isAnonymous: e.target.checked })}
                />
              }
              label="Post anonymously"
            />

            {!newReview.isAnonymous && (
              <TextField
                label="Your Name"
                fullWidth
                value={newReview.reviewerName}
                onChange={(e) => setNewReview({ ...newReview, reviewerName: e.target.value })}
                placeholder="Enter your name..."
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleAddReview} 
            variant="contained"
            disabled={submitting || !newReview.content.trim()}
          >
            {submitting ? 'Adding...' : 'Add Review'}
          </Button>
        </DialogActions>
      </Dialog>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem
          onClick={() => selectedReview && handleDeleteReview(selectedReview)}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ mr: 1 }} />
          Delete Review
        </MenuItem>
      </Menu>
    </Box>
  );
}
