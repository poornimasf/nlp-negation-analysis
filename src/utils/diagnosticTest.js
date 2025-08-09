/**
 * Simple diagnostic test to verify if verb extraction is working
 * This will help identify if the issue is with verb detection or something else
 */

// Test the verb extraction patterns directly
function testVerbExtraction() {
  console.log('🧪 DIAGNOSTIC: Testing verb extraction patterns');
  
  const testSentences = [
    "avant que son lancement soit reporté pour le mois",
    "avant que la cour le désigne officiellement",
    "avant que vous commenciez à examiner",
    "avant que la vallée soit submergée",
    "avant que ce dernier le conduise",
    "avant qu'elle s'accroche"
  ];
  
  testSentences.forEach((sentence, index) => {
    console.log(`\n--- Test ${index + 1}: "${sentence}" ---`);
    
    // Test pattern 1: soit + past participle
    if (sentence.toLowerCase().includes('soit')) {
      const soitMatch = sentence.toLowerCase().match(/soit\s+(\w+)/);
      if (soitMatch) {
        console.log(`✅ Pattern 1 (soit + participle): "${soitMatch[1]}"`);
      } else {
        console.log(`❌ Pattern 1: No match`);
      }
    }
    
    // Test pattern 2: reflexive constructions
    const reflexiveMatch = sentence.toLowerCase().match(/avant\s+que?\s+[^.]*?\bse\s+(\w+)/);
    if (reflexiveMatch) {
      console.log(`✅ Pattern 2 (reflexive): "${reflexiveMatch[1]}"`);
    } else {
      console.log(`❌ Pattern 2: No reflexive match`);
    }
    
    // Test pattern 3: general verb pattern
    const generalMatch = sentence.toLowerCase().match(/avant\s+que?\s+[^.]*?(\w+(?:e|é|ée|és|ées|i|ie|is|it|u|ue|us|ues))\b/);
    if (generalMatch) {
      console.log(`✅ Pattern 3 (general): "${generalMatch[1]}"`);
    } else {
      console.log(`❌ Pattern 3: No general match`);
    }
  });
}

// Test if the enhanced training analyzer is being called
function testEnhancedTrainingAnalyzer() {
  console.log('🧪 DIAGNOSTIC: Testing enhanced training analyzer integration');
  
  // This should be called from the browser console to test
  console.log('To test in browser:');
  console.log('1. Open browser console');
  console.log('2. Run: testVerbExtraction()');
  console.log('3. Check if patterns are matching correctly');
}

// Export for browser testing
if (typeof window !== 'undefined') {
  window.testVerbExtraction = testVerbExtraction;
  window.testEnhancedTrainingAnalyzer = testEnhancedTrainingAnalyzer;
}

export { testVerbExtraction, testEnhancedTrainingAnalyzer };
