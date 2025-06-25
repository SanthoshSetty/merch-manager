#!/bin/bash

# 🔐 Quick Service Account Update Script
# Run this script to quickly update your service account after credential exposure

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${RED}🚨 EMERGENCY SERVICE ACCOUNT UPDATE SCRIPT 🚨${NC}"
echo -e "${YELLOW}This script will help you update your compromised service account${NC}"
echo ""

# Configuration
PROJECT_ID="neon-vigil-395120"
OLD_SA_EMAIL="merchant-api-service@neon-vigil-395120.iam.gserviceaccount.com"
NEW_SA_NAME="merch-manager-secure-$(date +%Y%m%d)"
NEW_SA_EMAIL="${NEW_SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
REGION="us-central1"

echo -e "${YELLOW}Configuration:${NC}"
echo "Project ID: $PROJECT_ID"
echo "Old Service Account: $OLD_SA_EMAIL"
echo "New Service Account: $NEW_SA_EMAIL"
echo ""

read -p "Do you want to continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

# Step 1: Set project
echo -e "${GREEN}Step 1: Setting up Google Cloud project...${NC}"
gcloud config set project $PROJECT_ID

# Step 2: Disable old service account
echo -e "${GREEN}Step 2: Disabling compromised service account...${NC}"
gcloud iam service-accounts disable $OLD_SA_EMAIL 2>/dev/null || echo "Service account already disabled or doesn't exist"

# Step 3: Create new service account
echo -e "${GREEN}Step 3: Creating new service account...${NC}"
gcloud iam service-accounts create $NEW_SA_NAME \
    --display-name="Merch Manager Service Account (Secure)" \
    --description="Secure service account created after credential exposure incident"

# Step 4: Grant permissions
echo -e "${GREEN}Step 4: Granting necessary permissions...${NC}"
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${NEW_SA_EMAIL}" \
    --role="roles/content.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${NEW_SA_EMAIL}" \
    --role="roles/secretmanager.secretAccessor"

# Step 5: Update Cloud Run services
echo -e "${GREEN}Step 5: Updating Cloud Run services...${NC}"

# Update backend
echo "Updating backend service..."
gcloud run services update merch-manager-backend \
    --service-account=$NEW_SA_EMAIL \
    --region=$REGION 2>/dev/null || echo "Backend service not found, will need manual deployment"

# Update frontend (if it exists)
echo "Updating frontend service..."
gcloud run services update merch-manager-frontend \
    --service-account=$NEW_SA_EMAIL \
    --region=$REGION 2>/dev/null || echo "Frontend service not found, will need manual deployment"

# Step 6: Verification
echo -e "${GREEN}Step 6: Verifying updates...${NC}"
echo "Checking backend service account:"
gcloud run services describe merch-manager-backend \
    --region=$REGION \
    --format="value(spec.template.spec.serviceAccountName)" 2>/dev/null || echo "Backend service not found"

echo "Checking frontend service account:"
gcloud run services describe merch-manager-frontend \
    --region=$REGION \
    --format="value(spec.template.spec.serviceAccountName)" 2>/dev/null || echo "Frontend service not found"

# Step 7: Generate local credentials (optional)
echo ""
echo -e "${YELLOW}Do you need to create a service account key for local development?${NC}"
echo -e "${RED}WARNING: Only do this if you absolutely need it for local development${NC}"
read -p "Create local key file? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${GREEN}Creating secure local credentials...${NC}"
    
    # Create secure directory
    mkdir -p ~/secure-credentials
    chmod 700 ~/secure-credentials
    
    # Generate key file
    gcloud iam service-accounts keys create ~/secure-credentials/merch-manager-key.json \
        --iam-account=$NEW_SA_EMAIL
    
    echo -e "${GREEN}✅ Key file created at: ~/secure-credentials/merch-manager-key.json${NC}"
    echo -e "${YELLOW}Add this to your shell profile:${NC}"
    echo "export GOOGLE_APPLICATION_CREDENTIALS=~/secure-credentials/merch-manager-key.json"
    echo ""
    echo -e "${RED}REMEMBER: Never commit this file to git!${NC}"
fi

# Step 8: Summary
echo ""
echo -e "${GREEN}✅ Service Account Update Complete!${NC}"
echo ""
echo -e "${YELLOW}Summary of changes:${NC}"
echo "- Old service account disabled: $OLD_SA_EMAIL"
echo "- New service account created: $NEW_SA_EMAIL"
echo "- Cloud Run services updated (if they existed)"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Create new Gemini API key at: https://makersuite.google.com/app/apikey"
echo "2. Update your local .env files with new credentials"
echo "3. Test your application locally and in production"
echo "4. Delete the old service account once everything is working:"
echo "   gcloud iam service-accounts delete $OLD_SA_EMAIL"
echo ""
echo -e "${RED}Security reminders:${NC}"
echo "- Never share service account JSON files"
echo "- Never commit .env files to git"
echo "- Use Secret Manager for production secrets"
echo "- Regularly rotate your credentials"
echo ""
echo -e "${GREEN}🔐 Stay secure! 🔐${NC}"
