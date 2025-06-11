# Google Merchant API Field Update Interface

A comprehensive Google Merchant API management interface with real-time field-level synchronization capabilities. This full-stack TypeScript application enables merchants to manage their Google Merchant Center products with instant field updates and advanced UI features.

![Google Merchant API Manager](https://img.shields.io/badge/Google%20Merchant%20API-Manager-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)
![React](https://img.shields.io/badge/React-19.1-blue)
![Material--UI](https://img.shields.io/badge/Material--UI-7.1-blue)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)

## 🎯 Features

### Real-time Field Synchronization
- **Instant Updates**: Debounced field updates with visual feedback
- **Sync Status**: Real-time indicators showing sync progress, success, and errors
- **Smart Validation**: Client and server-side field validation
- **Error Recovery**: Comprehensive error handling with retry mechanisms

### Advanced Dashboard
- **Bulk Operations**: Multi-product field updates with progress tracking
- **Analytics**: Performance metrics and update history
- **History Tracking**: Detailed sync history with success/failure logs
- **Responsive Design**: Mobile-first design with Material-UI components

### Google Merchant API Integration
- **Field-level Updates**: Precise field targeting with minimal API calls
- **Bulk Updates**: Efficient batch operations for multiple products
- **Authentication**: Secure Google Cloud service account integration
- **Rate Limiting**: Built-in API rate limiting and error handling

## 🏗️ Architecture

```
├── Backend (Node.js + Express + TypeScript)
│   ├── Google Merchant API integration
│   ├── Field-level update endpoints
│   ├── Authentication management
│   └── Real-time sync capabilities
│
└── Frontend (React + TypeScript + Vite + Material-UI v7)
    ├── Real-time field synchronization
    ├── Advanced dashboard with analytics
    ├── Form-based product management
    └── Beautiful animations and feedback
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Google Cloud Project with Merchant API enabled (for full functionality)
- Google Merchant Center account (for full functionality)
- Service account with proper permissions (for full functionality)

### 1. Clone and Install
```bash
git clone <repository-url>
cd merch-manager
npm install
cd web && npm install && cd ..
```

### 2. Start Development (Demo Mode)
```bash
# Start both backend and frontend in demo mode
npm run dev:all

# Or start individually
npm run dev          # Backend only (port 3001)
npm run web:dev      # Frontend only (port 5173)
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

### 3. Google Cloud Setup (Optional - for full functionality)

#### Enable APIs
```bash
gcloud services enable merchantapi.googleapis.com
gcloud services enable content.googleapis.com
```

#### Create Service Account
```bash
gcloud iam service-accounts create merchant-api-service \
  --display-name="Merchant API Service Account"

gcloud iam service-accounts keys create credentials/service-account-key.json \
  --iam-account=merchant-api-service@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

#### Grant Merchant Center Access
1. Go to [Google Merchant Center](https://merchants.google.com/)
2. Settings > Account Access
3. Add service account email with "Admin" access

### 3. Environment Configuration
Copy the template and fill in your values:
```bash
cp .env .env.local
# Edit .env.local with your configuration
```

Required environment variables:
```env
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=./credentials/service-account-key.json
GOOGLE_MERCHANT_ID=your-merchant-id
PORT=3001
CORS_ORIGIN=http://localhost:5173
```

### 4. Start Development
```bash
# Start both backend and frontend
npm run dev:all

# Or start individually
npm run dev          # Backend only
npm run web:dev      # Frontend only
```

## 📋 Current Status

### ✅ Completed Features
- **Full-stack Architecture**: Complete TypeScript setup with Node.js backend and React frontend
- **Material-UI Integration**: Modern UI with Material-UI v7 components
- **Product Form Interface**: Comprehensive product management form with all essential fields
- **Development Environment**: Full development setup with hot reloading
- **API Structure**: RESTful API endpoints for product management
- **Authentication Framework**: Google Cloud service account integration structure
- **Field Validation**: Client-side and server-side validation patterns
- **Responsive Design**: Mobile-first responsive layout

### 🚧 Demo Mode (Current State)
The application is currently running in **demo mode** with the following functionality:
- Interactive product form with Material-UI components
- Real-time field updates (local state only)
- Beautiful UI with theming and animations
- Responsive design that works on all devices
- Complete backend API structure ready for Google Merchant integration

### 🔧 Next Steps for Full Functionality
To enable full Google Merchant Center integration:
1. Configure Google Cloud credentials (see setup section below)
2. Enable Google Merchant API in your project
3. Set up service account permissions
4. Configure environment variables with your merchant details

## 📋 API Reference

### Field Update Endpoints

#### Update Single Field
```http
PATCH /api/products/{productId}/fields
Content-Type: application/json

{
  "updates": {
    "title": "New Product Title",
    "price": "29.99"
  },
  "updateMask": "attributes.title,attributes.price"
}
```

#### Bulk Field Updates
```http
PATCH /api/products/bulk-fields
Content-Type: application/json

{
  "operations": [
    {
      "productId": "product-1",
      "updates": { "price": "19.99" },
      "updateMask": "attributes.price"
    },
    {
      "productId": "product-2", 
      "updates": { "availability": "out_of_stock" },
      "updateMask": "attributes.availability"
    }
  ]
}
```

#### Get Product
```http
GET /api/products/{productId}
```

#### List Products
```http
GET /api/products?pageSize=25&pageToken=optional
```

## 🎨 Frontend Components

### SyncableField
Real-time field synchronization with visual feedback:

```tsx
import SyncableField from './components/SyncableField';
import { useFieldUpdate } from './hooks/useFieldUpdate';

function ProductForm({ productId }) {
  const fieldUpdate = useFieldUpdate(productId);
  
  return (
    <SyncableField
      fullWidth
      label="Product Title"
      fieldPath="title"
      value={title}
      onChange={(value) => handleFieldChange('title', value, 'Product Title')}
      fieldState={fieldUpdate.getFieldState('title')}
      syncLabel="Title"
    />
  );
}
```

### FieldUpdateDashboard
Advanced dashboard with bulk operations and analytics:

```tsx
import FieldUpdateDashboard from './components/FieldUpdateDashboard';

function App() {
  return (
    <FieldUpdateDashboard productId="product-123">
      <ProductForm productId="product-123" />
    </FieldUpdateDashboard>
  );
}
```

## 🔧 Field Mappings

| Form Field | API Field Path | Description |
|------------|----------------|-------------|
| `title` | `attributes.title` | Product title |
| `description` | `attributes.description` | Product description |
| `price` | `attributes.price` | Product price |
| `availability` | `attributes.availability` | Stock availability |
| `condition` | `attributes.condition` | Product condition |
| `brand` | `attributes.brand` | Brand name |
| `gtin` | `attributes.gtin` | Global Trade Item Number |
| `mpn` | `attributes.mpn` | Manufacturer Part Number |

## 🛠️ Development

### Project Structure
```
merch-manager/
├── src/                          # Backend source
│   ├── server.ts                # Main server file
│   ├── auth/
│   │   └── MerchantAuth.ts      # Google authentication
│   └── modules/
│       └── products/
│           └── ProductsClient.ts # Products API client
├── web/                         # Frontend source
│   └── src/
│       ├── components/          # React components
│       │   ├── SyncableField.tsx
│       │   ├── ProductForm.tsx
│       │   ├── FieldUpdateDashboard.tsx
│       │   ├── BulkFieldUpdatePanel.tsx
│       │   ├── SyncHistoryPanel.tsx
│       │   └── FieldUpdateAnalytics.tsx
│       └── hooks/
│           └── useFieldUpdate.ts # Field update logic
└── credentials/                 # Service account keys
```

### Build Commands
```bash
npm run build        # Build backend
npm run web:build    # Build frontend
npm run start        # Start production server
```

### Testing
```bash
npm test             # Run backend tests
npm run web:test     # Run frontend tests
```

## 🔐 Security

- Store service account keys securely
- Use environment variables for all credentials
- Implement proper CORS policies
- Add rate limiting for API endpoints
- Validate all field updates server-side
- Never commit credentials to version control

## 📚 Documentation

- [Google Merchant API Documentation](https://developers.google.com/shopping-content/reference/rest/v2.1/products)
- [Material-UI Documentation](https://mui.com/)
- [React TypeScript Patterns](https://react-typescript-cheatsheet.netlify.app/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the [Google Merchant API documentation](https://developers.google.com/shopping-content)
- Review the [Material-UI components guide](https://mui.com/components/)

---

**Note**: This application requires proper Google Cloud setup and Merchant Center access. Make sure to follow the setup instructions carefully and test with a development merchant account first.
