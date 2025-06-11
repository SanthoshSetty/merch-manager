import axios from 'axios';
import { MerchantAuth } from '../../auth/MerchantAuth';

export class ProductsClient {
  private baseUrl: string;
  private merchantId: string;

  constructor(private auth: MerchantAuth) {
    this.baseUrl = `${process.env.MERCHANT_API_BASE_URL}/${process.env.MERCHANT_API_VERSION}`;
    this.merchantId = process.env.GOOGLE_MERCHANT_ID!;
  }

  async updateProductFields(productId: string, updates: any, updateMask: string) {
    const token = await this.auth.getAccessToken();
    
    // Transform form data to API format
    const apiPayload = {
      attributes: updates
    };

    const response = await axios.patch(
      `https://merchantapi.googleapis.com/products/v1beta/accounts/${this.merchantId}/products/${productId}`,
      apiPayload,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        params: {
          updateMask
        }
      }
    );

    return response.data;
  }

  async getProduct(productId: string) {
    const token = await this.auth.getAccessToken();
    
    const response = await axios.get(
      `https://merchantapi.googleapis.com/products/v1beta/accounts/${this.merchantId}/products/${productId}`,
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
      `https://merchantapi.googleapis.com/products/v1beta/accounts/${this.merchantId}/products`,
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
}
