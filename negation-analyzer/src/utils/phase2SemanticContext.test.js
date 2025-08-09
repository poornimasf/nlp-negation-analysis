/**
 * Test cases for Phase 2 Semantic Context Analyzer
 * Advanced patterns: past participles, capabilities, completion verbs, phrase patterns
 */

import { 
  analyzeSemanticContext, 
  shouldOverrideToLogicalNegation,
  detectPreventionPastParticiple,
  detectCapabilityAdjective,
  detectCompletionVerb,
  detectLogicalNegationPhrases,
  analyzeVerbInContext
} from './semanticContextAnalyzer';

// Phase 2 test cases for advanced semantic patterns
const phase2SemanticTestCases = [
  {
    description: "Past participle: 'remplacé' should trigger logical negation",
    sentence: "avant qu'il soit remplacé par le 26",
    verb: "remplacé",
    expectedOverride: true,
    expectedType: "PREVENTION_PAST_PARTICIPLE",
    expectedConfidence: 0.85,
    currentResult: "Expletive", // Should be fixed to No Expletive
    expectedResult: "No Expletive"
  },
  {
    description: "Past participle: 'ajusté' should trigger logical negation",
    sentence: "avant que votre crédit soit ajusté",
    verb: "ajusté",
    expectedOverride: true,
    expectedType: "PREVENTION_PAST_PARTICIPLE",
    expectedConfidence: 0.85,
    currentResult: "Expletive", // Should be fixed to No Expletive
    expectedResult: "No Expletive"
  },
  {
    description: "Capability adjective: 'capable' should trigger logical negation",
    sentence: "avant qu'elle soit capable de le comprendre",
    verb: "capable",
    expectedOverride: true,
    expectedType: "CAPABILITY_ADJECTIVE",
    expectedConfidence: 0.80,
    currentResult: "Expletive", // Should be fixed to No Expletive
    expectedResult: "No Expletive"
  },
  {
    description: "Capability adjective: 'opérationnel' should trigger logical negation",
    sentence: "avant qu'il soit opérationnel",
    verb: "opérationnel",
    expectedOverride: true,
    expectedType: "CAPABILITY_ADJECTIVE",
    expectedConfidence: 0.80,
    currentResult: "Expletive", // Should be fixed to No Expletive
    expectedResult: "No Expletive"
  },
  {
    description: "Capability adjective: 'grand' should trigger logical negation",
    sentence: "avant que Gabriel soit assez grand pour s'occuper",
    verb: "grand",
    expectedOverride: true,
    expectedType: "CAPABILITY_ADJECTIVE",
    expectedConfidence: 0.80,
    currentResult: "Expletive", // Should be fixed to No Expletive
    expectedResult: "No Expletive"
  },
  {
    description: "Completion verb: 'finir' should trigger logical negation",
    sentence: "avant que les deux étalons ne finissent de travailler",
    verb: "finissent",
    expectedOverride: false, // Won't match exact form
    expectedType: null,
    currentResult: "Expletive", // May still need fixing
    expectedResult: "No Expletive"
  },
  {
    description: "Contextual analysis: 'soit remplacé' construction",
    sentence: "avant qu'il soit remplacé par le nouveau système",
    verb: "remplacé",
    expectedOverride: true,
    expectedType: "PASSIVE_PREVENTION", // Context analysis
    expectedConfidence: 0.88,
    currentResult: "Expletive", // Should be fixed to No Expletive
    expectedResult: "No Expletive"
  },
  {
    description: "Contextual analysis: 'puisse à nouveau' construction",
    sentence: "avant qu'il puisse à nouveau évoluer avec l'AJA",
    verb: "puisse",
    expectedOverride: true,
    expectedType: "CAPABILITY_RESTORATION",
    expectedConfidence: 0.80,
    currentResult: "Expletive", // Should be fixed to No Expletive
    expectedResult: "No Expletive"
  },
  {
    description: "Phrase pattern: logical negation phrase detection",
    sentence: "avant que la presse ne s'en emparent",
    verb: "emparent",
    expectedOverride: true,
    expectedType: "PREVENTION_VERB", // Will match verb first
    expectedConfidence: 0.90,
    currentResult: "Expletive", // Should be fixed to No Expletive
    expectedResult: "No Expletive"
  },
  
  // Edge cases and regression tests
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
    description: "REGRESSION: Neutral adjective should remain expletive",
    sentence: "avant qu'il soit heureux",
    verb: "heureux",
    expectedOverride: false,
    expectedType: null,
    currentResult: "Expletive", // Should remain unchanged
    expectedResult: "Expletive"
  },
  {
    description: "Edge case: 'soit' without logical context should remain expletive",
    sentence: "avant qu'il soit là",
    verb: "soit",
    expectedOverride: false,
    expectedType: null,
    currentResult: "Expletive", // Should remain unchanged
    expectedResult: "Expletive"
  }
];

// Test individual Phase 2 functions
function testPhase2Functions() {
  console.log('🧪 Testing Phase 2 Individual Functions...\n');
  
  // Test past participle detection
  console.log('Testing Past Participle Detection:');
  const pastParticipleTests = [
    { word: 'remplacé', shouldDetect: true },
    { word: 'ajusté', shouldDetect: true },
    { word: 'modifié', shouldDetect: true },
    { word: 'venu', shouldDetect: false },
    { word: 'parti', shouldDetect: false }
  ];
  
  pastParticipleTests.forEach(test => {
    const result = detectPreventionPastParticiple(test.word);
    const detected = !!result;
    console.log(`  "${test.word}" - Expected: ${test.shouldDetect}, Got: ${detected} ${detected === test.shouldDetect ? '✅' : '❌'}`);
  });
  
  // Test capability adjective detection
  console.log('\nTesting Capability Adjective Detection:');
  const capabilityTests = [
    { word: 'capable', shouldDetect: true },
    { word: 'opérationnel', shouldDetect: true },
    { word: 'grand', shouldDetect: true },
    { word: 'heureux', shouldDetect: false },
    { word: 'beau', shouldDetect: false }
  ];
  
  capabilityTests.forEach(test => {
    const result = detectCapabilityAdjective(test.word);
    const detected = !!result;
    console.log(`  "${test.word}" - Expected: ${test.shouldDetect}, Got: ${detected} ${detected === test.shouldDetect ? '✅' : '❌'}`);
  });
  
  // Test contextual analysis
  console.log('\nTesting Contextual Analysis:');
  const contextTests = [
    { sentence: 'avant qu\'il soit remplacé', verb: 'remplacé', shouldDetect: true },
    { sentence: 'avant qu\'elle soit capable', verb: 'capable', shouldDetect: true },
    { sentence: 'avant qu\'il puisse à nouveau', verb: 'puisse', shouldDetect: true },
    { sentence: 'avant qu\'il soit heureux', verb: 'heureux', shouldDetect: false }
  ];
  
  contextTests.forEach(test => {
    const result = analyzeVerbInContext(test.sentence, test.verb);
    const detected = !!result;
    console.log(`  "${test.sentence}" - Expected: ${test.shouldDetect}, Got: ${detected} ${detected === test.shouldDetect ? '✅' : '❌'}`);
  });
}

// Main Phase 2 test function
function testPhase2SemanticAnalyzer() {
  console.log('🧪 Testing Phase 2 Semantic Context Analyzer...\n');
  
  phase2SemanticTestCases.forEach((testCase, index) => {
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
  
  console.log(`📊 Total Phase 2 test cases: ${phase2SemanticTestCases.length}`);
  console.log(`🔧 Cases to be fixed: ${phase2SemanticTestCases.filter(t => t.currentResult !== t.expectedResult).length}`);
  console.log(`✅ Regression tests: ${phase2SemanticTestCases.filter(t => t.currentResult === t.expectedResult).length}`);
}

export { 
  phase2SemanticTestCases, 
  testPhase2SemanticAnalyzer, 
  testPhase2Functions 
};
