/**
 * Logical Negation Context Detector
 * Identifies contexts where "ne" would be logical negation (with pas, jamais, etc.)
 * rather than expletive negation
 */

// Logical negation indicators that suggest "ne" would be paired with negation words
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
 * Analyze if a sentence contains logical negation context
 * @param {string} text - The sentence to analyze
 * @param {Object} triggerInfo - Information about the trigger phrase
 * @returns {Object} Analysis result
 */
export function analyzeLogicalNegationContext(text, triggerInfo) {
  if (!text || typeof text !== 'string') {
    return { isLogicalNegation: false, confidence: 0, reasoning: 'Invalid input' };
  }

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

  // Special analysis for "avant que" contexts
  if (triggerInfo && triggerInfo.trigger && triggerInfo.trigger.includes('avant')) {
    // Look for completion/achievement contexts after "avant que"
    const afterTrigger = extractTextAfterTrigger(text, triggerInfo);
    if (afterTrigger) {
      // Check for completion verbs
      if (/\b(soit|soient|ait|aient|puisse|puissent|finisse|finissent|arrive|arrivent)\b/gi.test(afterTrigger)) {
        // Check the broader context for logical vs expletive indicators
        if (/\b(opérationnel|prêt|terminé|fini|résolu|réglé|corrigé|modifié|changé|ouvert|ouverte|ouvertes)\b/gi.test(normalizedText)) {
          logicalScore += 3.0; // Increased from 2.0
          evidence.push('Completion/achievement context detected after "avant que"');
        }
      }
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

/**
 * Extract text after a trigger phrase
 * @param {string} text - Full text
 * @param {Object} triggerInfo - Trigger information
 * @returns {string} Text after the trigger
 */
function extractTextAfterTrigger(text, triggerInfo) {
  const triggerIndex = text.toLowerCase().indexOf(triggerInfo.trigger.toLowerCase());
  if (triggerIndex === -1) return text;
  
  return text.slice(triggerIndex + triggerInfo.trigger.length).trim();
}

const logicalNegationDetector = {
  analyzeLogicalNegationContext,
  LOGICAL_NEGATION_PATTERNS,
  EXPLETIVE_CONTEXTS
};

export default logicalNegationDetector;
