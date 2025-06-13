#!/usr/bin/env python3
import sys
import json

print("Starting Python script test...")
print(f"Arguments: {sys.argv}")

# Simple test output
result = {
    "success": True,
    "data": [
        {
            "Retailer": "Test Retailer",
            "Price (in SGD)": "SGD 1200.00",
            "Grounded URL": "https://example.com",
            "Resolved URL": "https://example.com"
        }
    ],
    "metadata": {
        "source": "Python Test Script",
        "timestamp": "2025-06-13"
    }
}

print(json.dumps(result, indent=2))
