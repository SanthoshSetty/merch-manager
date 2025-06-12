#!/bin/bash

echo "🧪 Testing Product Save API Fix"
echo "================================"

# Test the backend API directly
echo ""
echo "📋 Test 1: Empty price fields (should not cause NaN errors)"

curl -X PATCH "http://localhost:3001/api/products/test-product-123/fields" \
  -H "Content-Type: application/json" \
  -d '{
    "updates": {
      "title": "Test Product",
      "description": "Test Description"
    },
    "updateMask": "attributes.title,attributes.description"
  }' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s

echo ""
echo "📋 Test 2: Valid price data (should work)"

curl -X PATCH "http://localhost:3001/api/products/test-product-123/fields" \
  -H "Content-Type: application/json" \
  -d '{
    "updates": {
      "title": "Test Product 2",
      "description": "Test Description 2",
      "price": {
        "amountMicros": "19990000",
        "currencyCode": "USD"
      }
    },
    "updateMask": "attributes.title,attributes.description,attributes.price"
  }' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s

echo ""
echo "📋 Test 3: Check server health"

curl -X GET "http://localhost:3001/api/products" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s

echo ""
echo "✅ API tests completed"
