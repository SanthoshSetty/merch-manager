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

# Set environment variables for build
ENV VITE_API_BASE_URL=https://merch-manager-backend-361151780407.us-central1.run.app
ENV VITE_API_TIMEOUT=30000

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
