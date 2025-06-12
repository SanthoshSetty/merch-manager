"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MerchantAuth = void 0;
const google_auth_library_1 = require("google-auth-library");
class MerchantAuth {
    constructor() {
        this.auth = new google_auth_library_1.GoogleAuth({
            scopes: [process.env.REQUIRED_SCOPES || 'https://www.googleapis.com/auth/content'],
            keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
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