#!/usr/bin/env python3
"""
Experimental Competitive Analysis Script using Google Gemini 2.5 Flash Preview
This is an experimental script for testing different AI models and approaches.
Requires: pip install google-genai
"""

import os
import sys
import json
import argparse
from typing import List, Dict, Any, Optional
from google import genai
from google.genai import types

class ExperimentalCompetitiveAnalyzer:
    def __init__(self, api_key: str):
        """Initialize the experimental competitive analyzer with Google Gemini API."""
        self.api_key = api_key
        self.client = genai.Client(api_key=api_key)
        self.model = 'gemini-2.5-flash-preview-04-17'
    
    def create_experimental_prompt(self, product_name: str, brand: str, model_number: str = None) -> str:
        """Create an experimental prompt for competitive analysis."""
        
        # Build comprehensive search query
        if model_number:
            search_query = f"{brand} {product_name} {model_number}"
        else:
            search_query = f"{brand} {product_name}"
        
        return f"""Find comprehensive pricing and availability information for the product: {search_query}

Search Strategy:
1. First, search the official {brand} website (preferably {brand.lower()}.com) for this exact product
2. Then search major retail websites and marketplaces for price comparisons
3. Look for both online and physical store availability

For each retailer you find, provide the following information in this EXACT format:

**Retailer:** [Retailer Name]
**Current Price (with currency):** [Price] [Currency]  
**Product Availability Status:** [In Stock/Out of Stock/Limited/Available]
**Direct Product URL/link:** [Full working URL to the specific product page]
**Official Store:** [Yes if it's the brand's official store, No if third party]
**Special Offers:** [Any discounts or promotions]
**Shipping Information:** [Delivery options and costs]

IMPORTANT: 
- Always include the complete, clickable URL for each retailer
- Make sure URLs are real and working product links  
- Include at least 5-10 different retailers
- Prioritize major retailers like official brand stores, Amazon, eBay, major department stores
- Include both official brand stores and third-party retailers

Focus on finding accurate, current pricing data from reliable and authoritative sources. Provide real, working URLs that users can click to visit the product pages."""

def parse_retailer_data(analysis_text: str) -> List[Dict[str, Any]]:
    """Parse the analysis text to extract structured retailer information."""
    retailers = []
    
    # Split analysis by numbered retailer sections or **Retailer:** patterns
    import re
    
    # Try multiple parsing patterns
    patterns = [
        # Pattern 1: **Retailer:** Name
        r'\*\*Retailer:\*\*\s*([^\n]+)',
        # Pattern 2: **1. Retailer:** or similar numbered patterns
        r'\*\*\d+\.\s*([^:]*?):\s*([^*]*?)(?=\*\*\d+\.|$)',
        # Pattern 3: Look for explicit retailer mentions
        r'retailer[:\s]+([^\n]+)',
        # Pattern 4: Store/company names followed by pricing info
        r'([A-Z][a-zA-Z\s&]+(?:Sports|Store|Shop|Mall|Market|\.com))[^\n]*(?:\n.*?price|.*?MVR|.*?\$|.*?€)'
    ]
    
    # Try pattern 1 first - look for the new structured format
    retailer_pattern = r'\*\*Retailer:\*\*\s*([^\n]+)'
    retailer_matches = re.findall(retailer_pattern, analysis_text, re.IGNORECASE)
    if retailer_matches:
        for retailer_name in retailer_matches:
            retailers.append(create_retailer_info(retailer_name.strip(), analysis_text))
    
    # Try pattern 2 - numbered sections
    if not retailers:
        numbered_matches = re.findall(r'\*\*\d+\.\s*([^:]*?):\s*([^*]*?)(?=\*\*\d+\.|$)', analysis_text, re.DOTALL)
        for match in numbered_matches:
            retailer_header = match[0].strip()
            retailer_content = match[1].strip()
            if retailer_header and retailer_content:
                retailers.append(parse_retailer_section(retailer_header, retailer_content))
    
    # Try pattern 3 - Look for specific retailer names in the text
    if not retailers:
        # Common retailer name patterns
        retailer_patterns = [
            r'([A-Z][a-zA-Z\s&]+(?:Sports|Store|Shop|Mall|Market|\.com))',
            r'(Amazon[^\n]*)',
            r'(eBay[^\n]*)',
            r'(Walmart[^\n]*)',
            r'(Target[^\n]*)',
            r'([A-Z][a-zA-Z\s]+ Official[^\n]*)',
            r'(Sonee Sports[^\n]*)',
            r'(MANGO[^\n]*official[^\n]*)'
        ]
        
        for pattern in retailer_patterns:
            matches = re.findall(pattern, analysis_text, re.IGNORECASE)
            for match in matches:
                retailer_name = match.strip()
                if len(retailer_name) > 2:
                    retailers.append(create_retailer_info(retailer_name, analysis_text))
    
    # Remove duplicates and clean up
    seen_retailers = set()
    unique_retailers = []
    for retailer in retailers:
        retailer_key = retailer.get('retailer', '').lower()
        if retailer_key and retailer_key not in seen_retailers:
            seen_retailers.add(retailer_key)
            unique_retailers.append(retailer)
    
    return unique_retailers

def create_retailer_info(retailer_name: str, full_text: str) -> Dict[str, Any]:
    """Create retailer info by extracting details from the full text."""
    import re
    
    retailer_info = {
        'retailer': retailer_name,
        'official_site': False,
        'url': '',
        'price': '',
        'currency': '',
        'availability': '',
        'product_url': ''
    }
    
    # Check if it's an official site - look for the new structured format first
    official_pattern = r'\*\*Official Store:\*\*\s*(Yes|True|Official)'
    official_match = re.search(official_pattern, full_text, re.IGNORECASE)
    if official_match:
        retailer_info['official_site'] = True
    elif any(term in retailer_name.lower() for term in ['official', 'brand store']) or any(term in full_text.lower() for term in ['official store: yes', 'official site']):
        retailer_info['official_site'] = True
    
    # Extract price and currency from surrounding text
    price_patterns = [
        r'MVR\s*([0-9,]+\.?[0-9]*)',
        r'€\s*([0-9,]+\.?[0-9]*)',
        r'US\$\s*([0-9,]+\.?[0-9]*)',
        r'\$\s*([0-9,]+\.?[0-9]*)',
        r'AED\s*([0-9,]+\.?[0-9]*)',
        r'Price[:\s]*([0-9,]+\.?[0-9]*)',
    ]
    
    for pattern in price_patterns:
        price_match = re.search(pattern, full_text)
        if price_match:
            retailer_info['price'] = price_match.group(1).replace(',', '')
            if pattern.startswith('MVR'):
                retailer_info['currency'] = 'MVR'
            elif pattern.startswith('€'):
                retailer_info['currency'] = 'EUR'
            elif pattern.startswith('US\\$'):
                retailer_info['currency'] = 'USD'
            elif pattern.startswith('\\$'):
                retailer_info['currency'] = 'USD'
            elif pattern.startswith('AED'):
                retailer_info['currency'] = 'AED'
            break
    
    # Extract URLs - prioritize the new structured format
    # First look for the **Direct Product URL/link:** pattern
    url_pattern = r'\*\*Direct Product URL/link:\*\*\s*([^\n\s]+)'
    url_match = re.search(url_pattern, full_text, re.IGNORECASE)
    if url_match:
        url = url_match.group(1).strip()
        if url.startswith('http') and 'grounding-api-redirect' not in url:
            retailer_info['url'] = url
            retailer_info['product_url'] = url
    else:
        # Fallback to general URL extraction
        url_matches = re.findall(r'https?://[^\s\)\]]+', full_text)
        for url in url_matches:
            if 'grounding-api-redirect' not in url and retailer_name.lower() in url.lower():
                retailer_info['product_url'] = url.rstrip('.')
                break
            elif 'grounding-api-redirect' not in url and not retailer_info['url']:
                retailer_info['url'] = url.rstrip('.')
    
    # Extract availability
    availability_patterns = [
        r'Only\s+(\d+)\s+left',
        r'In\s+Stock',
        r'Out\s+of\s+Stock',
        r'Limited\s+availability',
        r'Available',
        r'Unavailable'
    ]
    
    for pattern in availability_patterns:
        availability_match = re.search(pattern, full_text, re.IGNORECASE)
        if availability_match:
            retailer_info['availability'] = availability_match.group(0)
            break
    
    return retailer_info

def parse_retailer_section(header: str, content: str) -> Dict[str, Any]:
    """Parse a specific retailer section with header and content."""
    import re
    
    retailer_info = {
        'retailer': '',
        'official_site': False,
        'url': '',
        'price': '',
        'currency': '',
        'availability': '',
        'product_url': ''
    }
    
    # Extract retailer name from header
    if 'official' in header.lower():
        retailer_info['official_site'] = True
    
    # Parse retailer name (often in parentheses or after "Retailer:")
    retailer_name = header
    if '(' in retailer_name and ')' in retailer_name:
        retailer_name = retailer_name.split('(')[1].split(')')[0]
    elif ':' in retailer_name:
        retailer_name = retailer_name.split(':')[0]
    
    retailer_info['retailer'] = retailer_name.replace('Retailer', '').replace('Official', '').strip()
    
    # Parse content for specific details
    lines = content.split('\n')
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # Extract website URL
        if any(keyword in line.lower() for keyword in ['website:', 'url:', 'link:']):
            urls = re.findall(r'https?://[^\s\)\]]+', line)
            if urls:
                retailer_info['url'] = urls[0].rstrip('.')
                
        # Extract price
        elif any(keyword in line.lower() for keyword in ['price:', 'cost:']):
            # Common price patterns
            price_patterns = [
                r'€\s*([0-9,]+\.?[0-9]*)',
                r'MVR\s*([0-9,]+\.?[0-9]*)',
                r'US\$\s*([0-9,]+\.?[0-9]*)',
                r'\$\s*([0-9,]+\.?[0-9]*)',
                r'AED\s*([0-9,]+\.?[0-9]*)',
            ]
            
            for pattern in price_patterns:
                match = re.search(pattern, line)
                if match:
                    retailer_info['price'] = match.group(1).replace(',', '')
                    if pattern.startswith('€'):
                        retailer_info['currency'] = 'EUR'
                    elif pattern.startswith('MVR'):
                        retailer_info['currency'] = 'MVR'
                    elif pattern.startswith('US\\$'):
                        retailer_info['currency'] = 'USD'
                    elif pattern.startswith('\\$'):
                        retailer_info['currency'] = 'USD'
                    elif pattern.startswith('AED'):
                        retailer_info['currency'] = 'AED'
                    break
                    
        # Extract availability
        elif any(keyword in line.lower() for keyword in ['availability:', 'stock:']):
            availability = line.split(':')[1].strip() if ':' in line else line
            availability = availability.replace('"', '').strip()
            if availability.endswith('.'):
                availability = availability[:-1]
            retailer_info['availability'] = availability
            
        # Extract product URL
        elif any(keyword in line.lower() for keyword in ['product url:', 'direct link:']):
            urls = re.findall(r'https?://[^\s\)\]]+', line)
            if urls:
                for url in urls:
                    if 'grounding-api-redirect' not in url:
                        retailer_info['product_url'] = url.rstrip('.')
                        break
                if not retailer_info['product_url'] and urls:
                    retailer_info['product_url'] = urls[0].rstrip('.')
    
    return retailer_info

class ExperimentalCompetitiveAnalyzer:
    def __init__(self, api_key: str):
        """Initialize the experimental competitive analyzer with Google Gemini API."""
        self.api_key = api_key
        self.client = genai.Client(api_key=api_key)
        self.model = 'gemini-2.5-flash-preview-04-17'
    
    def create_experimental_prompt(self, product_name: str, brand: str, model_number: str = None) -> str:
        """Create an experimental prompt for competitive analysis."""
        
        # Build comprehensive search query
        if model_number:
            search_query = f"{brand} {product_name} {model_number}"
        else:
            search_query = f"{brand} {product_name}"
        
        return f"""Find comprehensive pricing and availability information for the product: {search_query}

Search Strategy:
1. First, search the official {brand} website (preferably {brand.lower()}.com) for this exact product
2. Then search major retail websites and marketplaces for price comparisons
3. Look for both online and physical store availability

For each retailer you find, provide the following information in this EXACT format:

**Retailer:** [Retailer Name]
**Current Price (with currency):** [Price] [Currency]  
**Product Availability Status:** [In Stock/Out of Stock/Limited/Available]
**Direct Product URL/link:** [Full working URL to the specific product page]
**Official Store:** [Yes if it's the brand's official store, No if third party]
**Special Offers:** [Any discounts or promotions]
**Shipping Information:** [Delivery options and costs]

IMPORTANT: 
- Always include the complete, clickable URL for each retailer
- Make sure URLs are real and working product links  
- Include at least 5-10 different retailers
- Prioritize major retailers like official brand stores, Amazon, eBay, major department stores
- Include both official brand stores and third-party retailers

Focus on finding accurate, current pricing data from reliable and authoritative sources. Provide real, working URLs that users can click to visit the product pages."""

    def analyze_product_experimental(self, product_name: str, brand: str, model_number: str = None) -> Dict[str, Any]:
        """Perform experimental competitive analysis using Gemini 2.5 Flash Preview with grounded search."""
        try:
            print(f"🧪 Running experimental analysis with Gemini 2.5 Flash Preview...", file=sys.stderr)
            
            # Create the experimental prompt
            prompt = self.create_experimental_prompt(product_name, brand, model_number)
            
            # Create content for the model
            contents = [
                types.Content(
                    role="user",
                    parts=[
                        types.Part.from_text(text=prompt),
                    ],
                ),
            ]
            
            # Configure generation with thinking budget and grounded search
            generate_content_config = types.GenerateContentConfig(
                thinking_config=types.ThinkingConfig(
                    thinking_budget=8000,
                ),
                response_mime_type="text/plain",
                # Enable grounded search
                tools=[
                    types.Tool(
                        google_search=types.GoogleSearch()
                    )
                ]
            )

            print("🤖 Generating experimental analysis with grounded search...", file=sys.stderr)
            
            sources = []
            response_text = ""
            
            try:
                # Try with grounded search first
                response = self.client.models.generate_content(
                    model=self.model,
                    contents=contents,
                    config=generate_content_config,
                )
                
                response_text = response.text if hasattr(response, 'text') else str(response)
                
                # Extract grounded sources
                if hasattr(response, 'candidates') and response.candidates:
                    candidate = response.candidates[0]
                    
                    # Check for grounding metadata
                    if hasattr(candidate, 'grounding_metadata') and candidate.grounding_metadata:
                        print("📚 Extracting grounded sources...", file=sys.stderr)
                        grounding_data = candidate.grounding_metadata
                        
                        # Handle different grounding metadata structures
                        if hasattr(grounding_data, 'search_entry_point'):
                            sources.append({
                                "type": "search_entry_point",
                                "url": str(grounding_data.search_entry_point.rendered_content) if hasattr(grounding_data.search_entry_point, 'rendered_content') else str(grounding_data.search_entry_point)
                            })
                        
                        if hasattr(grounding_data, 'grounding_chunks'):
                            for chunk in grounding_data.grounding_chunks:
                                if hasattr(chunk, 'web') and chunk.web:
                                    sources.append({
                                        "type": "web_source",
                                        "url": chunk.web.uri if hasattr(chunk.web, 'uri') else str(chunk.web),
                                        "title": chunk.web.title if hasattr(chunk.web, 'title') else "N/A"
                                    })
                        
                        if hasattr(grounding_data, 'web_search_queries'):
                            for query in grounding_data.web_search_queries:
                                sources.append({
                                    "type": "search_query",
                                    "query": str(query)
                                })
                
            except Exception as grounded_error:
                print(f"⚠️ Grounded search failed, falling back to regular generation: {grounded_error}", file=sys.stderr)
                
                # Fallback to regular generation without grounding
                fallback_config = types.GenerateContentConfig(
                    thinking_config=types.ThinkingConfig(
                        thinking_budget=8000,
                    ),
                    response_mime_type="text/plain",
                )
                
                response = self.client.models.generate_content(
                    model=self.model,
                    contents=contents,
                    config=fallback_config,
                )
                
                response_text = response.text if hasattr(response, 'text') else str(response)
            
            if not response_text.strip():
                raise Exception("Empty response from Gemini API")
                
            print("✅ Experimental analysis completed", file=sys.stderr)
            
            # Parse retailer data from the analysis
            retailers = parse_retailer_data(response_text)
            
            # Convert to standardized format for backend API
            standardized_retailers = self.convert_to_standard_format(retailers)
            
            # Return structured response
            return {
                'success': True,
                'retailers': standardized_retailers,  # Primary output for API
                'data': {
                    'analysis': response_text,
                    'raw_response': response_text,
                    'sources': sources,
                    'retailers': retailers
                },
                'metadata': {
                    'productName': product_name,
                    'brand': brand,
                    'modelNumber': model_number or '',
                    'model_used': self.model,
                    'timestamp': '2025-06-19T00:00:00Z',
                    'source': 'Google Gemini 2.5 Flash Preview (Experimental)',
                    'thinking_budget': 8000,
                    'grounded_search': len(sources) > 0,
                    'retailers_found': len(standardized_retailers)
                }
            }
            
        except Exception as e:
            print(f"❌ Experimental analysis error: {str(e)}", file=sys.stderr)
            return {
                'success': False,
                'error': str(e),
                'code': 'EXPERIMENTAL_ANALYSIS_ERROR'
            }
    
    def convert_to_standard_format(self, retailers: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Convert retailer data to standardized format for backend API."""
        standardized = []
        
        for retailer in retailers:
            # Extract price value without currency symbols
            price_value = retailer.get('price', '0.00')
            if isinstance(price_value, str):
                # Remove currency symbols and clean up
                import re
                price_match = re.search(r'[\d,]+\.?\d*', price_value)
                if price_match:
                    price_value = price_match.group(0).replace(',', '')
                else:
                    price_value = '0.00'
            
            # Determine the best URL to use
            url = retailer.get('product_url') or retailer.get('url', '')
            
            standard_retailer = {
                'retailer': retailer.get('retailer', 'Unknown Retailer'),
                'officialsite': bool(retailer.get('official_site', False)),
                'url': url,
                'price': price_value
            }
            
            standardized.append(standard_retailer)
        
        return standardized

def format_columns(result: Dict[str, Any]) -> str:
    """Format the analysis result in a nice column-based layout."""
    if not result.get('success'):
        return f"❌ ERROR: {result.get('error', 'Unknown error')}"
    
    data = result.get('data', {})
    metadata = result.get('metadata', {})
    sources = data.get('sources', [])
    retailers = data.get('retailers', [])
    analysis = data.get('analysis', '')
    
    # Create formatted output
    output = []
    
    # Header
    output.append("=" * 120)
    output.append(f"🧪 EXPERIMENTAL COMPETITIVE ANALYSIS")
    output.append("=" * 120)
    
    # Product Information
    output.append("\n📋 PRODUCT INFORMATION:")
    output.append("-" * 60)
    output.append(f"{'Product:':<15} {metadata.get('productName', 'N/A')}")
    output.append(f"{'Brand:':<15} {metadata.get('brand', 'N/A')}")
    output.append(f"{'Model:':<15} {metadata.get('modelNumber', 'N/A') or 'Not specified'}")
    output.append(f"{'AI Model:':<15} {metadata.get('model_used', 'N/A')}")
    output.append(f"{'Grounded:':<15} {'✅ Yes' if metadata.get('grounded_search') else '❌ No'}")
    output.append(f"{'Retailers:':<15} {metadata.get('retailers_found', 0)} found")
    
    # Retailer Summary Table
    if retailers:
        output.append("\n� RETAILER PRICING SUMMARY:")
        output.append("-" * 120)
        output.append(f"{'RETAILER':<25} {'OFFICIAL':<10} {'PRICE':<15} {'CURRENCY':<10} {'AVAILABILITY':<20} {'URL':<30}")
        output.append("-" * 120)
        
        for retailer in retailers:
            official = "✅ YES" if retailer.get('official_site') else "❌ NO"
            price = retailer.get('price', 'N/A')
            currency = retailer.get('currency', '')
            price_display = f"{price} {currency}".strip() if price != 'N/A' else 'N/A'
            availability = retailer.get('availability', 'Unknown')[:18] + '..' if len(retailer.get('availability', '')) > 20 else retailer.get('availability', 'Unknown')
            url = retailer.get('url', 'N/A')[:28] + '..' if len(retailer.get('url', '')) > 30 else retailer.get('url', 'N/A')
            
            output.append(f"{retailer.get('retailer', 'Unknown')[:23]:<25} {official:<10} {price_display:<15} {currency:<10} {availability:<20} {url:<30}")
    else:
        output.append("\n💰 RETAILER PRICING SUMMARY:")
        output.append("-" * 60)
        output.append("No structured retailer data found.")
    
    # Detailed Analysis (abbreviated)
    output.append(f"\n� DETAILED ANALYSIS:")
    output.append("-" * 60)
    analysis_lines = analysis.split('\n')[:10]  # Show first 10 lines
    for line in analysis_lines:
        if line.strip():
            output.append(f"{line[:115]}")
    if len(analysis.split('\n')) > 10:
        output.append("... (truncated for summary view)")
    
    # Sources summary
    if sources:
        output.append(f"\n📚 SOURCES SUMMARY:")
        output.append("-" * 60)
        output.append(f"Total grounded sources: {len(sources)}")
        
        source_types = {}
        for source in sources:
            source_type = source.get('type', 'unknown')
            source_types[source_type] = source_types.get(source_type, 0) + 1
            
        for source_type, count in source_types.items():
            output.append(f"  - {source_type}: {count}")
    else:
        output.append("\n📚 SOURCES: No grounded sources available")
    
    # Footer
    output.append("\n" + "=" * 120)
    output.append(f"🕒 Generated: {metadata.get('timestamp', 'N/A')}")
    output.append(f"🔬 Source: {metadata.get('source', 'N/A')}")
    output.append("=" * 120)
    
    return '\n'.join(output)

def main():
    """Main function to run the experimental competitive analysis."""
    try:
        # Parse command line arguments
        parser = argparse.ArgumentParser(description='Experimental Competitive Analysis')
        parser.add_argument('--product', required=True, help='Product name')
        parser.add_argument('--brand', required=True, help='Brand name')
        parser.add_argument('--model-number', help='Model number (optional)')
        parser.add_argument('--api-key', help='Google Generative AI API key (or set GEMINI_API_KEY env var)')
        parser.add_argument('--format', choices=['json', 'columns', 'text'], default='json', help='Output format')
        
        args = parser.parse_args()
        
        # Get API key from argument or environment
        api_key = args.api_key or os.environ.get('GEMINI_API_KEY')
        
        if not api_key:
            # Generate fallback experimental data
            print("⚠️ No GEMINI_API_KEY found, generating experimental fallback...", file=sys.stderr)
            
            fallback_retailers = [
                {
                    "retailer": f"{args.brand} Official Store",
                    "official_site": True,
                    "url": f"https://www.{args.brand.lower()}.com",
                    "price": "99.99",
                    "currency": "USD",
                    "availability": "In Stock",
                    "product_url": f"https://www.{args.brand.lower()}.com/products"
                },
                {
                    "retailer": "Amazon",
                    "official_site": False,
                    "url": "https://www.amazon.com",
                    "price": "109.99",
                    "currency": "USD", 
                    "availability": "In Stock",
                    "product_url": "https://www.amazon.com/search"
                }
            ]
            
            # Convert to standard format for API consistency
            standardized_retailers = []
            for retailer in fallback_retailers:
                standardized_retailers.append({
                    'retailer': retailer['retailer'],
                    'officialsite': retailer['official_site'],
                    'url': retailer['url'],
                    'price': retailer['price']
                })
            
            result = {
                "success": True,
                "retailers": standardized_retailers,  # Primary output for API
                "data": {
                    "analysis": f"Experimental Analysis for {args.product} by {args.brand}\n\nThis is a fallback response for testing purposes.\n\nProduct: {args.product}\nBrand: {args.brand}\nModel: {args.model_number or 'Not specified'}\n\nNote: This is experimental data. Provide a valid GEMINI_API_KEY for real analysis.",
                    "raw_response": "Fallback experimental data",
                    "sources": [],
                    "retailers": fallback_retailers
                },
                "metadata": {
                    "productName": args.product,
                    "brand": args.brand,
                    "modelNumber": args.model_number or '',
                    "model_used": "gemini-2.5-flash-preview-04-17",
                    "timestamp": "2025-06-19T00:00:00Z",
                    "source": "Experimental Fallback (No API Key)",
                    "thinking_budget": 8000,
                    "grounded_search": False,
                    "retailers_found": len(standardized_retailers),
                    "note": "Fallback data used - provide GEMINI_API_KEY for real analysis"
                }
            }
            if args.format == 'columns':
                print(format_columns(result))
            elif args.format == 'text':
                print(f"Product: {args.product}")
                print(f"Brand: {args.brand}")
                print(f"Analysis: {result['data']['analysis']}")
            else:
                print(json.dumps(result, indent=2))
            return
        
        # Send log messages to stderr so they don't interfere with JSON output
        print(f"🧪 Experimental analysis for: {args.product} by {args.brand}", file=sys.stderr)
        if args.model_number:
            print(f"📋 Model number: {args.model_number}", file=sys.stderr)
        
        # Initialize experimental analyzer
        analyzer = ExperimentalCompetitiveAnalyzer(api_key)
        
        # Perform experimental analysis
        result = analyzer.analyze_product_experimental(args.product, args.brand, args.model_number)
        
        # Output in requested format
        if args.format == 'columns':
            print(format_columns(result))
        elif args.format == 'text':
            if result.get('success'):
                data = result.get('data', {})
                print(f"Product: {result['metadata']['productName']}")
                print(f"Brand: {result['metadata']['brand']}")
                print(f"Analysis:\n{data.get('analysis', '')}")
                if data.get('sources'):
                    print(f"\nSources:")
                    for i, source in enumerate(data['sources'], 1):
                        print(f"{i}. {source}")
            else:
                print(f"Error: {result.get('error')}")
        else:  # json format
            print(json.dumps(result, indent=2))
        
    except Exception as e:
        error_result = {
            "success": False,
            "error": str(e),
            "code": "EXPERIMENTAL_SCRIPT_ERROR"
        }
        print(json.dumps(error_result, indent=2))
        sys.exit(1)

if __name__ == "__main__":
    main()
