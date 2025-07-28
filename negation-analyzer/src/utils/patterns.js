// Enhanced logical negation patterns with categories
export const LOGICAL_NEGATION_PATTERNS = {
  // Basic negation
  basic: {
    patterns: [
      /\bne\s+(?:pas|point)\b/gi,
      /\bn[''](?:est|a|ont)\s+pas\b/gi
    ],
    confidence: 0.9,
    description: "Standard negation"
  },

  // Temporal negation
  temporal: {
    patterns: [
      /\bne\s+(?:jamais|plus)\b/gi,
      /\bn[''](?:a|ont)\s+(?:jamais|plus)\b/gi
    ],
    confidence: 0.9,
    description: "Temporal negation"
  },

  // Quantitative negation
  quantitative: {
    patterns: [
      /\bne\s+rien\b/gi,
      /\bn[''](?:a|ont)\s+rien\b/gi,
      /\bne\s+aucun[e]?\b/gi,
      /\bne\s+guère\b/gi
    ],
    confidence: 0.85,
    description: "Quantitative negation"
  },

  // Personal negation
  personal: {
    patterns: [
      /\bne\s+personne\b/gi,
      /\bn[''](?:a|ont)\s+personne\b/gi
    ],
    confidence: 0.85,
    description: "Personal negation"
  },

  // Absolute negation
  absolute: {
    patterns: [
      /\bne\s+nullement\b/gi,
      /\bn[''](?:est|a|ont)\s+nullement\b/gi
    ],
    confidence: 0.9,
    description: "Absolute negation"
  },

  // Complex negation (multiple markers)
  complex: {
    patterns: [
      /\bne\s+(?:plus\s+jamais|jamais\s+plus)\b/gi,
      /\bne\s+(?:rien\s+du\s+tout|plus\s+rien)\b/gi
    ],
    confidence: 0.95,
    description: "Complex negation"
  }
};

// Expletive trigger patterns
export const EXPLETIVE_TRIGGER_PATTERNS = {
  // Fear expressions
  fear: {
    patterns: [
      /\b(?:avoir\s+)?peur\s+que?\b/i,
      /\b(?:craindre|redouter)\s+que?\b/i,
      /\bpar\s+(?:peur|crainte)\s+que?\b/i
    ],
    confidence: 0.85,
    description: "Fear expressions"
  },

  // Temporal expressions
  temporal: {
    patterns: [
      /\bavant\s+que?\b/i,
      /\b(?:jusqu'à|en attendant)\s+que?\b/i
    ],
    confidence: 0.8,
    description: "Temporal expressions"
  },

  // Peu s'en faut expressions
  peuSenFaut: {
    patterns: [
      // Standard forms
      /\bpeu\s+s['']en\s+(?:faut|fallait|faudra|faudrait)\b/i,
      
      // Impersonal forms with optional negation
      /\b(?:il\s+)?(?:ne\s+)?s['']en\s+(?:faut|fallait|faudra|faudrait)\s+de\s+peu\b/i,
      
      // Negated forms
      /\b(?:il\s+)?ne\s+s['']en\s+(?:faut|fallait|faudra|faudrait)\s+pas\s+de\s+beaucoup\b/i
    ],
    confidence: 0.85,
    description: "Peu s'en faut expressions"
  },

  // Other triggers
  other: {
    patterns: [
      /\bà\s+moins\s+que?\b/i,
      /\bempêcher\s+que?\b/i
    ],
    confidence: 0.75,
    description: "Other expletive triggers"
  }
};
