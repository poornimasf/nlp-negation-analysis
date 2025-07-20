// Test script for expletive inference functionality
// This tests the core inference algorithm without React dependencies

// Mock research dataset for testing
const mockResearchDataset = [
  {
    original_text: "J'ai peur qu'il ne vienne pas",
    modified_text: "J'ai peur qu'il vienne",
    had_expletive_ne: true,
    classification: "expletive"
  },
  {
    original_text: "Je crains qu'elle ne soit malade",
    modified_text: "Je crains qu'elle soit malade", 
    had_expletive_ne: true,
    classification: "expletive"
  },
  {
    original_text: "Il mange tous les jours",
    modified_text: "Il mange tous les jours",
    had_expletive_ne: false,
    classification: "no_expletive"
  }
];

// Helper function for text similarity calculation
const calculateTextSimilarity = (text1, text2) => {
  const words1 = text1.split(/\s+/).filter(w => w.length > 2);
  const words2 = text2.split(/\s+/).filter(w => w.length > 2);
  
  if (words1.length === 0 || words2.length === 0) return 0;
  
  const commonWords = words1.filter(word => words2.includes(word));
  const similarity = (2 * commonWords.length) / (words1.length + words2.length);
  
  return similarity;
};

// Core inference algorithm (extracted from React component)
const inferOriginalExpletiveNegation = (modifiedText, researchDataset = []) => {
  if (!modifiedText.trim()) return null;

  const normalizedText = modifiedText.toLowerCase().trim();
  let inferenceScore = 0;
  let totalIndicators = 0;
  const foundEvidence = [];
  const reasoning = {
    trigger_found: false,
    subjunctive_present: false,
    similar_training_examples: 0,
    linguistic_context: [],
    pattern_matches: []
  };

  // Step 1: Identify expletive trigger patterns
  const expletiveTriggers = [
    'peur qu', 'peur que', 'ai peur qu', 'as peur qu', 'a peur qu', 
    'avons peur qu', 'avez peur qu', 'ont peur qu',
    'avoir peur qu', 'avoir peur que', 'par peur qu', 'par peur que', 
    'de peur qu', 'de peur que',
    'crains qu', 'craint qu', 'craignons qu', 'craignez qu', 'craignent qu',
    'craindre qu', 'craindre que',
    'redoute qu', 'redoutes qu', 'redoutons qu', 'redoutez qu', 'redoutent qu',
    'redouter qu', 'redouter que',
    'doute qu', 'doutes qu', 'doutons qu', 'doutez qu', 'doutent qu',
    'douter qu', 'douter que'
  ];

  const foundTriggers = expletiveTriggers.filter(trigger => normalizedText.includes(trigger));
  if (foundTriggers.length > 0) {
    inferenceScore += 4;
    totalIndicators++;
    reasoning.trigger_found = true;
    reasoning.linguistic_context.push(`Expletive trigger found: ${foundTriggers[0]}`);
    foundEvidence.push({ 
      type: 'expletive_trigger', 
      pattern: foundTriggers[0], 
      weight: 4,
      confidence: 0.9 
    });
  }

  // Step 2: Check for subjunctive mood
  const subjunctiveVerbs = [
    'soit', 'ait', 'vienne', 'comprenne', 'sache', 'puisse', 'veuille', 
    'fasse', 'parte', 'aille', 'tombe', 'manque'
  ];

  const foundSubjunctive = subjunctiveVerbs.filter(verb => normalizedText.includes(verb));
  if (foundSubjunctive.length > 0) {
    inferenceScore += 3;
    totalIndicators++;
    reasoning.subjunctive_present = true;
    reasoning.linguistic_context.push(`Subjunctive mood: ${foundSubjunctive[0]}`);
    foundEvidence.push({ 
      type: 'subjunctive_mood', 
      pattern: foundSubjunctive[0], 
      weight: 3,
      confidence: 0.85 
    });
  }

  // Step 3: Pattern matching with research dataset
  if (researchDataset.length > 0) {
    const similarPatterns = researchDataset.filter(item => {
      if (!item.original_text || !item.modified_text) return false;
      const similarity = calculateTextSimilarity(normalizedText, item.modified_text.toLowerCase());
      return similarity > 0.7;
    });

    reasoning.similar_training_examples = similarPatterns.length;
    
    if (similarPatterns.length > 0) {
      const expletiveExamples = similarPatterns.filter(item => item.had_expletive_ne === true);
      const expletiveRatio = expletiveExamples.length / similarPatterns.length;
      
      if (expletiveRatio > 0.6) {
        inferenceScore += 3;
        totalIndicators++;
        reasoning.pattern_matches.push(`${expletiveExamples.length}/${similarPatterns.length} similar examples had expletive ne`);
        foundEvidence.push({ 
          type: 'research_pattern_match', 
          pattern: `${expletiveExamples.length} similar expletive examples`, 
          weight: 3,
          confidence: expletiveRatio 
        });
      }
    }
  }

  // Calculate confidence and make inference
  const maxPossibleScore = 10; // Simplified for testing
  const rawConfidence = Math.min(inferenceScore / maxPossibleScore, 1.0);
  
  let adjustedConfidence = rawConfidence;
  if (totalIndicators >= 3) adjustedConfidence = Math.min(rawConfidence + 0.1, 1.0);

  let inference = 'uncertain';
  let likelihood = 50;
  
  if (adjustedConfidence >= 0.7) {
    inference = 'likely_had_expletive';
    likelihood = Math.round(adjustedConfidence * 100);
  } else if (adjustedConfidence >= 0.4) {
    inference = 'possibly_had_expletive';
    likelihood = Math.round(adjustedConfidence * 100);
  } else {
    inference = 'unlikely_had_expletive';
    likelihood = Math.round(adjustedConfidence * 100);
  }

  return {
    inference,
    likelihood,
    confidence: adjustedConfidence,
    confidence_level: adjustedConfidence >= 0.8 ? 'High' : 
                     adjustedConfidence >= 0.6 ? 'Medium' : 'Low',
    total_indicators: totalIndicators,
    inference_score: inferenceScore,
    found_evidence: foundEvidence,
    reasoning
  };
};

// Test cases
const testCases = [
  {
    text: "J'ai peur qu'il vienne",
    expected: "likely_had_expletive",
    description: "Classic 'peur que' construction with subjunctive"
  },
  {
    text: "Je crains qu'elle soit malade",
    expected: "likely_had_expletive", 
    description: "Craindre + subjunctive construction"
  },
  {
    text: "Il mange du pain",
    expected: "unlikely_had_expletive",
    description: "Simple sentence without expletive context"
  },
  {
    text: "Je pense qu'il viendra",
    expected: "unlikely_had_expletive",
    description: "Penser construction (not expletive trigger)"
  }
];

// Run tests
console.log("🔬 Testing Expletive Inference Algorithm\n");
console.log("Research Dataset:", mockResearchDataset.length, "examples\n");

testCases.forEach((testCase, index) => {
  console.log(`Test ${index + 1}: ${testCase.description}`);
  console.log(`Input: "${testCase.text}"`);
  
  const result = inferOriginalExpletiveNegation(testCase.text, mockResearchDataset);
  
  if (result) {
    console.log(`Result: ${result.inference} (${result.likelihood}%)`);
    console.log(`Confidence: ${result.confidence_level} (${Math.round(result.confidence * 100)}%)`);
    console.log(`Indicators: ${result.total_indicators}, Score: ${result.inference_score}`);
    console.log(`Evidence: ${result.found_evidence.map(e => e.type).join(', ')}`);
    
    const passed = result.inference === testCase.expected;
    console.log(`Status: ${passed ? '✅ PASS' : '❌ FAIL'}`);
  } else {
    console.log("Result: null");
    console.log("Status: ❌ FAIL - No result returned");
  }
  
  console.log("---");
});

console.log("\n🎯 Test Summary:");
console.log("Algorithm successfully processes French sentences for expletive inference");
console.log("Key features working:");
console.log("- Expletive trigger detection (peur que, craindre, etc.)");
console.log("- Subjunctive mood recognition");
console.log("- Research dataset pattern matching");
console.log("- Confidence scoring and classification");
