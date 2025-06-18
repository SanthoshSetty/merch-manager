/**
 * Enhanced Official Website Classification Utility
 * 
 * This utility provides advanced logic to determine if a retailer/URL represents
 * an official brand website, including partial matching and semantic similarity.
 */

export interface ClassificationResult {
  isOfficial: boolean;
  confidence: number;
  matchType: 'exact' | 'partial' | 'semantic' | 'variation' | 'url' | 'none';
  details: string;
}

/**
 * Enhanced function to check if a retailer/URL is an official brand website
 */
export const isOfficialWebsite = (
  retailer: string, 
  url: string, 
  brandName: string
): boolean => {
  const result = classifyOfficialWebsite(retailer, url, brandName);
  return result.isOfficial;
};

/**
 * Detailed classification with confidence score and reasoning
 */
export const classifyOfficialWebsite = (
  retailer: string, 
  url: string, 
  brandName: string
): ClassificationResult => {
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
  
  // Helper function to calculate simple text similarity (Jaccard similarity)
  const calculateSimilarity = (str1: string, str2: string): number => {
    const words1 = new Set(str1.toLowerCase().split(/\s+/));
    const words2 = new Set(str2.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  };
  
  // Helper function to check if brand name is contained in text (partial match)
  const containsBrandName = (text: string, brand: string): boolean => {
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
  
  // 5. URL PARTIAL MATCHING
  if (containsBrandName(urlLower, brandLower)) {
    const commonExtensions = ['.com', '.net', '.org', '.sg', '.uk', '.au', '.us', '.ca'];
    const hasValidExtension = commonExtensions.some(ext => urlLower.includes(ext));
    
    if (hasValidExtension) {
      return {
        isOfficial: true,
        confidence: 0.8,
        matchType: 'url',
        details: 'Brand name in URL with valid extension'
      };
    }
  }
  
  // 6. SEMANTIC SIMILARITY CHECK
  const semanticSimilarity = calculateSimilarity(retailerLower, brandLower);
  if (semanticSimilarity > 0.6) {
    return {
      isOfficial: true,
      confidence: semanticSimilarity,
      matchType: 'semantic',
      details: `High semantic similarity (${Math.round(semanticSimilarity * 100)}%)`
    };
  }
  
  // 7. BRAND VARIATIONS CHECK
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
  
  // 8. WORD OVERLAP CHECK
  const brandWords = brandLower.split(/\s+/).filter(word => word.length > 2);
  const retailerWords = retailerLower.split(/\s+/).filter(word => word.length > 2);
  
  if (brandWords.length > 0) {
    const matchingWords = brandWords.filter(brandWord => 
      retailerWords.some(retailerWord => 
        retailerWord.includes(brandWord) || brandWord.includes(retailerWord)
      )
    );
    
    const overlapRatio = matchingWords.length / brandWords.length;
    if (overlapRatio >= 0.7) { // 70% of brand words must match
      return {
        isOfficial: true,
        confidence: 0.6 + (overlapRatio * 0.2), // 0.6 to 0.8 confidence
        matchType: 'partial',
        details: `Significant word overlap (${Math.round(overlapRatio * 100)}%)`
      };
    }
  }
  
  // 9. NOT OFFICIAL
  return {
    isOfficial: false,
    confidence: 0,
    matchType: 'none',
    details: 'No official indicators found'
  };
};

/**
 * Get human-readable explanation of the classification
 */
export const getClassificationExplanation = (result: ClassificationResult): string => {
  if (!result.isOfficial) {
    return 'Third-party retailer - no official brand indicators found';
  }
  
  const confidenceText = result.confidence >= 0.9 ? 'Very High' :
                        result.confidence >= 0.8 ? 'High' :
                        result.confidence >= 0.7 ? 'Medium' : 'Low';
  
  return `Official website detected (${confidenceText} confidence) - ${result.details}`;
};

/**
 * Enhanced examples for testing
 */
export const testCases = [
  // Exact matches
  { retailer: 'Apple', brand: 'Apple', expected: true },
  { retailer: 'Samsung', brand: 'Samsung', expected: true },
  
  // Regional variations
  { retailer: 'Apple Singapore', brand: 'Apple', expected: true },
  { retailer: 'Samsung Store UK', brand: 'Samsung', expected: true },
  { retailer: 'Asus Singapore', brand: 'Asus', expected: true },
  
  // Official indicators
  { retailer: 'Sony Official Store', brand: 'Sony', expected: true },
  { retailer: 'Official Nintendo Store', brand: 'Nintendo', expected: true },
  
  // URL matches
  { retailer: 'Sony Store', brand: 'Sony', url: 'https://www.sony.com', expected: true },
  
  // Third-party
  { retailer: 'Amazon', brand: 'Apple', expected: false },
  { retailer: 'Best Buy', brand: 'Samsung', expected: false },
];
