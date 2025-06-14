#!/bin/bash

# Google Cloud Deployment Script for Merch Manager
# This script deploys both backend and frontend to Google Cloud Run

set -e

# Source Google Cloud SDK PATH
if [ -f "/opt/homebrew/share/google-cloud-sdk/path.zsh.inc" ]; then
    source /opt/homebrew/share/google-cloud-sdk/path.zsh.inc
fi

# Configuration
PROJECT_ID="neon-vigil-395120"
REGION="us-central1"
BACKEND_SERVICE_NAME="merch-manager-backend"
FRONTEND_SERVICE_NAME="merch-manager-frontend"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Google Cloud deployment for Merch Manager${NC}"

# Check if user is logged in to gcloud
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo -e "${RED}❌ Please log in to Google Cloud first: gcloud auth login${NC}"
    exit 1
fi

# Set the project
echo -e "${YELLOW}📋 Setting project to ${PROJECT_ID}${NC}"
gcloud config set project $PROJECT_ID

# Enable required APIs
echo -e "${YELLOW}🔌 Enabling required Google Cloud APIs${NC}"
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Create secret for Gemini API key
echo -e "${YELLOW}🔐 Creating secret for Gemini API key${NC}"
if ! gcloud secrets describe gemini-api-key --project=$PROJECT_ID >/dev/null 2>&1; then
    echo -n "Enter your Gemini API key: "
    read -s GEMINI_API_KEY
    echo
    echo -n "$GEMINI_API_KEY" | gcloud secrets create gemini-api-key --data-file=-
    echo -e "${GREEN}✅ Secret created successfully${NC}"
else
    echo -e "${GREEN}✅ Secret already exists${NC}"
fi

# Build and deploy backend
echo -e "${YELLOW}🏗️  Building and deploying backend...${NC}"
cd /Users/santhoshkumarsampangiramasetty/merch-manager/merch-manager

# Build backend Docker image
echo -e "${BLUE}📦 Building backend Docker image${NC}"
gcloud builds submit --tag us-central1-docker.pkg.dev/$PROJECT_ID/merch-manager/$BACKEND_SERVICE_NAME:latest .

# Deploy backend to Cloud Run
echo -e "${BLUE}🚀 Deploying backend to Cloud Run${NC}"
sed "s/PROJECT_ID/$PROJECT_ID/g" cloud-run-backend.yaml > cloud-run-backend-processed.yaml
gcloud run services replace cloud-run-backend-processed.yaml --region=$REGION

# Get backend URL
BACKEND_URL=$(gcloud run services describe $BACKEND_SERVICE_NAME --region=$REGION --format="value(status.url)")
echo -e "${GREEN}✅ Backend deployed at: $BACKEND_URL${NC}"

# Build and deploy frontend
echo -e "${YELLOW}🏗️  Building and deploying frontend...${NC}"
cd web

# Update frontend API URL
echo -e "${BLUE}🔧 Updating frontend API configuration${NC}"
# Create a temporary environment file for build
cat > .env.production << EOF
VITE_API_BASE_URL=$BACKEND_URL
VITE_API_TIMEOUT=30000
EOF

echo -e "${BLUE}📋 Frontend environment configuration:${NC}"
cat .env.production

# Build frontend Docker image
echo -e "${BLUE}📦 Building frontend Docker image${NC}"
gcloud builds submit --tag us-central1-docker.pkg.dev/$PROJECT_ID/merch-manager/$FRONTEND_SERVICE_NAME:latest .

# Deploy frontend to Cloud Run
echo -e "${BLUE}🚀 Deploying frontend to Cloud Run${NC}"
sed "s/PROJECT_ID/$PROJECT_ID/g" cloud-run-frontend.yaml > cloud-run-frontend-processed.yaml
gcloud run services replace cloud-run-frontend-processed.yaml --region=$REGION

# Get frontend URL
FRONTEND_URL=$(gcloud run services describe $FRONTEND_SERVICE_NAME --region=$REGION --format="value(status.url)")
echo -e "${GREEN}✅ Frontend deployed at: $FRONTEND_URL${NC}"

# Update backend CORS origin
echo -e "${BLUE}🔧 Updating backend CORS configuration${NC}"
cd ..
sed "s|https://merch-manager-frontend-PROJECT_ID.a.run.app|$FRONTEND_URL|g" cloud-run-backend.yaml > cloud-run-backend-final.yaml
gcloud run services replace cloud-run-backend-final.yaml --region=$REGION

# Clean up temporary files
rm -f cloud-run-backend-processed.yaml cloud-run-backend-final.yaml
rm -f web/cloud-run-frontend-processed.yaml web/.env.production

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${GREEN}📱 Frontend URL: $FRONTEND_URL${NC}"
echo -e "${GREEN}🔧 Backend URL: $BACKEND_URL${NC}"
echo -e "${YELLOW}📋 Note: It may take a few minutes for the services to be fully available${NC}"

# Optional: Open the frontend in browser
echo -e "${BLUE}🔗 Opening frontend in browser...${NC}"
open $FRONTEND_URL

echo -e "${GREEN}✅ Deployment script completed!${NC}"
