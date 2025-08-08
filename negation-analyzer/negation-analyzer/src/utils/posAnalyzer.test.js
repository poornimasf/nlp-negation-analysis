/**
 * Test cases for POS Analyzer
 * Verify that conservative noun detection works correctly
 */

import { isDefinitelyNoun, analyzeWordPOS, SAFE_FRENCH_NOUNS } from './posAnalyzer';

// Test cases for the problematic sentence
const testCases = [
  {
    description: "Should identify 'vent' as noun in 'le vent l'emporte'",
    word: "vent",
    context: "Avant que le vent l'emporte",
    expectedPOS: "Noun",
    expectedSkip: true
  },
  {
    description: "Should identify 'temps' as noun in 'le temps passe'",
    word: "temps", 
    context: "avant que le temps passe",
    expectedPOS: "Noun",
    expectedSkip: true
  },
  {
    description: "Should NOT skip 'vienne' (real verb)",
    word: "vienne",
    context: "avant qu'il vienne",
    expectedPOS: "Unknown",
    expectedSkip: false
  },
  {
    description: "Should NOT skip 'parte' (real verb)",
    word: "parte",
    context: "avant qu'elle parte", 
    expectedPOS: "Unknown",
    expectedSkip: false
  },
  {
    description: "Should identify 'eau' as noun with article",
    word: "eau",
    context: "avant que l'eau coule",
    expectedPOS: "Noun", 
    expectedSkip: true
  },
  {
    description: "Should NOT skip 'eau' without article (edge case)",
    word: "eau",
    context: "avant qu'eau coule", // No article
    expectedPOS: "PossibleNoun",
    expectedSkip: false
  }
];

// Manual testing function (can be called from console)
function testPOSAnalyzer() {
  console.log('🧪 Testing POS Analyzer...\n');
  
  testCases.forEach((testCase, index) => {
    console.log(`Test ${index + 1}: ${testCase.description}`);
    
    const result = analyzeWordPOS(testCase.word, testCase.context);
    const isDefinitelyNounResult = isDefinitelyNoun(testCase.word, testCase.context);
    
    console.log(`  Word: "${testCase.word}"`);
    console.log(`  Context: "${testCase.context}"`);
    console.log(`  Result: ${JSON.stringify(result, null, 2)}`);
    console.log(`  isDefinitelyNoun: ${isDefinitelyNounResult}`);
    
    // Check expectations
    const posMatch = result.pos === testCase.expectedPOS;
    const skipMatch = result.shouldSkipVerbAnalysis === testCase.expectedSkip;
    
    if (posMatch && skipMatch) {
      console.log(`  ✅ PASS\n`);
    } else {
      console.log(`  ❌ FAIL`);
      console.log(`    Expected POS: ${testCase.expectedPOS}, Got: ${result.pos}`);
      console.log(`    Expected Skip: ${testCase.expectedSkip}, Got: ${result.shouldSkipVerbAnalysis}\n`);
    }
  });
  
  console.log(`📊 Safe French Nouns Count: ${SAFE_FRENCH_NOUNS.size}`);
  console.log(`📝 Sample nouns: ${Array.from(SAFE_FRENCH_NOUNS).slice(0, 10).join(', ')}`);
}

// Export for use in other files
export { testPOSAnalyzer, testCases };
