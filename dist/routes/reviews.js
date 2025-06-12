"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = void 0;
const express_1 = require("express");
const ReviewsClient_1 = require("../modules/reviews/ReviewsClient");
const MerchantAuth_1 = require("../auth/MerchantAuth");
const router = (0, express_1.Router)();
exports.default = router;
const authManager = new MerchantAuth_1.MerchantAuth();
const reviewsClient = new ReviewsClient_1.ReviewsClient(authManager);
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
        }
        catch (error) {
            console.error('Create review error:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to create review',
                code: error.code || 'CREATE_REVIEW_ERROR'
            });
        }
    })();
});
//# sourceMappingURL=reviews.js.map