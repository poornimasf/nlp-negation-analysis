/**
 * Test cases for Semantic Context Analyzer
 * Phase 1: Prevention Verb Detection
 */

import { 
  analyzeSemanticContext, 
  shouldOverrideToLogicalNegation,
  detectPreventionVerb,
  detectAdversarialContext 
} from './semanticContextAnalyzer';

// Test cases for false positives that should be fixed
const semanticContextTestCases = [
  {
    description: "Prevention verb: 'emparer' should trigger logical negation",
    sentence: "avant que la presse ou le camp adverse ne s'en emparent",
    verb: "emparent",
    expectedOverride: true,
    expectedType: "PREVENTION_VERB",
    expectedConfidence: 0.90,
    currentResult: "Expletive", // Should be fixed to No Expletive
    expectedResult: "No Expletive"
  },
  {
    description: "Prevention verb: 'remarquer' should trigger logical negation",
    sentence: "avant qu'on les remarque",
    verb: "remarque",
    expectedOverride: true,
    expectedType: "PREVENTION_VERB",
    expectedConfidence: 0.90,
    currentResult: "Expletive", // Should be fixed to No Expletive
    expectedResult: "No Expletive"
  },
  {
    description: "Prevention verb: 'entraîner' should trigger logical negation",
    sentence: "avant que les contre-frappes n'entraînent leur cessation",
    verb: "entraînent",
    expectedOverride: true,
    expectedType: "PREVENTION_VERB",
    expectedConfidence: 0.90,
    currentResult: "Expletive", // Should be fixed to No Expletive
    expectedResult: "No Expletive"
  },
  {
    description: "Prevention verb: 'remplacer' should trigger logical negation",
    sentence: "avant qu'il soit remplacé par le 26",
    verb: "remplacé", // Note: past participle form
    expectedOverride: false, // Won't match exact verb form
    expectedType: null,
    currentResult: "Expletive", // May still need fixing
    expectedResult: "No Expletive"
  },
  {
    description: "Adversarial context: 'presse' should trigger logical negation",
    sentence: "avant que la presse ne s'en emparent",
    verb: "emparent",
    expectedOverride: true,
    expectedType: "PREVENTION_VERB", // Will match verb first
    expectedConfidence: 0.90,
    currentResult: "Expletive", // Should be fixed to No Expletive
    expectedResult: "No Expletive"
  },
  
  // Regression tests - these should NOT be overridden
  {
    description: "REGRESSION: Neutral verb 'venir' should remain expletive",
    sentence: "avant qu'il vienne",
    verb: "vienne",
    expectedOverride: false,
    expectedType: null,
    currentResult: "Expletive", // Should remain unchanged
    expectedResult: "Expletive"
  },
  {
    description: "REGRESSION: Neutral verb 'partir' should remain expletive",
    sentence: "avant qu'elle parte",
    verb: "parte",
    expectedOverride: false,
    expectedType: null,
    currentResult: "Expletive", // Should remain unchanged
    expectedResult: "Expletive"
  },
  {
    description: "REGRESSION: Neutral verb 'arriver' should remain expletive",
    sentence: "avant qu'il arrive",
    verb: "arrive",
    expectedOverride: false,
    expectedType: null,
    currentResult: "Expletive", // Should remain unchanged
    expectedResult: "Expletive"
  }
];

// Manual testing function
function testSemanticContextAnalyzer() {
  console.log('🧪 Testing Semantic Context Analyzer (Phase 1)...\n');
  
  semanticContextTestCases.forEach((testCase, index) => {
    console.log(`Test ${index + 1}: ${testCase.description}`);
    console.log(`  Sentence: "${testCase.sentence}"`);
    console.log(`  Verb: "${testCase.verb}"`);
    
    // Test semantic context analysis
    const semanticContext = analyzeSemanticContext(testCase.sentence, testCase.verb);
    const shouldOverride = shouldOverrideToLogicalNegation(semanticContext);
    
    console.log(`  Semantic Context: ${JSON.stringify(semanticContext, null, 2)}`);
    console.log(`  Should Override: ${shouldOverride}`);
    console.log(`  Expected Override: ${testCase.expectedOverride}`);
    console.log(`  Current Result: ${testCase.currentResult}`);
    console.log(`  Expected Result: ${testCase.expectedResult}`);
    
    // Check if test passes
    const overrideMatch = shouldOverride === testCase.expectedOverride;
    const typeMatch = !semanticContext || semanticContext.type === testCase.expectedType;
    
    if (overrideMatch && typeMatch) {
      console.log(`  ✅ PASS`);
    } else {
      console.log(`  ❌ FAIL`);
      if (!overrideMatch) {
        console.log(`    Override mismatch: expected ${testCase.expectedOverride}, got ${shouldOverride}`);
      }
      if (!typeMatch) {
        console.log(`    Type mismatch: expected ${testCase.expectedType}, got ${semanticContext?.type}`);
      }
    }
    console.log('');
  });
  
  console.log(`📊 Total test cases: ${semanticContextTestCases.length}`);
  console.log(`🔧 Cases to be fixed: ${semanticContextTestCases.filter(t => t.currentResult !== t.expectedResult).length}`);
  console.log(`✅ Regression tests: ${semanticContextTestCases.filter(t => t.currentResult === t.expectedResult).length}`);
}

// Test individual functions
function testPreventionVerbDetection() {
  console.log('🧪 Testing Prevention Verb Detection...\n');
  
  const testVerbs = [
    { verb: 'emparer', shouldDetect: true },
    { verb: 'emparent', shouldDetect: true },
    { verb: 'remarquer', shouldDetect: true },
    { verb: 'remarque', shouldDetect: true },
    { verb: 'entraîner', shouldDetect: true },
    { verb: 'entraînent', shouldDetect: true },
    { verb: 'venir', shouldDetect: false },
    { verb: 'partir', shouldDetect: false },
    { verb: 'arriver', shouldDetect: false }
  ];
  
  testVerbs.forEach(test => {
    const result = detectPreventionVerb(test.verb);
    const detected = !!result;
    
    console.log(`Verb: "${test.verb}" - Expected: ${test.shouldDetect}, Got: ${detected} ${detected === test.shouldDetect ? '✅' : '❌'}`);
  });
}

export { 
  semanticContextTestCases, 
  testSemanticContextAnalyzer, 
  testPreventionVerbDetection 
};
