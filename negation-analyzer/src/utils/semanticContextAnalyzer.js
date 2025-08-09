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
  'désigner',   // désigner (designate) - MISSING!
  'nommer',     // nommer (name/appoint)
  'approuver',  // approuver (approve)
  
  // Guidance/Direction verbs (often neutral context)
  'conduire',   // conduire (lead, conduct) - MISSING!
  'conduise',   // conduise (subjunctive of conduire) - MISSING!
  'guider',     // guider (guide)
  'diriger',    // diriger (direct)
  'mener',      // mener (lead)
  'accompagner', // accompagner (accompany)
  
  // Process/Action verbs (often neutral context)
  'partir',     // partir (leave, depart)
  'arriver',    // arriver (arrive)
  'venir',      // venir (come)
  'aller',      // aller (go)
  'revenir',    // revenir (come back)
  'repartir',   // repartir (leave again)
  
  // Communication/Expression verbs
  'dire',       // dire (say)
  'parler',     // parler (speak)
  'répondre',   // répondre (respond)
  'expliquer',  // expliquer (explain)
  'raconter',   // raconter (tell)
  
  // Reflexive action verbs (often neutral)
  'réunir',     // se réunir (meet, gather)
  'décider',    // se décider (decide)
  'réveiller',  // se réveiller (wake up)
  'lever',      // se lever (get up)
  'lancer',     // se lancer (launch oneself)
  
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
  'effacé', 'effacée', 'effacés', 'effacées',
  // MISSING PAST PARTICIPLES - CRITICAL ADDITIONS:
  'reporté', 'reportée', 'reportés', 'reportées', // postponed/delayed - MISSING!
  'désigné', 'désignée', 'désignés', 'désignées', // designated - MISSING!
  'submergé', 'submergée', 'submergés', 'submergées', // submerged - MISSING!
  'conduit', 'conduite', 'conduits', 'conduites', // led/conducted - MISSING!
  'commencé', 'commencée', 'commencés', 'commencées', // begun - MISSING!
  'attaché', 'attachée', 'attachés', 'attachées', // attached - MISSING!
  'installé', 'installée', 'installés', 'installées', // installed - MISSING!
  'placé', 'placée', 'placés', 'placées', // placed - MISSING!
  'positionné', 'positionnée', 'positionnés', 'positionnées' // positioned - MISSING!
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
  'aboutir', 'parvenir', 'atteindre', 'arriver',
  'empirer', 'empire', 'empires', 'empirent', // worsen/get worse
  'dégrader', 'dégrade', 'dégrades', 'dégradent', // degrade
  'détériorer', 'détériore', 'détériores', 'détériorent', // deteriorate
  'commencer', 'commence', 'commences', 'commencez', 'commenciez', // begin - MISSING!
  'débuter', 'débute', 'débutes', 'débutez', // start
  'entamer', 'entame', 'entames', 'entamez', // begin/start
  'initier', 'initie', 'inities', 'initiez' // initiate
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

// NEW PHASE 2: Reflexive action verbs (often neutral physical actions)
const REFLEXIVE_ACTION_VERBS = new Set([
  'accroche', 'accrocher', // s'accrocher (grab hold)
  'attache', 'attacher', // s'attacher (attach)
  'installe', 'installer', // s'installer (install/settle)
  'assoit', 'asseoir', // s'asseoir (sit down)
  'place', 'placer', // se placer (place oneself)
  'positionne', 'positionner', // se positionner (position oneself)
  'dirige', 'diriger', // se diriger (head towards)
  'rend', 'rendre' // se rendre (go to)
]);

/**
 * NEW PHASE 2: Detect reflexive action verbs
 * @param {string} verb - The verb to analyze
 * @returns {object|null} - Reflexive action analysis or null
 */
function detectReflexiveActionVerb(verb) {
  const normalizedVerb = verb.toLowerCase().trim();
  
  if (REFLEXIVE_ACTION_VERBS.has(normalizedVerb)) {
    return {
      type: 'REFLEXIVE_ACTION',
      verb: normalizedVerb,
      confidence: 0.70,
      reasoning: `Reflexive action verb: "${verb}" in physical action context often takes logical "ne"`
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

// NEW: Neutral temporal context indicators that suggest expletive "ne" rather than logical
const NEUTRAL_TEMPORAL_INDICATORS = new Set([
  // Administrative/official processes (neutral)
  'officiellement', 'dans un premier temps', 'ne sera donc effectif',
  'le processus', 'la procédure', 'l\'épisode', 'la saison',
  
  // Neutral sequencing indicators
  'pour aller', 'pour jouer', 'pour espionner', 'et ce',
  'mais', 'probablement', 'en fait', 'donc',
  
  // Natural/inevitable processes
  'naturellement', 'inévitablement', 'automatiquement',
  
  // Neutral temporal expressions
  'dans le temps', 'au moment où', 'à ce moment-là',
  'pendant que', 'tandis que', 'alors que',
  
  // Natural growth/development
  'au monde', 'de naissance', 'par nature',
  'avec le temps', 'petit à petit', 'progressivement',
  
  // Administrative timing
  'jour ouvrable', 'délai', 'échéance', 'terme',
  'à terme', 'en temps voulu', 'le moment venu',
  
  // Narrative/storytelling contexts (neutral)
  'une dernière fois', 'à ce moment là', 'tout à l\'heure',
  'quelques pages', 'quelques heures', 'quelques instants',
  'une heure ou deux', 'des heures entières',
  
  // Natural processes/timing
  'juste avant', 'peu de temps avant', 'bien avant',
  'longtemps avant', 'des années avant', 'des mois avant',
  
  // Communication/media contexts
  'radio nova', 'l\'auteur', 'l\'éditeur', 'la collection',
  'le film', 'les personnages', 'l\'histoire'
]);

// Neutral process contexts (not prevention)
const NEUTRAL_PROCESS_CONTEXTS = new Set([
  'lancement', 'désignation', 'nomination', 'approbation',
  'processus', 'procédure', 'examen', 'évaluation',
  'submersion', 'inondation', 'érosion', 'évolution',
  'conduite', 'accompagnement', 'guidance', 'direction',
  'reporté pour', 'prévu pour', 'annoncé pour',
  // Natural biological/growth processes
  'vienne au monde', 'naisse', 'naissance',
  'assez grand', 'assez grande', 'assez mûr', 'assez mûre',
  'se déclenchent', 'se déclenche', 'déclenchement',
  // Administrative/technical processes
  'soit ajusté', 'soit remplacé', 'soit modifié',
  'soit opérationnel', 'soit utilisable', 'soit prêt'
]);

/**
 * NEW: Validate semantic context to prevent over-aggressive detection
 * Reduces confidence for neutral temporal contexts that should use expletive "ne"
 * @param {string} sentence - The full sentence
 * @param {string} verb - The detected verb
 * @param {object} semanticContext - The detected semantic context
 * @returns {object} - Validated semantic context with adjusted confidence
 */
function validateSemanticContext(sentence, verb, semanticContext) {
  if (!semanticContext) return null;
  
  const lowerSentence = sentence.toLowerCase();
  let confidenceReduction = 1.0;
  let validationReasons = [];
  
  console.log('🔍 Validating semantic context:', {
    originalType: semanticContext.type,
    originalConfidence: semanticContext.confidence,
    verb: verb
  });
  
  // Check for neutral temporal indicators
  for (const indicator of NEUTRAL_TEMPORAL_INDICATORS) {
    if (lowerSentence.includes(indicator)) {
      confidenceReduction *= 0.6; // Reduce confidence by 40%
      validationReasons.push(`neutral temporal indicator: "${indicator}"`);
      console.log('🔍 Neutral temporal indicator found:', indicator);
    }
  }
  
  // Check for neutral process contexts
  for (const context of NEUTRAL_PROCESS_CONTEXTS) {
    if (lowerSentence.includes(context)) {
      confidenceReduction *= 0.5; // Reduce confidence by 50%
      validationReasons.push(`neutral process context: "${context}"`);
      console.log('🔍 Neutral process context found:', context);
    }
  }
  
  // Special validation for past participles in neutral contexts
  if (semanticContext.type === 'PREVENTION_PAST_PARTICIPLE') {
    // Check if this is actually a neutral administrative/natural process
    const NEUTRAL_PAST_PARTICIPLE_CONTEXTS = [
      'reporté pour', 'prévu pour', 'annoncé pour', 'programmé pour',
      'submergée', 'inondée', 'érodée', 'évoluée',
      'désigné officiellement', 'nommé officiellement', 'approuvé officiellement'
    ];
    
    for (const neutralContext of NEUTRAL_PAST_PARTICIPLE_CONTEXTS) {
      if (lowerSentence.includes(neutralContext)) {
        confidenceReduction *= 0.4; // Strong reduction for neutral past participles
        validationReasons.push(`neutral past participle context: "${neutralContext}"`);
        console.log('🔍 Neutral past participle context found:', neutralContext);
      }
    }
  }
  
  // Special validation for reflexive verbs in neutral contexts
  if (semanticContext.type === 'REFLEXIVE_ACTION') {
    // Check if this is neutral physical action rather than prevention
    const NEUTRAL_REFLEXIVE_CONTEXTS = [
      's\'accroche', 's\'attache', 's\'installe', 's\'assoit',
      'se place', 'se positionne', 'se dirige', 'se rend'
    ];
    
    if (NEUTRAL_REFLEXIVE_CONTEXTS.some(context => lowerSentence.includes(context))) {
      confidenceReduction *= 0.5; // Reduce for neutral reflexive actions
      validationReasons.push('neutral reflexive action context');
      console.log('🔍 Neutral reflexive action context found');
    }
  }
  
  // Calculate adjusted confidence
  const adjustedConfidence = semanticContext.confidence * confidenceReduction;
  
  // Create validated context
  const validatedContext = {
    ...semanticContext,
    confidence: adjustedConfidence,
    reasoning: validationReasons.length > 0 
      ? `${semanticContext.reasoning} (confidence reduced due to: ${validationReasons.join(', ')})`
      : semanticContext.reasoning,
    validationApplied: validationReasons.length > 0,
    originalConfidence: semanticContext.confidence,
    confidenceReduction: confidenceReduction
  };
  
  console.log('🔍 Context validation result:', {
    originalConfidence: semanticContext.confidence,
    adjustedConfidence: adjustedConfidence,
    confidenceReduction: confidenceReduction,
    validationReasons: validationReasons,
    willOverride: adjustedConfidence >= 0.75
  });
  
  return validatedContext;
}

/**
 * Comprehensive semantic context analysis (Phase 1 + Phase 2 + Validation)
 * @param {string} sentence - The full sentence
 * @param {string} verb - The detected verb
 * @returns {object|null} - Semantic context analysis or null
 */
function analyzeSemanticContext(sentence, verb) {
  console.log('🔍 Semantic context analysis (Phase 1 + 2 + Validation):', {
    sentence: sentence.substring(0, 50) + '...',
    verb: verb
  });
  
  let semanticContext = null;
  let lastValidatedContext = null; // Track the last validated context
  
  // PHASE 1: Check for prevention verb
  semanticContext = detectPreventionVerb(verb);
  if (semanticContext) {
    console.log('🎯 Phase 1 - Prevention verb detected:', semanticContext);
    // Apply validation
    semanticContext = validateSemanticContext(sentence, verb, semanticContext);
    if (semanticContext) {
      lastValidatedContext = semanticContext; // Store validated context
      if (semanticContext.confidence >= 0.75) {
        return semanticContext;
      } else {
        console.log('🔍 Prevention verb confidence reduced below threshold after validation');
      }
    }
  }
  
  // PHASE 2: Check for past participle forms
  semanticContext = detectPreventionPastParticiple(verb);
  if (semanticContext) {
    console.log('🎯 Phase 2 - Prevention past participle detected:', semanticContext);
    // Apply validation
    semanticContext = validateSemanticContext(sentence, verb, semanticContext);
    if (semanticContext) {
      lastValidatedContext = semanticContext; // Store validated context
      if (semanticContext.confidence >= 0.75) {
        return semanticContext;
      } else {
        console.log('🔍 Past participle confidence reduced below threshold after validation');
      }
    }
  }
  
  // PHASE 2: Check for capability adjectives
  semanticContext = detectCapabilityAdjective(verb);
  if (semanticContext) {
    console.log('🎯 Phase 2 - Capability adjective detected:', semanticContext);
    // Apply validation
    semanticContext = validateSemanticContext(sentence, verb, semanticContext);
    if (semanticContext) {
      lastValidatedContext = semanticContext; // Store validated context
      if (semanticContext.confidence >= 0.75) {
        return semanticContext;
      } else {
        console.log('🔍 Capability adjective confidence reduced below threshold after validation');
      }
    }
  }
  
  // PHASE 2: Check for completion verbs
  semanticContext = detectCompletionVerb(verb);
  if (semanticContext) {
    console.log('🎯 Phase 2 - Completion verb detected:', semanticContext);
    // Apply validation
    semanticContext = validateSemanticContext(sentence, verb, semanticContext);
    if (semanticContext) {
      lastValidatedContext = semanticContext; // Store validated context
      if (semanticContext.confidence >= 0.75) {
        return semanticContext;
      } else {
        console.log('🔍 Completion verb confidence reduced below threshold after validation');
      }
    }
  }
  
  // PHASE 2: Check for reflexive action verbs
  semanticContext = detectReflexiveActionVerb(verb);
  if (semanticContext) {
    console.log('🎯 Phase 2 - Reflexive action verb detected:', semanticContext);
    // Apply validation
    semanticContext = validateSemanticContext(sentence, verb, semanticContext);
    if (semanticContext) {
      lastValidatedContext = semanticContext; // Store validated context
      if (semanticContext.confidence >= 0.75) {
        return semanticContext;
      } else {
        console.log('🔍 Reflexive action verb confidence reduced below threshold after validation');
      }
    }
  }
  
  // PHASE 2: Check for contextual verb analysis
  semanticContext = analyzeVerbInContext(sentence, verb);
  if (semanticContext) {
    console.log('🎯 Phase 2 - Contextual analysis detected:', semanticContext);
    // Apply validation
    semanticContext = validateSemanticContext(sentence, verb, semanticContext);
    if (semanticContext) {
      lastValidatedContext = semanticContext; // Store validated context
      if (semanticContext.confidence >= 0.75) {
        return semanticContext;
      } else {
        console.log('🔍 Contextual analysis confidence reduced below threshold after validation');
      }
    }
  }
  
  // PHASE 2: Check for logical negation phrase patterns
  semanticContext = detectLogicalNegationPhrases(sentence);
  if (semanticContext) {
    console.log('🎯 Phase 2 - Logical negation phrase detected:', semanticContext);
    // Apply validation
    semanticContext = validateSemanticContext(sentence, verb, semanticContext);
    if (semanticContext) {
      lastValidatedContext = semanticContext; // Store validated context
      if (semanticContext.confidence >= 0.75) {
        return semanticContext;
      } else {
        console.log('🔍 Phrase pattern confidence reduced below threshold after validation');
      }
    }
  }
  
  // PHASE 1: Check for adversarial context
  semanticContext = detectAdversarialContext(sentence);
  if (semanticContext) {
    console.log('🎯 Phase 1 - Adversarial context detected:', semanticContext);
    // Apply validation
    semanticContext = validateSemanticContext(sentence, verb, semanticContext);
    if (semanticContext) {
      lastValidatedContext = semanticContext; // Store validated context
      if (semanticContext.confidence >= 0.75) {
        return semanticContext;
      } else {
        console.log('🔍 Adversarial context confidence reduced below threshold after validation');
      }
    }
  }
  
  console.log('🔍 No semantic context override detected (after validation)');
  
  // CRITICAL FIX: Return the last validated context instead of null
  // This allows the training analyzer to detect that validation was applied
  if (lastValidatedContext) {
    console.log('🔍 Returning validated context for potential semantic boost:', {
      type: lastValidatedContext.type,
      confidence: lastValidatedContext.confidence,
      validationApplied: lastValidatedContext.validationApplied
    });
    return lastValidatedContext;
  }
  
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
  detectReflexiveActionVerb,
  detectLogicalNegationPhrases,
  analyzeVerbInContext,
  PREVENTION_VERBS,
  ADVERSARIAL_CONTEXTS,
  // NEW PHASE 2 CONSTANTS
  PREVENTION_PAST_PARTICIPLES,
  CAPABILITY_ADJECTIVES,
  COMPLETION_VERBS,
  REFLEXIVE_ACTION_VERBS,
  LOGICAL_NEGATION_PHRASES
};
