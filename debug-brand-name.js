// Test the containsBrandName function specifically
const testContainsBrandName = () => {
  const containsBrandName = (text, brand) => {
    const textWords = text.toLowerCase().split(/[\s\-_\.]+/);
    const brandWords = brand.toLowerCase().split(/[\s\-_\.]+/);
    
    console.log(`Testing: "${text}" contains "${brand}"`);
    console.log(`Text words: [${textWords.join(', ')}]`);
    console.log(`Brand words: [${brandWords.join(', ')}]`);
    
    // For single brand words, check if any text word contains the brand word
    if (brandWords.length === 1) {
      const brandWord = brandWords[0];
      console.log(`Single brand word: "${brandWord}"`);
      if (brandWord.length > 2) {
        const result = textWords.some(textWord => 
          textWord.includes(brandWord) || textWord === brandWord
        );
        console.log(`Result: ${result}`);
        return result;
      }
    }
    
    // For multi-word brands, check if all significant brand words appear in text
    const significantBrandWords = brandWords.filter(word => word.length > 2);
    console.log(`Significant brand words: [${significantBrandWords.join(', ')}]`);
    if (significantBrandWords.length === 0) return false;
    
    // At least one significant brand word must appear in the text
    const result = significantBrandWords.some(brandWord => 
      textWords.some(textWord => 
        textWord.includes(brandWord) || brandWord.includes(textWord) || textWord === brandWord
      )
    );
    console.log(`Result: ${result}`);
    return result;
  };

  // Test cases
  console.log('=== Testing containsBrandName function ===\n');
  
  const tests = [
    { text: 'Mango Singapore', brand: 'Mango' },
    { text: 'Apple Singapore', brand: 'Apple' },
    { text: 'Nike Store', brand: 'Nike' },
    { text: 'Amazon', brand: 'Mango' },
    { text: 'mango singapore', brand: 'Mango' },
  ];
  
  tests.forEach(({ text, brand }) => {
    const result = containsBrandName(text, brand);
    console.log(`\n"${text}" contains "${brand}": ${result}`);
    console.log('---');
  });
};

// Call the test function
testContainsBrandName();
