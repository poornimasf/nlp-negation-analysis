/**
 * Unified Subjunctive Detection System
 * Consolidates all subjunctive detection logic into a single, authoritative system
 * Preserves all existing functionality while eliminating conflicts
 */

// High-priority subjunctive patterns (most reliable)
const HIGH_PRIORITY_PATTERNS = {
  ETRE: /\b(sois|soit|soyons|soyez|soient)\b/g,
  AVOIR: /\b(aie|aies|ait|ayons|ayez|aient)\b/g,
  FAIRE: /\b(fasse|fasses|fasse|fassions|fassiez|fassent)\b/g,
  ALLER: /\b(aille|ailles|aille|allions|alliez|aillent)\b/g,
  POUVOIR: /\b(puisse|puisses|puisse|puissions|puissiez|puissent)\b/g,
  VOULOIR: /\b(veuille|veuilles|veuille|voulions|vouliez|veuillent)\b/g,
  SAVOIR: /\b(sache|saches|sache|sachions|sachiez|sachent)\b/g,
  VENIR: /\b(vienne|viennes|vienne|venions|veniez|viennent)\b/g
};

// Regular subjunctive patterns for common verb endings
const REGULAR_PATTERNS = {
  ER_VERBS: /\b\w+(e|es|e|ions|iez|ent)\b/g,
  IR_VERBS: /\b\w+(isse|isses|isse|issions|issiez|issent)\b/g,
  RE_VERBS: /\b\w+(e|es|e|ions|iez|ent)\b/g
};

// Words that are NOT subjunctives (to prevent false positives)
const NON_SUBJUNCTIVE_WORDS = new Set([
  'que', 'le', 'la', 'les', 'de', 'du', 'des', 'un', 'une',
  'ce', 'cette', 'ces', 'mon', 'ma', 'mes', 'ton', 'ta', 'tes',
  'son', 'sa', 'ses', 'notre', 'nos', 'votre', 'vos', 'leur', 'leurs',
  'je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'elles',
  'marie', 'julie', 'pierre', 'jean', 'paul', 'anne', // Common names
  'guerre', 'terre', 'mere', 'pere', 'frere', 'soeur' // Common nouns
]);

/**
 * Main subjunctive detection function
 * @param {string} text - Text to analyze
 * @param {Object} context - Optional context information
 * @returns {Object} Detection result
 */
export function detectSubjunctive(text, context = {}) {
  if (!text || typeof text !== 'string') {
    return { found: false, confidence: 0 };
  }

  const normalizedText = text.toLowerCase().trim();
  
  // Priority 1: High-confidence irregular verbs
  for (const [type, pattern] of Object.entries(HIGH_PRIORITY_PATTERNS)) {
    const matches = normalizedText.match(pattern);
    if (matches) {
      for (const match of matches) {
        if (!NON_SUBJUNCTIVE_WORDS.has(match)) {
          return {
            found: true,
            verb: match,
            type: type,
            confidence: 0.95,
            reasoning: `High-priority ${type} subjunctive detected: "${match}"`
          };
        }
      }
    }
  }

  // Priority 2: Regular patterns with validation
  for (const [type, pattern] of Object.entries(REGULAR_PATTERNS)) {
    const matches = normalizedText.match(pattern);
    if (matches) {
      for (const match of matches) {
        if (!NON_SUBJUNCTIVE_WORDS.has(match) && isLikelyVerb(match, normalizedText)) {
          return {
            found: true,
            verb: match,
            type: type,
            confidence: 0.75,
            reasoning: `Regular ${type} subjunctive pattern detected: "${match}"`
          };
        }
      }
    }
  }

  return { found: false, confidence: 0 };
}

/**
 * Context-aware subjunctive detection for specific triggers
 * @param {string} text - Text to analyze
 * @param {Object} triggerInfo - Information about the trigger phrase
 * @returns {Object} Detection result
 */
export function detectSubjunctiveWithContext(text, triggerInfo) {
  if (!triggerInfo || !triggerInfo.trigger) {
    return detectSubjunctive(text);
  }

  // For "avant que" contexts, focus on text after the trigger
  if (triggerInfo.trigger.includes('avant que')) {
    const afterTrigger = extractTextAfterTrigger(text, triggerInfo);
    if (afterTrigger) {
      return detectSubjunctive(afterTrigger, { trigger: triggerInfo.trigger });
    }
  }

  return detectSubjunctive(text, { trigger: triggerInfo.trigger });
}

/**
 * Helper function to determine if a word is likely a verb
 * @param {string} word - Word to check
 * @param {string} context - Full text context
 * @returns {boolean} Whether the word is likely a verb
 */
function isLikelyVerb(word, context) {
  // Skip very short words
  if (word.length < 3) return false;
  
  // Skip if it's in our non-subjunctive list
  if (NON_SUBJUNCTIVE_WORDS.has(word)) return false;
  
  // Skip if it appears to be a noun (preceded by articles)
  const wordPattern = new RegExp(`\\b(le|la|les|un|une|du|des)\\s+${word}\\b`, 'i');
  if (wordPattern.test(context)) return false;
  
  // Skip if it's likely a proper noun (capitalized in original)
  if (/^[A-Z]/.test(word)) return false;
  
  return true;
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
  
  const afterTrigger = text.slice(triggerIndex + triggerInfo.trigger.length).trim();
  
  // Look for "qu'" or "que" and extract what follows
  const queMatch = afterTrigger.match(/qu['']?\s*(.+)/i);
  return queMatch ? queMatch[1].trim() : afterTrigger;
}

/**
 * Legacy compatibility function for existing code
 * @param {string} clause - Text to analyze
 * @param {Object} triggerInfo - Trigger information
 * @returns {Object} Detection result in legacy format
 */
export function detectSubjunctiveInClause(clause, triggerInfo) {
  const result = detectSubjunctiveWithContext(clause, triggerInfo);
  
  // Convert to legacy format if needed
  return {
    hasSubjunctive: result.found,
    verb: result.verb || null,
    confidence: result.confidence || 0,
    type: result.type || 'unknown',
    reasoning: result.reasoning || 'No subjunctive detected'
  };
}

export default {
  detectSubjunctive,
  detectSubjunctiveWithContext,
  detectSubjunctiveInClause
};
