"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsClient = void 0;
const axios_1 = __importDefault(require("axios"));
class ProductsClient {
    constructor(auth) {
        this.auth = auth;
        this.baseUrl = `${process.env.MERCHANT_API_BASE_URL}/${process.env.MERCHANT_API_VERSION}`;
        this.merchantId = process.env.GOOGLE_MERCHANT_ID;
    }
    async updateProductFields(productId, updates, updateMask) {
        const token = await this.auth.getAccessToken();
        // Transform form data to API format
        const apiPayload = {
            attributes: updates
        };
        const response = await axios_1.default.patch(`${this.baseUrl}/accounts/${this.merchantId}/products/${productId}`, apiPayload, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            params: {
                updateMask
            }
        });
        return response.data;
    }
    async getProduct(productId) {
        const token = await this.auth.getAccessToken();
        const response = await axios_1.default.get(`${this.baseUrl}/accounts/${this.merchantId}/products/${productId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });
        return response.data;
    }
    async listProducts(pageSize = 25, pageToken) {
        const token = await this.auth.getAccessToken();
        const params = { pageSize };
        if (pageToken)
            params.pageToken = pageToken;
        const response = await axios_1.default.get(`${this.baseUrl}/accounts/${this.merchantId}/products`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            params
        });
        return response.data;
    }
}
exports.ProductsClient = ProductsClient;
//# sourceMappingURL=ProductsClient.js.map