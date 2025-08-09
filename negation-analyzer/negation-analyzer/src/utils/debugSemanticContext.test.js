/**
 * Debug test for the problematic sentences that are still showing "No Expletive"
 * This will help identify why context validation isn't working
 */

import { 
  analyzeSemanticContext, 
  shouldOverrideToLogicalNegation,
  detectPreventionPastParticiple,
  detectPreventionVerb
} from './semanticContextAnalyzer';

// The exact sentences that are still showing "No Expletive" despite context validation
const problematicSentences = [
  {
    sentence: "Ce service annoncé dans un premier temps pour le mois d'août dernier avant que son lancement soit reporté pour le mois d' octobre ne sera donc effectif que vers la fin l'année.",
    expectedVerb: "reporté",
    expectedDetection: "PREVENTION_PAST_PARTICIPLE",
    expectedNeutralIndicators: ["dans un premier temps", "reporté pour"],
    expectedFinalResult: "Expletive"
  },
  {
    sentence: "Expliquez-lui que des informations, dont un casier judiciaire, devront être présentées au tribunal avant que la cour le désigne officiellement comme tuteur.",
    expectedVerb: "désigne",
    expectedDetection: "PREVENTION_VERB",
    expectedNeutralIndicators: ["officiellement"],
    expectedFinalResult: "Expletive"
  },
  {
    sentence: "Vous vous posez probablement des questions sur l'approbation préalable des prêts, la recherche de logement et les agents immobiliers, mais le processus de préparation de l'achat d'une maison commence en fait des mois, voire des années, avant que vous commenciez à examiner les taux d' intérêt.",
    expectedVerb: "commenciez",
    expectedDetection: "COMPLETION_VERB",
    expectedNeutralIndicators: ["le processus", "en fait"],
    expectedFinalResult: "Expletive"
  },
  {
    sentence: "Dans le quatrième épisode de la saison 9, Le Docteur, accompagné de Bennett et d'O'Donnell, est revenu à l'endroit où se trouvait le Baril, mais avant que la vallée soit submergée, et ce, pour aller à la rencontre du pilote du vaisseau spatial.",
    expectedVerb: "submergée",
    expectedDetection: "PREVENTION_PAST_PARTICIPLE",
    expectedNeutralIndicators: ["l'épisode", "et ce", "pour aller"],
    expectedFinalResult: "Expletive"
  },
  {
    sentence: "Ce dernier fait du chantage à Xavier pour jouer dans son nouveau film avant que ce dernier le conduise aux douches pour espionner les autres garçons.",
    expectedVerb: "conduise",
    expectedDetection: "PREVENTION_VERB",
    expectedNeutralIndicators: ["pour jouer", "pour espionner"],
    expectedFinalResult: "Expletive"
  },
  {
    sentence: "Pas trop épais sinon le poids va la faire tomber avant qu'elle s'accroche ! Je reviendrai avec d'autres questions n'en doutez pas!",
    expectedVerb: "accroche",
    expectedDetection: "REFLEXIVE_ACTION",
    expectedNeutralIndicators: [],
    expectedFinalResult: "Expletive"
  }
];

function debugProblematicSentences() {
  console.log('🔍 DEBUGGING PROBLEMATIC SENTENCES\n');
  
  problematicSentences.forEach((testCase, index) => {
    console.log(`\n=== SENTENCE ${index + 1} ===`);
    console.log(`Sentence: "${testCase.sentence}"`);
    console.log(`Expected verb: "${testCase.expectedVerb}"`);
    console.log(`Expected detection: ${testCase.expectedDetection}`);
    console.log(`Expected neutral indicators: [${testCase.expectedNeutralIndicators.join(', ')}]`);
    console.log(`Expected final result: ${testCase.expectedFinalResult}`);
    
    // Test semantic context analysis
    console.log('\n--- SEMANTIC CONTEXT ANALYSIS ---');
    const semanticContext = analyzeSemanticContext(testCase.sentence, testCase.expectedVerb);
    
    if (semanticContext) {
      console.log('✅ Semantic context detected:', {
        type: semanticContext.type,
        confidence: semanticContext.confidence,
        originalConfidence: semanticContext.originalConfidence,
        validationApplied: semanticContext.validationApplied,
        confidenceReduction: semanticContext.confidenceReduction,
        reasoning: semanticContext.reasoning
      });
      
      const shouldOverride = shouldOverrideToLogicalNegation(semanticContext);
      console.log(`Should override: ${shouldOverride}`);
      console.log(`Expected override: false (for Expletive result)`);
      
      if (shouldOverride) {
        console.log('❌ PROBLEM: Still overriding despite validation!');
        console.log('   This explains why result is "No Expletive" instead of "Expletive"');
      } else {
        console.log('✅ GOOD: Not overriding after validation');
        console.log('   Should result in "Expletive" classification');
      }
    } else {
      console.log('❌ NO semantic context detected');
      console.log('   This should result in "Expletive" classification');
    }
    
    // Test individual detection methods
    console.log('\n--- INDIVIDUAL DETECTION TESTS ---');
    
    // Test past participle detection
    const pastParticiple = detectPreventionPastParticiple(testCase.expectedVerb);
    console.log('Past participle detection:', pastParticiple ? pastParticiple.type : 'None');
    
    // Test prevention verb detection
    const preventionVerb = detectPreventionVerb(testCase.expectedVerb);
    console.log('Prevention verb detection:', preventionVerb ? preventionVerb.type : 'None');
    
    // Test neutral indicator matching
    console.log('\n--- NEUTRAL INDICATOR MATCHING ---');
    const lowerSentence = testCase.sentence.toLowerCase();
    testCase.expectedNeutralIndicators.forEach(indicator => {
      const found = lowerSentence.includes(indicator.toLowerCase());
      console.log(`  "${indicator}": ${found ? '✅ Found' : '❌ Not found'}`);
    });
    
    console.log('\n' + '='.repeat(80));
  });
}

// Test specific detection methods
function testSpecificDetections() {
  console.log('\n🔍 TESTING SPECIFIC DETECTION METHODS\n');
  
  const testVerbs = [
    { verb: 'reporté', expectedType: 'PREVENTION_PAST_PARTICIPLE' },
    { verb: 'désigne', expectedType: 'PREVENTION_VERB' },
    { verb: 'commenciez', expectedType: 'COMPLETION_VERB' },
    { verb: 'submergée', expectedType: 'PREVENTION_PAST_PARTICIPLE' },
    { verb: 'conduise', expectedType: 'PREVENTION_VERB' },
    { verb: 'accroche', expectedType: null } // Should not be detected
  ];
  
  testVerbs.forEach(test => {
    console.log(`Testing verb: "${test.verb}"`);
    
    const pastParticiple = detectPreventionPastParticiple(test.verb);
    const preventionVerb = detectPreventionVerb(test.verb);
    
    console.log(`  Past participle: ${pastParticiple ? pastParticiple.type : 'None'}`);
    console.log(`  Prevention verb: ${preventionVerb ? preventionVerb.type : 'None'}`);
    console.log(`  Expected: ${test.expectedType || 'None'}`);
    
    const actualType = pastParticiple?.type || preventionVerb?.type || null;
    const matches = actualType === test.expectedType;
    console.log(`  Result: ${matches ? '✅ Match' : '❌ Mismatch'}`);
    console.log('');
  });
}

export { 
  problematicSentences,
  debugProblematicSentences, 
  testSpecificDetections 
};
