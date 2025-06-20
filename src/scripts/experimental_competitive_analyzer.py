# To run this code you need to install the following dependencies:
# pip install requests

import argparse
import json
import os
import sys
import requests
import re

def generate_competitive_analysis(product_name: str, brand: str, model_number: str = None, country: str = "Global"):
    """Generate competitive analysis using Google Gemini with Search grounding"""
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise Exception("GEMINI_API_KEY environment variable not set")
    
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
    
    # Build the search query
    if model_number:
        search_query = f"{brand} {product_name} {model_number}"
    else:
        search_query = f"{brand} {product_name}"
    
    # Enhanced prompt for structured output with focus on pricing
    
    if model_number:
        # Prompt when model number is provided - more specific search
        prompt = f"""Search for "{search_query}" from {country} and find as many links as possible. prioritize results from {brand} official website. Make sure results belong to product identifier {model_number}. prioritize accuracy and relevance of the results.
you can also search for {model_number} from {brand} site if it is not available in the first search results. Make sure you search for pricing of the products in the search results.
For each retailer found, provide the information in this exact format:

RETAILER: [retailer name]
URI: [Grounded url from search results]
PRICE: [exact price with currency symbol, e.g., "$299.99" or "€249.00" - if price not visible, write "Price not displayed"]
OFFICIAL: [Yes if official brand website, No if third-party retailer]
---
"""
    else:
        # Prompt when no model number is provided - broader search
        prompt = f"""Search for "{search_query}" from {country} and find as many links as possible. prioritize results from {brand} official website. Focus on finding the most relevant {brand} {product_name} products available for purchase.
Since no specific model number is provided, look for popular or current models of {brand} {product_name}. Make sure you search for pricing of the products in the search results.
For each retailer found, provide the information in this exact format:

RETAILER: [retailer name]
URI: [Grounded url from search results]
PRICE: [exact price with currency symbol, e.g., "$299.99" or "€249.00" - if price not visible, write "Price not displayed"]
OFFICIAL: [Yes if official brand website, No if third-party retailer]
---
"""

    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "tools": [{"google_search": {}}]
    }
    
    response = requests.post(url, json=payload)
    data = response.json()
    
    if "candidates" not in data or not data["candidates"]:
        raise Exception(f"No response from Gemini API. Response: {json.dumps(data, indent=2)}")
    
    candidate = data["candidates"][0]
    
    # Get the response text (may be empty if no parts)
    text = ""
    if "content" in candidate and "parts" in candidate["content"] and candidate["content"]["parts"]:
        text = candidate["content"]["parts"][0]["text"]
    
    # Get grounding sources - extract URLs from groundingChunks (the real URLs!)
    grounding = candidate.get("groundingMetadata", {})
    sources = []
    
    # Extract URLs from groundingChunks - this contains the actual source URLs
    if grounding.get("groundingChunks"):
        sources = [{"title": chunk["web"]["title"], "uri": chunk["web"]["uri"]} 
                  for chunk in grounding.get("groundingChunks", []) if "web" in chunk]
    
    # If we still have no sources but have text, that's okay - we'll work with just the text
    if not sources and not text:
        raise Exception(f"No content or grounding sources found. Candidate: {json.dumps(candidate, indent=2)}")
    
    return text, sources

def parse_response(response_text: str, sources: list):
    """Parse the AI response and extract retailer information from both structured text and grounding sources"""
    retailers = []
    
    try:
        # First, get real URLs from grounding sources (this is the key!)
        grounding_retailers = []
        for source in sources:
            # Determine if it's an official site based on URL patterns
            uri_lower = source['uri'].lower()
            title_lower = source['title'].lower()
            
            # Enhanced official site detection
            official_domains = [
                'apple.com', 'samsung.com', 'nike.com', 'adidas.com', 
                'mango.com', 'zara.com', 'hm.com', 'uniqlo.com',
                'sony.com', 'microsoft.com', 'dell.com', 'hp.com',
                'rubies.com'  # Added for costume example
            ]
            
            is_official = False
            if any(domain in uri_lower for domain in official_domains):
                is_official = True
            elif any(domain in title_lower for domain in official_domains):  # Check title too
                is_official = True
            elif any(keyword in title_lower for keyword in ['official', 'brand store']):
                is_official = True
            elif any(retailer in uri_lower for retailer in ['amazon', 'ebay', 'walmart', 'target', 'bestbuy']):
                is_official = False
            else:
                is_official = False
            
            grounding_retailers.append({
                'retailer': source['title'],
                'url': source['uri'],
                'price': 'Visit site for current pricing',  # More descriptive placeholder
                'officialsite': is_official
            })
        
        # Second, try to parse structured response from the text
        text_retailers = []
        sections = response_text.split('---')
        
        for section in sections:
            if 'RETAILER:' in section:
                retailer_info = {}
                
                # Extract retailer name
                retailer_match = re.search(r'RETAILER:\s*(.+)', section)
                if retailer_match:
                    retailer_info['retailer'] = retailer_match.group(1).strip()
                
                # Extract URL (look for both URL: and URI: patterns)
                url_match = re.search(r'(?:URL|URI):\s*(.+)', section)
                if url_match:
                    retailer_info['url'] = url_match.group(1).strip()
                
                # Extract price with better parsing
                price_match = re.search(r'PRICE:\s*(.+)', section)
                if price_match:
                    price_text = price_match.group(1).strip()
                    # Clean up common price formats
                    if price_text.lower() in ['not listed', 'n/a', 'na', 'not available']:
                        retailer_info['price'] = 'Price not available'
                    elif price_text.lower() in ['price not displayed', 'check website']:
                        retailer_info['price'] = 'Visit site for pricing'
                    else:
                        retailer_info['price'] = price_text
                
                # Extract official status
                official_match = re.search(r'OFFICIAL:\s*(.+)', section)
                if official_match:
                    official_status = official_match.group(1).strip().lower()
                    retailer_info['officialsite'] = official_status == 'yes'
                
                if len(retailer_info) >= 2:  # At least retailer and one other field
                    text_retailers.append(retailer_info)
        
        # Combine results: prioritize grounding sources (real URLs) but merge with text info
        all_results = []
        seen_urls = set()
        
        # First add grounding sources (these have the real working URLs!)
        for source in grounding_retailers:
            url = source.get('url', '')
            if url and url not in seen_urls:
                seen_urls.add(url)
                
                # Try to find price info from text for this retailer/URL
                price_from_text = None
                for text_retailer in text_retailers:
                    text_url = text_retailer.get('url', '')
                    text_retailer_name = text_retailer.get('retailer', '').lower()
                    source_title = source['retailer'].lower()
                    
                    # Match by URL or similar retailer name
                    if (text_url and text_url in url) or \
                       (text_retailer_name and (text_retailer_name in source_title or source_title in text_retailer_name)):
                        price_from_text = text_retailer.get('price')
                        break
                
                # Use price from text if available, otherwise keep placeholder
                if price_from_text and price_from_text not in ['Visit site for current pricing', 'Check website for pricing']:
                    source['price'] = price_from_text
                
                all_results.append(source)
        
        # Then add text-based results that have URLs not already included
        for retailer in text_retailers:
            url = retailer.get('url', '')
            if url and url not in seen_urls and url.startswith('http'):
                seen_urls.add(url)
                all_results.append(retailer)
        
        # Use the combined results or fallback to individual lists
        if all_results:
            retailers = all_results[:10]  # Limit to 10 results
        elif grounding_retailers:
            retailers = grounding_retailers[:10]
        elif text_retailers:
            retailers = text_retailers[:10]
        else:
            retailers = [{"retailer": "No retailers found", "officialsite": False, "url": "", "price": "N/A"}]
            
        return retailers
        
    except Exception as e:
        return [{"retailer": f"Error: {str(e)}", "officialsite": False, "url": "", "price": "N/A"}]

def main():
    """Main function to handle command line arguments and run analysis"""
    parser = argparse.ArgumentParser(description='Experimental Competitive Analysis')
    parser.add_argument('--product', required=True, help='Product name')
    parser.add_argument('--brand', required=True, help='Brand name')
    parser.add_argument('--model-number', help='Model number (optional)')
    parser.add_argument('--country', default='Global', help='Country to focus search on (default: Global)')
    
    args = parser.parse_args()
    
    try:
        # Generate analysis
        response_text, sources = generate_competitive_analysis(
            args.product, 
            args.brand, 
            args.model_number,
            args.country
        )
        
        # Parse response
        retailers = parse_response(response_text, sources)
        
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
                "country": args.country,
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
