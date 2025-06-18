"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MerchantAuth = void 0;
const google_auth_library_1 = require("google-auth-library");
class MerchantAuth {
    constructor() {
        // On Cloud Run, use the attached service account automatically
        // This will use the merchant-api-service@neon-vigil-395120.iam.gserviceaccount.com
        this.auth = new google_auth_library_1.GoogleAuth({
            scopes: [
                'https://www.googleapis.com/auth/content'
            ],
            // Don't specify keyFilename - let it use the Cloud Run service account
        });
    }
    async getAccessToken() {
        const client = await this.auth.getClient();
        const accessToken = await client.getAccessToken();
        return accessToken.token;
    }
    async getAuthenticatedClient() {
        return await this.auth.getClient();
    }
}
exports.MerchantAuth = MerchantAuth;
//# sourceMappingURL=MerchantAuth.js.map