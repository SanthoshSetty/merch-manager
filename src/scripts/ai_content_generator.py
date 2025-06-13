#!/usr/bin/env python3
"""
AI Content Generation Script using Google Gemini Grounding API
This script generates comprehensive product information and field-specific content.
"""

import os
import sys
import json
import argparse
import asyncio
import re
import requests
from typing import List, Dict, Any
from google import genai
from google.genai import types

class AIContentGenerator:
    def __init__(self, api_key: str):
        """Initialize the AI content generator with Google Gemini API."""
        self.api_key = api_key
        self.client = genai.Client(api_key=api_key)
        self.model = "gemini-2.0-flash-exp"
    
    def create_comprehensive_analysis_prompt(self, product_name: str, brand: str, country: str = "Global") -> str:
        """Create a prompt for comprehensive product analysis."""
        return f"""Analyze the product {brand} {product_name} and provide comprehensive information. Search for detailed product specifications, features, descriptions, and market information.

Product: {product_name}
Brand: {brand}
Market: {country}

Provide detailed information in JSON format with these fields:

{{
  "title": "Complete product title",
  "description": "Comprehensive product description (200-300 words)",
  "brand": "Brand name",
  "category": "Google product category",
  "gtin": "GTIN/EAN/UPC code if available",
  "mpn": "Manufacturer part number",
  "condition": "new/refurbished/used",
  "availability": "in stock/out of stock/preorder",
  "age_group": "adult/teen/kids/toddler/infant/newborn",
  "gender": "male/female/unisex",
  "size": "Product size/dimensions",
  "color": "Primary color",
  "material": "Primary material",
  "pattern": "Pattern type if applicable",
  "energy_efficiency_class": "Energy rating if applicable",
  "custom_label_0": "Key feature 1",
  "custom_label_1": "Key feature 2", 
  "custom_label_2": "Key feature 3",
  "custom_label_3": "Key feature 4",
  "custom_label_4": "Key benefit/use case"
}}

Return ONLY the JSON object, no additional text."""

    def create_field_specific_prompt(self, product_name: str, brand: str, field_name: str, field_instructions: str, product_context: Dict[str, Any] = None) -> str:
        """Create a prompt for specific field generation."""
        context_str = ""
        if product_context:
            context_str = f"\nProduct Context: {json.dumps(product_context, indent=2)}"
        
        return f"""Generate content for a specific product field based on the field name and instructions.

Product: {brand} {product_name}
Field Name: {field_name}
Field Instructions: {field_instructions}{context_str}

Based on the field name and instructions, generate appropriate content for this field. Consider:
- Field type and expected format
- Product characteristics and target audience
- Marketing best practices
- SEO optimization
- Compliance requirements

Return ONLY the generated content for this field, no additional formatting or explanation."""

    async def get_comprehensive_product_info(self, product_name: str, brand: str, country: str = "Global") -> Dict[str, Any]:
        """Get comprehensive product information using Google Gemini Grounding."""
        try:
            print(f"Analyzing product comprehensively: {brand} {product_name}", file=sys.stderr)
            
            prompt = self.create_comprehensive_analysis_prompt(product_name, brand, country)
            
            # Create content with Google Search tool
            contents = [
                types.Content(
                    role="user",
                    parts=[
                        types.Part.from_text(text=prompt),
                    ],
                ),
            ]
            
            tools = [types.Tool(google_search=types.GoogleSearch())]
            
            generate_content_config = types.GenerateContentConfig(
                tools=tools,
                response_mime_type="text/plain",
            )

            print("Generating comprehensive product analysis with Google Search grounding...", file=sys.stderr)
            response = self.client.models.generate_content(
                model=self.model,
                contents=contents,
                config=generate_content_config,
            )
            
            if not response.text:
                raise Exception("Empty response from Gemini API")
                
            print("Received comprehensive product analysis", file=sys.stderr)
            
            # Parse JSON response
            try:
                response_text = response.text.strip()
                if response_text.startswith("```json"):
                    response_text = response_text[7:]
                if response_text.endswith("```"):
                    response_text = response_text[:-3]
                
                # Extract JSON object
                json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
                if json_match:
                    response_text = json_match.group(0)
                
                # Clean up the JSON
                response_text = ''.join(char for char in response_text if ord(char) >= 32 or char in '\n\r\t')
                response_text = re.sub(r',(\s*[}\]])', r'\1', response_text)
                
                product_data = json.loads(response_text)
                
                return {
                    'success': True,
                    'data': product_data,
                    'metadata': {
                        'productName': product_name,
                        'brand': brand,
                        'country': country,
                        'source': 'Google Gemini with Search Grounding API',
                        'timestamp': '2025-06-13T00:00:00Z'
                    }
                }
                
            except (json.JSONDecodeError, ValueError) as e:
                print(f"Failed to parse JSON response: {e}", file=sys.stderr)
                return self.generate_fallback_product_data(product_name, brand, country)
                
        except Exception as e:
            print(f"Error in comprehensive product analysis: {e}", file=sys.stderr)
            return {
                'success': False,
                'error': str(e),
                'code': 'GEMINI_API_ERROR'
            }

    async def generate_field_content(self, product_name: str, brand: str, field_name: str, field_instructions: str, product_context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Generate content for a specific field."""
        try:
            print(f"Generating content for field: {field_name}", file=sys.stderr)
            
            prompt = self.create_field_specific_prompt(product_name, brand, field_name, field_instructions, product_context)
            
            contents = [
                types.Content(
                    role="user",
                    parts=[
                        types.Part.from_text(text=prompt),
                    ],
                ),
            ]
            
            tools = [types.Tool(google_search=types.GoogleSearch())]
            
            generate_content_config = types.GenerateContentConfig(
                tools=tools,
                response_mime_type="text/plain",
            )

            response = self.client.models.generate_content(
                model=self.model,
                contents=contents,
                config=generate_content_config,
            )
            
            if not response.text:
                raise Exception("Empty response from Gemini API")
            
            # Clean and return the generated content
            generated_content = response.text.strip()
            
            # Remove any markdown formatting
            generated_content = re.sub(r'```.*?```', '', generated_content, flags=re.DOTALL)
            generated_content = re.sub(r'`([^`]+)`', r'\1', generated_content)
            generated_content = generated_content.strip()
            
            return {
                'success': True,
                'content': generated_content,
                'metadata': {
                    'fieldName': field_name,
                    'productName': product_name,
                    'brand': brand,
                    'source': 'Google Gemini with Search Grounding API',
                    'timestamp': '2025-06-13T00:00:00Z'
                }
            }
            
        except Exception as e:
            print(f"Error generating field content: {e}", file=sys.stderr)
            return {
                'success': False,
                'error': str(e),
                'code': 'FIELD_GENERATION_ERROR'
            }

    def generate_fallback_product_data(self, product_name: str, brand: str, country: str) -> Dict[str, Any]:
        """Generate fallback product data when API fails."""
        print("Generating fallback product data...", file=sys.stderr)
        
        fallback_data = {
            "title": f"{brand} {product_name}",
            "description": f"The {brand} {product_name} is a high-quality product designed to meet your needs. This product combines innovative technology with reliable performance, making it an excellent choice for consumers seeking quality and value.",
            "brand": brand,
            "category": "Electronics > Consumer Electronics",
            "condition": "new",
            "availability": "in stock",
            "age_group": "adult",
            "gender": "unisex",
            "custom_label_0": "High Quality",
            "custom_label_1": "Reliable Performance",
            "custom_label_2": "Innovative Design",
            "custom_label_3": "User Friendly",
            "custom_label_4": "Excellent Value"
        }
        
        return {
            'success': True,
            'data': fallback_data,
            'metadata': {
                'productName': product_name,
                'brand': brand,
                'country': country,
                'source': 'Fallback Product Data',
                'timestamp': '2025-06-13T00:00:00Z',
                'note': 'Fallback data used due to API parsing issues'
            }
        }

async def main():
    """Main function to run the AI content generation."""
    try:
        parser = argparse.ArgumentParser(description='AI Content Generation using Google Gemini')
        parser.add_argument('--product', required=True, help='Product name')
        parser.add_argument('--brand', required=True, help='Brand name')
        parser.add_argument('--country', default='Global', help='Target country/market')
        parser.add_argument('--mode', choices=['comprehensive', 'field'], required=True, help='Generation mode')
        parser.add_argument('--field-name', help='Field name for field-specific generation')
        parser.add_argument('--field-instructions', help='Instructions for field generation')
        parser.add_argument('--product-context', help='JSON string of product context')
        parser.add_argument('--api-key', help='Google Gemini API key (or set GEMINI_API_KEY env var)')
        
        args = parser.parse_args()
        
        # Get API key
        api_key = args.api_key or os.getenv('GEMINI_API_KEY')
        if not api_key:
            print("❌ Error: Google Gemini API key is required.", file=sys.stderr)
            sys.exit(1)
        
        # Initialize generator
        generator = AIContentGenerator(api_key)
        
        if args.mode == 'comprehensive':
            # Generate comprehensive product analysis
            result = await generator.get_comprehensive_product_info(args.product, args.brand, args.country)
        elif args.mode == 'field':
            # Generate field-specific content
            if not args.field_name or not args.field_instructions:
                print("❌ Error: field-name and field-instructions required for field mode.", file=sys.stderr)
                sys.exit(1)
            
            product_context = None
            if args.product_context:
                try:
                    product_context = json.loads(args.product_context)
                except:
                    pass
            
            result = await generator.generate_field_content(
                args.product, args.brand, args.field_name, 
                args.field_instructions, product_context
            )
        
        # Output result as JSON
        print(json.dumps(result, indent=2))
        
    except Exception as e:
        error_result = {
            "success": False,
            "error": str(e),
            "code": "AI_GENERATION_ERROR"
        }
        print(json.dumps(error_result, indent=2), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
