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
  /\b(?:viens|vient|venons|venez|viennent)\b/i,
  /\b(?:dois|doit|devons|devez|doivent)\b/i,
  /\b(?:sache|sait|savons|savez|savent)\b/i
];

// Expletive patterns with typical NE positions
const EXPLETIVE_PATTERNS = {
  FEAR_DOUBT: [
    {
      pattern: /\b(?:avoir\s+peur|craindre|redouter)\s+que\b/i,
      name: 'FEAR_EXPRESSION',
      neOffset: 1  // Place NE after 'que'
    },
    {
      pattern: /\b(?:peur|crainte)\s+que\b/i,
      name: 'FEAR_NOUN',
      neOffset: 1
    }
  ],
  TEMPORAL: [
    {
      pattern: /\b(?:avant)\s+que\b/i,
      name: 'TEMPORAL_EXPRESSION',
      neOffset: 1
    }
  ],
  IMPERSONAL: [
    {
      pattern: /\b(?:il\s+s['']en\s+faut|peu\s+s['']en\s+faut)\s+que\b/i,
      name: 'IMPERSONAL_EXPRESSION',
      neOffset: 1
    }
  ]
};

/**
 * Finds verb position in text
 */
function findVerbPosition(text) {
  const words = text.split(/\s+/);
  for (let i = 0; i < words.length; i++) {
    if (VERB_PATTERNS.some(pattern => pattern.test(words[i]))) {
      return i;
    }
  }
  return -1;
}

/**
 * Finds matching expletive pattern and analyzes context
 */
function findPatternMatch(text) {
  for (const [category, patterns] of Object.entries(EXPLETIVE_PATTERNS)) {
    for (const rule of patterns) {
      const match = text.match(rule.pattern);
      if (match) {
        // Find position for NE (after trigger + offset)
        const words = text.split(/\s+/);
        const matchIndex = words.findIndex(word => 
          rule.pattern.test(word + (words[words.indexOf(word) + 1] || '')));
        
        if (matchIndex !== -1) {
          const nePosition = matchIndex + rule.neOffset;
          return {
            category,
            pattern: rule.name,
            match,
            nePosition
          };
        }
      }
    }
  }
  return null;
}

/**
 * Calculates similarity between two sentences
 */
function calculateSimilarity(text1, text2) {
  const words1 = text1.toLowerCase().split(/\s+/);
  const words2 = text2.toLowerCase().split(/\s+/);
  
  const commonWords = words1.filter(word => words2.includes(word));
  return commonWords.length / Math.max(words1.length, words2.length);
}

/**
 * Extracts NE position from a training example
 */
function extractNePosition(example) {
  // If example has explicit NE position
  if (example.nePosition !== undefined) {
    return example.nePosition;
  }

  // If example has trigger pattern, use it
  if (example.trigger && typeof example.trigger === 'string') {
    const triggerWords = example.trigger.toLowerCase().split(/\s+/);
    const textWords = example.text.toLowerCase().split(/\s+/);
    
    // Find trigger in text
    for (let i = 0; i < textWords.length - triggerWords.length + 1; i++) {
      if (triggerWords.every((word, j) => textWords[i + j].includes(word))) {
        return i + triggerWords.length;  // Place NE after trigger
      }
    }
  }

  // Find verb position as fallback
  return findVerbPosition(example.text);
}

/**
 * Rule-Based mode: Propose 'ne' placement using grammatical rules
 */
function proposeFromRules(text) {
  // Find potential expletive pattern
  const patternMatch = findPatternMatch(text);
  const verbPosition = findVerbPosition(text);

  // Calculate confidence
  const confidence = patternMatch ? 0.8 :
                    verbPosition !== -1 ? 0.5 :
                    0.2;

  // If we have a pattern match, use it for placement
  if (patternMatch) {
    const words = text.split(/\s+/);
    return {
      text: [
        ...words.slice(0, patternMatch.nePosition),
        "NE",
        ...words.slice(patternMatch.nePosition)
      ].join(" "),
      confidence,
      rule: `${patternMatch.category}_${patternMatch.pattern}`
    };
  }

  // Try verb position
  if (verbPosition !== -1) {
    const words = text.split(/\s+/);
    return {
      text: [
        ...words.slice(0, verbPosition),
        "NE",
        ...words.slice(verbPosition)
      ].join(" "),
      confidence,
      rule: 'VERB_POSITION'
    };
  }

  // Fallback to first position
  return {
    text: "NE " + text,
    confidence,
    rule: 'FALLBACK_POSITION'
  };
}

/**
 * Training Data mode: Use training examples for proposals
 */
function proposeFromTrainingData(text, trainingData) {
  if (!trainingData?.length) {
    return proposeFromRules(text);  // Fallback to rule-based if no training data
  }

  // Find similar examples
  const similarExamples = trainingData
    .map(example => ({
      ...example,
      similarity: calculateSimilarity(text, example.text)
    }))
    .filter(example => example.similarity > 0.3)  // Only consider reasonably similar examples
    .sort((a, b) => b.similarity - a.similarity);

  if (similarExamples.length === 0) {
    // If no similar examples found, try rule-based approach
    return proposeFromRules(text);
  }

  // Use the most similar example's pattern
  const bestMatch = similarExamples[0];
  const nePosition = extractNePosition(bestMatch);
  
  if (nePosition === -1) {
    return proposeFromRules(text);  // Fallback if can't determine position
  }

  const words = text.split(/\s+/);
  const position = Math.min(nePosition, words.length - 1);

  return {
    text: [
      ...words.slice(0, position),
      "NE",
      ...words.slice(position)
    ].join(" "),
    confidence: bestMatch.similarity,
    source: 'TRAINING_EXAMPLE'
  };
}

/**
 * CroissantLLM mode: Propose 'ne' placement based on LLM analysis
 */
function proposeFromCroissantLLM(text, analysis) {
  // Default to rule-based if no analysis is available
  if (!analysis) {
    return proposeFromRules(text);
  }

  const analysisText = analysis.toLowerCase();
  const words = text.split(/\s+/);
  
  // Check if CroissantLLM has provided specific placement information
  const placementMatch = analysisText.match(/ne placement:\s*(\d+)/i);
  if (placementMatch) {
    const position = parseInt(placementMatch[1], 10);
    if (!isNaN(position) && position >= 0 && position < words.length) {
      return {
        text: [
          ...words.slice(0, position),
          "NE",
          ...words.slice(position)
        ].join(" "),
        confidence: 0.9,
        source: 'CROISSANT_LLM_EXPLICIT'
      };
    }
  }

  // Check for verb-based placement hints
  const verbMatch = analysisText.match(/place ne before[:\s]+(\w+)/i);
  if (verbMatch) {
    const targetVerb = verbMatch[1].toLowerCase();
    const verbIndex = words.findIndex(word => 
      word.toLowerCase() === targetVerb || 
      VERB_PATTERNS.some(pattern => pattern.test(word))
    );
    
    if (verbIndex !== -1) {
      return {
        text: [
          ...words.slice(0, verbIndex),
          "NE",
          ...words.slice(verbIndex)
        ].join(" "),
        confidence: 0.8,
        source: 'CROISSANT_LLM_VERB'
      };
    }
  }

  // Check classification and use appropriate strategy
  if (analysisText.includes('classification: expletive')) {
    // For expletive negation, try to place after 'que' if present
    const queIndex = words.findIndex(word => /que?/i.test(word));
    if (queIndex !== -1) {
      return {
        text: [
          ...words.slice(0, queIndex + 1),
          "NE",
          ...words.slice(queIndex + 1)
        ].join(" "),
        confidence: 0.7,
        source: 'CROISSANT_LLM_EXPLETIVE'
      };
    }
  }

  // Fallback to rule-based placement
  return proposeFromRules(text);
}

/**
 * Main function for proposing 'ne' placement
 * Always returns a sentence with NE placement
 */
export default function proposeNePlacement(text, mode = 'RULE_BASED', trainingData = [], analysis = '') {
  if (!text || typeof text !== 'string') {
    return text;  // Return unchanged if invalid input
  }

  try {
    switch (mode) {
      case 'TRAINING_DATA':
        const trainingProposal = proposeFromTrainingData(text, trainingData);
        return trainingProposal.text;
      
      case 'HYBRID':  // Now represents CroissantLLM mode
        const llmProposal = proposeFromCroissantLLM(text, analysis);
        return llmProposal.text;
      
      default:
        const ruleProposal = proposeFromRules(text);
        return ruleProposal.text;
    }
  } catch (error) {
    console.error('Error in NE placement:', error);
    return text;  // Return original text if error occurs
  }
}
