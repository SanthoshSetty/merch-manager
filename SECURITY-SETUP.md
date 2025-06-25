# 🔐 Secure Credentials Setup Guide

## ⚠️ NEVER commit or share service account keys publicly!

## 1. Create New Google Cloud Service Account

```bash
# Set your project
gcloud config set project neon-vigil-395120

# Create service account
gcloud iam service-accounts create merch-manager-sa \
    --display-name="Merch Manager Service Account"

# Get the service account email
SA_EMAIL="merch-manager-sa@neon-vigil-395120.iam.gserviceaccount.com"

# Grant necessary permissions
gcloud projects add-iam-policy-binding neon-vigil-395120 \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/content.admin"
```

## 2. For Local Development (SECURE METHOD)

### Option A: Use Application Default Credentials (Recommended)
```bash
# Authenticate your local environment
gcloud auth application-default login
```

### Option B: Service Account Key (if needed)
```bash
# Create key file (keep it OUTSIDE your project directory)
gcloud iam service-accounts keys create ~/secure-keys/merch-manager-key.json \
    --iam-account=merch-manager-sa@neon-vigil-395120.iam.gserviceaccount.com

# Set environment variable (add to your shell profile)
export GOOGLE_APPLICATION_CREDENTIALS=~/secure-keys/merch-manager-key.json
```

## 3. Create Local Environment Files

### Backend .env (create this file, don't commit it)
```bash
# Copy the example
cp .env.example .env

# Edit with your values (KEEP THIS FILE LOCAL ONLY)
# .env content:
GOOGLE_CLOUD_PROJECT_ID=neon-vigil-395120
GOOGLE_MERCHANT_ID=5591219286
GEMINI_API_KEY=your-new-gemini-key
MERCHANT_API_BASE_URL=https://merchantapi.googleapis.com
MERCHANT_API_VERSION=v1beta
REQUIRED_SCOPES=https://www.googleapis.com/auth/content
PORT=3001
CORS_ORIGIN=http://localhost:5174
```

### Frontend .env (create this file, don't commit it)
```bash
# Copy the example
cd web
cp .env.example .env

# Edit with your values
# web/.env content:
VITE_API_BASE_URL=http://localhost:3001
VITE_API_TIMEOUT=30000
VITE_REQUEST_TIMEOUT=120000
VITE_APP_NAME=Merch Manager
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=development
```

## 4. For Production (Google Cloud Run)

### Option A: Use Cloud Run Service Account (Recommended)
```bash
# Assign the service account to your Cloud Run service
gcloud run services update merch-manager-backend \
    --service-account=merch-manager-sa@neon-vigil-395120.iam.gserviceaccount.com \
    --region=us-central1
```

### Option B: Use Secret Manager
```bash
# Store secrets securely
echo "your-gemini-api-key" | gcloud secrets create gemini-api-key --data-file=-
gcloud run services update merch-manager-backend \
    --update-env-vars GEMINI_API_KEY="projects/neon-vigil-395120/secrets/gemini-api-key/versions/latest" \
    --region=us-central1
```

## 5. Update Deployed Services

### Backend
```bash
cd /path/to/your/project
gcloud run deploy merch-manager-backend \
    --source . \
    --platform managed \
    --region us-central1 \
    --service-account=merch-manager-sa@neon-vigil-395120.iam.gserviceaccount.com \
    --set-env-vars GOOGLE_CLOUD_PROJECT_ID=neon-vigil-395120,GOOGLE_MERCHANT_ID=5591219286 \
    --allow-unauthenticated
```

### Frontend
```bash
cd web
gcloud run deploy merch-manager-frontend \
    --source . \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated
```

## 6. Get New Gemini API Key

1. Go to: https://makersuite.google.com/app/apikey
2. Create new API key for project: neon-vigil-395120
3. Store it securely (don't share it)

## ✅ Security Checklist

- [ ] Revoked the exposed service account key
- [ ] Created new service account
- [ ] Set up local .env files (not committed)
- [ ] Updated Cloud Run services with new service account
- [ ] Generated new Gemini API key
- [ ] Verified .gitignore excludes sensitive files
- [ ] Tested both local and production deployments

## 🚫 What NOT to do

- ❌ Don't post service account JSON in chat/email
- ❌ Don't commit .env files
- ❌ Don't hardcode credentials in code
- ❌ Don't use the same credentials after exposure
- ❌ Don't share API keys via messaging platforms
