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
