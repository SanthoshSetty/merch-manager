#!/bin/bash

echo "🔐 Testing Google OAuth Implementation for Merch Manager"
echo "=============================================="

# Build the project
echo "📦 Building the project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed!"
    exit 1
fi

# Start the server in background
echo "🚀 Starting the server..."
node dist/server.js &
SERVER_PID=$!

# Wait for server to start
sleep 3

# Test health endpoint
echo "🔍 Testing health endpoint..."
curl -s http://localhost:8080/health

echo ""
echo "🔍 Testing API health endpoint..."
curl -s http://localhost:8080/api/health

echo ""
echo "🔐 Testing OAuth endpoints..."
curl -s http://localhost:8080/auth/google

echo ""
echo "🚫 Testing protected endpoint without auth (should fail)..."
curl -s http://localhost:8080/api/products

echo ""
echo "🛑 Stopping server..."
kill $SERVER_PID

echo ""
echo "✅ OAuth implementation test completed!"
