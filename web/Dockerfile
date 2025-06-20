# Dockerfile for React Frontend
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Set comprehensive environment variables for build
# Backend API Configuration
ENV VITE_API_BASE_URL=https://merch-manager-backend-hbo66mhwnq-uc.a.run.app
ENV VITE_API_TIMEOUT=30000
ENV VITE_REQUEST_TIMEOUT=120000

# Application Configuration
ENV VITE_APP_NAME="Merch Manager"
ENV VITE_APP_VERSION=1.0.0
ENV VITE_ENVIRONMENT=production
ENV VITE_BUILD_TIMESTAMP=1749970740

# Google Cloud Configuration
ENV VITE_GOOGLE_CLOUD_PROJECT_ID=neon-vigil-395120
ENV VITE_GOOGLE_CLOUD_REGION=us-central1
ENV VITE_GOOGLE_MERCHANT_ID=5591219286

# Feature Flags
ENV VITE_ENABLE_AI_FEATURES=true
ENV VITE_ENABLE_COMPETITIVE_PRICING=true
ENV VITE_ENABLE_REVIEWS=true
ENV VITE_ENABLE_CUSTOM_FIELDS=true
ENV VITE_ENABLE_GROUNDED_SOURCES=true
ENV VITE_ENABLE_BULK_OPERATIONS=true
ENV VITE_ENABLE_ANALYTICS=true

# UI Configuration
ENV VITE_THEME_MODE=light
ENV VITE_ENABLE_DARK_MODE=true
ENV VITE_PAGINATION_SIZE=25
ENV VITE_MAX_FILE_SIZE=10485760
ENV VITE_ALLOWED_FILE_TYPES="jpg,jpeg,png,gif,webp"

# Performance Configuration
ENV VITE_CACHE_TIMEOUT=300000
ENV VITE_DEBOUNCE_DELAY=500
ENV VITE_AUTO_SAVE_INTERVAL=30000

# Debug Configuration (disabled in production)
ENV VITE_DEBUG_MODE=false
ENV VITE_VERBOSE_LOGGING=false
ENV VITE_ENABLE_CONSOLE_LOGS=false

# External Services
ENV VITE_GOOGLE_ANALYTICS_ID=""
ENV VITE_SENTRY_DSN=""

# URLs and Links
ENV VITE_DOCUMENTATION_URL="https://developers.google.com/merchant/api"
ENV VITE_SUPPORT_EMAIL="support@merchmanager.com"
ENV VITE_FEEDBACK_URL="https://forms.google.com/feedback"
ENV VITE_MERCHANT_CENTER_URL="https://merchants.google.com/mc/accounts/5591219286"
ENV VITE_MERCHANT_SUPPORT_URL="https://support.google.com/merchants"

# Build the application with production environment
RUN npm run build -- --mode production

# Production stage with nginx
FROM nginx:alpine AS production

# Copy built app to nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 8080
EXPOSE 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
