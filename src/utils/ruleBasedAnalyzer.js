/**
 * Rule-based analyzer for French expletive negation
 */

// Trigger patterns with confidence levels
const TRIGGER_PATTERNS = {
  AVANT_QUE: {
    pattern: /\bavant\s+(?:que|qu[''])/i,
    confidence: 0.85, // Standard confidence - can be either expletive or non-expletive
    requiresSubjunctive: true,
    name: 'avant que'
  },
  PEUR_QUE: {
    pattern: /\bpeur\s+(?:que|qu[''])/i,
    confidence: 0.85,
    requiresSubjunctive: true,
    name: 'peur que'
  },
  PEU_SEN_FAUT: {
    pattern: /\bpeu\s+s['']en\s+faut/i,
    confidence: 0.80,
    requiresSubjunctive: true,
    name: 'peu s\'en faut'
  }
};

// Subjunctive verb patterns
const SUBJUNCTIVE_PATTERNS = [
  /\b(?:soit|sois|soyons|soyez|soient)\b/i,
  /\b(?:ait|aie|ayons|ayez|aient)\b/i,
  /\b(?:fasse|fasses|fassions|fassiez|fassent)\b/i,
  /\b(?:aille|ailles|allions|alliez|aillent)\b/i,
  /\b(?:vienne|viennes|venions|veniez|viennent)\b/i,
  /\b(?:puisse|puisses|puissions|puissiez|puissent)\b/i,
  // Add more subjunctive forms as needed
];

/**
 * Check for complement clause after trigger
 * @param {string} text - Full text
 * @param {string} trigger - Trigger phrase found
 * @returns {Object} - Clause analysis result
 */
const analyzeComplementClause = (text, trigger) => {
  const triggerIndex = text.toLowerCase().indexOf(trigger.toLowerCase());
  if (triggerIndex === -1) return null;

  const afterTrigger = text.slice(triggerIndex + trigger.length).trim();
  const hasClause = /\b\w+\b.*\b\w+\b/i.test(afterTrigger); // At least two words
  const hasSubjunctive = SUBJUNCTIVE_PATTERNS.some(pattern => pattern.test(afterTrigger));

  return {
    hasClause,
    hasSubjunctive,
    clause: afterTrigger,
    position: triggerIndex + trigger.length
  };
};

/**
 * Find verb in complement clause
 * @param {string} clause - The complement clause text
 * @returns {Object|null} - Verb information if found
 */
const findVerb = (clause) => {
  for (const pattern of SUBJUNCTIVE_PATTERNS) {
    const match = clause.match(pattern);
    if (match) {
      return {
        verb: match[0],
        position: match.index,
        isSubjunctive: true
      };
    }
  }
  return null;
};

/**
 * Analyze text for expletive negation using rule-based approach
 * @param {string} text - Text to analyze
 * @returns {Object} - Analysis result
 */
export const analyzeText = (text) => {
  // Check all triggers with equal priority
  for (const [key, config] of Object.entries(TRIGGER_PATTERNS)) {
    const match = text.match(config.pattern);
    if (match) {
      const clauseAnalysis = analyzeComplementClause(text, config.name);
      if (clauseAnalysis?.hasClause) {
        const verbInfo = findVerb(clauseAnalysis.clause);
        
        // Base confidence on presence of subjunctive, not on trigger type
        const confidence = clauseAnalysis.hasSubjunctive ? config.confidence : config.confidence * 0.8;

        return {
          type: 'Expletive',
          confidence,
          evidence: {
            trigger: config.name,
            hasSubjunctive: clauseAnalysis.hasSubjunctive,
            details: `Found "${config.name}" with ${clauseAnalysis.hasSubjunctive ? 'subjunctive' : ''} complement clause`,
            verbInfo,
            clausePosition: clauseAnalysis.position,
            recommendNe: clauseAnalysis.hasSubjunctive,
            nePosition: verbInfo ? clauseAnalysis.position + verbInfo.position : null
          }
        };
      }
    }
  }

  return {
    type: 'No Expletive',
    confidence: 0.90,
    evidence: {
      details: 'No valid trigger patterns found',
      recommendNe: false
    }
  };
};
