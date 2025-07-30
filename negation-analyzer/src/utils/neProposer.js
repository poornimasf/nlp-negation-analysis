/**
 * Utility for proposing 'ne' placement in French sentences
 * Note: Always returns a proposal with NE, confidence score indicates certainty
 */

// [Previous constants remain the same]

/**
 * Rule-Based mode: Propose 'ne' placement using grammatical rules
 * Always returns a proposal with NE, even with low confidence
 */
function proposeFromRules(text) {
  // Find potential expletive pattern
  const patternMatch = findPatternMatch(text);
  
  // Analyze structure and context
  const structure = analyzeClauseStructure(text);
  const hasLogical = hasLogicalNegation(text);

  // Calculate confidence based on all factors
  const confidence = calculateConfidence({
    hasPattern: !!patternMatch,
    hasCompleteStructure: structure.isComplete,
    hasLogicalNegation: hasLogical,
    hasValidContext: true,
    hasAmbiguousContext: false
  });

  // If we have a pattern match, use it for placement
  if (patternMatch) {
    const words = text.split(/(\s+)/);
    return {
      text: [
        ...words.slice(0, patternMatch.nePosition),
        "NE",
        " ",
        ...words.slice(patternMatch.nePosition)
      ].join(""),
      confidence,
      rule: `${patternMatch.category}_${patternMatch.pattern}`
    };
  }

  // Fallback to verb pattern - we'll always make a proposal
  const words = text.split(/(\s+)/);
  let verbIndex = -1;
  
  for (let i = 0; i < words.length; i++) {
    if (VERB_PATTERNS.some(pattern => pattern.test(words[i]))) {
      verbIndex = i;
      break;
    }
  }

  // If no verb found, place before first word as last resort
  const insertPosition = verbIndex !== -1 ? verbIndex : 0;
  
  return {
    text: [
      ...words.slice(0, insertPosition),
      "NE",
      " ",
      ...words.slice(insertPosition)
    ].join(""),
    confidence: verbIndex !== -1 ? 0.3 : 0.1,
    rule: verbIndex !== -1 ? 'VERB_PATTERN' : 'FALLBACK_POSITION'
  };
}

/**
 * Training Data mode: Use only training examples for proposals
 * Always returns a proposal with NE
 */
function proposeFromTrainingData(text, trainingData) {
  if (!trainingData?.length) {
    // Fallback to first position if no training data
    return {
      text: "NE " + text,
      confidence: 0.1,
      source: 'NO_TRAINING_DATA_FALLBACK'
    };
  }

  // Find most similar example from training data
  const similarExample = trainingData.find(example => {
    const pattern = example.pattern?.toLowerCase();
    return pattern && text.toLowerCase().includes(pattern);
  });

  if (!similarExample?.nePosition) {
    // If no match found, place at beginning
    return {
      text: "NE " + text,
      confidence: 0.1,
      source: 'NO_MATCH_FALLBACK'
    };
  }

  const words = text.split(/(\s+)/);
  const position = Math.min(similarExample.nePosition, words.length);

  return {
    text: [
      ...words.slice(0, position),
      "NE",
      " ",
      ...words.slice(position)
    ].join(""),
    confidence: 0.8,
    source: 'TRAINING_EXAMPLE'
  };
}

/**
 * Main function for proposing 'ne' placement
 * Always returns a sentence with NE placement
 */
export default function proposeNePlacement(text, mode = 'RULE_BASED', trainingData = []) {
  if (mode === 'TRAINING_DATA') {
    const proposal = proposeFromTrainingData(text, trainingData);
    return proposal.text;
  }
  
  const proposal = proposeFromRules(text);
  return proposal.text;
}
