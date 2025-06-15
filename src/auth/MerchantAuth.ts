import { GoogleAuth } from 'google-auth-library';

export class MerchantAuth {
  private auth: GoogleAuth;
  
  constructor() {
    // On Cloud Run, use the attached service account automatically
    // This will use the merchant-api-service@neon-vigil-395120.iam.gserviceaccount.com
    this.auth = new GoogleAuth({
      scopes: [
        'https://www.googleapis.com/auth/content'
      ],
      // Don't specify keyFilename - let it use the Cloud Run service account
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
