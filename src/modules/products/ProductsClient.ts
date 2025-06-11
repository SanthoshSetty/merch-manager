import axios from 'axios';
import { MerchantAuth } from '../../auth/MerchantAuth';

export class ProductsClient {
  private baseUrl: string;
  private merchantId: string;

  constructor(private auth: MerchantAuth) {
    this.baseUrl = 'https://merchantapi.googleapis.com/products/v1beta';
    this.merchantId = process.env.GOOGLE_MERCHANT_ID!;
  }

  async updateProductFields(productId: string, updates: any, updateMask: string) {
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

    const response = await axios.post(
      `${this.baseUrl}/accounts/${this.merchantId}/productInputs`,
      productInput,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      }
    );

    return response.data;
  }

  async getProduct(productId: string) {
    const token = await this.auth.getAccessToken();
    
    // Extract the actual product ID from full product name if needed
    // Format: accounts/{merchantId}/products/{productId}
    const actualProductId = productId.startsWith('accounts/') 
      ? productId.split('/products/')[1] 
      : productId;
    
    const response = await axios.get(
      `${this.baseUrl}/accounts/${this.merchantId}/products/${actualProductId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      }
    );

    return response.data;
    }

  async listProducts(pageSize: number = 25, pageToken?: string) {
    const token = await this.auth.getAccessToken();
    
    const params: any = { pageSize };
    if (pageToken) params.pageToken = pageToken;

    const response = await axios.get(
      `${this.baseUrl}/accounts/${this.merchantId}/products`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        params
      }
    );

    return response.data;
  }

  async getAccount() {
    const token = await this.auth.getAccessToken();
    
    // Use the accounts API to get account information
    const response = await axios.get(
      `https://merchantapi.googleapis.com/accounts/v1beta/accounts/${this.merchantId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      }
    );

    return response.data;
  }

  // New method to create a product input
  async createProductInput(productData: any) {
    const token = await this.auth.getAccessToken();
    
    const productInput = {
      product: {
        attributes: productData
      },
      channel: "ONLINE",
      contentLanguage: "en",
      targetCountry: "US"
    };

    const response = await axios.post(
      `${this.baseUrl}/accounts/${this.merchantId}/productInputs`,
      productInput,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      }
    );

    return response.data;
  }

  // Delete a product input
  async deleteProductInput(productInputId: string) {
    const token = await this.auth.getAccessToken();
    
    const response = await axios.delete(
      `${this.baseUrl}/accounts/${this.merchantId}/productInputs/${productInputId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      }
    );

    return response.data;
  }
}
