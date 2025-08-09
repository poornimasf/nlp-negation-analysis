/**
 * Semantic Context Analyzer for French Negation
 * Phase 1: Prevention Verb Detection to reduce false positives
 */

// Phase 1: High-confidence prevention verbs that typically take logical "ne"
const PREVENTION_VERBS = new Set([
  // Seizing/Taking verbs (logical negation context)
  'emparer',    // s'emparer de (seize, take hold of)
  'saisir',     // saisir (seize, grab)
  'prendre',    // prendre (take)
  'attraper',   // attraper (catch)
  'capturer',   // capturer (capture)
  
  // Detection/Discovery verbs (avoidance context)
  'remarquer',  // remarquer (notice)
  'découvrir',  // découvrir (discover)
  'détecter',   // détecter (detect)
  'apercevoir', // apercevoir (perceive)
  'voir',       // voir (see)
  'observer',   // observer (observe)
  
  // Causation verbs (prevention context)
  'entraîner',  // entraîner (cause, lead to)
  'causer',     // causer (cause)
  'provoquer',  // provoquer (provoke, cause)
  'déclencher', // déclencher (trigger)
  'créer',      // créer (create)
  'générer',    // générer (generate)
  
  // Process completion verbs (often logical negation)
  'remplacer',  // remplacer (replace)
  'substituer', // substituer (substitute)
  'changer',    // changer (change)
  'modifier',   // modifier (modify)
  'transformer',// transformer (transform)
  
  // Administrative/Technical processes
  'ajuster',    // ajuster (adjust)
  'corriger',   // corriger (correct)
  'adapter',    // adapter (adapt)
  'régler',     // régler (adjust, settle)
  'renommer',   // renommer (rename)
  'rebaptiser', // rebaptiser (rename)
  
  // Destruction/Elimination verbs
  'détruire',   // détruire (destroy)
  'supprimer',  // supprimer (delete, remove)
  'éliminer',   // éliminer (eliminate)
  'effacer',    // effacer (erase)
  'disparaître' // disparaître (disappear)
]);

// Adversarial context indicators
const ADVERSARIAL_CONTEXTS = new Set([
  'presse',
  'camp adverse',
  'adversaires',
  'ennemis',
  'opposition',
  'rival',
  'contre-frappes',
  'attaques',
  'contre-attaques',
  'service de nettoyage',
  'autorités'
]);

/**
 * Detect if a verb indicates prevention/logical negation context
 * @param {string} verb - The verb to analyze
 * @returns {object|null} - Prevention context analysis or null
 */
function detectPreventionVerb(verb) {
  const normalizedVerb = verb.toLowerCase().trim();
  
  if (PREVENTION_VERBS.has(normalizedVerb)) {
    return {
      type: 'PREVENTION_VERB',
      verb: normalizedVerb,
      confidence: 0.90,
      reasoning: `Prevention verb detected: "${verb}" typically takes logical "ne"`
    };
  }
  
  return null;
}

/**
 * Detect adversarial context in sentence
 * @param {string} sentence - The full sentence
 * @returns {object|null} - Adversarial context analysis or null
 */
function detectAdversarialContext(sentence) {
  const lowerSentence = sentence.toLowerCase();
  
  for (const context of ADVERSARIAL_CONTEXTS) {
    if (lowerSentence.includes(context)) {
      return {
        type: 'ADVERSARIAL_CONTEXT',
        context: context,
        confidence: 0.85,
        reasoning: `Adversarial context detected: "${context}" suggests logical negation`
      };
    }
  }
  
  return null;
}

/**
 * Comprehensive semantic context analysis
 * @param {string} sentence - The full sentence
 * @param {string} verb - The detected verb
 * @returns {object|null} - Semantic context analysis or null
 */
function analyzeSemanticContext(sentence, verb) {
  console.log('🔍 Semantic context analysis:', {
    sentence: sentence.substring(0, 50) + '...',
    verb: verb
  });
  
  // Check for prevention verb
  const preventionAnalysis = detectPreventionVerb(verb);
  if (preventionAnalysis) {
    console.log('🎯 Prevention verb detected:', preventionAnalysis);
    return preventionAnalysis;
  }
  
  // Check for adversarial context
  const adversarialAnalysis = detectAdversarialContext(sentence);
  if (adversarialAnalysis) {
    console.log('🎯 Adversarial context detected:', adversarialAnalysis);
    return adversarialAnalysis;
  }
  
  console.log('🔍 No semantic context override detected');
  return null;
}

/**
 * Determine if semantic context should override linguistic analysis
 * @param {object} semanticContext - Result from analyzeSemanticContext
 * @returns {boolean} - True if should override to "No Expletive"
 */
function shouldOverrideToLogicalNegation(semanticContext) {
  if (!semanticContext) {
    return false;
  }
  
  // High confidence prevention contexts override to logical negation
  if (semanticContext.confidence >= 0.85) {
    console.log('🎯 Semantic override: High confidence logical negation context');
    return true;
  }
  
  return false;
}

export {
  analyzeSemanticContext,
  shouldOverrideToLogicalNegation,
  detectPreventionVerb,
  detectAdversarialContext,
  PREVENTION_VERBS,
  ADVERSARIAL_CONTEXTS
};
