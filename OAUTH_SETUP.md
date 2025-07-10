# Google OAuth Setup for Merch Manager

## 🔐 OAuth Implementation Complete!

Your Merch Manager application now requires Google OAuth authentication. Only users with a Google account can access the backend APIs.

## 🚀 What's Been Implemented

### Backend Protection
All API endpoints now require authentication:
- `/api/products` - Product management
- `/api/reviews` - Review management  
- `/api/competitive-pricing` - Competitive pricing analysis
- `/api/ai-content` - AI content generation
- `/api/csv` - CSV operations
- `/api/account` - Account information

### OAuth Endpoints
- `GET /auth/google` - Get Google OAuth URL
- `POST /auth/google/callback` - Handle OAuth callback
- `GET /auth/profile` - Get user profile (requires auth)
- `POST /auth/verify` - Verify JWT token
- `POST /auth/logout` - Logout

## ⚙️ Required Environment Variables

Add these to your environment (Cloud Run, .env file, etc.):

```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=https://your-app-domain.com/auth/callback

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRY=24h

# Optional: Admin Restrictions
ADMIN_EMAILS=admin@yourcompany.com,another@yourcompany.com
ADMIN_DOMAINS=yourcompany.com
```

## 🔧 Setting Up Google OAuth

### 1. Google Cloud Console Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "APIs & Services" > "Credentials"
3. Click "Create Credentials" > "OAuth 2.0 Client IDs"
4. Choose "Web application"
5. Add authorized redirect URIs:
   - For development: `http://localhost:8080/auth/callback`
   - For production: `https://your-domain.com/auth/callback`

### 2. Frontend Integration
Update your frontend to handle OAuth flow:

```javascript
// 1. Get OAuth URL
const response = await fetch('/auth/google');
const { data } = await response.json();
window.location.href = data.authUrl;

// 2. Handle callback (usually done by your frontend router)
// The callback will receive a 'code' parameter
const callbackResponse = await fetch('/auth/google/callback', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ code: 'authorization-code-from-google' })
});
const { data: { token } } = await callbackResponse.json();

// 3. Store token and use for API calls
localStorage.setItem('authToken', token);

// 4. Use token for API calls
const apiResponse = await fetch('/api/products', {
  headers: { 
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

## 🧪 Testing the Implementation

### Test OAuth Flow
```bash
# Test getting OAuth URL
curl http://localhost:8080/auth/google

# Test protected endpoint (should fail without auth)
curl http://localhost:8080/api/products

# Test with valid token
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" http://localhost:8080/api/products
```

### Run the Test Script
```bash
./test-oauth.sh
```

## 🔄 Deployment

### Update Cloud Run Environment Variables
```bash
# Update backend service
gcloud run services update merch-manager-backend \
  --region=us-central1 \
  --set-env-vars="GOOGLE_CLIENT_ID=your-client-id,GOOGLE_CLIENT_SECRET=your-client-secret,GOOGLE_REDIRECT_URI=https://your-domain.com/auth/callback,JWT_SECRET=your-jwt-secret"
```

## 🎯 Usage Flow

1. **User visits frontend** → Redirected to login if not authenticated
2. **User clicks "Login with Google"** → Frontend calls `/auth/google`
3. **User redirected to Google** → Google OAuth consent screen
4. **User consents** → Google redirects back with authorization code
5. **Frontend sends code** → POST to `/auth/google/callback`
6. **Backend verifies with Google** → Returns JWT token
7. **Frontend stores token** → All API calls include `Authorization: Bearer TOKEN`
8. **Backend validates token** → Allows access to protected resources

## 🛡️ Security Features

- **JWT Tokens**: Secure, stateless authentication
- **Token Expiration**: Configurable expiry (default 24h)
- **Admin Controls**: Optional email/domain restrictions
- **HTTPS Required**: For production OAuth callbacks
- **CORS Protection**: Configured for your domains

## 🎨 Frontend Example (React)

```jsx
// Auth context/hook
const useAuth = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('authToken'));

  const login = async () => {
    const response = await fetch('/auth/google');
    const { data } = await response.json();
    window.location.href = data.authUrl;
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
  };

  return { user, token, login, logout };
};

// Protected component
const Dashboard = () => {
  const { token, login } = useAuth();

  if (!token) {
    return (
      <div>
        <h1>Please log in</h1>
        <button onClick={login}>Login with Google</button>
      </div>
    );
  }

  return <div>Welcome to Merch Manager!</div>;
};
```

## 📋 Troubleshooting

### Common Issues
1. **"Token required" errors**: Frontend not sending Authorization header
2. **"Invalid token" errors**: Token expired or JWT_SECRET mismatch
3. **OAuth redirect errors**: Incorrect GOOGLE_REDIRECT_URI configuration
4. **CORS errors**: Frontend domain not in corsOrigins list

### Debug Mode
Set environment variables for debugging:
```bash
DEBUG_MODE=true
VERBOSE_LOGGING=true
```

## ✅ Next Steps

1. **Set up Google OAuth credentials**
2. **Configure environment variables**
3. **Update frontend to handle OAuth flow**
4. **Test the complete authentication flow**
5. **Deploy to production with HTTPS**

Your Merch Manager is now secure! 🔐✨
