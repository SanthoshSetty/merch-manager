# Merch Manager - AI-Enhanced Google Merchant Center Management

A comprehensive web application for managing Google Merchant Center products with AI-powered content generation, competitive pricing analysis, and advanced product management features.

## 🚀 Features

### Core Functionality
- **Product Management**: Complete CRUD operations for Google Merchant Center products
- **Real-time Sync**: Direct integration with Google Merchant Center API
- **Bulk Operations**: Import, export, and bulk edit products
- **Advanced Search**: Filter and search products by multiple criteria

### AI-Powered Features
- **AI Content Generation**: Generate product titles, descriptions, and custom fields using Google Gemini
- **Grounded Sources**: AI-generated content backed by real web sources
- **Competitive Pricing**: AI-powered competitive price analysis
- **Smart Categorization**: Automatic product categorization suggestions

### Advanced Features
- **Dynamic Custom Fields**: Create and manage custom product attributes
- **Multi-country Support**: Manage products for different markets
- **Review Integration**: Access and manage product reviews
- **Analytics Dashboard**: Track product performance and insights

## 🏗️ Architecture

### Backend (Node.js/TypeScript)
- **Express.js**: REST API server
- **Google Merchant Center API**: Direct product management
- **Google Gemini AI**: Content generation with grounding
- **Python Scripts**: AI processing and analysis
- **Docker**: Containerized deployment

### Frontend (React/TypeScript)
- **Vite**: Modern build tool and dev server
- **Material-UI**: Professional UI components
- **React Query**: Efficient data fetching and caching
- **TypeScript**: Type-safe development

### Deployment
- **Google Cloud Run**: Serverless container deployment
- **Google Secret Manager**: Secure API key management
- **Docker**: Multi-stage builds for optimization
- **Nginx**: Production web server for frontend

## 📋 Prerequisites

- Node.js 18+
- Python 3.8+
- Google Cloud Project with enabled APIs:
  - Merchant API
  - Generative AI API
  - Secret Manager API
- Google Merchant Center account

## 🛠️ Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd merch-manager
```

### 2. Backend Setup
```bash
# Install dependencies
npm install
pip install -r requirements.txt

# Environment configuration
cp .env.example .env
# Edit .env with your configuration
```

### 3. Frontend Setup
```bash
cd web
npm install

# Environment configuration
cp .env.example .env
# Edit .env with your configuration (DO NOT commit this file!)
```

### 4. Google Cloud Setup

⚠️ **SECURITY WARNING**: Never commit service account keys or API keys to version control!

```bash
# Authenticate with Google Cloud
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# Create secrets in Google Secret Manager (RECOMMENDED for production)
gcloud secrets create gemini-api-key --data-file=<(echo "YOUR_GEMINI_API_KEY")
# For service account authentication, use Google Cloud Run service accounts instead of JSON keys
```

**For Local Development Only:**
- Create a service account in Google Cloud Console
- Download the JSON key file (store it outside the repository)
- Set `GOOGLE_APPLICATION_CREDENTIALS` to point to the key file
- Never commit this file to git

**For Production:**
- Use Google Cloud Run service accounts (recommended)
- Store secrets in Google Secret Manager
- Use IAM roles instead of service account keys

## 🚀 Development

### Start Backend
```bash
npm run dev
```

### Start Frontend
```bash
cd web
npm run dev
```

The application will be available at:
- Backend: http://localhost:3001
- Frontend: http://localhost:5173

## 📦 Deployment

### Deploy to Google Cloud Run
```bash
# Make script executable
chmod +x deploy-to-gcloud.sh

# Deploy both backend and frontend
./deploy-to-gcloud.sh
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```bash
# Application
NODE_ENV=development
APP_NAME=merch-manager-backend
APP_VERSION=1.0.0

# Google Cloud
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_MERCHANT_ID=your-merchant-id
GEMINI_API_KEY=your-gemini-api-key

# Server
PORT=3001
CORS_ORIGIN=http://localhost:5173
```

#### Frontend (web/.env)
```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:3001
VITE_API_TIMEOUT=30000

# Application
VITE_APP_NAME=Merch Manager
VITE_ENVIRONMENT=development

# Google Cloud
VITE_GOOGLE_CLOUD_PROJECT_ID=your-project-id
VITE_GOOGLE_MERCHANT_ID=your-merchant-id
```

## 🔒 Security

⚠️ **IMPORTANT SECURITY NOTICE** ⚠️

This repository has been cleaned of sensitive credentials after they were accidentally exposed. If you're setting up this project:

### What NOT to do:
- ❌ Never commit `.env` files with real API keys
- ❌ Never commit service account JSON key files  
- ❌ Never hardcode credentials in source code
- ❌ Never commit credentials to public repositories

### Best Practices:
- ✅ Use `.env.example` files for documentation
- ✅ Add `.env` and `credentials/` to `.gitignore`
- ✅ Use Google Cloud Run service accounts for production
- ✅ Store secrets in Google Secret Manager
- ✅ Regularly rotate API keys and service accounts
- ✅ Use IAM roles with least privilege principle

### If credentials are compromised:
1. Immediately revoke the exposed credentials in Google Cloud Console
2. Create new service accounts and API keys
3. Update your deployment with new credentials
4. Consider using `git filter-branch` to remove sensitive data from git history

## 🧪 Testing

### Backend Tests
```bash
npm test
```

### Frontend Tests
```bash
cd web
npm test
```

### Integration Tests
```bash
npm run test:integration
```

## 📖 API Documentation

### Product Endpoints
- `GET /api/products` - List products
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### AI Endpoints
- `POST /api/ai/generate-content` - Generate AI content
- `POST /api/ai/competitive-pricing` - Analyze competitive pricing
- `GET /api/ai/grounded-sources` - Get grounded sources

### Health Endpoints
- `GET /health` - Health check
- `GET /ready` - Readiness check

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation in the `/docs` folder
- Review the troubleshooting guide

## 🏷️ Version History

- **v1.0.0**: Initial release with core functionality
- **v1.1.0**: Added AI content generation
- **v1.2.0**: Added competitive pricing analysis
- **v1.3.0**: Added dynamic custom fields
- **v1.4.0**: Enhanced UI and performance optimizations

---

Built with ❤️ using Google Cloud Platform, React, and Node.js
