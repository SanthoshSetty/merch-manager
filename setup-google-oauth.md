# Google OAuth Setup Guide

## Issue
The current OAuth client ID stored in Google Secret Manager is not recognized by Google, causing the error:
```
Error 401: invalid_client
The OAuth client was not found.
```

## Solution Steps

### 1. Create a Google OAuth 2.0 Client
1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services > Credentials**
3. Click **+ CREATE CREDENTIALS > OAuth 2.0 Client IDs**
4. Choose **Web application** as the application type
5. Set the name to `Merch Manager OAuth Client`

### 2. Configure Authorized Redirect URIs
Add these redirect URIs:
```
https://merch-manager-backend-361151780407.us-central1.run.app/auth/google/callback
http://localhost:3001/auth/google/callback
```

### 3. Configure Authorized JavaScript Origins
Add these origins:
```
https://merch-manager-frontend-361151780407.us-central1.run.app
http://localhost:5173
```

### 4. Update Secrets with New Credentials
After creating the OAuth client, you'll get:
- Client ID (looks like: `123456789-abcdefghijk.apps.googleusercontent.com`)
- Client Secret (looks like: `GOCSPX-abcdefghijklmnop`)

Update the secrets:
```bash
# Update client ID
echo "YOUR_NEW_CLIENT_ID" | gcloud secrets versions add google-oauth-client-id --data-file=-

# Update client secret
echo "YOUR_NEW_CLIENT_SECRET" | gcloud secrets versions add google-oauth-client-secret --data-file=-
```

### 5. Restart Backend Service
After updating secrets, restart the backend:
```bash
gcloud run services update merch-manager-backend --region=us-central1
```

## Current Backend Status
✅ Backend is running: https://merch-manager-backend-361151780407.us-central1.run.app
✅ OAuth configuration is loaded
❌ OAuth client ID is invalid/not found

## Test After Setup
1. Visit the frontend: https://merch-manager-frontend-361151780407.us-central1.run.app
2. Click "Sign in with Google"
3. Should redirect to Google OAuth consent screen
4. After consent, should redirect back with success
