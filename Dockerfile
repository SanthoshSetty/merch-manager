# Dockerfile for Node.js Backend
FROM node:18-alpine AS base

# Install Python and pip for AI scripts
RUN apk add --no-cache python3 py3-pip python3-dev gcc musl-dev curl

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY src/ ./src/
COPY credentials/ ./credentials/

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Install Python and required packages for Google Genai
RUN apk add --no-cache python3 py3-pip curl
RUN pip3 install --break-system-packages google-genai requests

# Create app directory
WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built application
COPY --from=base /app/dist ./dist
COPY --from=base /app/src/scripts ./src/scripts
COPY --from=base /app/credentials ./credentials

# Make sure scripts are executable
RUN chmod +x src/scripts/*.py

# Create non-root user but give access to write temp files
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
RUN mkdir -p /tmp/app-data && chown nextjs:nodejs /tmp/app-data
USER nextjs

# Expose port (Cloud Run will set PORT environment variable)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:$PORT/api/health || exit 1

# Start the server
CMD ["node", "dist/server.js"]
