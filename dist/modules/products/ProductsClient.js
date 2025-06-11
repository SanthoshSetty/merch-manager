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
        this.baseUrl = 'https://merchantapi.googleapis.com/products/v1beta';
        this.merchantId = process.env.GOOGLE_MERCHANT_ID;
    }
    async updateProductFields(productId, updates, updateMask) {
        const token = await this.auth.getAccessToken();
        // Use ProductInputs API for updates - this creates a new product input
        // The product input will be processed and update the actual product
        const productInput = {
            product: {
                name: `accounts/${this.merchantId}/products/${productId}`,
                attributes: updates
            },
            channel: "ONLINE",
            contentLanguage: "en",
            targetCountry: "US"
        };
        const response = await axios_1.default.post(`${this.baseUrl}/accounts/${this.merchantId}/productInputs`, productInput, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
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
    async getAccount() {
        const token = await this.auth.getAccessToken();
        // Use the accounts API to get account information
        const response = await axios_1.default.get(`https://merchantapi.googleapis.com/accounts/v1beta/accounts/${this.merchantId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });
        return response.data;
    }
    // New method to create a product input
    async createProductInput(productData) {
        const token = await this.auth.getAccessToken();
        const productInput = {
            product: {
                attributes: productData
            },
            channel: "ONLINE",
            contentLanguage: "en",
            targetCountry: "US"
        };
        const response = await axios_1.default.post(`${this.baseUrl}/accounts/${this.merchantId}/productInputs`, productInput, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        });
        return response.data;
    }
    // Delete a product input
    async deleteProductInput(productInputId) {
        const token = await this.auth.getAccessToken();
        const response = await axios_1.default.delete(`${this.baseUrl}/accounts/${this.merchantId}/productInputs/${productInputId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });
        return response.data;
    }
}
exports.ProductsClient = ProductsClient;
//# sourceMappingURL=ProductsClient.js.map