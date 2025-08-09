/**
 * Test to check if training data is biased toward "No Expletive"
 * This could explain why sentences are still showing "No Expletive" despite semantic validation
 */

import { analyzeWithEnhancedFeatures } from './enhancedTrainingAnalyzer';

// Test with minimal training data to see the bias
const testTrainingData = [
  // Expletive examples
  { text: "avant qu'il vienne", has_expletive_ne: true, classification: "expletive" },
  { text: "avant qu'elle parte", has_expletive_ne: true, classification: "expletive" },
  
  // No expletive examples  
  { text: "avant qu'on les remarque", has_expletive_ne: false, classification: "no_expletive" },
  { text: "avant que cela empire", has_expletive_ne: false, classification: "no_expletive" }
];

// Test sentences that should be expletive
const testSentences = [
  "avant que son lancement soit reporté",
  "avant que la cour le désigne officiellement", 
  "avant que vous commenciez à examiner",
  "avant que la vallée soit submergée",
  "avant que ce dernier le conduise",
  "avant qu'elle s'accroche"
];

function testTrainingDataBias() {
  console.log('🧪 TESTING TRAINING DATA BIAS\n');
  
  testSentences.forEach((sentence, index) => {
    console.log(`\n=== TEST SENTENCE ${index + 1} ===`);
    console.log(`Sentence: "${sentence}"`);
    console.log(`Expected: Expletive (classification: true)`);
    
    try {
      const result = analyzeWithEnhancedFeatures(sentence, testTrainingData);
      
      console.log('Analysis Result:', {
        classification: result.classification,
        confidence: result.confidence,
        interpretedAs: result.classification ? 'Expletive' : 'No Expletive'
      });
      
      if (result.classification === false) {
        console.log('❌ BIAS DETECTED: Training data pushing toward "No Expletive"');
        
        // Check the voting details if available
        if (result.enhancedVotes) {
          console.log('Voting details:', {
            adjustedExpletive: result.enhancedVotes.adjustedExpletive,
            adjustedNonExpletive: result.enhancedVotes.adjustedNonExpletive,
            winner: result.enhancedVotes.adjustedExpletive > result.enhancedVotes.adjustedNonExpletive ? 'Expletive' : 'No Expletive'
          });
        }
        
        // Check if semantic context was detected
        if (result.linguisticAnalysis?.semanticContext) {
          console.log('Semantic context:', {
            type: result.linguisticAnalysis.semanticContext.type,
            confidence: result.linguisticAnalysis.semanticContext.confidence,
            validationApplied: result.linguisticAnalysis.semanticContext.validationApplied
          });
        } else {
          console.log('❌ No semantic context detected');
        }
        
      } else {
        console.log('✅ CORRECT: Classification is Expletive');
      }
      
    } catch (error) {
      console.error('❌ Analysis failed:', error.message);
    }
    
    console.log('-'.repeat(80));
  });
}

// Test with different training data compositions
function testDifferentTrainingCompositions() {
  console.log('\n🧪 TESTING DIFFERENT TRAINING DATA COMPOSITIONS\n');
  
  const compositions = [
    {
      name: 'Balanced (50/50)',
      data: [
        { text: "avant qu'il vienne", has_expletive_ne: true, classification: "expletive" },
        { text: "avant qu'elle parte", has_expletive_ne: true, classification: "expletive" },
        { text: "avant qu'on les remarque", has_expletive_ne: false, classification: "no_expletive" },
        { text: "avant que cela empire", has_expletive_ne: false, classification: "no_expletive" }
      ]
    },
    {
      name: 'Expletive-heavy (75/25)',
      data: [
        { text: "avant qu'il vienne", has_expletive_ne: true, classification: "expletive" },
        { text: "avant qu'elle parte", has_expletive_ne: true, classification: "expletive" },
        { text: "avant qu'ils arrivent", has_expletive_ne: true, classification: "expletive" },
        { text: "avant qu'on les remarque", has_expletive_ne: false, classification: "no_expletive" }
      ]
    },
    {
      name: 'No-expletive-heavy (25/75)',
      data: [
        { text: "avant qu'il vienne", has_expletive_ne: true, classification: "expletive" },
        { text: "avant qu'on les remarque", has_expletive_ne: false, classification: "no_expletive" },
        { text: "avant que cela empire", has_expletive_ne: false, classification: "no_expletive" },
        { text: "avant qu'ils s'en emparent", has_expletive_ne: false, classification: "no_expletive" }
      ]
    }
  ];
  
  const testSentence = "avant que son lancement soit reporté";
  
  compositions.forEach(comp => {
    console.log(`\n--- ${comp.name} ---`);
    console.log(`Training data: ${comp.data.filter(d => d.classification === 'expletive').length} expletive, ${comp.data.filter(d => d.classification === 'no_expletive').length} no_expletive`);
    
    try {
      const result = analyzeWithEnhancedFeatures(testSentence, comp.data);
      console.log(`Result: ${result.classification ? 'Expletive' : 'No Expletive'} (${Math.round(result.confidence * 100)}% confidence)`);
      
      if (result.enhancedVotes) {
        console.log(`Votes: Expletive=${result.enhancedVotes.adjustedExpletive.toFixed(2)}, No Expletive=${result.enhancedVotes.adjustedNonExpletive.toFixed(2)}`);
      }
    } catch (error) {
      console.error(`Error: ${error.message}`);
    }
  });
}

export { 
  testTrainingData,
  testSentences,
  testTrainingDataBias, 
  testDifferentTrainingCompositions 
};
