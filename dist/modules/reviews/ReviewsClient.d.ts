import { MerchantAuth } from '../../auth/MerchantAuth';
export interface ProductReview {
    name?: string;
    productReviewId?: string;
    attributes?: {
        aggregatorName?: string;
        subclientName?: string;
        gtin?: string[];
        sku?: string;
        title?: string;
        content?: string;
        link?: string;
        reviewerName?: string;
        reviewTime?: string;
        starRating?: number;
        collectionMethod?: 'UNSOLICITED' | 'POST_FULFILLMENT';
        reviewLanguage?: string;
        reviewCountry?: string;
        isAnonymous?: boolean;
        additionalFields?: Record<string, any>;
    };
    customAttributes?: Array<{
        name: string;
        value: string;
    }>;
    dataSource?: string;
}
export interface ListReviewsResponse {
    productReviews?: ProductReview[];
    nextPageToken?: string;
}
export declare class ReviewsClient {
    private auth;
    private baseUrl;
    private merchantId;
    constructor(auth: MerchantAuth);
    listProductReviews(pageSize?: number, pageToken?: string, productId?: string): Promise<ListReviewsResponse>;
    getProductReview(productReviewId: string): Promise<ProductReview>;
    insertProductReview(reviewData: ProductReview): Promise<ProductReview>;
    deleteProductReview(productReviewId: string): Promise<void>;
    /**
     * Helper method to create a review for a specific product
     */
    createProductReview(productId: string, reviewData: {
        title?: string;
        content: string;
        starRating: number;
        reviewerName?: string;
        reviewTime?: string;
        collectionMethod?: 'UNSOLICITED' | 'POST_FULFILLMENT';
        reviewLanguage?: string;
        reviewCountry?: string;
        isAnonymous?: boolean;
    }): Promise<ProductReview>;
}
//# sourceMappingURL=ReviewsClient.d.ts.map