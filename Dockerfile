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

# Install Python and required packages
RUN apk add --no-cache python3 py3-pip curl

# Create app directory
WORKDIR /app

# Copy requirements.txt and install Python dependencies
COPY requirements.txt ./
RUN pip3 install --break-system-packages -r requirements.txt

# Copy built application
COPY --from=base /app/dist ./dist
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./
COPY --from=base /app/src/scripts ./src/scripts
COPY --from=base /app/src/routes ./src/routes
COPY --from=base /app/credentials ./credentials

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/api/health || exit 1

# Start the server
CMD ["node", "dist/server.js"]
