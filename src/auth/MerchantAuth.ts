import { GoogleAuth } from 'google-auth-library';

export class MerchantAuth {
  private auth: GoogleAuth;
  
  constructor() {
    this.auth = new GoogleAuth({
      scopes: [process.env.REQUIRED_SCOPES || 'https://www.googleapis.com/auth/content'],
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });
  }

  async getAccessToken(): Promise<string> {
    const client = await this.auth.getClient();
    const accessToken = await client.getAccessToken();
    return accessToken.token!;
  }

  async getAuthenticatedClient() {
    return await this.auth.getClient();
  }
}
