/**
 * Enhanced training data analyzer with sophisticated linguistic features
 * Integrates avant que analysis, subjunctive detection, and register analysis
 */

import { normalizeText } from './textProcessing';
import { enhanceAvantQueAnalysis } from './avantQueAnalyzer';
import { TRIGGER_PATTERNS, SUBJUNCTIVE_PATTERNS } from './patterns';
import { analyzeAmbiguityAndNegation } from './ambiguityNegationAnalyzer';

// Enhanced trigger patterns with additional constructions
const ENHANCED_TRIGGER_PATTERNS = {
  ...TRIGGER_PATTERNS,
  FEAR: [
    ...TRIGGER_PATTERNS.FEAR,
    /de\s+peur\s+qu(?:e|')/i,  // de peur que
    /dans\s+la\s+crainte\s+qu(?:e|')/i,  // dans la crainte que
    /par\s+crainte\s+qu(?:e|')/i,  // par crainte que
  ],
  CONDITIONAL: [
    /à\s+moins\s+qu(?:e|')/i,  // à moins que
    /pourvu\s+qu(?:e|')/i,     // pourvu que
    /pour\s+peu\s+qu(?:e|')/i, // pour peu que
  ],
  COMPARATIVE: [
    /plus\s+(?:\w+\s+)*qu(?:e|')/i,     // plus ... que
    /moins\s+(?:\w+\s+)*qu(?:e|')/i,    // moins ... que
    /mieux\s+(?:\w+\s+)*qu(?:e|')/i,    // mieux ... que
    /autre\s+(?:\w+\s+)*qu(?:e|')/i,    // autre ... que
  ]
};

// Register/Genre detection patterns
const REGISTER_PATTERNS = {
  LITERARY: {
    patterns: [
      /\b(?:dont|duquel|auquel|desquels|auxquels)\b/i,  // Complex relatives
      /\b(?:eût|fût|eussent|fussent)\b/i,               // Literary subjunctive
      /\b(?:point|guère|nullement)\b/i,                 // Literary negation
      /\b(?:jadis|naguère|autrefois)\b/i,               // Temporal markers
      /\b(?:certes|assurément|néanmoins)\b/i,           // Formal connectors
    ],
    weight: 0.3
  },
  FORMAL: {
    patterns: [
      /\b(?:cependant|toutefois|néanmoins|par\s+conséquent)\b/i,  // Formal connectors
      /\b(?:afin\s+que|de\s+sorte\s+que|si\s+bien\s+que)\b/i,    // Purpose clauses
      /\b(?:quoique|bien\s+que|encore\s+que)\b/i,                // Concessive
      /\b(?:lequel|laquelle|lesquels|lesquelles)\b/i,            // Formal relatives
    ],
    weight: 0.2
  },
  COLLOQUIAL: {
    patterns: [
      /\b(?:ça|c'est\s+que|y\s+a|j'sais\s+pas)\b/i,    // Colloquial forms
      /\b(?:super|hyper|méga|trop)\b/i,                  // Intensifiers
      /\b(?:ouais|nan|bah|ben)\b/i,                      // Informal particles
      /\b(?:truc|machin|bidule)\b/i,                     // Vague terms
    ],
    weight: -0.2  // Negative weight for expletive ne likelihood
  }
};

// Discourse context patterns
const DISCOURSE_PATTERNS = {
  NEGATIVE_CONTEXT: [
    /\b(?:pas|jamais|rien|personne|aucun|nulle?)\b/i,
    /\b(?:sans|ni|non)\b/i,
  ],
  CONTRASTIVE_CONTEXT: [
    /\b(?:mais|cependant|pourtant|néanmoins|toutefois)\b/i,
    /\b(?:au\s+contraire|en\s+revanche|par\s+contre)\b/i,
  ],
  TEMPORAL_CONTEXT: [
    /\b(?:avant|après|pendant|durant|lors)\b/i,
    /\b(?:quand|lorsque|dès\s+que|aussitôt\s+que)\b/i,
  ]
};

/**
 * Enhanced trigger extraction with expanded patterns
 */
function extractEnhancedTrigger(text) {
  const normalizedText = normalizeText(text.toLowerCase());
  
  // Check all enhanced trigger categories
  for (const [category, patterns] of Object.entries(ENHANCED_TRIGGER_PATTERNS)) {
    if (category === 'TEMPORAL' && typeof patterns === 'object') {
      // Handle temporal subcategories
      for (const [subcategory, subPatterns] of Object.entries(patterns)) {
        for (const pattern of subPatterns) {
          const match = normalizedText.match(pattern);
          if (match) {
            return {
              category: 'TEMPORAL',
              subcategory,
              trigger: match[0],
              position: match.index,
              pattern: pattern.source
            };
          }
        }
      }
    } else {
      // Handle other categories
      const categoryPatterns = Array.isArray(patterns) ? patterns : [patterns];
      for (const pattern of categoryPatterns) {
        const match = normalizedText.match(pattern);
        if (match) {
          return {
            category,
            trigger: match[0],
            position: match.index,
            pattern: pattern.source
          };
        }
      }
    }
  }
  
  return null;
}

/**
 * Detect subjunctive mood in text
 */
function detectSubjunctiveMood(text) {
  const normalizedText = normalizeText(text.toLowerCase());
  let bestMatch = null;
  let highestPriority = 0;
  
  for (const [type, pattern] of Object.entries(SUBJUNCTIVE_PATTERNS)) {
    const match = normalizedText.match(pattern.pattern);
    if (match && pattern.priority >= highestPriority) {
      bestMatch = {
        type,
        verb: match[0],
        priority: pattern.priority,
        position: match.index,
        confidence: pattern.priority === 3 ? 0.95 : pattern.priority === 2 ? 0.85 : 0.70
      };
      highestPriority = pattern.priority;
    }
  }
  
  return bestMatch;
}

/**
 * Detect register/genre of text
 */
function detectRegister(text) {
  const normalizedText = normalizeText(text.toLowerCase());
  let registerScore = 0;
  let detectedFeatures = [];
  let primaryRegister = 'NEUTRAL';
  
  for (const [register, config] of Object.entries(REGISTER_PATTERNS)) {
    let matchCount = 0;
    for (const pattern of config.patterns) {
      if (pattern.test(normalizedText)) {
        matchCount++;
        const match = normalizedText.match(pattern);
        if (match) {
          detectedFeatures.push(`${register.toLowerCase()}: "${match[0]}"`);
        }
      }
    }
    
    if (matchCount > 0) {
      const categoryScore = matchCount * config.weight;
      registerScore += categoryScore;
      
      if (Math.abs(categoryScore) > 0.1) {
        primaryRegister = register;
      }
    }
  }
  
  return {
    register: primaryRegister,
    score: registerScore,
    features: detectedFeatures,
    confidence: Math.min(Math.abs(registerScore), 1.0)
  };
}

/**
 * Detect discourse context features
 */
function detectDiscourseContext(text) {
  const normalizedText = normalizeText(text.toLowerCase());
  let contextFeatures = [];
  
  for (const [contextType, patterns] of Object.entries(DISCOURSE_PATTERNS)) {
    for (const pattern of patterns) {
      const match = normalizedText.match(pattern);
      if (match) {
        contextFeatures.push({
          type: contextType,
          feature: match[0],
          position: match.index
        });
      }
    }
  }
  
  return contextFeatures;
}

/**
 * Enhanced similarity calculation with linguistic features
 */
export function calculateEnhancedSimilarity(text1, text2) {
  const norm1 = normalizeText(text1.toLowerCase());
  const norm2 = normalizeText(text2.toLowerCase());
  
  // Base lexical similarity
  const commonWords = new Set(['le', 'la', 'les', 'un', 'une', 'des', 'de', 'du', 'à', 'au', 'aux', 'ne', 'n']);
  const words1 = norm1.split(/\s+/).filter(w => !commonWords.has(w));
  const words2 = norm2.split(/\s+/).filter(w => !commonWords.has(w));
  
  const intersection = words1.filter(word => words2.includes(word));
  const union = [...new Set([...words1, ...words2])];
  let similarity = intersection.length / union.length;
  
  // Enhanced linguistic features
  const trigger1 = extractEnhancedTrigger(norm1);
  const trigger2 = extractEnhancedTrigger(norm2);
  const subjunctive1 = detectSubjunctiveMood(norm1);
  const subjunctive2 = detectSubjunctiveMood(norm2);
  const register1 = detectRegister(norm1);
  const register2 = detectRegister(norm2);
  
  let linguisticFeatures = {
    triggerMatch: false,
    subjunctiveMatch: false,
    registerMatch: false,
    avantQueEnhanced: false
  };
  
  // Trigger category matching (stronger weight)
  if (trigger1 && trigger2 && trigger1.category === trigger2.category) {
    similarity += 0.3;
    linguisticFeatures.triggerMatch = true;
    
    // Subcategory matching for temporal triggers
    if (trigger1.subcategory && trigger2.subcategory && 
        trigger1.subcategory === trigger2.subcategory) {
      similarity += 0.1;
    }
  }
  
  // Subjunctive mood matching
  if (subjunctive1 && subjunctive2) {
    if (subjunctive1.type === subjunctive2.type) {
      similarity += 0.2; // Same subjunctive type
      linguisticFeatures.subjunctiveMatch = true;
    } else if (subjunctive1.priority === subjunctive2.priority) {
      similarity += 0.1; // Same priority level
    }
  } else if ((subjunctive1 && !subjunctive2) || (!subjunctive1 && subjunctive2)) {
    similarity -= 0.1; // Penalty for subjunctive mismatch
  }
  
  // Register matching
  if (register1.register === register2.register && register1.register !== 'NEUTRAL') {
    similarity += 0.15;
    linguisticFeatures.registerMatch = true;
  }
  
  // Enhanced avant que analysis
  if (trigger1 && trigger1.trigger.includes('avant') && 
      trigger2 && trigger2.trigger.includes('avant')) {
    // Both are avant que constructions - apply enhanced analysis
    linguisticFeatures.avantQueEnhanced = true;
    similarity += 0.1;
  }
  
  return {
    similarity: Math.min(similarity, 0.98),
    features: linguisticFeatures,
    trigger1,
    trigger2,
    subjunctive1,
    subjunctive2,
    register1,
    register2
  };
}

/**
 * Enhanced training data analysis with linguistic features
 */
export function analyzeWithEnhancedFeatures(text, trainingData) {
  if (!text || !trainingData || trainingData.length === 0) {
    throw new Error('Invalid input for enhanced analysis');
  }
  
  const inputTrigger = extractEnhancedTrigger(text);
  const inputSubjunctive = detectSubjunctiveMood(text);
  const inputRegister = detectRegister(text);
  const inputDiscourse = detectDiscourseContext(text);
  
  // Enhanced avant que analysis if applicable
  let avantQueAnalysis = null;
  if (inputTrigger && inputTrigger.trigger.includes('avant')) {
    avantQueAnalysis = enhanceAvantQueAnalysis(text, inputTrigger);
  }
  
  // Ambiguity and negation analysis
  const ambiguityNegationAnalysis = analyzeAmbiguityAndNegation(text);
  
  // Find similar examples with enhanced similarity
  const enhancedExamples = trainingData
    .map(example => {
      const enhancedSim = calculateEnhancedSimilarity(text, example.text);
      return {
        ...example,
        ...enhancedSim,
        originalSimilarity: enhancedSim.similarity
      };
    })
    .filter(example => {
      // More sophisticated filtering
      const hasMatchingTrigger = example.trigger1?.category === inputTrigger?.category;
      const hasReasonableSimilarity = example.similarity > 0.25;
      const hasLinguisticMatch = example.features.triggerMatch || 
                                example.features.subjunctiveMatch || 
                                example.features.registerMatch;
      
      return hasMatchingTrigger && (hasReasonableSimilarity || hasLinguisticMatch);
    })
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 8); // Increased to 8 for better analysis
  
  // Enhanced weighted voting
  const enhancedVotes = enhancedExamples.reduce((acc, example) => {
    let weight = example.similarity;
    
    // Boost weight for linguistic feature matches
    if (example.features.triggerMatch) weight += 0.1;
    if (example.features.subjunctiveMatch) weight += 0.1;
    if (example.features.registerMatch) weight += 0.05;
    if (example.features.avantQueEnhanced) weight += 0.05;
    
    if (example.has_expletive_ne === true) {
      acc.expletive += weight;
    } else {
      acc.nonExpletive += weight;
    }
    
    acc.totalWeight += weight;
    return acc;
  }, { expletive: 0, nonExpletive: 0, totalWeight: 0 });
  
  // Apply ambiguity and negation adjustments
  let adjustedExpletive = enhancedVotes.expletive;
  let adjustedNonExpletive = enhancedVotes.nonExpletive;
  
  // Ambiguity increases expletive likelihood
  if (ambiguityNegationAnalysis.ambiguity.clarificationNeeded) {
    adjustedExpletive += 0.3;
  } else if (ambiguityNegationAnalysis.ambiguity.hasAmbiguity) {
    adjustedExpletive += 0.1;
  }
  
  // Negation type affects likelihood
  if (ambiguityNegationAnalysis.negation.isLogicalNegation) {
    adjustedNonExpletive += 0.5; // Strong evidence against expletive
  } else if (ambiguityNegationAnalysis.negation.isExpletiveContext) {
    adjustedExpletive += 0.4; // Strong evidence for expletive
  }
  
  const shouldHaveNe = adjustedExpletive > adjustedNonExpletive;
  const confidence = (adjustedExpletive + adjustedNonExpletive) > 0 ? 
    Math.max(adjustedExpletive, adjustedNonExpletive) / (adjustedExpletive + adjustedNonExpletive) :
    0.5;
  
  return {
    classification: shouldHaveNe,
    confidence,
    matches: enhancedExamples,
    linguisticAnalysis: {
      trigger: inputTrigger,
      subjunctive: inputSubjunctive,
      register: inputRegister,
      discourse: inputDiscourse,
      avantQueAnalysis,
      ambiguityAnalysis: ambiguityNegationAnalysis.ambiguity,
      negationAnalysis: ambiguityNegationAnalysis.negation,
      vowelContext: ambiguityNegationAnalysis.vowelContext,
      combinedAnalysis: ambiguityNegationAnalysis.combinedAnalysis
    },
    enhancedVotes: {
      ...enhancedVotes,
      adjustedExpletive,
      adjustedNonExpletive,
      ambiguityAdjustment: ambiguityNegationAnalysis.combinedAnalysis.expletiveLikelihood
    },
    originalText: text
  };
}
