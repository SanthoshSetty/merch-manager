## Google Merchant Center API 400 Error - Resolution Guide

### 🔍 **Issue Identified**
The backend is properly deployed and authenticated, but Google Merchant API returns 400 errors when trying to access merchant account `5591219286`.

### 🎯 **Root Cause**  
The service account `merchant-api-service@neon-vigil-395120.iam.gserviceaccount.com` does not have access to Google Merchant Center account `5591219286`.

### ✅ **What's Working**
- ✅ Backend deployed successfully at `https://merch-manager-backend-361151780407.us-central1.run.app`
- ✅ Frontend deployed successfully at `https://merch-manager-frontend-361151780407.us-central1.run.app`
- ✅ Service account authentication is working (tokens are being generated)
- ✅ Google Cloud permissions are correct (service account has Owner role)
- ✅ Environment variables are properly configured
- ✅ Credentials are properly mounted in Cloud Run

### ❌ **What's Not Working**
- ❌ Google Merchant API returns 400 "Bad Request" errors
- ❌ Cannot list products from merchant account
- ❌ Frontend shows "500 Internal Server Error" (wrapping the 400 error)

### 🛠️ **Solution Steps**

#### Step 1: Add Service Account to Google Merchant Center
1. **Go to Google Merchant Center**: https://merchants.google.com/
2. **Select the correct account**: Look for merchant ID `5591219286`
3. **Navigate to Account Access**: 
   - Click on the gear icon (Settings)
   - Select "Account Access" from the menu
4. **Add the service account**:
   - Click "Add User" or "+" button
   - Enter email: `merchant-api-service@neon-vigil-395120.iam.gserviceaccount.com`
   - Select access level: **Admin** (required for API access)
   - Click "Save" or "Add"

#### Step 2: Wait for Propagation
- **Wait 5-10 minutes** for the permission changes to propagate through Google's systems
- During this time, the API may still return 400 errors

#### Step 3: Test the Fix
After waiting, test the API:
```bash
curl "https://merch-manager-backend-361151780407.us-central1.run.app/api/products?pageSize=1"
```

**Expected Success Response:**
```json
{
  "success": true,
  "data": {
    "products": [...],
    "nextPageToken": "..."
  }
}
```

#### Step 4: Verify Frontend Access
1. Open frontend: https://merch-manager-frontend-361151780407.us-central1.run.app
2. The product list should now load successfully
3. Product detail pages should work
4. Product editing should function properly

### 🔧 **Alternative Solutions**

#### Option 1: Verify Merchant Account ID
If adding the service account doesn't work, verify the merchant account ID:
1. Go to Google Merchant Center
2. Check the account ID in the URL or account settings
3. Update the `MERCHANT_ID` environment variable if different

#### Option 2: Create New Service Account
If the current service account has issues:
1. Create a new service account in Google Cloud Console
2. Download new credentials
3. Update the `google-credentials` secret in Cloud Run
4. Add the new service account to Merchant Center

#### Option 3: Use Different Merchant Account
If this merchant account is not accessible:
1. Use a different Google Merchant Center account
2. Update the `MERCHANT_ID` environment variable
3. Ensure the service account has access to the new account

### 📊 **Current Configuration**
- **Backend URL**: `https://merch-manager-backend-361151780407.us-central1.run.app`
- **Frontend URL**: `https://merch-manager-frontend-361151780407.us-central1.run.app`  
- **Service Account**: `merchant-api-service@neon-vigil-395120.iam.gserviceaccount.com`
- **Merchant ID**: `5591219286`
- **Project**: `neon-vigil-395120`

### 🚀 **Expected Outcome**
Once the service account is properly added to Google Merchant Center:
- Products API will return successful responses
- Frontend will display products from the merchant account
- Full product management functionality will be available
- All CRUD operations will work properly

### 📞 **Need Help?**
If these steps don't resolve the issue:
1. Double-check the merchant account ID is correct
2. Ensure you have admin access to the Google Merchant Center account
3. Verify the service account email is entered correctly
4. Wait longer for propagation (up to 24 hours in rare cases)

---
**Status**: ⏳ Waiting for Google Merchant Center permissions to be configured
**Next Action**: Add service account to Merchant Center account access
