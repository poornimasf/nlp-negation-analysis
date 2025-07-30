/**
 * Utility for proposing 'ne' placement in French sentences
 * Note: Always returns a proposal with NE, confidence score indicates certainty
 */

// Logical negation markers
const LOGICAL_MARKERS = [
  /\b(?:pas|point|plus|jamais|rien|personne|aucun[e]?|guère|nullement)\b/i
];

// Common positions for 'ne' placement
const VERB_PATTERNS = [
  /\b(?:suis|es|est|sommes|êtes|sont)\b/i,
  /\b(?:seront|sera|serai|seras|serez|serons)\b/i,
  /\b(?:étais|était|étions|étiez|étaient)\b/i,
  /\b(?:ai|as|a|avons|avez|ont)\b/i,
  /\b(?:aurai|auras|aura|aurons|aurez|auront)\b/i,
  /\b(?:avais|avait|avions|aviez|avaient)\b/i,
  /\b(?:peux|peut|pouvons|pouvez|peuvent)\b/i,
  /\b(?:veux|veut|voulons|voulez|veulent)\b/i,
  /\b(?:fais|fait|faisons|faites|font)\b/i,
  /\b(?:viens|vient|venons|venez|viennent)\b/i
];

// Expletive patterns - Note: These alone don't determine negation type
const EXPLETIVE_PATTERNS = {
  FEAR_DOUBT: [
    {
      pattern: /\b(?:avoir\s+peur|craindre|redouter)\s+que\b/i,
      name: 'FEAR_EXPRESSION'
    }
  ],
  TEMPORAL: [
    {
      pattern: /\b(?:avant)\s+que\b/i,
      name: 'TEMPORAL_EXPRESSION'
    }
  ],
  IMPERSONAL: [
    {
      pattern: /\b(?:il\s+s['']en\s+faut)\s+que\b/i,
      name: 'IMPERSONAL_EXPRESSION'
    }
  ]
};

/**
 * Analyzes clause structure for completeness and validity
 */
function analyzeClauseStructure(text) {
  // Basic clause structure check
  const hasMainVerb = VERB_PATTERNS.some(pattern => pattern.test(text));
  const hasQue = /\bque\b/i.test(text);
  const hasSubordinateClause = hasQue && text.split(/\bque\b/i)[1].trim().length > 0;

  return {
    isComplete: hasMainVerb && hasSubordinateClause,
    hasMainVerb,
    hasSubordinateClause
  };
}

/**
 * Checks for presence of logical negation markers
 */
function hasLogicalNegation(text) {
  return LOGICAL_MARKERS.some(marker => marker.test(text));
}

/**
 * Finds matching expletive pattern and analyzes context
 */
function findPatternMatch(text) {
  for (const [category, patterns] of Object.entries(EXPLETIVE_PATTERNS)) {
    for (const rule of patterns) {
      const match = text.match(rule.pattern);
      if (match) {
        // Find position for NE (after 'que')
        const queIndex = text.toLowerCase().indexOf('que', match.index + match[0].length);
        if (queIndex !== -1) {
          return {
            category,
            pattern: rule.name,
            match,
            nePosition: queIndex + 'que'.length
          };
        }
      }
    }
  }
  return null;
}

/**
 * Calculates confidence based on multiple factors
 */
function calculateConfidence(analysis) {
  let confidence = 0;

  // Base confidence from pattern presence
  if (analysis.hasPattern) confidence += 0.3;
  
  // Structure analysis
  if (analysis.hasCompleteStructure) confidence += 0.3;
  
  // Logical negation check
  if (!analysis.hasLogicalNegation) confidence += 0.2;
  
  // Context analysis
  if (analysis.hasValidContext) confidence += 0.2;

  // Adjustments
  if (analysis.hasLogicalNegation) confidence *= 0.5;
  if (!analysis.hasCompleteStructure) confidence *= 0.7;
  if (analysis.hasAmbiguousContext) confidence *= 0.75;

  return Math.min(confidence, 0.9);
}

/**
 * Rule-Based mode: Propose 'ne' placement using grammatical rules
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
