# 🔧 Deployment Troubleshooting Guide

## Issue: "Please check your internet connection and try again"

### Root Cause
You're currently authenticated with a **service account** instead of your personal Google account:
```
account = merchant-api-service@neon-vigil-395120.iam.gserviceaccount.com
```

Service accounts may not have the required permissions for Cloud Run deployment operations.

## 🚀 Solution

### Step 1: Fix Authentication
```bash
# Run this script to fix authentication
./fix-auth-and-deploy.sh
```

**OR manually:**
```bash
# Login with your personal Google account
gcloud auth login

# Set project and region
gcloud config set project neon-vigil-395120
gcloud config set run/region us-central1

# Verify it worked
gcloud auth list
```

### Step 2: Test Connection
```bash
# Test if you can list Cloud Run services
gcloud run services list --region=us-central1
```

### Step 3: Deploy Again
```bash
# Deploy backend
npm run deploy:backend

# Deploy frontend  
npm run deploy:frontend
```

## 🔍 Additional Troubleshooting

### If you still get connection errors:

1. **Check VPN/Firewall**
   - Disable VPN temporarily
   - Check corporate firewall settings
   - Ensure ports 443/80 are open

2. **Application Default Credentials**
   ```bash
   gcloud auth application-default login
   ```

3. **Clear gcloud cache**
   ```bash
   gcloud auth revoke --all
   gcloud auth login
   ```

4. **Network connectivity test**
   ```bash
   curl -I https://console.cloud.google.com
   ping cloud.google.com
   ```

5. **Alternative deployment method**
   ```bash
   # Use explicit flags
   gcloud run deploy merch-manager-backend \
     --source . \
     --region us-central1 \
     --project neon-vigil-395120 \
     --allow-unauthenticated
   ```

## 🎯 Expected Results After Fix

After running `./fix-auth-and-deploy.sh`, you should see:
- ✅ Your personal email in `gcloud auth list`
- ✅ Project set to `neon-vigil-395120`
- ✅ Region set to `us-central1`
- ✅ Successful connection to Cloud Run API

## 🚨 Common Issues

### Issue: "Permission denied"
**Solution**: Make sure your Google account has Cloud Run Admin role

### Issue: "Project not found"
**Solution**: Verify project ID is correct: `neon-vigil-395120`

### Issue: "API not enabled"
**Solution**: Enable Cloud Run API:
```bash
gcloud services enable run.googleapis.com
```

### Issue: "Quota exceeded"
**Solution**: Check Cloud Run quotas in Google Cloud Console

## ✅ Success Indicators

Your deployment is successful when you see:
```
Service [merch-manager-backend] revision [xxx] has been deployed
Service URL: https://merch-manager-backend-xxx.us-central1.run.app
```

After deployment, test your endpoints:
- Backend: `https://merch-manager-backend-xxx.us-central1.run.app/api/health`
- Frontend: `https://merch-manager-frontend-xxx.us-central1.run.app`
