import { Router } from 'express';
import { ReviewsClient } from '../modules/reviews/ReviewsClient';
import { MerchantAuth } from '../auth/MerchantAuth';

const router = Router();
const authManager = new MerchantAuth();
const reviewsClient = new ReviewsClient(authManager);

// Create new product review
router.post('/', (req, res) => {
  (async () => {
    try {
      const { productId, reviewData } = req.body;
      
      console.log('📝 Creating product review for:', productId);
      
      if (!productId) {
        return res.status(400).json({
          success: false,
          error: 'Product ID is required'
        });
      }
      
      if (!reviewData?.content || !reviewData?.starRating) {
        return res.status(400).json({
          success: false,
          error: 'Review content and star rating are required'
        });
      }
      
      const result = await reviewsClient.createProductReview(productId, reviewData);
      
      res.json({
        success: true,
        data: result,
        message: 'Review created successfully'
      });
    } catch (error: any) {
      console.error('Create review error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create review',
        code: error.code || 'CREATE_REVIEW_ERROR'
      });
    }
  })();
});

export { router as default };
