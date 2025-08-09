/**
 * Test cases for Context Validation (Phase 1 Fix)
 * Verify that neutral temporal contexts are properly identified and confidence reduced
 */

import { 
  analyzeSemanticContext, 
  shouldOverrideToLogicalNegation 
} from './semanticContextAnalyzer';

// Test cases for context validation - these should NOT be overridden after validation
const contextValidationTestCases = [
  {
    description: "Administrative process: 'lancement soit reporté' should be expletive",
    sentence: "Ce service annoncé dans un premier temps pour le mois d'août dernier avant que son lancement soit reporté pour le mois d'octobre",
    verb: "reporté",
    expectedOverride: false, // Should NOT override after validation
    expectedReason: "Neutral administrative process",
    currentResult: "No Expletive", // Currently wrong
    expectedResult: "Expletive" // Should be corrected
  },
  {
    description: "Official designation: 'la cour le désigne officiellement' should be expletive",
    sentence: "avant que la cour le désigne officiellement comme tuteur",
    verb: "désigne",
    expectedOverride: false, // Should NOT override after validation
    expectedReason: "Neutral official process",
    currentResult: "No Expletive", // Currently wrong
    expectedResult: "Expletive" // Should be corrected
  },
  {
    description: "Process beginning: 'vous commenciez à examiner' should be expletive",
    sentence: "avant que vous commenciez à examiner les taux d'intérêt",
    verb: "commenciez",
    expectedOverride: false, // Should NOT override after validation
    expectedReason: "Neutral temporal sequence",
    currentResult: "No Expletive", // Currently wrong
    expectedResult: "Expletive" // Should be corrected
  },
  {
    description: "Natural process: 'la vallée soit submergée' should be expletive",
    sentence: "avant que la vallée soit submergée, et ce, pour aller à la rencontre",
    verb: "submergée",
    expectedOverride: false, // Should NOT override after validation
    expectedReason: "Neutral natural process",
    currentResult: "No Expletive", // Currently wrong
    expectedResult: "Expletive" // Should be corrected
  },
  {
    description: "Neutral action: 'ce dernier le conduise' should be expletive",
    sentence: "avant que ce dernier le conduise aux douches pour espionner",
    verb: "conduise",
    expectedOverride: false, // Should NOT override after validation
    expectedReason: "Neutral action sequence",
    currentResult: "No Expletive", // Currently wrong
    expectedResult: "Expletive" // Should be corrected
  },
  {
    description: "Physical action: 'elle s'accroche' should be expletive",
    sentence: "sinon le poids va la faire tomber avant qu'elle s'accroche",
    verb: "accroche",
    expectedOverride: false, // Should NOT override after validation
    expectedReason: "Neutral physical action",
    currentResult: "No Expletive", // Currently wrong
    expectedResult: "Expletive" // Should be corrected
  },
  
  // Regression tests - these should STILL be overridden (true prevention contexts)
  {
    description: "REGRESSION: True prevention 'la presse ne s'en emparent' should remain No Expletive",
    sentence: "avant que la presse ou le camp adverse ne s'en emparent",
    verb: "emparent",
    expectedOverride: true, // Should still override
    expectedReason: "True prevention context",
    currentResult: "No Expletive", // Should remain
    expectedResult: "No Expletive" // Should remain unchanged
  },
  {
    description: "REGRESSION: True prevention 'cela empire' should remain No Expletive",
    sentence: "comment réparer avant que cela empire",
    verb: "empire",
    expectedOverride: true, // Should still override
    expectedReason: "True prevention of worsening",
    currentResult: "No Expletive", // Should remain
    expectedResult: "No Expletive" // Should remain unchanged
  }
];

// Test the validation logic specifically
function testContextValidation() {
  console.log('🧪 Testing Context Validation (Phase 1 Fix)...\n');
  
  contextValidationTestCases.forEach((testCase, index) => {
    console.log(`Test ${index + 1}: ${testCase.description}`);
    console.log(`  Sentence: "${testCase.sentence}"`);
    console.log(`  Verb: "${testCase.verb}"`);
    
    // Test semantic context analysis with validation
    const semanticContext = analyzeSemanticContext(testCase.sentence, testCase.verb);
    const shouldOverride = shouldOverrideToLogicalNegation(semanticContext);
    
    console.log(`  Semantic Context:`, semanticContext ? {
      type: semanticContext.type,
      confidence: semanticContext.confidence,
      originalConfidence: semanticContext.originalConfidence,
      validationApplied: semanticContext.validationApplied,
      confidenceReduction: semanticContext.confidenceReduction
    } : null);
    
    console.log(`  Should Override: ${shouldOverride}`);
    console.log(`  Expected Override: ${testCase.expectedOverride}`);
    console.log(`  Current Result: ${testCase.currentResult}`);
    console.log(`  Expected Result: ${testCase.expectedResult}`);
    
    // Check if validation worked correctly
    const validationWorked = shouldOverride === testCase.expectedOverride;
    const isRegression = testCase.description.includes('REGRESSION');
    
    if (validationWorked) {
      console.log(`  ✅ ${isRegression ? 'REGRESSION PROTECTED' : 'VALIDATION SUCCESSFUL'}`);
    } else {
      console.log(`  ❌ ${isRegression ? 'REGRESSION FAILED' : 'VALIDATION FAILED'}`);
      if (semanticContext) {
        console.log(`    Original confidence: ${semanticContext.originalConfidence}`);
        console.log(`    Adjusted confidence: ${semanticContext.confidence}`);
        console.log(`    Validation applied: ${semanticContext.validationApplied}`);
      }
    }
    console.log('');
  });
  
  console.log(`📊 Total test cases: ${contextValidationTestCases.length}`);
  console.log(`🔧 Cases to be fixed: ${contextValidationTestCases.filter(t => t.currentResult !== t.expectedResult && !t.description.includes('REGRESSION')).length}`);
  console.log(`✅ Regression tests: ${contextValidationTestCases.filter(t => t.description.includes('REGRESSION')).length}`);
}

// Test specific validation scenarios
function testValidationScenarios() {
  console.log('🧪 Testing Specific Validation Scenarios...\n');
  
  const validationScenarios = [
    {
      name: 'Neutral Temporal Indicator',
      sentence: 'avant que son lancement soit reporté dans un premier temps',
      verb: 'reporté',
      expectedReduction: true
    },
    {
      name: 'Administrative Process Context',
      sentence: 'avant que la cour le désigne officiellement',
      verb: 'désigne',
      expectedReduction: true
    },
    {
      name: 'True Prevention Context',
      sentence: 'avant que la presse ne s\'en emparent pour nuire',
      verb: 'emparent',
      expectedReduction: false // Should not be reduced
    }
  ];
  
  validationScenarios.forEach(scenario => {
    console.log(`Testing: ${scenario.name}`);
    const semanticContext = analyzeSemanticContext(scenario.sentence, scenario.verb);
    
    if (semanticContext) {
      const wasReduced = semanticContext.validationApplied;
      console.log(`  Validation applied: ${wasReduced}`);
      console.log(`  Expected reduction: ${scenario.expectedReduction}`);
      console.log(`  Result: ${wasReduced === scenario.expectedReduction ? '✅' : '❌'}`);
      
      if (semanticContext.originalConfidence) {
        console.log(`  Original confidence: ${semanticContext.originalConfidence}`);
        console.log(`  Adjusted confidence: ${semanticContext.confidence}`);
        console.log(`  Reduction factor: ${semanticContext.confidenceReduction}`);
      }
    } else {
      console.log(`  No semantic context detected`);
    }
    console.log('');
  });
}

export { 
  contextValidationTestCases, 
  testContextValidation, 
  testValidationScenarios 
};
