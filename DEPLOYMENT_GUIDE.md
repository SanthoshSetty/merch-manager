# 🚀 Google Cloud Deployment Guide

## Prerequisites

1. **Google Cloud CLI installed and authenticated**
   ```bash
   gcloud auth login
   gcloud config set project neon-vigil-395120
   ```

2. **Required APIs enabled**
   - Cloud Run API
   - Secret Manager API  
   - Artifact Registry API

## Step 1: Set Up OAuth Credentials

### 1.1 Get OAuth Credentials
1. Go to [Google Cloud Console → APIs & Services → Credentials](https://console.cloud.google.com/apis/credentials)
2. Create OAuth 2.0 Client ID (if not already created)
3. Set authorized redirect URIs:
   - `https://merch-manager-backend-361151780407.us-central1.run.app/auth/google/callback`
4. Note down:
   - Client ID
   - Client Secret

### 1.2 Create Secrets in Secret Manager
```bash
# Run the setup script for instructions
./setup-oauth-secrets.sh

# Or create manually:
echo "YOUR_CLIENT_ID" | gcloud secrets create google-oauth-client-id --data-file=-
echo "YOUR_CLIENT_SECRET" | gcloud secrets create google-oauth-client-secret --data-file=-
echo "$(openssl rand -base64 32)" | gcloud secrets create jwt-secret --data-file=-
echo "$(openssl rand -base64 32)" | gcloud secrets create session-secret --data-file=-
```

### 1.3 Grant Service Account Access
```bash
# Grant access to all OAuth secrets
for secret in google-oauth-client-id google-oauth-client-secret jwt-secret session-secret; do
  gcloud secrets add-iam-policy-binding $secret \
    --member='serviceAccount:merchant-api-service@neon-vigil-395120.iam.gserviceaccount.com' \
    --role='roles/secretmanager.secretAccessor'
done
```

## Step 2: Deploy to Cloud Run

### Option A: Use the deployment script
```bash
./deploy-all.sh
```

### Option B: Deploy manually

#### Deploy Backend
```bash
# Build and deploy backend
npm run build
gcloud run deploy merch-manager-backend \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 2Gi \
  --cpu 2 \
  --timeout 300 \
  --service-account merchant-api-service@neon-vigil-395120.iam.gserviceaccount.com
```

#### Deploy Frontend  
```bash
# Build and deploy frontend
cd web && npm run build && cd ..
gcloud run deploy merch-manager-frontend \
  --source ./web \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1
```

## Step 3: Post-Deployment Configuration

### 3.1 Update OAuth Redirect URIs
After deployment, update your Google OAuth app redirect URIs:
- `https://merch-manager-backend-361151780407.us-central1.run.app/auth/google/callback`

### 3.2 Test OAuth Flow
1. Visit: `https://merch-manager-frontend-361151780407.us-central1.run.app`
2. Click "Sign in with Google"
3. Complete OAuth flow
4. Verify you can access protected features

## Step 4: Verify Deployment

### Check Backend Health
```bash
curl https://merch-manager-backend-361151780407.us-central1.run.app/api/health
```

### Check Frontend
```bash
curl https://merch-manager-frontend-361151780407.us-central1.run.app
```

## 🔧 Configuration Files

- **Backend Config**: `cloud-run-backend.yaml`
- **Frontend Config**: `web/cloud-run-frontend.yaml`
- **Environment Variables**: Set in the YAML files

## 🔐 Security Features

✅ **OAuth 2.0 with Google**
✅ **JWT-based authentication**
✅ **All API endpoints protected**
✅ **Secrets stored in Secret Manager**
✅ **Service account authentication**
✅ **HTTPS-only communication**

## 🎯 URLs After Deployment

- **Frontend**: https://merch-manager-frontend-361151780407.us-central1.run.app
- **Backend**: https://merch-manager-backend-361151780407.us-central1.run.app
- **Health Check**: https://merch-manager-backend-361151780407.us-central1.run.app/api/health

## 🐛 Troubleshooting

### Common Issues:
1. **OAuth errors**: Check redirect URIs match exactly
2. **Secret access**: Verify service account has Secret Manager access
3. **CORS errors**: Check CORS_ORIGIN environment variable
4. **Build errors**: Ensure `npm run build` works locally

### Check Logs:
```bash
# Backend logs
gcloud run services logs read merch-manager-backend --region us-central1

# Frontend logs  
gcloud run services logs read merch-manager-frontend --region us-central1
```

## 🎉 You're Ready!

Your Merch Manager application is now deployed with full OAuth authentication!
