/**
 * Utility for proposing 'ne' placement in French sentences
 */

// Rules for Rule-Based mode only
const EXPLETIVE_RULES = {
  FEAR_DOUBT: [
    {
      pattern: /\b(avoir\s+peur|craindre|redouter)\s+que\b/i,
      nePosition: (text, match) => {
        const queIndex = text.indexOf('que', match.index + match[0].length);
        return queIndex + 'que'.length;
      }
    }
  ],

  TEMPORAL: [
    {
      pattern: /\b(avant|jusqu'à\s+ce)\s+que\b/i,
      nePosition: (text, match) => {
        const queIndex = text.indexOf('que', match.index + match[0].length);
        return queIndex + 'que'.length;
      }
    }
  ],

  PREVENTION: [
    {
      pattern: /\b(empêcher|éviter|prendre\s+garde)\s+que\b/i,
      nePosition: (text, match) => {
        const queIndex = text.indexOf('que', match.index + match[0].length);
        return queIndex + 'que'.length;
      }
    }
  ],

  COMPARATIVE: [
    {
      pattern: /\b(plus|moins|meilleur|mieux|autre|autrement)\s+que\b/i,
      nePosition: (text, match) => {
        const queIndex = text.indexOf('que', match.index + match[0].length);
        return queIndex + 'que'.length;
      }
    }
  ],

  IMPERSONAL: [
    {
      pattern: /\b(il\s+s'en\s+faut|il\s+tient\s+à\s+ce)\s+que\b/i,
      nePosition: (text, match) => {
        const queIndex = text.indexOf('que', match.index + match[0].length);
        return queIndex + 'que'.length;
      }
    }
  ]
};

// Common verb patterns (for Rule-Based fallback only)
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

/**
 * Find matching rule for Rule-Based mode
 * @param {string} text - Input text
 * @returns {Object|null} - Matching rule info or null
 */
function findRuleMatch(text) {
  for (const [category, rules] of Object.entries(EXPLETIVE_RULES)) {
    for (const rule of rules) {
      const match = text.match(rule.pattern);
      if (match) {
        return {
          category,
          match,
          nePosition: rule.nePosition(text, match)
        };
      }
    }
  }
  return null;
}

/**
 * Rule-Based mode: Propose 'ne' placement using grammatical rules
 * @param {string} text - Input text
 * @returns {Object} - Proposal with text and metadata
 */
function proposeFromRules(text) {
  // Try specific construction rules first
  const ruleMatch = findRuleMatch(text);
  if (ruleMatch) {
    const words = text.split(/(\s+)/);
    const position = ruleMatch.nePosition;
    
    return {
      text: [
        ...words.slice(0, position),
        "ne",
        " ",
        ...words.slice(position)
      ].join(""),
      confidence: 0.85,
      rule: ruleMatch.category
    };
  }

  // Fall back to verb pattern matching
  const words = text.split(/(\s+)/);
  let verbIndex = -1;
  
  for (let i = 0; i < words.length; i++) {
    if (VERB_PATTERNS.some(pattern => pattern.test(words[i]))) {
      verbIndex = i;
      break;
    }
  }

  if (verbIndex === -1) {
    return {
      text: text,
      confidence: 0,
      rule: 'NO_MATCH'
    };
  }

  return {
    text: [
      ...words.slice(0, verbIndex),
      "ne",
      " ",
      ...words.slice(verbIndex)
    ].join(""),
    confidence: 0.6,
    rule: 'VERB_PATTERN'
  };
}

/**
 * Training Data mode: Use only training examples for proposals
 * @param {string} text - Input text
 * @param {Array} trainingData - Training examples
 * @returns {Object} - Proposal with text and metadata
 */
function proposeFromTrainingData(text, trainingData) {
  if (!trainingData?.length) {
    return {
      text: text,
      confidence: 0,
      source: 'NO_TRAINING_DATA'
    };
  }

  // Find most similar example from training data
  const similarExample = trainingData.find(example => {
    const pattern = example.pattern?.toLowerCase();
    return pattern && text.toLowerCase().includes(pattern);
  });

  if (!similarExample?.nePosition) {
    return {
      text: text,
      confidence: 0,
      source: 'NO_MATCHING_EXAMPLE'
    };
  }

  const words = text.split(/(\s+)/);
  const position = Math.min(similarExample.nePosition, words.length);

  return {
    text: [
      ...words.slice(0, position),
      "ne",
      " ",
      ...words.slice(position)
    ].join(""),
    confidence: 0.8,
    source: 'TRAINING_EXAMPLE'
  };
}

/**
 * Main function for proposing 'ne' placement
 * @param {string} text - The input sentence
 * @param {string} mode - Analysis mode ('RULE_BASED' or 'TRAINING_DATA')
 * @param {Array} trainingData - Training data for TRAINING_DATA mode
 * @returns {string} - Sentence with proposed 'ne' placement
 */
export default function proposeNePlacement(text, mode = 'RULE_BASED', trainingData = []) {
  if (mode === 'TRAINING_DATA') {
    // Training Data mode: Use only training data, no fallback
    const proposal = proposeFromTrainingData(text, trainingData);
    return proposal.text;
  }
  
  // Rule-Based mode: Use grammatical rules
  const proposal = proposeFromRules(text);
  return proposal.text;
}
