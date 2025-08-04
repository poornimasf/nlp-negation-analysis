/**
 * Rule-based analyzer focused on avant que/avant qu' expletive negation
 */

// Avant que pattern with variations
const AVANT_QUE_PATTERN = {
  pattern: /\b(?:avant\s+(?:que|qu['']))\b/i,
  name: 'avant que'
};

// Common subjunctive verbs after avant que
const SUBJUNCTIVE_PATTERNS = [
  // être
  /\b(?:sois|soit|soyons|soyez|soient)\b/i,
  // avoir
  /\b(?:aie|ait|ayons|ayez|aient)\b/i,
  // faire
  /\b(?:fasse|fasses|fassions|fassiez|fassent)\b/i,
  // aller
  /\b(?:aille|ailles|allions|alliez|aillent)\b/i,
  // venir
  /\b(?:vienne|viennes|venions|veniez|viennent)\b/i,
  // pouvoir
  /\b(?:puisse|puisses|puissions|puissiez|puissent)\b/i,
  // devoir
  /\b(?:doive|doives|devions|deviez|doivent)\b/i,
  // savoir
  /\b(?:sache|saches|sachions|sachiez|sachent)\b/i,
  // prendre
  /\b(?:prenne|prennes|prenions|preniez|prennent)\b/i,
  // mettre
  /\b(?:mette|mettes|mettions|mettiez|mettent)\b/i,
  // dire
  /\b(?:dise|dises|disions|disiez|disent)\b/i,
  // voir
  /\b(?:voie|voies|voyions|voyiez|voient)\b/i,
  // finir
  /\b(?:finisse|finisses|finissions|finissiez|finissent)\b/i,
  // partir
  /\b(?:parte|partes|partions|partiez|partent)\b/i
];

// Main clause tense patterns (for temporal context)
const MAIN_CLAUSE_TENSES = {
  PRESENT: /\b(?:suis|es|est|sommes|êtes|sont|ai|as|a|avons|avez|ont|fais|fait|faisons|faites|font)\b/i,
  FUTURE: /\b(?:serai|seras|sera|serons|serez|seront|aurai|auras|aura|aurons|aurez|auront)\b/i,
  PAST: /\b(?:étais|était|étions|étiez|étaient|avais|avait|avions|aviez|avaient)\b/i,
  CONDITIONAL: /\b(?:serais|serait|serions|seriez|seraient|aurais|aurait|aurions|auriez|auraient)\b/i
};

/**
 * Analyze main clause structure and tense
 * @param {string} text - Full text before avant que
 * @returns {Object} - Main clause analysis
 */
const analyzeMainClause = (text) => {
  const tenses = Object.entries(MAIN_CLAUSE_TENSES).reduce((acc, [tense, pattern]) => {
    acc[tense] = pattern.test(text);
    return acc;
  }, {});

  return {
    hasTense: Object.values(tenses).some(Boolean),
    tenses,
    isComplete: /\b\w+\b.*\b\w+\b/i.test(text) // Basic check for at least two words
  };
};

/**
 * Analyze complement clause structure
 * @param {string} text - Text after avant que
 * @returns {Object} - Complement clause analysis
 */
const analyzeComplementClause = (text) => {
  // Find subjunctive verb
  let verbInfo = null;
  for (const pattern of SUBJUNCTIVE_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      verbInfo = {
        verb: match[0],
        position: match.index,
        pattern: pattern.toString()
      };
      break;
    }
  }

  // Check for subject-verb structure
  const hasSubjectVerb = /\b(?:\w+\s+){0,2}\w+\b.*\b\w+\b/i.test(text);

  return {
    hasSubjunctive: verbInfo !== null,
    verbInfo,
    hasSubjectVerb,
    text: text.trim()
  };
};

/**
 * Check if the temporal context suggests prevention/anticipation
 * @param {Object} mainClause - Main clause analysis
 * @param {Object} complementClause - Complement clause analysis
 * @returns {boolean} - Whether context suggests prevention
 */
const hasPreventiveContext = (mainClause, complementClause) => {
  // Future or present in main clause often indicates prevention
  const hasFutureContext = mainClause.tenses.FUTURE || mainClause.tenses.PRESENT;
  // Past in complement with future in main also suggests prevention
  const hasTemporalContrast = mainClause.tenses.FUTURE && complementClause.hasSubjunctive;
  
  return hasFutureContext || hasTemporalContrast;
};

/**
 * Analyze text for avant que expletive negation
 * @param {string} text - Text to analyze
 * @returns {Object} - Analysis result
 */
export const analyzeText = (text) => {
  const match = text.match(AVANT_QUE_PATTERN.pattern);
  if (!match) {
    return {
      type: 'No Expletive',
      confidence: 0.90,
      evidence: {
        details: 'No avant que/avant qu\' found',
        recommendNe: false
      }
    };
  }

  // Split text at avant que
  const triggerIndex = match.index;
  const beforeTrigger = text.slice(0, triggerIndex).trim();
  const afterTrigger = text.slice(triggerIndex + match[0].length).trim();

  // Analyze both clauses
  const mainClause = analyzeMainClause(beforeTrigger);
  const complementClause = analyzeComplementClause(afterTrigger);

  // Calculate confidence and determine type
  let confidence = 0.5; // Base confidence
  let evidencePoints = [];

  // Add confidence based on structural evidence
  if (mainClause.isComplete) {
    confidence += 0.1;
    evidencePoints.push('Complete main clause');
  }
  if (complementClause.hasSubjunctive) {
    confidence += 0.2;
    evidencePoints.push('Subjunctive in complement clause');
  }
  if (complementClause.hasSubjectVerb) {
    confidence += 0.1;
    evidencePoints.push('Subject-verb structure in complement');
  }
  if (hasPreventiveContext(mainClause, complementClause)) {
    confidence += 0.1;
    evidencePoints.push('Preventive/anticipatory context');
  }

  // Determine position for ne if needed
  let nePosition = null;
  if (complementClause.verbInfo) {
    // Calculate word position for ne placement
    const words = afterTrigger.split(/\s+/);
    const verbWordIndex = words.findIndex(word => 
      word.toLowerCase() === complementClause.verbInfo.verb.toLowerCase()
    );
    if (verbWordIndex !== -1) {
      nePosition = verbWordIndex;
    }
  }

  return {
    type: 'Expletive',
    confidence: Math.min(confidence, 0.95),
    evidence: {
      trigger: AVANT_QUE_PATTERN.name,
      hasSubjunctive: complementClause.hasSubjunctive,
      details: evidencePoints.join('; '),
      mainClause: {
        text: beforeTrigger,
        ...mainClause
      },
      complementClause: {
        text: afterTrigger,
        ...complementClause
      },
      nePosition,
      verbInfo: complementClause.verbInfo
    }
  };
};
