/**
 * Conservative Part-of-Speech Analyzer for French
 * Phase 1: Focus on obvious, unambiguous nouns to prevent false positives
 */

// Conservative list of French nouns that are never verbs
const SAFE_FRENCH_NOUNS = new Set([
  // Natural elements (never verbs)
  'vent',      // wind
  'eau',       // water
  'feu',       // fire
  'air',       // air
  'terre',     // earth
  'ciel',      // sky
  'soleil',    // sun
  'lune',      // moon
  'mer',       // sea
  'montagne',  // mountain
  'forêt',     // forest
  'rivière',   // river
  
  // Time/weather (never verbs)
  'temps',     // time/weather (note: not the verb "temps" which doesn't exist)
  'heure',     // hour
  'minute',    // minute
  'seconde',   // second
  'matin',     // morning
  'soir',      // evening
  'nuit',      // night
  'pluie',     // rain
  'neige',     // snow
  
  // Abstract concepts (never verbs)
  'monde',     // world
  'vie',       // life
  'mort',      // death
  'amour',     // love
  'paix',      // peace
  'guerre',    // war
  'liberté',   // freedom
  'vérité',    // truth
  
  // Objects (never verbs)
  'maison',    // house
  'voiture',   // car
  'livre',     // book
  'table',     // table
  'chaise',    // chair
  'fenêtre',   // window
  'porte',     // door
  
  // People (never verbs)
  'homme',     // man
  'femme',     // woman
  'enfant',    // child
  'père',      // father
  'mère',      // mother
  'ami',       // friend
  'famille',   // family
  
  // NEW: Medical/technical terms from false negatives
  'symptômes', // symptoms
  'patients',  // patients
  'mesures',   // measures
  'résultats', // results
  'chiffres',  // numbers/figures
  'fruits',    // fruits
  'avis',      // opinions/reviews
  'demoiselle',// young lady
  'situation', // situation
  'zones',     // zones
  'cas',       // cases
  'informations', // information
  'questions', // questions
  'études',    // studies
  'changements', // changes
  
  // NEW: Common adjectives that might be misidentified
  'évidents',  // obvious (plural adjective, never verb)
  'utilisables', // usable (plural adjective, never verb)
  'importantes', // important (plural adjective, never verb)
  'nombreuses', // numerous (plural adjective, never verb)
  'tardive',   // late (adjective, never verb)
  'blessée',   // injured (past participle used as adjective)
  'submergée', // submerged (past participle used as adjective)
  'révisés'    // revised (past participle used as adjective)
]);

/**
 * Check if a word is definitely a noun based on conservative criteria
 * @param {string} word - The word to analyze
 * @param {string} context - The surrounding context
 * @returns {boolean} - True if definitely a noun, false otherwise
 */
function isDefinitelyNoun(word, context) {
  const normalizedWord = word.toLowerCase();
  
  // Must be in our safe noun list
  const isKnownNoun = SAFE_FRENCH_NOUNS.has(normalizedWord);
  if (!isKnownNoun) {
    return false;
  }
  
  // Check for definite article pattern: "le/la/les + word"
  const wordIndex = context.toLowerCase().indexOf(normalizedWord);
  if (wordIndex === -1) {
    return false;
  }
  
  const beforeWord = context.substring(0, wordIndex).toLowerCase();
  const hasDefiniteArticle = /\b(?:le|la|les)\s+$/.test(beforeWord);
  
  // Both conditions must be true for conservative approach
  return hasDefiniteArticle;
}

/**
 * Check if a word is likely a noun with additional context clues
 * @param {string} word - The word to analyze
 * @param {string} context - The surrounding context
 * @returns {object} - Analysis result with confidence and reasoning
 */
function analyzeWordPOS(word, context) {
  const normalizedWord = word.toLowerCase();
  
  // Check if it's definitely a noun
  const isNoun = isDefinitelyNoun(word, context);
  
  if (isNoun) {
    return {
      pos: 'Noun',
      confidence: 0.95,
      reasoning: `"${word}" is a known noun preceded by definite article`,
      shouldSkipVerbAnalysis: true
    };
  }
  
  // Check if it's in our noun list but without article (lower confidence)
  if (SAFE_FRENCH_NOUNS.has(normalizedWord)) {
    return {
      pos: 'PossibleNoun',
      confidence: 0.70,
      reasoning: `"${word}" is a known noun but context unclear`,
      shouldSkipVerbAnalysis: false // Don't skip without article confirmation
    };
  }
  
  // Default: assume it could be a verb
  return {
    pos: 'Unknown',
    confidence: 0.50,
    reasoning: `"${word}" not in known noun list, treating as potential verb`,
    shouldSkipVerbAnalysis: false
  };
}

/**
 * Enhanced POS analysis with debugging
 * @param {string} word - The word to analyze
 * @param {string} context - The surrounding context
 * @returns {object} - Detailed analysis result
 */
function enhancedPOSAnalysis(word, context) {
  const analysis = analyzeWordPOS(word, context);
  
  console.log('🔍 POS Analysis:', {
    word: word,
    analysis: analysis,
    contextSnippet: context.substring(Math.max(0, context.indexOf(word) - 20), context.indexOf(word) + word.length + 20)
  });
  
  return analysis;
}

export {
  isDefinitelyNoun,
  analyzeWordPOS,
  enhancedPOSAnalysis,
  SAFE_FRENCH_NOUNS
};
