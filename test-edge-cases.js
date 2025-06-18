// Test edge cases without URL domain matching
const testEdgeCases = () => {
  // Replicate the exact logic from officialWebsiteClassifier.ts
  const classifyOfficialWebsite = (retailer, url, brandName) => {
    if (!retailer || !brandName) {
      return {
        isOfficial: false,
        confidence: 0,
        matchType: 'none',
        details: 'Missing retailer name or brand name'
      };
    }
    
    const retailerLower = retailer.toLowerCase();
    const brandLower = brandName.toLowerCase();
    const urlLower = url?.toLowerCase() || '';
    
    // Helper function to check if brand name is contained in text (partial match)
    const containsBrandName = (text, brand) => {
      const textWords = text.toLowerCase().split(/[\s\-_\.]+/);
      const brandWords = brand.toLowerCase().split(/[\s\-_\.]+/);
      
      // For single brand words, check if any text word contains the brand word
      if (brandWords.length === 1) {
        const brandWord = brandWords[0];
        if (brandWord.length > 2) {
          return textWords.some(textWord => 
            textWord.includes(brandWord) || textWord === brandWord
          );
        }
      }
      
      // For multi-word brands, check if all significant brand words appear in text
      const significantBrandWords = brandWords.filter(word => word.length > 2);
      if (significantBrandWords.length === 0) return false;
      
      // At least one significant brand word must appear in the text
      return significantBrandWords.some(brandWord => 
        textWords.some(textWord => 
          textWord.includes(brandWord) || brandWord.includes(textWord) || textWord === brandWord
        )
      );
    };
    
    // 1. EXACT MATCH CHECK
    if (retailerLower === brandLower) {
      return {
        isOfficial: true,
        confidence: 1.0,
        matchType: 'exact',
        details: 'Exact brand name match'
      };
    }
    
    // 2. EXPLICIT OFFICIAL INDICATORS
    const officialIndicators = ['official', 'store', 'direct', 'global', 'international', 'worldwide'];
    const hasOfficialIndicator = officialIndicators.some(indicator => 
      retailerLower.includes(`${brandLower} ${indicator}`) ||
      retailerLower.includes(`${indicator} ${brandLower}`) ||
      (retailerLower.includes(brandLower) && retailerLower.includes(indicator))
    );
    
    if (hasOfficialIndicator) {
      return {
        isOfficial: true,
        confidence: 0.9,
        matchType: 'variation',
        details: 'Brand name with official indicator'
      };
    }
    
    // 3. URL-BASED CLASSIFICATION
    const brandInOfficialDomain = (
      urlLower.includes(`${brandLower}.com`) ||
      urlLower.includes(`www.${brandLower}.com`) ||
      urlLower.includes(`${brandLower}.net`) ||
      urlLower.includes(`${brandLower}.org`)
    );
    
    if (brandInOfficialDomain) {
      return {
        isOfficial: true,
        confidence: 0.95,
        matchType: 'url',
        details: 'Brand name in official domain'
      };
    }
    
    // 4. PARTIAL BRAND NAME MATCHING
    if (containsBrandName(retailerLower, brandLower)) {
      // Check for regional variations (e.g., "Asus Singapore", "Apple Store UK")
      const regionalIndicators = ['singapore', 'usa', 'uk', 'australia', 'canada', 'japan', 'germany', 'france'];
      const hasRegionalVariation = regionalIndicators.some(region => 
        retailerLower.includes(region)
      );
      
      if (hasRegionalVariation) {
        return {
          isOfficial: true,
          confidence: 0.85,
          matchType: 'partial',
          details: 'Brand name with regional variation'
        };
      }
      
      return {
        isOfficial: true,
        confidence: 0.75,
        matchType: 'partial',
        details: 'Partial brand name match'
      };
    }
    
    // 5. BRAND VARIATIONS CHECK
    const brandVariations = [
      `${brandLower} official`,
      `${brandLower} store`,
      `${brandLower} singapore`,
      `${brandLower} global`,
      `${brandLower} direct`,
      `${brandLower} online`,
      `official ${brandLower}`,
      `${brandLower} international`,
      `${brandLower} worldwide`
    ];
    
    const matchedVariation = brandVariations.find(variation => 
      retailerLower === variation || 
      retailerLower.includes(variation) ||
      variation.includes(retailerLower)
    );
    
    if (matchedVariation) {
      return {
        isOfficial: true,
        confidence: 0.8,
        matchType: 'variation',
        details: `Matched variation: ${matchedVariation}`
      };
    }
    
    // NOT OFFICIAL
    return {
      isOfficial: false,
      confidence: 0,
      matchType: 'none',
      details: 'No official indicators found'
    };
  };

  console.log('=== Testing Edge Cases (No URL Domain Match) ===\n');
  
  const testCases = [
    { retailer: 'Mango Singapore', brand: 'Mango', url: 'https://lazada.com/mango-store' },
    { retailer: 'Apple Singapore', brand: 'Apple', url: 'https://shopify.com/apple-store' },
    { retailer: 'Nike Store', brand: 'Nike', url: 'https://thirdparty.com' },
    { retailer: 'Samsung Singapore', brand: 'Samsung', url: 'https://marketplace.com' },
    { retailer: 'Zara Singapore', brand: 'Zara', url: 'https://shopping.com' },
    { retailer: 'Uniqlo Singapore', brand: 'Uniqlo', url: 'https://ecommerce.com' },
  ];
  
  testCases.forEach(({ retailer, brand, url }) => {
    const result = classifyOfficialWebsite(retailer, url, brand);
    console.log(`🔍 Testing: "${retailer}" for brand "${brand}"`);
    console.log(`   URL: ${url}`);
    console.log(`   Result: ${result.isOfficial ? '✅ OFFICIAL' : '❌ NOT OFFICIAL'}`);
    console.log(`   Confidence: ${result.confidence}`);
    console.log(`   Match Type: ${result.matchType}`);
    console.log(`   Details: ${result.details}`);
    console.log('');
  });
};

// Run the test
testEdgeCases();
