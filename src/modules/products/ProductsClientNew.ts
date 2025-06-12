import axios from 'axios';
import { MerchantAuth } from '../../auth/MerchantAuth';

export class ProductsClientNew {
  private baseUrl: string;
  private merchantId: string;

  constructor(private auth: MerchantAuth) {
    this.baseUrl = 'https://merchantapi.googleapis.com/products/v1beta';
    this.merchantId = process.env.GOOGLE_MERCHANT_ID!;
  }

  async updateProductFields(productId: string, updates: any, updateMask: string) {
    console.log('🚀🚀🚀 NEW ProductsClientNew.updateProductFields method executing! 🚀🚀🚀');
    console.log('🎉 This is the BRAND NEW implementation with feed label parsing!');
    
    const token = await this.auth.getAccessToken();
    
    // Extract the actual product ID from the full path if needed
    const actualProductId = productId.startsWith('accounts/') 
      ? productId.split('/products/')[1] 
      : productId;
    
    // Parse the product ID to extract channel, contentLanguage, feedLabel, and offerId
    // Format: {channel}~{contentLanguage}~{feedLabel}~{offerId}
    const parts = actualProductId.split('~');
    if (parts.length < 4) {
      throw new Error(`Invalid product ID format: ${actualProductId}. Expected format: channel~contentLanguage~feedLabel~offerId`);
    }
    
    const [channel, contentLanguage, feedLabel, ...offerIdParts] = parts;
    const offerId = offerIdParts.join('~');
    
    console.log('🔍 NEW Field Update Request Analysis:');
    console.log('  📋 Full Product ID:', productId);
    console.log('  🎯 Extracted Product ID:', actualProductId);
    console.log('  📂 Parsed Components:');
    console.log(`    🌐 Channel: ${channel}`);
    console.log(`    🗣️ Content Language: ${contentLanguage}`);
    console.log(`    🏷️ Feed Label: ${feedLabel}`);
    console.log(`    🆔 Offer ID: ${offerId}`);
    console.log('  🎯 Fields to Update:', Object.keys(updates));
    console.log('  📝 Update Values:', JSON.stringify(updates, null, 2));
    console.log('  🔍 Update Mask:', updateMask);
    
    // Use the correct feed label extracted from the product ID
    const productInput = {
      offerId: offerId,
      channel: channel.toUpperCase(),
      contentLanguage: contentLanguage,
      feedLabel: feedLabel,
      attributes: updates
    };

    const apiUrl = `${this.baseUrl}/accounts/${this.merchantId}/productInputs:insert`;
    
    // Use the correct data source based on feed label
    const dataSourceMapping: { [key: string]: string } = {
      'DE': '10536470531',
      'US': '10536290691'
    };
    
    const dataSourceId = dataSourceMapping[feedLabel] || dataSourceMapping['US'];
    const fullDataSourceId = `accounts/${this.merchantId}/dataSources/${dataSourceId}`;

    console.log('📤 NEW Sending product update via productInputs:insert...');
    console.log('  📦 Fields to update:', Object.keys(updates));
    console.log('  📡 API URL:', apiUrl);
    console.log('  🏷️ Feed Label:', feedLabel);
    console.log('  📊 Data Source ID:', fullDataSourceId);
    console.log('  📋 Request Body:', JSON.stringify(productInput, null, 2));
    
    try {
      const response = await axios.post(apiUrl, productInput, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        params: {
          dataSource: fullDataSourceId
        }
      });

      console.log('✅ NEW Product update successful!');
      console.log('  📊 Response Status:', response.status);
      console.log('  📋 Response Data:', JSON.stringify(response.data, null, 2));
      
      return response.data;
      
    } catch (error: any) {
      console.error('❌ NEW Product Update Error:');
      console.error('  🔥 Status:', error.response?.status);
      console.error('  📄 Status Text:', error.response?.statusText);
      console.error('  📊 Response Data:', JSON.stringify(error.response?.data, null, 2));
      console.error('  📡 Request URL:', apiUrl);
      console.error('  📋 Request Data:', JSON.stringify(productInput, null, 2));
      
      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData?.error?.message) {
          console.error('  💬 Error Message:', errorData.error.message);
        }
        if (errorData?.error?.details) {
          console.error('  📋 Error Details:', JSON.stringify(errorData.error.details, null, 2));
        }
      }
      
      throw error;
    }
  }

  async getProduct(productId: string) {
    const token = await this.auth.getAccessToken();
    const actualProductId = productId.startsWith('accounts/') ? productId.split('/products/')[1] : productId;
    const encodedProductId = encodeURIComponent(actualProductId);
    const apiUrl = `${this.baseUrl}/accounts/${this.merchantId}/products/${encodedProductId}`;
    
    const response = await axios.get(apiUrl, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  }

  async listProducts(pageSize: number = 25, pageToken?: string) {
    const token = await this.auth.getAccessToken();
    const params: any = { pageSize };
    if (pageToken) params.pageToken = pageToken;

    const response = await axios.get(`${this.baseUrl}/accounts/${this.merchantId}/products`, {
      headers: { 'Authorization': `Bearer ${token}` },
      params
    });
    return response.data;
  }

  async getAccount() {
    const token = await this.auth.getAccessToken();
    const response = await axios.get(`https://merchantapi.googleapis.com/accounts/v1beta/accounts/${this.merchantId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  }

  async createProductInput(productData: any) {
    const token = await this.auth.getAccessToken();
    const productInput = {
      offerId: `new-product-${Date.now()}`,
      channel: "ONLINE",
      contentLanguage: "en",
      feedLabel: "US",
      attributes: productData
    };

    const response = await axios.post(`${this.baseUrl}/accounts/${this.merchantId}/productInputs:insert`, productInput, {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      params: { dataSource: `accounts/${this.merchantId}/dataSources/10536290691` }
    });
    return response.data;
  }

  async deleteProductInput(productInputId: string) {
    const token = await this.auth.getAccessToken();
    const response = await axios.delete(`${this.baseUrl}/accounts/${this.merchantId}/productInputs/${productInputId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  }
}
