# 🔐 How to Update Service Account Key in Google Cloud

## 🚨 IMPORTANT: First, Revoke the Compromised Key

Since you accidentally shared your service account key, you must **immediately revoke it**:

### Step 1: Revoke the Compromised Service Account
```bash
# List all service accounts to find the compromised one
gcloud iam service-accounts list

# Delete the compromised service account (replace with your email)
gcloud iam service-accounts delete merchant-api-service@neon-vigil-395120.iam.gserviceaccount.com

# Or disable it temporarily
gcloud iam service-accounts disable merchant-api-service@neon-vigil-395120.iam.gserviceaccount.com
```

## 🔧 Step 2: Create a New Service Account

### 2.1 Create the Service Account
```bash
# Set your project ID
export PROJECT_ID="neon-vigil-395120"
gcloud config set project $PROJECT_ID

# Create new service account
gcloud iam service-accounts create merch-manager-new \
    --display-name="Merch Manager Service Account (New)" \
    --description="Service account for Merch Manager application"

# Get the new service account email
export SA_EMAIL="merch-manager-new@${PROJECT_ID}.iam.gserviceaccount.com"
echo "New Service Account: $SA_EMAIL"
```

### 2.2 Grant Required Permissions
```bash
# Grant Google Merchant Center permissions
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/content.admin"

# Grant additional permissions if needed
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/storage.objectViewer"

# If you need Secret Manager access
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/secretmanager.secretAccessor"
```

## 🔐 Step 3: Update Your Deployments

### 3.1 Update Google Cloud Run Services

#### Backend Service
```bash
# Update backend service to use new service account
gcloud run services update merch-manager-backend \
    --service-account=$SA_EMAIL \
    --region=us-central1

# If service doesn't exist, deploy with new service account
gcloud run deploy merch-manager-backend \
    --source . \
    --platform managed \
    --region us-central1 \
    --service-account=$SA_EMAIL \
    --set-env-vars GOOGLE_CLOUD_PROJECT_ID=$PROJECT_ID \
    --set-env-vars GOOGLE_MERCHANT_ID=5591219286 \
    --allow-unauthenticated
```

#### Frontend Service (if it needs service account access)
```bash
gcloud run services update merch-manager-frontend \
    --service-account=$SA_EMAIL \
    --region=us-central1
```

### 3.2 Verify the Update
```bash
# Check if the service account is properly assigned
gcloud run services describe merch-manager-backend \
    --region=us-central1 \
    --format="value(spec.template.spec.serviceAccountName)"
```

## 🔑 Step 4: Update Local Development (Optional)

### Option A: Use Application Default Credentials (Recommended)
```bash
# This uses your personal Google account for local development
gcloud auth application-default login
```

### Option B: Create Service Account Key for Local Development
⚠️ **Only if absolutely necessary for local development**

```bash
# Create a secure directory outside your project
mkdir -p ~/secure-credentials

# Generate new key file
gcloud iam service-accounts keys create ~/secure-credentials/merch-manager-key.json \
    --iam-account=$SA_EMAIL

# Set environment variable (add this to your ~/.zshrc or ~/.bashrc)
export GOOGLE_APPLICATION_CREDENTIALS=~/secure-credentials/merch-manager-key.json

# Apply the change
source ~/.zshrc  # or ~/.bashrc
```

### Create Local .env Files
```bash
# Backend .env
cd /path/to/your/merch-manager/project
cp .env.example .env

# Edit .env with these values (don't commit this file):
# GOOGLE_CLOUD_PROJECT_ID=neon-vigil-395120
# GOOGLE_MERCHANT_ID=5591219286
# GEMINI_API_KEY=your-new-gemini-api-key
# PORT=3001
# CORS_ORIGIN=http://localhost:5174

# Frontend .env
cd web
cp .env.example .env

# Edit web/.env with:
# VITE_API_BASE_URL=http://localhost:3001
# VITE_API_TIMEOUT=30000
# VITE_REQUEST_TIMEOUT=120000
```

## 🔄 Step 5: Update API Keys

### 5.1 Create New Gemini API Key
```bash
# Go to Google AI Studio
open "https://makersuite.google.com/app/apikey"

# Or use gcloud (if available)
gcloud services enable generativelanguage.googleapis.com
```

### 5.2 Store API Key Securely
```bash
# Option A: Use Secret Manager (Recommended for production)
echo "your-new-gemini-api-key" | gcloud secrets create gemini-api-key --data-file=-

# Grant service account access to the secret
gcloud secrets add-iam-policy-binding gemini-api-key \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/secretmanager.secretAccessor"

# Update Cloud Run to use the secret
gcloud run services update merch-manager-backend \
    --update-secrets=GEMINI_API_KEY=gemini-api-key:latest \
    --region=us-central1
```

## 🧪 Step 6: Test the Updates

### 6.1 Test Local Development
```bash
# Start backend
npm run dev

# In another terminal, start frontend
cd web
npm run dev

# Test the application at http://localhost:5174
```

### 6.2 Test Production Deployment
```bash
# Check backend logs
gcloud run services logs read merch-manager-backend --region=us-central1

# Test the deployed service
curl -X GET "https://merch-manager-backend-361151780407.us-central1.run.app/api/products"
```

## 🛡️ Step 7: Security Best Practices

### 7.1 Clean Up Old Keys
```bash
# List all keys for the old service account (if not deleted)
gcloud iam service-accounts keys list --iam-account=old-service-account@project.iam.gserviceaccount.com

# Delete specific keys
gcloud iam service-accounts keys delete KEY_ID --iam-account=old-service-account@project.iam.gserviceaccount.com
```

### 7.2 Set Up Key Rotation (Optional)
```bash
# Create a script to rotate keys monthly
cat > rotate-keys.sh << 'EOF'
#!/bin/bash
SA_EMAIL="merch-manager-new@neon-vigil-395120.iam.gserviceaccount.com"

# Create new key
gcloud iam service-accounts keys create new-key.json --iam-account=$SA_EMAIL

# Update your deployment with new key
# ... deployment commands ...

# Delete old key after verification
# gcloud iam service-accounts keys delete OLD_KEY_ID --iam-account=$SA_EMAIL
EOF

chmod +x rotate-keys.sh
```

## ✅ Verification Checklist

- [ ] Old compromised service account deleted/disabled
- [ ] New service account created with proper permissions
- [ ] Cloud Run services updated with new service account
- [ ] New Gemini API key generated and stored securely
- [ ] Local development environment configured (if needed)
- [ ] Both local and production environments tested
- [ ] Old service account keys removed
- [ ] Environment files are in .gitignore
- [ ] No credentials committed to git repository

## 🚨 Emergency Response for Future Incidents

If credentials are accidentally exposed again:

1. **Immediately disable/delete the exposed service account**
2. **Revoke all API keys associated with the project**
3. **Check Cloud Audit Logs for unauthorized access**
4. **Create new credentials following this guide**
5. **Update all deployments and local environments**
6. **Consider rotating all project secrets**

---

**Remember: Never share service account JSON files or API keys. Always use environment variables and secure secret management systems.**
