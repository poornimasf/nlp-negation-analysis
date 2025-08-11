/**
 * Precision Enhancement Module
 * Surgical fixes for specific misclassification patterns identified in user testing
 * Integrates with both Training Data Analysis and Rule-Based modes
 */

/**
 * COMPLETION/ACHIEVEMENT CONTEXT PATTERNS
 * These should be classified as "No Expletive" (logical negation)
 */
const COMPLETION_PATTERNS = {
  // Administrative/Process completion
  ADMINISTRATIVE_COMPLETION: {
    patterns: [
      /soit\s+(?:opérationnel|opérationnelle|opérationnels|opérationnelles)/i,
      /soit\s+(?:validé|validée|validés|validées)/i,
      /soit\s+(?:approuvé|approuvée|approuvés|approuvées)/i,
      /soit\s+(?:accordé|accordée|accordés|accordées)/i,
      /soit\s+(?:publié|publiée|publiés|publiées)/i,
      /soit\s+(?:mis|mise|mises)\s+en\s+place/i,
      /soit\s+(?:réalisé|réalisée|réalisés|réalisées)/i,
      /soit\s+(?:terminé|terminée|terminés|terminées)/i,
      /soit\s+(?:fini|finie|finis|finies)/i,
      /soit\s+(?:résolu|résolue|résolus|résolues)/i,
      /soit\s+(?:corrigé|corrigée|corrigés|corrigées)/i,
      /soit\s+(?:modifié|modifiée|modifiés|modifiées)/i,
      /soit\s+(?:ajusté|ajustée|ajustés|ajustées)/i,
      /soit\s+(?:remplacé|remplacée|remplacés|remplacées)/i,
      /soit\s+(?:transféré|transférée|transférés|transférées)/i,
      /soit\s+(?:envoyé|envoyée|envoyés|envoyées)/i,
      /soit\s+(?:informé|informée|informés|informées)/i,
      /soit\s+(?:chargé|chargée|chargés|chargées)/i
    ],
    confidence: 0.90,
    reasoning: 'Administrative/process completion context indicates logical negation'
  },

  // Physical action completion
  PHYSICAL_COMPLETION: {
    patterns: [
      /se\s+remette?\s+(?:sur\s+pieds?|debout|en\s+route)/i,
      /s'empare(?:nt)?\s+(?:de|du|des)/i,
      /s'accroche(?:nt)?\s+(?:à|au|aux)/i,
      /se\s+réunisse(?:nt)?/i,
      /se\s+distingue(?:nt)?/i,
      /se\s+rende(?:nt)?\s+(?:à|au|aux|chez)/i,
      /arrive(?:nt)?\s+(?:à|au|aux)\s+(?:destination|terme)/i,
      /atteigne(?:nt)?\s+(?:le|la|les|un|une|des)/i,
      /parvienne(?:nt)?\s+(?:à|au|aux)/i,
      /réussisse(?:nt)?\s+(?:à|au|aux)/i
    ],
    confidence: 0.85,
    reasoning: 'Physical completion/achievement context indicates logical negation'
  },

  // System/Process states
  SYSTEM_STATES: {
    patterns: [
      /(?:système|machine|processus|programme|projet)\s+soit\s+(?:opérationnel|prêt|terminé|fini)/i,
      /(?:frontières?|borders?)\s+(?:soient?|soit)\s+(?:ouvertes?|rouvertes?)/i,
      /(?:objectif|but|résultat)\s+(?:soit|se)\s+(?:réalisé|atteint|accompli)/i,
      /(?:problème|issue|difficulté)\s+soit\s+(?:résolu|réglé|corrigé)/i,
      /(?:travaux|construction|développement)\s+(?:soient?|soit)\s+(?:terminés?|finis?|achevés?)/i,
      /(?:modification|changement|ajustement)\s+(?:soit|permette)/i
    ],
    confidence: 0.88,
    reasoning: 'System/process state completion indicates logical negation'
  }
};

/**
 * NEUTRAL TEMPORAL SEQUENCE PATTERNS  
 * These should be classified as "Expletive" (neutral temporal progression)
 */
const NEUTRAL_TEMPORAL_PATTERNS = {
  // Natural temporal sequences
  TEMPORAL_SEQUENCE: {
    patterns: [
      /soit\s+(?:trop\s+tard|tard)/i,
      /se\s+décide(?:nt)?\s+à/i,
      /(?:rideau|spectacle)\s+soit\s+(?:levé|commencé)/i,
      /se\s+(?:déclenchent?|déclenche)/i,
      /(?:causent?|cause)\s+des\s+problèmes/i,
      /soit\s+(?:connu|connue|connus|connues)/i,
      /se\s+(?:réveille(?:nt)?|lève(?:nt)?)/i,
      /(?:commence(?:nt)?|débute(?:nt)?)/i,
      /(?:finisse(?:nt)?|termine(?:nt)?)\s+(?:de|le|la|les)/i
    ],
    confidence: 0.80,
    reasoning: 'Neutral temporal sequence context indicates expletive negation'
  },

  // Concern/prevention contexts (classic expletive)
  CONCERN_PREVENTION: {
    patterns: [
      /soit\s+trop\s+tard/i,
      /(?:causent?|provoquent?)\s+(?:des\s+)?(?:problèmes?|difficultés?|ennuis?)/i,
      /(?:blessent?|blessé|blessée)/i,
      /(?:disparaisse(?:nt)?|s'en\s+aille(?:nt)?)/i,
      /soit\s+(?:perdu|perdue|perdus|perdues)/i,
      /s'(?:échappe(?:nt)?|enfuie(?:nt)?)/i
    ],
    confidence: 0.85,
    reasoning: 'Concern/prevention context indicates expletive negation'
  }
};

/**
 * Analyze text for completion context patterns
 * @param {string} text - The sentence to analyze
 * @returns {object|null} - Analysis result or null if no patterns found
 */
export function analyzeCompletionContext(text) {
  const normalizedText = text.toLowerCase();
  
  // Check for completion patterns (should be No Expletive)
  for (const [categoryName, category] of Object.entries(COMPLETION_PATTERNS)) {
    for (const pattern of category.patterns) {
      if (pattern.test(normalizedText)) {
        console.log('🎯 PRECISION ENHANCEMENT: Completion context detected:', {
          category: categoryName,
          pattern: pattern.source,
          confidence: category.confidence
        });
        
        return {
          type: 'COMPLETION_CONTEXT',
          category: categoryName,
          shouldBeNoExpletive: true,
          confidence: category.confidence,
          reasoning: category.reasoning,
          pattern: pattern.source,
          enhancement: 'precision_completion_detection'
        };
      }
    }
  }
  
  return null;
}

/**
 * Analyze text for neutral temporal sequence patterns
 * @param {string} text - The sentence to analyze  
 * @returns {object|null} - Analysis result or null if no patterns found
 */
export function analyzeNeutralTemporalContext(text) {
  const normalizedText = text.toLowerCase();
  
  // Check for neutral temporal patterns (should be Expletive)
  for (const [categoryName, category] of Object.entries(NEUTRAL_TEMPORAL_PATTERNS)) {
    for (const pattern of category.patterns) {
      if (pattern.test(normalizedText)) {
        console.log('🎯 PRECISION ENHANCEMENT: Neutral temporal context detected:', {
          category: categoryName,
          pattern: pattern.source,
          confidence: category.confidence
        });
        
        return {
          type: 'NEUTRAL_TEMPORAL_CONTEXT',
          category: categoryName,
          shouldBeExpletive: true,
          confidence: category.confidence,
          reasoning: category.reasoning,
          pattern: pattern.source,
          enhancement: 'precision_temporal_detection'
        };
      }
    }
  }
  
  return null;
}

/**
 * Main precision enhancement function
 * Integrates with existing analysis without disrupting architecture
 * @param {string} text - The sentence to analyze
 * @returns {object|null} - Enhancement result or null
 */
export function applyPrecisionEnhancement(text) {
  console.log('🔧 PRECISION ENHANCEMENT: Analyzing for specific patterns');
  
  // Only apply to "avant que" contexts to avoid interfering with other triggers
  if (!text.toLowerCase().includes('avant que')) {
    return null;
  }
  
  // Check completion contexts first (higher priority)
  const completionContext = analyzeCompletionContext(text);
  if (completionContext) {
    return completionContext;
  }
  
  // Check neutral temporal contexts
  const temporalContext = analyzeNeutralTemporalContext(text);
  if (temporalContext) {
    return temporalContext;
  }
  
  return null;
}

/**
 * Apply precision enhancement to confidence scores
 * @param {number} expletiveScore - Current expletive score
 * @param {number} nonExpletiveScore - Current non-expletive score
 * @param {object} enhancement - Enhancement result from applyPrecisionEnhancement
 * @returns {object} - Adjusted scores
 */
export function applyPrecisionBoost(expletiveScore, nonExpletiveScore, enhancement) {
  if (!enhancement) {
    return { expletiveScore, nonExpletiveScore };
  }
  
  const boostAmount = 3.0 * enhancement.confidence; // Scale boost by confidence
  
  if (enhancement.shouldBeNoExpletive) {
    // Boost non-expletive (No Expletive classification)
    const adjustedNonExpletive = nonExpletiveScore + boostAmount;
    console.log('🎯 PRECISION BOOST: Completion context - boosting No Expletive:', {
      originalNonExpletive: nonExpletiveScore,
      boostAmount,
      adjustedNonExpletive,
      reasoning: enhancement.reasoning
    });
    return { 
      expletiveScore, 
      nonExpletiveScore: adjustedNonExpletive,
      precisionBoostApplied: true,
      boostType: 'completion_context',
      boostAmount
    };
  }
  
  if (enhancement.shouldBeExpletive) {
    // Boost expletive (Expletive classification)
    const adjustedExpletive = expletiveScore + boostAmount;
    console.log('🎯 PRECISION BOOST: Temporal context - boosting Expletive:', {
      originalExpletive: expletiveScore,
      boostAmount,
      adjustedExpletive,
      reasoning: enhancement.reasoning
    });
    return { 
      expletiveScore: adjustedExpletive, 
      nonExpletiveScore,
      precisionBoostApplied: true,
      boostType: 'temporal_context',
      boostAmount
    };
  }
  
  return { expletiveScore, nonExpletiveScore };
}
