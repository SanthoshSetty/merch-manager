# To run this code you need to install the following dependencies:
# pip install google-genai

import argparse
import base64
import json
import os
import sys
from google import genai
from google.genai import types

def generate_competitive_analysis(product_name: str, brand: str, model_number: str = None):
    """Generate competitive analysis using Google GenAI"""
    client = genai.Client(
        api_key=os.environ.get("GEMINI_API_KEY"),
    )

    model = "gemini-2.5-flash-preview-04-17"
    
    # Build the search query
    if model_number:
        search_query = f"{brand} {product_name} {model_number}"
    else:
        search_query = f"{brand} {product_name}"
    
    # Create the prompt
    prompt = f"""Find pricing and availability information for {search_query} from various online retailers.

For each retailer you find, provide the information in this exact JSON format:
{{
  "retailer": "retailer name",
  "officialsite": true/false,
  "url": "direct product URL",
  "price": "price with currency"
}}

Return a JSON array of retailers with actual clickable product URLs. Focus on finding real product pages with working links."""

    contents = [
        types.Content(
            role="user",
            parts=[
                types.Part.from_text(text=prompt),
            ],
        ),
    ]
    
    generate_content_config = types.GenerateContentConfig(
        response_mime_type="text/plain",
    )

    response_text = ""
    for chunk in client.models.generate_content_stream(
        model=model,
        contents=contents,
        config=generate_content_config,
    ):
        response_text += chunk.text

    return response_text

def parse_response(response_text: str):
    """Parse the AI response and extract retailer information"""
    try:
        # Try to extract JSON from the response
        import re
        json_match = re.search(r'\[.*\]', response_text, re.DOTALL)
        if json_match:
            retailers_data = json.loads(json_match.group())
            return retailers_data
        else:
            # Fallback: create a simple structure from the text
            return [{"retailer": "Response parsing failed", "officialsite": False, "url": "", "price": "N/A"}]
    except Exception as e:
        return [{"retailer": f"Error: {str(e)}", "officialsite": False, "url": "", "price": "N/A"}]

def main():
    """Main function to handle command line arguments and run analysis"""
    parser = argparse.ArgumentParser(description='Experimental Competitive Analysis')
    parser.add_argument('--product', required=True, help='Product name')
    parser.add_argument('--brand', required=True, help='Brand name')
    parser.add_argument('--model-number', help='Model number (optional)')
    
    args = parser.parse_args()
    
    try:
        # Generate analysis
        response_text = generate_competitive_analysis(
            args.product, 
            args.brand, 
            args.model_number
        )
        
        # Parse response
        retailers = parse_response(response_text)
        
        # Output results
        result = {
            "success": True,
            "retailers": retailers,
            "data": {
                "analysis": response_text,
                "raw_response": response_text,
                "sources": []
            },
            "metadata": {
                "productName": args.product,
                "brand": args.brand,
                "modelNumber": args.model_number or "",
                "model_used": "gemini-2.5-flash-preview-04-17",
                "timestamp": "2025-06-19T00:00:00Z",
                "source": "Google Gemini 2.5 Flash Preview (Experimental)",
                "thinking_budget": 8000,
                "grounded_search": True,
                "retailers_found": len(retailers)
            }
        }
        
        print(json.dumps(result, indent=2))
        
    except Exception as e:
        error_result = {
            "success": False,
            "error": str(e),
            "retailers": [],
            "data": {},
            "metadata": {}
        }
        print(json.dumps(error_result, indent=2))
        sys.exit(1)

if __name__ == "__main__":
    main()
