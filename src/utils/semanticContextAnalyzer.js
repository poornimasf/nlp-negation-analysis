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

// NEW PHASE 2: Past participle forms of prevention verbs
const PREVENTION_PAST_PARTICIPLES = new Set([
  'remplacé', 'remplacée', 'remplacés', 'remplacées',
  'ajusté', 'ajustée', 'ajustés', 'ajustées',
  'modifié', 'modifiée', 'modifiés', 'modifiées',
  'transformé', 'transformée', 'transformés', 'transformées',
  'corrigé', 'corrigée', 'corrigés', 'corrigées',
  'adapté', 'adaptée', 'adaptés', 'adaptées',
  'réglé', 'réglée', 'réglés', 'réglées',
  'renommé', 'renommée', 'renommés', 'renommées',
  'détruit', 'détruite', 'détruits', 'détruites',
  'supprimé', 'supprimée', 'supprimés', 'supprimées',
  'éliminé', 'éliminée', 'éliminés', 'éliminées',
  'effacé', 'effacée', 'effacés', 'effacées'
]);

// NEW PHASE 2: Capability/readiness adjectives (often logical negation context)
const CAPABILITY_ADJECTIVES = new Set([
  'capable', 'capables',
  'opérationnel', 'opérationnelle', 'opérationnels', 'opérationnelles',
  'prêt', 'prête', 'prêts', 'prêtes',
  'disponible', 'disponibles',
  'accessible', 'accessibles',
  'utilisable', 'utilisables',
  'fonctionnel', 'fonctionnelle', 'fonctionnels', 'fonctionnelles',
  'grand', 'grande', 'grands', 'grandes', // in context "assez grand"
  'mature', 'matures',
  'compétent', 'compétente', 'compétents', 'compétentes'
]);

// NEW PHASE 2: Process/state completion verbs
const COMPLETION_VERBS = new Set([
  'finir', 'terminer', 'achever', 'compléter', 'accomplir',
  'réaliser', 'effectuer', 'exécuter', 'conclure',
  'aboutir', 'parvenir', 'atteindre', 'arriver'
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

// NEW PHASE 2: Logical negation phrase patterns
const LOGICAL_NEGATION_PHRASES = [
  // Prevention patterns
  /avant que.*ne.*emparer/i,
  /avant que.*ne.*remarque/i,
  /avant que.*ne.*entraîne/i,
  /avant que.*ne.*saisir/i,
  
  // Completion patterns with "soit"
  /avant que.*soit.*remplacé/i,
  /avant que.*soit.*ajusté/i,
  /avant que.*soit.*modifié/i,
  /avant que.*soit.*corrigé/i,
  
  // Capability patterns
  /avant que.*soit.*capable/i,
  /avant que.*soit.*opérationnel/i,
  /avant que.*soit.*prêt/i,
  /avant que.*soit.*assez.*grand/i,
  
  // Process completion patterns
  /avant que.*puisse.*nouveau/i,
  /avant que.*puisse.*à nouveau/i
];

/**
 * NEW PHASE 2: Detect past participle forms of prevention verbs
 * @param {string} verb - The verb/adjective to analyze
 * @returns {object|null} - Past participle analysis or null
 */
function detectPreventionPastParticiple(verb) {
  const normalizedVerb = verb.toLowerCase().trim();
  
  if (PREVENTION_PAST_PARTICIPLES.has(normalizedVerb)) {
    return {
      type: 'PREVENTION_PAST_PARTICIPLE',
      verb: normalizedVerb,
      confidence: 0.85,
      reasoning: `Past participle of prevention verb: "${verb}" in passive construction typically takes logical "ne"`
    };
  }
  
  return null;
}

/**
 * NEW PHASE 2: Detect capability/readiness adjectives
 * @param {string} word - The word to analyze
 * @returns {object|null} - Capability analysis or null
 */
function detectCapabilityAdjective(word) {
  const normalizedWord = word.toLowerCase().trim();
  
  if (CAPABILITY_ADJECTIVES.has(normalizedWord)) {
    return {
      type: 'CAPABILITY_ADJECTIVE',
      adjective: normalizedWord,
      confidence: 0.80,
      reasoning: `Capability adjective: "${word}" in readiness context often takes logical "ne"`
    };
  }
  
  return null;
}

/**
 * NEW PHASE 2: Detect completion verbs
 * @param {string} verb - The verb to analyze
 * @returns {object|null} - Completion analysis or null
 */
function detectCompletionVerb(verb) {
  const normalizedVerb = verb.toLowerCase().trim();
  
  if (COMPLETION_VERBS.has(normalizedVerb)) {
    return {
      type: 'COMPLETION_VERB',
      verb: normalizedVerb,
      confidence: 0.75,
      reasoning: `Completion verb: "${verb}" in process context often takes logical "ne"`
    };
  }
  
  return null;
}

/**
 * NEW PHASE 2: Detect logical negation phrase patterns
 * @param {string} sentence - The full sentence
 * @returns {object|null} - Phrase pattern analysis or null
 */
function detectLogicalNegationPhrases(sentence) {
  const lowerSentence = sentence.toLowerCase();
  
  for (const pattern of LOGICAL_NEGATION_PHRASES) {
    if (pattern.test(lowerSentence)) {
      return {
        type: 'LOGICAL_NEGATION_PHRASE',
        pattern: pattern.source,
        confidence: 0.85,
        reasoning: `Logical negation phrase pattern detected: ${pattern.source}`
      };
    }
  }
  
  return null;
}

/**
 * NEW PHASE 2: Context-aware verb analysis
 * Analyzes the verb in context to determine if it's in a logical negation situation
 * @param {string} sentence - The full sentence
 * @param {string} verb - The detected verb
 * @returns {object|null} - Context analysis or null
 */
function analyzeVerbInContext(sentence, verb) {
  const lowerSentence = sentence.toLowerCase();
  const lowerVerb = verb.toLowerCase();
  
  // Check for "soit + past participle" constructions
  if (lowerSentence.includes('soit') && PREVENTION_PAST_PARTICIPLES.has(lowerVerb)) {
    return {
      type: 'PASSIVE_PREVENTION',
      construction: `soit ${verb}`,
      confidence: 0.88,
      reasoning: `Passive construction "soit ${verb}" typically indicates logical negation`
    };
  }
  
  // Check for "soit + capability adjective" constructions
  if (lowerSentence.includes('soit') && CAPABILITY_ADJECTIVES.has(lowerVerb)) {
    return {
      type: 'CAPABILITY_CONSTRUCTION',
      construction: `soit ${verb}`,
      confidence: 0.82,
      reasoning: `Capability construction "soit ${verb}" often indicates logical negation`
    };
  }
  
  // Check for "puisse + à nouveau" constructions
  if (lowerVerb === 'puisse' && (lowerSentence.includes('à nouveau') || lowerSentence.includes('nouveau'))) {
    return {
      type: 'CAPABILITY_RESTORATION',
      construction: 'puisse à nouveau',
      confidence: 0.80,
      reasoning: 'Capability restoration "puisse à nouveau" often indicates logical negation'
    };
  }
  
  return null;
}
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
 * Comprehensive semantic context analysis (Phase 1 + Phase 2)
 * @param {string} sentence - The full sentence
 * @param {string} verb - The detected verb
 * @returns {object|null} - Semantic context analysis or null
 */
function analyzeSemanticContext(sentence, verb) {
  console.log('🔍 Semantic context analysis (Phase 1 + 2):', {
    sentence: sentence.substring(0, 50) + '...',
    verb: verb
  });
  
  // PHASE 1: Check for prevention verb
  const preventionAnalysis = detectPreventionVerb(verb);
  if (preventionAnalysis) {
    console.log('🎯 Phase 1 - Prevention verb detected:', preventionAnalysis);
    return preventionAnalysis;
  }
  
  // PHASE 2: Check for past participle forms
  const pastParticipleAnalysis = detectPreventionPastParticiple(verb);
  if (pastParticipleAnalysis) {
    console.log('🎯 Phase 2 - Prevention past participle detected:', pastParticipleAnalysis);
    return pastParticipleAnalysis;
  }
  
  // PHASE 2: Check for capability adjectives
  const capabilityAnalysis = detectCapabilityAdjective(verb);
  if (capabilityAnalysis) {
    console.log('🎯 Phase 2 - Capability adjective detected:', capabilityAnalysis);
    return capabilityAnalysis;
  }
  
  // PHASE 2: Check for completion verbs
  const completionAnalysis = detectCompletionVerb(verb);
  if (completionAnalysis) {
    console.log('🎯 Phase 2 - Completion verb detected:', completionAnalysis);
    return completionAnalysis;
  }
  
  // PHASE 2: Check for contextual verb analysis
  const contextAnalysis = analyzeVerbInContext(sentence, verb);
  if (contextAnalysis) {
    console.log('🎯 Phase 2 - Contextual analysis detected:', contextAnalysis);
    return contextAnalysis;
  }
  
  // PHASE 2: Check for logical negation phrase patterns
  const phraseAnalysis = detectLogicalNegationPhrases(sentence);
  if (phraseAnalysis) {
    console.log('🎯 Phase 2 - Logical negation phrase detected:', phraseAnalysis);
    return phraseAnalysis;
  }
  
  // PHASE 1: Check for adversarial context
  const adversarialAnalysis = detectAdversarialContext(sentence);
  if (adversarialAnalysis) {
    console.log('🎯 Phase 1 - Adversarial context detected:', adversarialAnalysis);
    return adversarialAnalysis;
  }
  
  console.log('🔍 No semantic context override detected');
  return null;
}

/**
 * Determine if semantic context should override linguistic analysis (Phase 1 + Phase 2)
 * @param {object} semanticContext - Result from analyzeSemanticContext
 * @returns {boolean} - True if should override to "No Expletive"
 */
function shouldOverrideToLogicalNegation(semanticContext) {
  if (!semanticContext) {
    return false;
  }
  
  // Phase 1: High confidence prevention contexts (0.85+)
  if (semanticContext.confidence >= 0.85) {
    console.log('🎯 Semantic override: High confidence logical negation context');
    return true;
  }
  
  // Phase 2: Medium-high confidence contexts (0.80+)
  if (semanticContext.confidence >= 0.80) {
    console.log('🎯 Semantic override: Medium-high confidence logical negation context');
    return true;
  }
  
  // Phase 2: Medium confidence contexts (0.75+) - more conservative
  if (semanticContext.confidence >= 0.75) {
    console.log('🎯 Semantic override: Medium confidence logical negation context');
    return true;
  }
  
  console.log('🔍 Semantic context confidence too low for override:', semanticContext.confidence);
  return false;
}

export {
  analyzeSemanticContext,
  shouldOverrideToLogicalNegation,
  detectPreventionVerb,
  detectAdversarialContext,
  // NEW PHASE 2 EXPORTS
  detectPreventionPastParticiple,
  detectCapabilityAdjective,
  detectCompletionVerb,
  detectLogicalNegationPhrases,
  analyzeVerbInContext,
  PREVENTION_VERBS,
  ADVERSARIAL_CONTEXTS,
  // NEW PHASE 2 CONSTANTS
  PREVENTION_PAST_PARTICIPLES,
  CAPABILITY_ADJECTIVES,
  COMPLETION_VERBS,
  LOGICAL_NEGATION_PHRASES
};
