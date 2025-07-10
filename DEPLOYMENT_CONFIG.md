# Deployment Configuration

This file contains the configuration values you need to customize for your deployment.

## Required Configuration

### Google Cloud Project
- `YOUR_PROJECT_ID`: Your Google Cloud Project ID
- `YOUR_MERCHANT_ID`: Your Google Merchant Center ID
- `REGION`: Your preferred Google Cloud region (e.g., us-central1)

### Service Account
- `YOUR_SERVICE_ACCOUNT`: Name of your service account for Cloud Run
  - Format: `service-name@YOUR_PROJECT_ID.iam.gserviceaccount.com`

### Container Images
- Backend: `REGION-docker.pkg.dev/YOUR_PROJECT_ID/merch-manager/backend:latest`
- Frontend: `REGION-docker.pkg.dev/YOUR_PROJECT_ID/merch-manager/frontend:latest`

### URLs (Generated after deployment)
- `YOUR_BACKEND_URL`: Backend Cloud Run service URL
- `YOUR_FRONTEND_URL`: Frontend Cloud Run service URL

## Configuration Steps

1. **Replace placeholders in cloud-run-backend.yaml**:
   - `YOUR_PROJECT_ID` → Your actual project ID
   - `YOUR_MERCHANT_ID` → Your Merchant Center ID  
   - `YOUR_SERVICE_ACCOUNT` → Your service account name
   - `REGION-docker.pkg.dev/YOUR_PROJECT_ID` → Your artifact registry path
   - `YOUR_BACKEND_URL` → Your backend service URL (after initial deployment)
   - `YOUR_FRONTEND_URL` → Your frontend service URL (after initial deployment)

2. **Replace placeholders in web/cloud-run-frontend.yaml**:
   - `YOUR_PROJECT_ID` → Your actual project ID
   - `REGION-docker.pkg.dev/YOUR_PROJECT_ID` → Your artifact registry path
   - `YOUR_BACKEND_URL` → Your backend service URL

3. **Set up Google Secret Manager secrets**:
   ```bash
   gcloud secrets create google-oauth-client-id
   gcloud secrets create google-oauth-client-secret
   gcloud secrets create jwt-secret
   gcloud secrets create session-secret
   gcloud secrets create gemini-api-key
   ```

4. **Add secret values**:
   ```bash
   echo "YOUR_OAUTH_CLIENT_ID" | gcloud secrets versions add google-oauth-client-id --data-file=-
   echo "YOUR_OAUTH_CLIENT_SECRET" | gcloud secrets versions add google-oauth-client-secret --data-file=-
   echo "YOUR_JWT_SECRET" | gcloud secrets versions add jwt-secret --data-file=-
   echo "YOUR_SESSION_SECRET" | gcloud secrets versions add session-secret --data-file=-
   echo "YOUR_GEMINI_API_KEY" | gcloud secrets versions add gemini-api-key --data-file=-
   ```

## Environment Variables Reference

### Backend (cloud-run-backend.yaml)
- `GOOGLE_CLOUD_PROJECT_ID`: Your Google Cloud project ID
- `GOOGLE_MERCHANT_ID`: Your Google Merchant Center ID
- `CORS_ORIGIN`: Frontend URL for CORS
- `GOOGLE_REDIRECT_URI`: OAuth callback URL
- `FRONTEND_URL`: Frontend URL for OAuth redirects

### Frontend (web/cloud-run-frontend.yaml)
- `VITE_API_BASE_URL`: Backend API URL
- `VITE_APP_NAME`: Application display name

## Security Notes

- Never commit actual secrets to version control
- Use Google Secret Manager for all sensitive data
- Ensure OAuth redirect URIs are properly configured in Google Cloud Console
- Verify service account has appropriate permissions for Merchant Center API

## Deployment Commands

After configuration:

1. **Deploy backend**:
   ```bash
   npm run deploy:backend
   ```

2. **Deploy frontend**:
   ```bash
   npm run deploy:frontend
   ```
