# Merch Manager - AI-Enhanced Google Merchant Center Management

A comprehensive web application for managing Google Merchant Center products with AI-powered content generation, competitive pricing analysis, and advanced product management features.

## 🚀 Features

### Core Functionality
- **Product Management**: Complete CRUD operations for Google Merchant Center products
- **Google OAuth Authentication**: Secure login with Google accounts
- **Real-time Sync**: Direct integration with Google Merchant Center API
- **Bulk Operations**: Import, export, and bulk edit products via CSV
- **Advanced Search**: Filter and search products by multiple criteria

### AI-Powered Features
- **AI Content Generation**: Generate product titles, descriptions, and custom fields using Google Gemini
- **Grounded Sources**: AI-generated content backed by real web sources
- **Competitive Pricing**: AI-powered competitive price analysis with market research
- **Smart Categorization**: Automatic product categorization suggestions

### Advanced Features
- **Dynamic Custom Fields**: Create and manage custom product attributes
- **Review Management**: Customer review analysis and management
- **Field Update Analytics**: Track and analyze product field changes
- **Sync History**: Monitor synchronization status and history

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │  Google APIs    │
│   (React)       │◄──►│   (Express.js)  │◄──►│                 │
│   Cloud Run     │    │   Cloud Run     │    │  - OAuth 2.0    │
└─────────────────┘    └─────────────────┘    │  - Merchant API │
                                             │  - Gemini AI    │
                                             └─────────────────┘
```

### Backend Services
- **Authentication**: OAuth 2.0 with Google, JWT token management
- **Product API**: Full CRUD operations for products
- **AI Services**: Content generation and competitive analysis
- **File Management**: CSV import/export and bulk operations
- **Analytics**: Market research and pricing analysis

### Frontend Application
- **React 18**: Modern React with hooks and context
- **Material-UI**: Professional, responsive design
- **TypeScript**: Type-safe component development
- **Authentication**: OAuth integration with session management

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js with comprehensive middleware
- **Authentication**: Passport.js with Google OAuth 2.0, JWT tokens
- **Database**: Google Merchant Center API integration
- **AI/ML**: Google Gemini AI API for content generation
- **Deployment**: Google Cloud Run with auto-scaling
- **Security**: CORS, rate limiting, secure headers

### Frontend
- **Framework**: React 18 with TypeScript
- **UI Library**: Material-UI (MUI) v5
- **Build Tool**: Vite for fast development and optimized builds
- **State Management**: React Context API with custom hooks
- **HTTP Client**: Axios with request/response interceptors
- **Deployment**: Google Cloud Run with Nginx

### Infrastructure
- **Cloud Platform**: Google Cloud Platform
- **Container Registry**: Google Cloud Artifact Registry
- **Secrets Management**: Google Secret Manager
- **Monitoring**: Google Cloud Logging and monitoring
- **SSL/TLS**: Automatic HTTPS with Google Cloud Run

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Google Cloud CLI (`gcloud`) configured
- Docker (for containerization)
- Google Cloud Project with required APIs enabled

### Local Development

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd merch-manager
   ```

2. **Install dependencies**:
   ```bash
   # Backend
   npm install
   
   # Frontend
   cd web && npm install
   ```

3. **Set up environment variables**:
   ```bash
   # Backend - copy and edit .env file
   cp .env.example .env
   
   # Frontend - copy and edit .env file
   cd web && cp .env.example .env
   ```

4. **Start development servers**:
   ```bash
   # Backend (port 3001)
   npm run dev
   
   # Frontend (port 5173)
   cd web && npm run dev
   ```

### Production Deployment

The application is designed for Google Cloud Run deployment:

1. **Configure Google Cloud**:
   ```bash
   gcloud config set project YOUR_PROJECT_ID
   gcloud auth login
   ```

2. **Deploy backend**:
   ```bash
   npm run deploy:backend
   ```

3. **Deploy frontend**:
   ```bash
   npm run deploy:frontend
   ```

## 🔧 Configuration

### Required Google Cloud APIs
- Google Merchant API
- Google OAuth 2.0 API
- Google Gemini AI API
- Cloud Run API
- Cloud Build API
- Secret Manager API

### Environment Variables

#### Backend
- `GOOGLE_CLOUD_PROJECT_ID`: Your Google Cloud project ID
- `GOOGLE_MERCHANT_ID`: Google Merchant Center ID
- `GEMINI_API_KEY`: Google Gemini AI API key (stored in Secret Manager)
- `GOOGLE_OAUTH_CLIENT_ID`: Google OAuth client ID (stored in Secret Manager)
- `GOOGLE_OAUTH_CLIENT_SECRET`: Google OAuth client secret (stored in Secret Manager)
- `JWT_SECRET`: Secret for JWT token signing (stored in Secret Manager)
- `SESSION_SECRET`: Secret for session management (stored in Secret Manager)
- `FRONTEND_URL`: Frontend application URL

#### Frontend
- `VITE_API_BASE_URL`: Backend API base URL
- `VITE_APP_NAME`: Application name
- `VITE_API_TIMEOUT`: API request timeout

### Google OAuth Setup

1. **Create OAuth 2.0 credentials**:
   - Go to Google Cloud Console → APIs & Services → Credentials
   - Create OAuth 2.0 client ID for web application
   - Configure authorized redirect URIs:
     - `https://your-backend-url/auth/google/callback`

2. **Set up service account**:
   - Create service account with Merchant Center API permissions
   - Grant necessary roles for Cloud Run deployment

## 📊 API Documentation

### Authentication Endpoints
- `GET /auth/google` - Get Google OAuth authentication URL
- `GET /auth/google/callback` - Handle OAuth callback from Google
- `POST /auth/verify` - Verify JWT token validity
- `GET /auth/profile` - Get authenticated user profile
- `POST /auth/logout` - Logout user and invalidate session

### Product Management
- `GET /api/products` - List all products with pagination
- `GET /api/products/:id` - Get detailed product information
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update existing product
- `DELETE /api/products/:id` - Delete product

### AI Services
- `POST /api/ai-content` - Generate AI-powered content for products
- `POST /api/competitive-pricing` - Analyze competitive pricing

### File Operations
- `POST /api/csv/import` - Import products from CSV file
- `GET /api/csv/export` - Export products to CSV format

### Health and Monitoring
- `GET /api/health` - Application health check with OAuth status

## 🔒 Security Features

- **OAuth 2.0**: Secure authentication with Google accounts
- **JWT Tokens**: Stateless authentication for API access
- **CORS Protection**: Configured for production domains
- **Rate Limiting**: API rate limiting to prevent abuse
- **Input Validation**: Comprehensive request validation
- **HTTPS Only**: All communications encrypted in transit
- **Secret Management**: Sensitive data stored in Google Secret Manager
- **Session Security**: Secure session management and token handling

## 🧪 Testing

### Development Testing
```bash
# Backend tests
npm test

# Frontend tests
cd web && npm test
```

### OAuth Flow Testing
- Comprehensive OAuth debugging tools included
- Health check endpoints for monitoring
- Real-time logging for troubleshooting

## 📈 Performance Optimizations

- **Auto-scaling**: Cloud Run automatically scales based on demand
- **CDN**: Static assets optimized for fast delivery
- **Compression**: Gzip compression for all responses
- **Caching**: Appropriate cache headers for static resources
- **Build Optimization**: Production builds optimized for size and performance
- **Lazy Loading**: Components loaded on-demand

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -am 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Submit a pull request

### Development Guidelines
- Follow TypeScript best practices
- Write comprehensive tests for new features
- Update documentation for API changes
- Ensure all secrets are properly managed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support & Documentation

For support and questions:
- Create an issue in the GitHub repository
- Check the comprehensive documentation files
- Review deployment guides and troubleshooting docs

### Available Documentation
- `DEPLOYMENT_GUIDE.md` - Comprehensive deployment instructions
- `OAUTH_SETUP.md` - OAuth configuration guide
- `TROUBLESHOOTING.md` - Common issues and solutions

## 🌟 Roadmap

- [ ] Multi-tenant support for multiple merchants
- [ ] Advanced analytics dashboard with charts
- [ ] Mobile application for on-the-go management
- [ ] Third-party marketplace integrations (Amazon, eBay)
- [ ] Advanced AI features for market prediction
- [ ] Real-time notifications and alerts
- [ ] Advanced user roles and permissions
- [ ] Automated testing and CI/CD pipeline
- [ ] Performance monitoring and optimization
- [ ] Advanced search and filtering capabilities

---

**Built with ❤️ using modern web technologies and Google Cloud Platform**

*This application demonstrates enterprise-grade architecture, security best practices, and modern web development techniques suitable for production e-commerce environments.*
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
