/**
 * Production Debug Test - Check what's actually happening with the problematic sentences
 * This will help identify why semantic context validation isn't working in production
 */

import { 
  analyzeSemanticContext, 
  shouldOverrideToLogicalNegation,
  detectPreventionVerb,
  detectPreventionPastParticiple,
  detectCapabilityAdjective,
  detectCompletionVerb,
  detectReflexiveActionVerb
} from './semanticContextAnalyzer';

// The exact sentences still showing "No Expletive" in production
const productionFailures = [
  {
    sentence: "Ce service annoncé dans un premier temps pour le mois d'août dernier avant que son lancement soit reporté pour le mois d' octobre ne sera donc effectif que vers la fin l'année.",
    expectedVerb: "reporté",
    expectedResult: "Expletive",
    expectedNeutralIndicators: ["dans un premier temps", "reporté pour"]
  },
  {
    sentence: "Expliquez-lui que des informations, dont un casier judiciaire, devront être présentées au tribunal avant que la cour le désigne officiellement comme tuteur.",
    expectedVerb: "désigne",
    expectedResult: "Expletive", 
    expectedNeutralIndicators: ["officiellement"]
  },
  {
    sentence: "Vous vous posez probablement des questions sur l'approbation préalable des prêts, la recherche de logement et les agents immobiliers, mais le processus de préparation de l'achat d'une maison commence en fait des mois, voire des années, avant que vous commenciez à examiner les taux d' intérêt.",
    expectedVerb: "commenciez",
    expectedResult: "Expletive",
    expectedNeutralIndicators: ["le processus", "en fait"]
  },
  {
    sentence: "Dans le quatrième épisode de la saison 9, Le Docteur, accompagné de Bennett et d'O'Donnell, est revenu à l'endroit où se trouvait le Baril, mais avant que la vallée soit submergée, et ce, pour aller à la rencontre du pilote du vaisseau spatial.",
    expectedVerb: "submergée",
    expectedResult: "Expletive",
    expectedNeutralIndicators: ["l'épisode", "et ce", "pour aller"]
  },
  {
    sentence: "Ce dernier fait du chantage à Xavier pour jouer dans son nouveau film avant que ce dernier le conduise aux douches pour espionner les autres garçons.",
    expectedVerb: "conduise",
    expectedResult: "Expletive",
    expectedNeutralIndicators: ["pour jouer", "pour espionner"]
  },
  {
    sentence: "Pas trop épais sinon le poids va la faire tomber avant qu'elle s'accroche ! Je reviendrai avec d'autres questions n'en doutez pas!",
    expectedVerb: "accroche",
    expectedResult: "Expletive",
    expectedNeutralIndicators: []
  }
];

function debugProductionFailures() {
  console.log('🚨 DEBUGGING PRODUCTION FAILURES - Still showing "No Expletive"\n');
  
  productionFailures.forEach((testCase, index) => {
    console.log(`\n=== PRODUCTION FAILURE ${index + 1} ===`);
    console.log(`Sentence: "${testCase.sentence.substring(0, 100)}..."`);
    console.log(`Expected verb: "${testCase.expectedVerb}"`);
    console.log(`Expected result: ${testCase.expectedResult}`);
    console.log(`Current result: No Expletive ❌`);
    
    // Test individual detection methods first
    console.log('\n--- INDIVIDUAL DETECTION TESTS ---');
    
    const preventionVerb = detectPreventionVerb(testCase.expectedVerb);
    console.log(`Prevention verb: ${preventionVerb ? `✅ ${preventionVerb.type} (${preventionVerb.confidence})` : '❌ None'}`);
    
    const pastParticiple = detectPreventionPastParticiple(testCase.expectedVerb);
    console.log(`Past participle: ${pastParticiple ? `✅ ${pastParticiple.type} (${pastParticiple.confidence})` : '❌ None'}`);
    
    const capabilityAdj = detectCapabilityAdjective(testCase.expectedVerb);
    console.log(`Capability adj: ${capabilityAdj ? `✅ ${capabilityAdj.type} (${capabilityAdj.confidence})` : '❌ None'}`);
    
    const completionVerb = detectCompletionVerb(testCase.expectedVerb);
    console.log(`Completion verb: ${completionVerb ? `✅ ${completionVerb.type} (${completionVerb.confidence})` : '❌ None'}`);
    
    const reflexiveVerb = detectReflexiveActionVerb(testCase.expectedVerb);
    console.log(`Reflexive verb: ${reflexiveVerb ? `✅ ${reflexiveVerb.type} (${reflexiveVerb.confidence})` : '❌ None'}`);
    
    // Test full semantic context analysis
    console.log('\n--- FULL SEMANTIC CONTEXT ANALYSIS ---');
    const semanticContext = analyzeSemanticContext(testCase.sentence, testCase.expectedVerb);
    
    if (semanticContext) {
      console.log('✅ Semantic context detected:', {
        type: semanticContext.type,
        originalConfidence: semanticContext.originalConfidence || semanticContext.confidence,
        adjustedConfidence: semanticContext.confidence,
        validationApplied: semanticContext.validationApplied,
        confidenceReduction: semanticContext.confidenceReduction,
        reasoning: semanticContext.reasoning.substring(0, 100) + '...'
      });
      
      const shouldOverride = shouldOverrideToLogicalNegation(semanticContext);
      console.log(`Should override: ${shouldOverride}`);
      console.log(`Expected override: false (for Expletive result)`);
      
      if (shouldOverride) {
        console.log('🚨 PROBLEM: Still overriding despite validation!');
        console.log('   This explains why result is "No Expletive"');
        console.log('   Validation is not reducing confidence enough');
        
        // Check what validation was applied
        if (semanticContext.validationApplied) {
          console.log('   Validation details:', {
            originalConfidence: semanticContext.originalConfidence,
            adjustedConfidence: semanticContext.confidence,
            reduction: semanticContext.confidenceReduction,
            threshold: 0.75
          });
          
          if (semanticContext.confidence >= 0.75) {
            console.log('   ❌ Confidence still above 0.75 threshold after validation');
          }
        } else {
          console.log('   ❌ No validation was applied - neutral indicators not detected');
        }
      } else {
        console.log('✅ GOOD: Not overriding after validation');
        console.log('   Should result in "Expletive" classification');
        console.log('   🤔 But production shows "No Expletive" - integration issue?');
      }
    } else {
      console.log('❌ NO semantic context detected');
      console.log('   Verb not in any detection sets');
      console.log('   Should result in "Expletive" classification');
      console.log('   🤔 But production shows "No Expletive" - training data bias?');
    }
    
    // Test neutral indicator matching
    console.log('\n--- NEUTRAL INDICATOR MATCHING ---');
    const lowerSentence = testCase.sentence.toLowerCase();
    let foundIndicators = [];
    
    testCase.expectedNeutralIndicators.forEach(indicator => {
      const found = lowerSentence.includes(indicator.toLowerCase());
      console.log(`  "${indicator}": ${found ? '✅ Found' : '❌ Not found'}`);
      if (found) foundIndicators.push(indicator);
    });
    
    console.log(`  Total indicators found: ${foundIndicators.length}/${testCase.expectedNeutralIndicators.length}`);
    
    if (foundIndicators.length === 0 && testCase.expectedNeutralIndicators.length > 0) {
      console.log('  🚨 NO neutral indicators found - validation won\'t trigger');
    }
    
    console.log('\n' + '='.repeat(100));
  });
  
  console.log('\n📊 SUMMARY:');
  console.log(`Total failing sentences: ${productionFailures.length}`);
  console.log('All sentences should be "Expletive" but show "No Expletive"');
  console.log('This suggests either:');
  console.log('1. Semantic context not being called in production');
  console.log('2. Validation not reducing confidence enough');
  console.log('3. Training data bias overriding even when no semantic context detected');
  console.log('4. Integration issue between semantic context and main analysis');
}

// Test specific validation scenarios
function testValidationEffectiveness() {
  console.log('\n🧪 TESTING VALIDATION EFFECTIVENESS\n');
  
  const validationTests = [
    {
      verb: 'reporté',
      sentence: 'dans un premier temps avant que son lancement soit reporté pour le mois',
      expectedReduction: true,
      expectedFinalConfidence: '<0.75'
    },
    {
      verb: 'désigne', 
      sentence: 'avant que la cour le désigne officiellement comme tuteur',
      expectedReduction: true,
      expectedFinalConfidence: '<0.75'
    },
    {
      verb: 'commenciez',
      sentence: 'le processus commence en fait avant que vous commenciez à examiner',
      expectedReduction: true,
      expectedFinalConfidence: '<0.75'
    }
  ];
  
  validationTests.forEach(test => {
    console.log(`Testing validation for: "${test.verb}"`);
    console.log(`Sentence: "${test.sentence}"`);
    
    const semanticContext = analyzeSemanticContext(test.sentence, test.verb);
    
    if (semanticContext) {
      const wasReduced = semanticContext.validationApplied;
      const finalConfidence = semanticContext.confidence;
      const belowThreshold = finalConfidence < 0.75;
      
      console.log(`  Original confidence: ${semanticContext.originalConfidence || 'N/A'}`);
      console.log(`  Final confidence: ${finalConfidence}`);
      console.log(`  Validation applied: ${wasReduced ? '✅' : '❌'}`);
      console.log(`  Below threshold: ${belowThreshold ? '✅' : '❌'}`);
      console.log(`  Expected: ${test.expectedFinalConfidence}`);
      
      if (wasReduced && belowThreshold) {
        console.log(`  ✅ Validation working correctly`);
      } else if (wasReduced && !belowThreshold) {
        console.log(`  ⚠️ Validation applied but confidence still too high`);
      } else if (!wasReduced) {
        console.log(`  ❌ Validation not applied - neutral indicators not detected`);
      }
    } else {
      console.log(`  ❌ No semantic context detected for "${test.verb}"`);
    }
    console.log('');
  });
}

export { 
  productionFailures,
  debugProductionFailures, 
  testValidationEffectiveness 
};
