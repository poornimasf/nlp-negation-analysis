/**
 * Enhanced Logical Negation Context Detector
 * Priority-ordered detection for "avant que" constructions based on training data analysis
 * 
 * Implementation Priority:
 * 1. High Priority: Administrative/procedural + comparative contexts
 * 2. Medium-High Priority: Urgency/prevention contexts (for expletive detection)
 * 3. Medium Priority: Neutral temporal sequences
 */

// High Priority: Administrative/Procedural Context Patterns
const ADMINISTRATIVE_PATTERNS = {
  // Core administrative verbs that indicate procedural contexts
  core_verbs: [
    'soit publié', 'soit accordé', 'soit validé', 'soit approuvé', 'soit établi',
    'soit prise', 'soient présentés', 'soit rendu', 'soit donné', 'soit fait',
    'soit terminé', 'soit achevé', 'soit fini', 'soit complété',
    'soit signé', 'soit ratifié', 'soit adopté', 'soit voté'
  ],
  
  // Administrative nouns that signal procedural contexts
  administrative_nouns: [
    'autorisation', 'permission', 'accord', 'approbation', 'validation',
    'décision', 'résolution', 'délibération', 'vote', 'ratification',
    'signature', 'publication', 'annonce', 'communication', 'notification'
  ],
  
  // Comparative temporal quantifiers with administrative contexts
  temporal_quantifiers: [
    'plusieurs mois', 'quelques mois', 'plusieurs années', 'quelques années',
    'plusieurs jours', 'quelques jours', 'plusieurs semaines', 'quelques semaines',
    'un certain temps', 'longtemps', 'bien avant', 'peu avant'
  ]
};

// Medium-High Priority: Urgency/Prevention Context Patterns (for expletive detection)
const URGENCY_PREVENTION_PATTERNS = {
  // Urgency indicators that suggest expletive "ne"
  urgency_indicators: [
    'trop tard', 'se dégrade', 's\'effondre', 'accident', 'catastrophe', 
    'problème', 'crise', 'danger', 'risque', 'menace'
  ],
  
  // Prevention/completion verbs that suggest expletive "ne"
  prevention_verbs: [
    'soit terminé', 'soit achevé', 'soit fini', 'commence', 'débute',
    'se produise', 'survienne', 'arrive', 'se passe'
  ],
  
  // Transformation verbs that suggest expletive "ne"
  transformation_verbs: [
    'devienne', 'deviennent', 'se transforme', 'prenne', 'prennent'
  ]
};

// Medium Priority: Neutral Temporal Context Patterns
const NEUTRAL_TEMPORAL_PATTERNS = {
  // Simple ability/possibility contexts
  ability_contexts: [
    'puisse répondre', 'puissiez faire', 'puissions célébrer', 'puisse entrer',
    'ait fini', 'aient terminé', 'arrive', 'parte', 'vienne', 'revienne'
  ],
  
  // Conditional/hypothetical contexts
  conditional_contexts: [
    'puisse entrer en vigueur', 'puisse être mis en place', 'puisse commencer',
    'soit possible', 'soit réalisable', 'soit faisable'
  ]
};

// Legacy patterns for backward compatibility
const LOGICAL_NEGATION_PATTERNS = {
  // Direct negation words that would pair with "ne"
  NEGATION_WORDS: /\b(pas|jamais|plus|rien|personne|aucun|aucune|nulle?part|guère)\b/gi,
  
  // Contexts that strongly suggest logical negation
  LOGICAL_CONTEXTS: [
    // Conditional/hypothetical contexts
    /\b(si|au cas où|dans le cas où|supposons que|imagine que)\b/gi,
    
    // Temporal contexts with completion/finality
    /\b(jusqu'à ce que|en attendant que|le temps que)\b/gi,
    
    // Causal/consequential contexts
    /\b(pour que|afin que|de sorte que|de façon que|de manière que)\b/gi,
    
    // Preventive/protective contexts
    /\b(éviter que|empêcher que|prévenir que|interdire que|défendre que)\b/gi,
    
    // Completion/achievement contexts
    /\b(réussir|terminer|finir|achever|compléter|accomplir)\b/gi,
    
    // Problem/issue resolution contexts
    /\b(résoudre|régler|corriger|réparer|améliorer|modifier)\b/gi
  ],
  
  // Verbs that commonly appear in logical negation contexts
  LOGICAL_NEGATION_VERBS: [
    // Modal verbs suggesting possibility/ability
    /\b(puisse|puisses|puissions|puissiez|puissent)\b/gi, // pouvoir
    /\b(sache|saches|sachions|sachiez|sachent)\b/gi,      // savoir
    /\b(veuille|veuilles|voulions|vouliez|veuillent)\b/gi, // vouloir
    
    // Action verbs in completion contexts
    /\b(finisse|finisses|finissions|finissiez|finissent)\b/gi,
    /\b(réussisse|réussisses|réussissions|réussissiez|réussissent)\b/gi,
    /\b(arrive|arrives|arrivions|arriviez|arrivent)\b/gi,
    /\b(parte|partes|partions|partiez|partent)\b/gi,
    /\b(vienne|viennes|venions|veniez|viennent)\b/gi
  ]
};

// Contexts that are typically expletive (for contrast)
const EXPLETIVE_CONTEXTS = [
  // Emotional/fear contexts
  /\b(peur|crainte|inquiétude|angoisse|souci)\s+que\b/gi,
  
  // Doubt/uncertainty contexts  
  /\b(doute|incertitude|hésitation)\s+que\b/gi,
  
  // Temporal proximity without completion
  /\b(peu s'en faut|il s'en faut de peu)\b/gi
];

/**
 * Analyzes administrative/procedural context for logical negation
 * @param {string} sentence - The sentence to analyze
 * @returns {Object} Analysis result with score and evidence
 */
function analyzeAdministrativeContext(sentence) {
  const normalizedText = sentence.toLowerCase();
  let score = 0;
  let evidence = [];
  
  // Check for administrative verbs
  for (const verb of ADMINISTRATIVE_PATTERNS.core_verbs) {
    if (normalizedText.includes(verb)) {
      score += 3.5; // Strong indicator
      evidence.push(`Administrative verb: "${verb}"`);
      break; // Only count one per category
    }
  }
  
  // Check for administrative nouns
  for (const noun of ADMINISTRATIVE_PATTERNS.administrative_nouns) {
    if (normalizedText.includes(noun)) {
      score += 2.0; // Moderate indicator
      evidence.push(`Administrative noun: "${noun}"`);
      break; // Only count one per category
    }
  }
  
  // Check for temporal quantifiers with administrative context
  for (const quantifier of ADMINISTRATIVE_PATTERNS.temporal_quantifiers) {
    if (normalizedText.includes(quantifier) && normalizedText.includes('avant que')) {
      score += 1.5; // Moderate boost for comparative + administrative
      evidence.push(`Temporal quantifier: "${quantifier}"`);
      break;
    }
  }
  
  return { score, evidence };
}

/**
 * Analyzes urgency/prevention context for expletive negation
 * @param {string} sentence - The sentence to analyze
 * @returns {Object} Analysis result with score and evidence
 */
function analyzeUrgencyPreventionContext(sentence) {
  const normalizedText = sentence.toLowerCase();
  let score = 0;
  let evidence = [];
  
  // Check for urgency indicators
  for (const indicator of URGENCY_PREVENTION_PATTERNS.urgency_indicators) {
    if (normalizedText.includes(indicator)) {
      score += 4.0; // Strong indicator for expletive
      evidence.push(`Urgency indicator: "${indicator}"`);
      break;
    }
  }
  
  // Check for prevention/completion verbs
  for (const verb of URGENCY_PREVENTION_PATTERNS.prevention_verbs) {
    if (normalizedText.includes(verb)) {
      score += 3.0; // Strong indicator for expletive
      evidence.push(`Prevention/completion verb: "${verb}"`);
      break;
    }
  }
  
  // Check for transformation verbs
  for (const verb of URGENCY_PREVENTION_PATTERNS.transformation_verbs) {
    if (normalizedText.includes(verb)) {
      score += 3.5; // Strong indicator for expletive
      evidence.push(`Transformation verb: "${verb}"`);
      break;
    }
  }
  
  return { score, evidence };
}

/**
 * Analyzes neutral temporal context
 * @param {string} sentence - The sentence to analyze
 * @returns {Object} Analysis result with score and evidence
 */
function analyzeNeutralTemporalContext(sentence) {
  const normalizedText = sentence.toLowerCase();
  let score = 0;
  let evidence = [];
  
  // Check for ability/possibility contexts
  for (const context of NEUTRAL_TEMPORAL_PATTERNS.ability_contexts) {
    if (normalizedText.includes(context)) {
      score += 2.5; // Moderate indicator for no expletive
      evidence.push(`Ability context: "${context}"`);
      break;
    }
  }
  
  // Check for conditional contexts
  for (const context of NEUTRAL_TEMPORAL_PATTERNS.conditional_contexts) {
    if (normalizedText.includes(context)) {
      score += 2.0; // Moderate indicator for no expletive
      evidence.push(`Conditional context: "${context}"`);
      break;
    }
  }
  
  return { score, evidence };
}

/**
 * Analyzes comparative patterns in "avant que" constructions
 * @param {string} sentence - The sentence to analyze
 * @returns {Object} Analysis result with expletive and no-expletive scores
 */
function analyzeComparativeContext(sentence) {
  const normalizedText = sentence.toLowerCase();
  let expletiveScore = 0;
  let noExpletiveScore = 0;
  let evidence = [];
  
  // Temporal intensifiers that can go either way depending on context
  const temporalIntensifiers = {
    'bien avant que': 0.7,
    'longtemps avant que': 0.6,
    'juste avant que': 0.8,
    'peu avant que': 0.7
  };
  
  // Check for temporal intensifiers
  for (const [pattern, weight] of Object.entries(temporalIntensifiers)) {
    if (normalizedText.includes(pattern)) {
      evidence.push(`Temporal intensifier: "${pattern}"`);
      
      // Context determines direction - check what follows
      const afterPattern = normalizedText.substring(normalizedText.indexOf(pattern) + pattern.length);
      
      // If followed by urgency/prevention context, boost expletive
      if (URGENCY_PREVENTION_PATTERNS.urgency_indicators.some(indicator => 
          afterPattern.includes(indicator))) {
        expletiveScore += weight + 0.5;
        evidence.push('Intensifier + urgency context → expletive');
      }
      // If followed by administrative context, boost no expletive
      else if (ADMINISTRATIVE_PATTERNS.core_verbs.some(verb => 
          afterPattern.includes(verb))) {
        noExpletiveScore += weight + 0.5;
        evidence.push('Intensifier + administrative context → no expletive');
      }
      // Default neutral boost
      else {
        expletiveScore += weight * 0.5;
        noExpletiveScore += weight * 0.5;
        evidence.push('Intensifier with neutral context');
      }
      break;
    }
  }
  
  // Check for outcome intensifiers (strongly suggest expletive)
  const outcomeIntensifiers = ['vraiment', 'définitivement', 'complètement', 'totalement'];
  for (const intensifier of outcomeIntensifiers) {
    if (normalizedText.includes(`avant que`) && normalizedText.includes(intensifier)) {
      expletiveScore += 0.8;
      evidence.push(`Outcome intensifier: "${intensifier}" → expletive`);
      break;
    }
  }
  
  return { expletiveScore, noExpletiveScore, evidence };
}

/**
 * Main logical negation detection function with priority-ordered analysis
 * @param {string} sentence - The sentence to analyze
 * @returns {Object} Complete analysis with classification recommendation
 */
export function detectLogicalNegation(sentence) {
  if (!sentence || !sentence.includes('avant que')) {
    return {
      isLogicalNegation: false,
      confidence: 0,
      evidence: [],
      reasoning: 'No "avant que" construction found'
    };
  }
  
  // Analyze different contexts
  const administrativeAnalysis = analyzeAdministrativeContext(sentence);
  const urgencyAnalysis = analyzeUrgencyPreventionContext(sentence);
  const neutralAnalysis = analyzeNeutralTemporalContext(sentence);
  const comparativeAnalysis = analyzeComparativeContext(sentence);
  
  // Calculate total scores
  const totalNoExpletiveScore = 
    administrativeAnalysis.score + 
    neutralAnalysis.score + 
    comparativeAnalysis.noExpletiveScore;
    
  const totalExpletiveScore = 
    urgencyAnalysis.score + 
    comparativeAnalysis.expletiveScore;
  
  // Collect all evidence
  const allEvidence = [
    ...administrativeAnalysis.evidence,
    ...urgencyAnalysis.evidence,
    ...neutralAnalysis.evidence,
    ...comparativeAnalysis.evidence
  ];
  
  // Determine classification
  const isLogicalNegation = totalNoExpletiveScore > totalExpletiveScore;
  const maxScore = Math.max(totalNoExpletiveScore, totalExpletiveScore);
  const confidence = maxScore > 0 ? Math.min(maxScore / 10, 0.95) : 0;
  
  // Generate reasoning
  let reasoning = '';
  if (totalNoExpletiveScore > totalExpletiveScore && totalNoExpletiveScore >= 3.0) {
    reasoning = 'Strong evidence for logical negation context (administrative/procedural/neutral temporal)';
  } else if (totalExpletiveScore > totalNoExpletiveScore && totalExpletiveScore >= 3.0) {
    reasoning = 'Strong evidence for expletive negation context (urgency/prevention)';
  } else if (allEvidence.length > 0) {
    reasoning = 'Mixed or weak contextual evidence';
  } else {
    reasoning = 'No clear contextual indicators found';
  }
  
  return {
    isLogicalNegation,
    confidence,
    evidence: allEvidence,
    reasoning,
    scores: {
      noExpletive: totalNoExpletiveScore,
      expletive: totalExpletiveScore,
      breakdown: {
        administrative: administrativeAnalysis.score,
        urgency: urgencyAnalysis.score,
        neutral: neutralAnalysis.score,
        comparative: {
          expletive: comparativeAnalysis.expletiveScore,
          noExpletive: comparativeAnalysis.noExpletiveScore
        }
      }
    }
  };
}

/**
 * Quick check for high-confidence logical negation cases
 * @param {string} sentence - The sentence to analyze
 * @returns {boolean} True if high confidence logical negation
 */
export function isHighConfidenceLogicalNegation(sentence) {
  const analysis = detectLogicalNegation(sentence);
  return analysis.isLogicalNegation && 
         analysis.confidence >= 0.7 && 
         analysis.scores.noExpletive >= 3.0;
}

/**
 * Quick check for high-confidence expletive negation cases
 * @param {string} sentence - The sentence to analyze
 * @returns {boolean} True if high confidence expletive negation
 */
export function isHighConfidenceExpletive(sentence) {
  const analysis = detectLogicalNegation(sentence);
  return !analysis.isLogicalNegation && 
         analysis.confidence >= 0.7 && 
         analysis.scores.expletive >= 3.0;
}

/**
 * Legacy function for backward compatibility
 * @param {string} text - The sentence to analyze
 * @param {Object} triggerInfo - Information about the trigger phrase
 * @returns {Object} Analysis result
 */
export function analyzeLogicalNegationContext(text, triggerInfo) {
  if (!text || typeof text !== 'string') {
    return { isLogicalNegation: false, confidence: 0, reasoning: 'Invalid input' };
  }

  // Use new priority-ordered analysis for "avant que" constructions
  if (text.includes('avant que')) {
    const newAnalysis = detectLogicalNegation(text);
    return {
      isLogicalNegation: newAnalysis.isLogicalNegation,
      confidence: newAnalysis.confidence,
      logicalScore: newAnalysis.scores.noExpletive,
      expletiveScore: newAnalysis.scores.expletive,
      totalScore: newAnalysis.scores.noExpletive - newAnalysis.scores.expletive,
      evidence: newAnalysis.evidence,
      reasoning: newAnalysis.reasoning
    };
  }

  // Fall back to legacy analysis for other constructions
  const normalizedText = text.toLowerCase();
  let logicalScore = 0;
  let expletiveScore = 0;
  const evidence = [];

  // Check for direct negation words
  const negationWords = normalizedText.match(LOGICAL_NEGATION_PATTERNS.NEGATION_WORDS);
  if (negationWords && negationWords.length > 0) {
    logicalScore += 5.0; // Very strong evidence
    evidence.push(`Direct negation words found: ${negationWords.join(', ')}`);
  }

  // Check for logical contexts
  for (const pattern of LOGICAL_NEGATION_PATTERNS.LOGICAL_CONTEXTS) {
    const matches = normalizedText.match(pattern);
    if (matches && matches.length > 0) {
      logicalScore += 3.0; // Increased from 2.0
      evidence.push(`Logical context pattern: ${matches.join(', ')}`);
    }
  }

  // Check for logical negation verbs
  for (const pattern of LOGICAL_NEGATION_PATTERNS.LOGICAL_NEGATION_VERBS) {
    const matches = normalizedText.match(pattern);
    if (matches && matches.length > 0) {
      logicalScore += 2.0; // Increased from 1.5
      evidence.push(`Logical negation verb: ${matches.join(', ')}`);
    }
  }

  // Check for expletive contexts (counter-evidence)
  for (const pattern of EXPLETIVE_CONTEXTS) {
    const matches = normalizedText.match(pattern);
    if (matches && matches.length > 0) {
      expletiveScore += 3.0; // Increased from 2.0
      evidence.push(`Expletive context pattern: ${matches.join(', ')}`);
    }
  }

  const totalScore = logicalScore - expletiveScore;
  const isLogicalNegation = totalScore > 0.5; // Lowered threshold from 1.0
  const confidence = Math.min(Math.abs(totalScore) / 4.0, 1.0); // Adjusted normalization

  return {
    isLogicalNegation,
    confidence,
    logicalScore,
    expletiveScore,
    totalScore,
    evidence,
    reasoning: isLogicalNegation 
      ? `Logical negation context detected (score: ${totalScore.toFixed(1)})`
      : `Expletive context likely (score: ${totalScore.toFixed(1)})`
  };
}

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  detectLogicalNegation,
  isHighConfidenceLogicalNegation,
  isHighConfidenceExpletive,
  analyzeLogicalNegationContext,
  LOGICAL_NEGATION_PATTERNS,
  EXPLETIVE_CONTEXTS
};
