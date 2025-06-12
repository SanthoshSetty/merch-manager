"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewsClient = void 0;
const axios_1 = __importDefault(require("axios"));
class ReviewsClient {
    constructor(auth) {
        this.auth = auth;
        this.baseUrl = 'https://merchantapi.googleapis.com/reviews/v1beta';
        this.merchantId = process.env.GOOGLE_MERCHANT_ID;
    }
    async listProductReviews(pageSize = 25, pageToken, productId) {
        const token = await this.auth.getAccessToken();
        const params = { pageSize };
        if (pageToken)
            params.pageToken = pageToken;
        // Add filter for specific product if provided
        if (productId) {
            params.filter = `attributes.sku="${productId}"`;
        }
        console.log('📋 Listing product reviews with params:', params);
        console.log('📡 API URL:', `${this.baseUrl}/accounts/${this.merchantId}/productReviews`);
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/accounts/${this.merchantId}/productReviews`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                params
            });
            console.log('✅ Reviews listed successfully');
            return response.data;
        }
        catch (error) {
            console.error('❌ List Reviews API Error Details:');
            console.error('  🔥 Status:', error.response?.status);
            console.error('  📄 Status Text:', error.response?.statusText);
            console.error('  📊 Response Data:', JSON.stringify(error.response?.data, null, 2));
            console.error('  📡 Request URL:', `${this.baseUrl}/accounts/${this.merchantId}/productReviews`);
            console.error('  📋 Request Params:', JSON.stringify(params, null, 2));
            throw error;
        }
    }
    async getProductReview(productReviewId) {
        const token = await this.auth.getAccessToken();
        console.log('📋 Getting product review:', productReviewId);
        const response = await axios_1.default.get(`${this.baseUrl}/accounts/${this.merchantId}/productReviews/${productReviewId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });
        return response.data;
    }
    async insertProductReview(reviewData) {
        const token = await this.auth.getAccessToken();
        console.log('📝 Creating product review:', JSON.stringify(reviewData, null, 2));
        // Validate required fields
        if (!reviewData.attributes?.content) {
            throw new Error('Review content is required');
        }
        if (!reviewData.attributes?.starRating || reviewData.attributes.starRating < 1 || reviewData.attributes.starRating > 5) {
            throw new Error('Star rating must be between 1 and 5');
        }
        const apiUrl = `${this.baseUrl}/accounts/${this.merchantId}/productReviews:insert`;
        console.log('📡 API URL:', apiUrl);
        console.log('📋 Request Body:', JSON.stringify(reviewData, null, 2));
        try {
            const response = await axios_1.default.post(apiUrl, reviewData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });
            console.log('✅ Review created successfully');
            return response.data;
        }
        catch (error) {
            console.error('❌ Create Review API Error Details:');
            console.error('  🔥 Status:', error.response?.status);
            console.error('  📄 Status Text:', error.response?.statusText);
            console.error('  📊 Response Data:', JSON.stringify(error.response?.data, null, 2));
            console.error('  📡 Request URL:', apiUrl);
            console.error('  📋 Request Data:', JSON.stringify(reviewData, null, 2));
            throw error;
        }
    }
    async deleteProductReview(productReviewId) {
        const token = await this.auth.getAccessToken();
        console.log('🗑️ Deleting product review:', productReviewId);
        await axios_1.default.delete(`${this.baseUrl}/accounts/${this.merchantId}/productReviews/${productReviewId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });
    }
    /**
     * Helper method to create a review for a specific product
     */
    async createProductReview(productId, reviewData) {
        const review = {
            attributes: {
                sku: productId,
                title: reviewData.title || '',
                content: reviewData.content,
                starRating: reviewData.starRating,
                reviewerName: reviewData.reviewerName || 'Anonymous',
                reviewTime: reviewData.reviewTime || new Date().toISOString(),
                collectionMethod: reviewData.collectionMethod || 'UNSOLICITED',
                reviewLanguage: reviewData.reviewLanguage || 'en',
                reviewCountry: reviewData.reviewCountry || 'US',
                isAnonymous: reviewData.isAnonymous ?? false,
            }
        };
        return this.insertProductReview(review);
    }
}
exports.ReviewsClient = ReviewsClient;
//# sourceMappingURL=ReviewsClient.js.map