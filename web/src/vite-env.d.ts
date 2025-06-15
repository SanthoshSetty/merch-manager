/// <reference types="vite/client" />

interface ImportMetaEnv {
  // API Configuration
  readonly VITE_API_BASE_URL: string
  readonly VITE_API_TIMEOUT: string
  readonly VITE_REQUEST_TIMEOUT: string
  
  // Application Configuration
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
  readonly VITE_ENVIRONMENT: string
  readonly VITE_BUILD_TIMESTAMP: string
  
  // Google Cloud Configuration
  readonly VITE_GOOGLE_CLOUD_PROJECT_ID: string
  readonly VITE_GOOGLE_CLOUD_REGION: string
  readonly VITE_GOOGLE_MERCHANT_ID: string
  
  // Feature Flags
  readonly VITE_ENABLE_AI_FEATURES: string
  readonly VITE_ENABLE_COMPETITIVE_PRICING: string
  readonly VITE_ENABLE_REVIEWS: string
  readonly VITE_ENABLE_CUSTOM_FIELDS: string
  readonly VITE_ENABLE_GROUNDED_SOURCES: string
  readonly VITE_ENABLE_BULK_OPERATIONS: string
  readonly VITE_ENABLE_ANALYTICS: string
  
  // UI Configuration
  readonly VITE_THEME_MODE: string
  readonly VITE_ENABLE_DARK_MODE: string
  readonly VITE_PAGINATION_SIZE: string
  readonly VITE_MAX_FILE_SIZE: string
  readonly VITE_ALLOWED_FILE_TYPES: string
  
  // Performance Configuration
  readonly VITE_CACHE_TIMEOUT: string
  readonly VITE_DEBOUNCE_DELAY: string
  readonly VITE_AUTO_SAVE_INTERVAL: string
  
  // Debug Configuration
  readonly VITE_DEBUG_MODE: string
  readonly VITE_VERBOSE_LOGGING: string
  readonly VITE_ENABLE_CONSOLE_LOGS: string
  
  // External Services
  readonly VITE_GOOGLE_ANALYTICS_ID: string
  readonly VITE_SENTRY_DSN: string
  
  // URLs and Links
  readonly VITE_DOCUMENTATION_URL: string
  readonly VITE_SUPPORT_EMAIL: string
  readonly VITE_FEEDBACK_URL: string
  readonly VITE_MERCHANT_CENTER_URL: string
  readonly VITE_MERCHANT_SUPPORT_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
