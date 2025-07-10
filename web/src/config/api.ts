// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT as string) || 10000;
const REQUEST_TIMEOUT = parseInt(import.meta.env.VITE_REQUEST_TIMEOUT as string) || 120000;

// Create axios instance with default configuration
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('merch_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear storage and reload
      localStorage.removeItem('merch_auth_token');
      localStorage.removeItem('merch_user');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

// Export configuration for use in components
export const config = {
  // API Configuration
  API_BASE_URL,
  API_TIMEOUT,
  REQUEST_TIMEOUT,
  
  // Application Configuration
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Merch Manager',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  ENVIRONMENT: import.meta.env.VITE_ENVIRONMENT || 'development',
  BUILD_TIMESTAMP: import.meta.env.VITE_BUILD_TIMESTAMP,
  
  // Google Cloud Configuration
  GOOGLE_CLOUD_PROJECT_ID: import.meta.env.VITE_GOOGLE_CLOUD_PROJECT_ID,
  GOOGLE_CLOUD_REGION: import.meta.env.VITE_GOOGLE_CLOUD_REGION || 'us-central1',
  GOOGLE_MERCHANT_ID: import.meta.env.VITE_GOOGLE_MERCHANT_ID,
  
  // Feature Flags
  ENABLE_AI_FEATURES: import.meta.env.VITE_ENABLE_AI_FEATURES === 'true',
  ENABLE_COMPETITIVE_PRICING: import.meta.env.VITE_ENABLE_COMPETITIVE_PRICING === 'true',
  ENABLE_REVIEWS: import.meta.env.VITE_ENABLE_REVIEWS === 'true',
  ENABLE_CUSTOM_FIELDS: import.meta.env.VITE_ENABLE_CUSTOM_FIELDS === 'true',
  ENABLE_GROUNDED_SOURCES: import.meta.env.VITE_ENABLE_GROUNDED_SOURCES === 'true',
  ENABLE_BULK_OPERATIONS: import.meta.env.VITE_ENABLE_BULK_OPERATIONS === 'true',
  ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  
  // UI Configuration
  THEME_MODE: import.meta.env.VITE_THEME_MODE || 'light',
  ENABLE_DARK_MODE: import.meta.env.VITE_ENABLE_DARK_MODE === 'true',
  PAGINATION_SIZE: parseInt(import.meta.env.VITE_PAGINATION_SIZE as string) || 25,
  MAX_FILE_SIZE: parseInt(import.meta.env.VITE_MAX_FILE_SIZE as string) || 10485760,
  ALLOWED_FILE_TYPES: import.meta.env.VITE_ALLOWED_FILE_TYPES?.split(',') || ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  
  // Performance Configuration
  CACHE_TIMEOUT: parseInt(import.meta.env.VITE_CACHE_TIMEOUT as string) || 300000,
  DEBOUNCE_DELAY: parseInt(import.meta.env.VITE_DEBOUNCE_DELAY as string) || 500,
  AUTO_SAVE_INTERVAL: parseInt(import.meta.env.VITE_AUTO_SAVE_INTERVAL as string) || 30000,
  
  // Debug Configuration
  DEBUG_MODE: import.meta.env.VITE_DEBUG_MODE === 'true',
  VERBOSE_LOGGING: import.meta.env.VITE_VERBOSE_LOGGING === 'true',
  ENABLE_CONSOLE_LOGS: import.meta.env.VITE_ENABLE_CONSOLE_LOGS === 'true',
  
  // External Services
  GOOGLE_ANALYTICS_ID: import.meta.env.VITE_GOOGLE_ANALYTICS_ID,
  SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
  
  // URLs and Links
  DOCUMENTATION_URL: import.meta.env.VITE_DOCUMENTATION_URL || 'https://developers.google.com/merchant/api',
  SUPPORT_EMAIL: import.meta.env.VITE_SUPPORT_EMAIL || 'support@merchmanager.com',
  FEEDBACK_URL: import.meta.env.VITE_FEEDBACK_URL,
  MERCHANT_CENTER_URL: import.meta.env.VITE_MERCHANT_CENTER_URL,
  MERCHANT_SUPPORT_URL: import.meta.env.VITE_MERCHANT_SUPPORT_URL || 'https://support.google.com/merchants',
};

console.log('🔧 Frontend Configuration:', {
  API_BASE_URL: config.API_BASE_URL,
  APP_NAME: config.APP_NAME,
  APP_VERSION: config.APP_VERSION,
  ENVIRONMENT: config.ENVIRONMENT,
  GOOGLE_MERCHANT_ID: config.GOOGLE_MERCHANT_ID,
  ENABLE_AI_FEATURES: config.ENABLE_AI_FEATURES,
  ENABLE_COMPETITIVE_PRICING: config.ENABLE_COMPETITIVE_PRICING,
  ENABLE_GROUNDED_SOURCES: config.ENABLE_GROUNDED_SOURCES,
});
