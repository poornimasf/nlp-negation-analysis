/**
 * Ambiguity avoidance and multiple negation detection for enhanced training data analysis
 */

import { normalizeText } from './textProcessing';

// Ambiguity detection patterns
const AMBIGUITY_PATTERNS = {
  TEMPORAL_AMBIGUITY: {
    patterns: [
      // Temporal sequence ambiguity
      /\b(?:quand|lorsque|dès\s+que|aussitôt\s+que)\b.*\b(?:avant|après)\b/i,
      /\b(?:avant|après)\b.*\b(?:quand|lorsque|pendant\s+que)\b/i,
      // Multiple temporal markers
      /\b(?:avant|après|pendant|durant|lors)\b.*\b(?:avant|après|pendant|durant|lors)\b/i,
    ],
    weight: 0.2,
    description: 'Multiple temporal markers create sequence ambiguity'
  },
  
  MODAL_AMBIGUITY: {
    patterns: [
      // Uncertainty markers that affect ne interpretation
      /\b(?:peut-être|probablement|sans\s+doute|vraisemblablement)\b/i,
      /\b(?:il\s+se\s+peut\s+que|il\s+est\s+possible\s+que)\b/i,
      /\b(?:j'ai\s+l'impression\s+que|il\s+me\s+semble\s+que)\b/i,
    ],
    weight: 0.15,
    description: 'Modal uncertainty affects negation interpretation'
  },
  
  SCOPE_AMBIGUITY: {
    patterns: [
      // Scope ambiguity with multiple clauses
      /\b(?:que|qu')\b.*\b(?:que|qu')\b.*\b(?:que|qu')\b/i,
      // Embedded clauses that create scope confusion
      /\b(?:dire|penser|croire|savoir)\s+que\b.*\b(?:peur|craindre|redouter)\b/i,
      /\b(?:peur|craindre|redouter)\b.*\b(?:dire|penser|croire)\b/i,
    ],
    weight: 0.25,
    description: 'Multiple embedded clauses create scope ambiguity'
  },
  
  NEGATION_AMBIGUITY: {
    patterns: [
      // Contexts where ne clarifies positive vs negative intent
      /\b(?:sans|ni|non)\b.*\b(?:peur|craindre|avant)\b/i,
      /\b(?:peur|craindre|avant)\b.*\b(?:sans|ni|non)\b/i,
      // Double negative contexts
      /\b(?:pas|jamais|rien|personne)\b.*\b(?:peur|craindre|avant)\b/i,
    ],
    weight: 0.3,
    description: 'Negative context creates interpretation ambiguity'
  }
};

// Multiple negation detection patterns
const MULTIPLE_NEGATION_PATTERNS = {
  DOUBLE_NEGATION: {
    patterns: [
      // Standard double negation (ne + negative word)
      /\bne\b\s*(?:\w+\s+){0,3}(?:pas|point|jamais|rien|personne|aucun|nul|guère|plus)\b/i,
      /\bn'\b\s*(?:\w+\s+){0,3}(?:pas|point|jamais|rien|personne|aucun|nul|guère|plus)\b/i,
      // Discontinuous negation
      /\b(?:ne|n')\b.*\b(?:que|qu')\b.*\b(?:pas|jamais|rien)\b/i,
    ],
    type: 'LOGICAL_NEGATION',
    confidence: 0.95,
    description: 'Standard French double negation (ne + negative word)'
  },
  
  EXPLETIVE_CONTEXT: {
    patterns: [
      // Expletive ne without negative words (in trigger contexts)
      /\b(?:peur|craindre|redouter|avant)\s+qu(?:e|')\s+(?:\w+\s+)*ne\b(?!\s*(?:pas|point|jamais|rien|personne|aucun|nul|guère|plus))/i,
      /\b(?:peur|craindre|redouter|avant)\s+qu(?:e|')\s+(?:\w+\s+)*n'(?!\s*(?:pas|point|jamais|rien|personne|aucun|nul|guère|plus))/i,
    ],
    type: 'EXPLETIVE_NEGATION',
    confidence: 0.85,
    description: 'Expletive ne in trigger context without negative words'
  },
  
  TRIPLE_NEGATION: {
    patterns: [
      // Complex negation with multiple negative elements
      /\b(?:ne|n')\b.*\b(?:pas|jamais|rien|personne)\b.*\b(?:pas|jamais|rien|personne|aucun|nul)\b/i,
      /\b(?:sans|ni)\b.*\b(?:ne|n')\b.*\b(?:pas|jamais|rien)\b/i,
    ],
    type: 'COMPLEX_NEGATION',
    confidence: 0.90,
    description: 'Complex negation with multiple negative elements'
  },
  
  NEGATIVE_POLARITY: {
    patterns: [
      // Negative polarity items that interact with ne
      /\b(?:ne|n')\b.*\b(?:que|qu')\b.*\b(?:seul|unique|premier|dernier)\b/i,
      /\b(?:ne|n')\b.*\b(?:plus|encore|déjà|toujours)\b/i,
    ],
    type: 'POLARITY_NEGATION',
    confidence: 0.80,
    description: 'Negation with polarity-sensitive items'
  }
};

// Enhanced vowel context patterns for n' handling
const VOWEL_CONTEXT_PATTERNS = {
  VOWEL_INITIAL: {
    pattern: /\b(?:a|e|i|o|u|h|y)\w*/i,
    description: 'Word starting with vowel or silent h'
  },
  
  VOWEL_SOUNDS: {
    // French vowel sounds including nasal vowels
    pattern: /\b(?:a|à|â|e|é|è|ê|ë|i|î|ï|o|ô|u|ù|û|ü|y|ÿ|œ|æ|h)\w*/i,
    description: 'Word starting with French vowel sound'
  },
  
  SILENT_H: {
    // Common French words with silent h
    pattern: /\b(?:heure|homme|histoire|hiver|hôtel|hôpital|habiter|hier|aujourd'hui)\b/i,
    description: 'Common words with silent h requiring elision'
  },
  
  ASPIRATED_H: {
    // Words with aspirated h (no elision)
    pattern: /\b(?:héros|honte|haut|hors|huit|onze|oui)\b/i,
    description: 'Words with aspirated h (no elision)'
  }
};

/**
 * Detect ambiguity contexts that might require expletive ne for clarity
 */
export function detectAmbiguityContext(text) {
  const normalizedText = normalizeText(text.toLowerCase());
  let ambiguityScore = 0;
  let detectedAmbiguities = [];
  let clarificationNeeded = false;
  
  for (const [ambiguityType, config] of Object.entries(AMBIGUITY_PATTERNS)) {
    for (const pattern of config.patterns) {
      const match = normalizedText.match(pattern);
      if (match) {
        ambiguityScore += config.weight;
        detectedAmbiguities.push({
          type: ambiguityType,
          pattern: match[0],
          position: match.index,
          weight: config.weight,
          description: config.description
        });
        
        // High ambiguity suggests ne might be used for clarity
        if (config.weight >= 0.25) {
          clarificationNeeded = true;
        }
      }
    }
  }
  
  return {
    hasAmbiguity: ambiguityScore > 0,
    ambiguityScore,
    clarificationNeeded,
    detectedAmbiguities,
    confidence: Math.min(ambiguityScore, 1.0),
    recommendation: clarificationNeeded ? 
      'Expletive ne recommended for disambiguation' : 
      'Low ambiguity context'
  };
}

/**
 * Analyze multiple negation patterns and distinguish types
 */
export function analyzeMultipleNegation(text) {
  const normalizedText = normalizeText(text.toLowerCase());
  let negationAnalysis = {
    hasMultipleNegation: false,
    negationType: 'NONE',
    confidence: 0,
    patterns: [],
    isExpletiveContext: false,
    isLogicalNegation: false,
    recommendation: ''
  };
  
  let highestConfidence = 0;
  let primaryType = 'NONE';
  
  for (const [negationType, config] of Object.entries(MULTIPLE_NEGATION_PATTERNS)) {
    for (const pattern of config.patterns) {
      const match = normalizedText.match(pattern);
      if (match) {
        negationAnalysis.hasMultipleNegation = true;
        negationAnalysis.patterns.push({
          type: negationType,
          negationType: config.type,
          pattern: match[0],
          position: match.index,
          confidence: config.confidence,
          description: config.description
        });
        
        // Track highest confidence pattern
        if (config.confidence > highestConfidence) {
          highestConfidence = config.confidence;
          primaryType = config.type;
        }
      }
    }
  }
  
  if (negationAnalysis.hasMultipleNegation) {
    negationAnalysis.negationType = primaryType;
    negationAnalysis.confidence = highestConfidence;
    negationAnalysis.isExpletiveContext = primaryType === 'EXPLETIVE_NEGATION';
    negationAnalysis.isLogicalNegation = primaryType === 'LOGICAL_NEGATION';
    
    // Generate recommendation
    if (primaryType === 'EXPLETIVE_NEGATION') {
      negationAnalysis.recommendation = 'Expletive ne detected - optional semantic marker';
    } else if (primaryType === 'LOGICAL_NEGATION') {
      negationAnalysis.recommendation = 'Logical negation detected - ne is part of standard negation';
    } else {
      negationAnalysis.recommendation = 'Complex negation pattern - requires careful analysis';
    }
  }
  
  return negationAnalysis;
}

/**
 * Enhanced vowel context analysis for proper n' vs ne handling
 */
export function analyzeVowelContext(text, nePosition) {
  if (!nePosition || nePosition < 0) {
    return {
      shouldUseElision: false,
      reason: 'No ne position specified'
    };
  }
  
  const words = text.split(/\s+/);
  const neWordIndex = Math.floor(nePosition / text.length * words.length); // Approximate word position
  
  if (neWordIndex >= words.length - 1) {
    return {
      shouldUseElision: false,
      reason: 'Ne at end of sentence'
    };
  }
  
  const nextWord = words[neWordIndex + 1];
  if (!nextWord) {
    return {
      shouldUseElision: false,
      reason: 'No following word'
    };
  }
  
  const normalizedNext = normalizeText(nextWord.toLowerCase());
  
  // Check for aspirated h (no elision)
  if (VOWEL_CONTEXT_PATTERNS.ASPIRATED_H.pattern.test(normalizedNext)) {
    return {
      shouldUseElision: false,
      reason: `Aspirated h in "${nextWord}" - no elision`,
      form: 'ne',
      nextWord
    };
  }
  
  // Check for silent h or vowel (elision required)
  if (VOWEL_CONTEXT_PATTERNS.SILENT_H.pattern.test(normalizedNext) ||
      VOWEL_CONTEXT_PATTERNS.VOWEL_SOUNDS.pattern.test(normalizedNext)) {
    return {
      shouldUseElision: true,
      reason: `Vowel sound in "${nextWord}" - elision required`,
      form: "n'",
      nextWord
    };
  }
  
  // Default: consonant start, no elision
  return {
    shouldUseElision: false,
    reason: `Consonant start in "${nextWord}" - no elision`,
    form: 'ne',
    nextWord
  };
}

/**
 * Comprehensive analysis combining ambiguity, negation, and vowel context
 */
export function analyzeAmbiguityAndNegation(text, nePosition = null) {
  const ambiguityAnalysis = detectAmbiguityContext(text);
  const negationAnalysis = analyzeMultipleNegation(text);
  const vowelAnalysis = nePosition ? analyzeVowelContext(text, nePosition) : null;
  
  // Calculate combined impact on expletive ne likelihood
  let expletiveLikelihood = 0;
  let factors = [];
  
  // Ambiguity increases expletive ne likelihood
  if (ambiguityAnalysis.clarificationNeeded) {
    expletiveLikelihood += 0.3;
    factors.push('High ambiguity context (+30%)');
  } else if (ambiguityAnalysis.hasAmbiguity) {
    expletiveLikelihood += 0.1;
    factors.push('Moderate ambiguity context (+10%)');
  }
  
  // Negation type affects likelihood
  if (negationAnalysis.isExpletiveContext) {
    expletiveLikelihood += 0.4;
    factors.push('Expletive negation context (+40%)');
  } else if (negationAnalysis.isLogicalNegation) {
    expletiveLikelihood -= 0.5;
    factors.push('Logical negation context (-50%)');
  }
  
  // Vowel context affects surface form but not likelihood
  if (vowelAnalysis) {
    factors.push(`Surface form: ${vowelAnalysis.form} (${vowelAnalysis.reason})`);
  }
  
  return {
    ambiguity: ambiguityAnalysis,
    negation: negationAnalysis,
    vowelContext: vowelAnalysis,
    combinedAnalysis: {
      expletiveLikelihood: Math.max(0, Math.min(1, expletiveLikelihood)),
      factors,
      recommendation: expletiveLikelihood > 0.5 ? 
        'Expletive ne likely due to ambiguity/context factors' :
        expletiveLikelihood < -0.2 ?
        'Expletive ne unlikely due to logical negation context' :
        'Neutral context for expletive ne'
    }
  };
}
