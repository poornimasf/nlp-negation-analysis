/**
 * Enhanced analysis for "avant que" constructions
 * Considers complement clauses and subjunctive mood for expletive negation prediction
 */

import { normalizeText } from './textProcessing';

// Subjunctive verb patterns with comprehensive coverage
const SUBJUNCTIVE_PATTERNS = {
  // High-priority irregular verbs (most common in avant que contexts)
  ETRE: {
    pattern: /\b(?:sois|soit|soyons|soyez|soient)\b/i,
    priority: 3,
    examples: ['soit', 'sois', 'soient']
  },
  AVOIR: {
    pattern: /\b(?:aie|aies|ait|ayons|ayez|aient)\b/i,
    priority: 3,
    examples: ['ait', 'aie', 'aient']
  },
  FAIRE: {
    pattern: /\b(?:fasse|fasses|fassions|fassiez|fassent)\b/i,
    priority: 3,
    examples: ['fasse', 'fassent']
  },
  ALLER: {
    pattern: /\b(?:aille|ailles|aillions|ailliez|aillent)\b/i,
    priority: 3,
    examples: ['aille', 'aillent']
  },
  VENIR: {
    pattern: /\b(?:vienne|viennes|venions|veniez|viennent)\b/i,
    priority: 3,
    examples: ['vienne', 'viennent']
  },
  PARTIR: {
    pattern: /\b(?:parte|partes|partions|partiez|partent)\b/i,
    priority: 3,
    examples: ['parte', 'partent']
  },
  ARRIVER: {
    pattern: /\b(?:arrive|arrives|arrivions|arriviez|arrivent)\b/i,
    priority: 2,
    examples: ['arrive', 'arrivent']
  },
  FINIR: {
    pattern: /\b(?:finisse|finisses|finissions|finissiez|finissent)\b/i,
    priority: 2,
    examples: ['finisse', 'finissent']
  },
  POUVOIR: {
    pattern: /\b(?:puisse|puisses|puissions|puissiez|puissent)\b/i,
    priority: 2,
    examples: ['puisse', 'puissent']
  },
  VOULOIR: {
    pattern: /\b(?:veuille|veuilles|veuillions|veuilliez|veuillent)\b/i,
    priority: 2,
    examples: ['veuille', 'veuillent']
  },
  
  // Regular verb patterns (lower priority but still important)
  ER_VERBS: {
    pattern: /\b\w+(?:e|es|ions|iez|ent)\b/i,
    priority: 1,
    examples: ['parle', 'parlent', 'mangent']
  },
  IR_VERBS: {
    pattern: /\b\w+(?:isse|isses|issions|issiez|issent)\b/i,
    priority: 1,
    examples: ['choisisse', 'réussisse']
  }
};

// Patterns to identify complement clauses (finite verb constructions)
const COMPLEMENT_CLAUSE_INDICATORS = {
  // Subject pronouns that indicate a finite clause
  SUBJECT_PRONOUNS: /\b(?:je|j'|tu|il|elle|on|nous|vous|ils|elles)\b/i,
  
  // Demonstrative and possessive pronouns as subjects
  DEMONSTRATIVE_SUBJECTS: /\b(?:ce|c'|ceci|cela|ça)\b/i,
  
  // Relative pronouns introducing subordinate clauses
  RELATIVE_PRONOUNS: /\b(?:qui|que|qu'|dont|où|lequel|laquelle|lesquels|lesquelles)\b/i,
  
  // Finite verb indicators (auxiliary verbs, modals)
  FINITE_VERBS: /\b(?:est|sont|a|ont|va|vont|peut|peuvent|doit|doivent|fait|font)\b/i
};

// Patterns that suggest non-complement constructions (infinitive, nominal)
const NON_COMPLEMENT_PATTERNS = {
  // Infinitive markers
  INFINITIVE_MARKERS: /\b(?:de|d')\s+\w+(?:er|ir|re)\b/i,
  
  // Nominal constructions
  NOMINAL_CONSTRUCTIONS: /\b(?:le|la|les|un|une|des|du|de\s+la|de\s+l')\s+\w+(?:\s+\w+)*$/i,
  
  // Prepositional phrases
  PREPOSITIONAL_PHRASES: /\b(?:avec|sans|pour|par|en|dans|sur|sous|vers|chez)\b/i
};

/**
 * Analyze the clause following "avant que" to determine if it's a complement clause
 * @param {string} text - The full sentence
 * @param {number} avantQuePosition - Position where "avant que" was found
 * @returns {Object} Analysis of the complement clause
 */
export function analyzeComplementClause(text, avantQuePosition) {
  const normalizedText = normalizeText(text.toLowerCase());
  
  // Find the position after "avant que" or "avant qu'"
  const avantQueMatch = normalizedText.slice(avantQuePosition).match(/avant\s+qu(?:e\s+|')/i);
  if (!avantQueMatch) {
    return {
      isComplementClause: false,
      confidence: 0,
      reason: 'Could not locate avant que construction'
    };
  }
  
  const afterAvantQue = normalizedText.slice(avantQuePosition + avantQueMatch[0].length);
  
  // Check for non-complement patterns first (these override complement detection)
  if (NON_COMPLEMENT_PATTERNS.INFINITIVE_MARKERS.test(afterAvantQue)) {
    return {
      isComplementClause: false,
      confidence: 0.9,
      reason: 'Infinitive construction detected',
      construction: 'infinitive'
    };
  }
  
  if (NON_COMPLEMENT_PATTERNS.NOMINAL_CONSTRUCTIONS.test(afterAvantQue)) {
    return {
      isComplementClause: false,
      confidence: 0.8,
      reason: 'Nominal construction detected',
      construction: 'nominal'
    };
  }
  
  // Look for complement clause indicators
  let complementScore = 0;
  let indicators = [];
  
  // Check for subject pronouns (strong indicator)
  if (COMPLEMENT_CLAUSE_INDICATORS.SUBJECT_PRONOUNS.test(afterAvantQue)) {
    complementScore += 3;
    const match = afterAvantQue.match(COMPLEMENT_CLAUSE_INDICATORS.SUBJECT_PRONOUNS);
    indicators.push(`Subject pronoun: "${match[0]}"`);
  }
  
  // Check for demonstrative subjects
  if (COMPLEMENT_CLAUSE_INDICATORS.DEMONSTRATIVE_SUBJECTS.test(afterAvantQue)) {
    complementScore += 2;
    const match = afterAvantQue.match(COMPLEMENT_CLAUSE_INDICATORS.DEMONSTRATIVE_SUBJECTS);
    indicators.push(`Demonstrative subject: "${match[0]}"`);
  }
  
  // Check for finite verbs
  if (COMPLEMENT_CLAUSE_INDICATORS.FINITE_VERBS.test(afterAvantQue)) {
    complementScore += 2;
    const match = afterAvantQue.match(COMPLEMENT_CLAUSE_INDICATORS.FINITE_VERBS);
    indicators.push(`Finite verb: "${match[0]}"`);
  }
  
  // Check for relative pronouns (subordinate clause)
  if (COMPLEMENT_CLAUSE_INDICATORS.RELATIVE_PRONOUNS.test(afterAvantQue)) {
    complementScore += 1;
    const match = afterAvantQue.match(COMPLEMENT_CLAUSE_INDICATORS.RELATIVE_PRONOUNS);
    indicators.push(`Relative pronoun: "${match[0]}"`);
  }
  
  const isComplementClause = complementScore >= 2;
  const confidence = Math.min(complementScore / 5, 1.0);
  
  return {
    isComplementClause,
    confidence,
    score: complementScore,
    indicators,
    reason: isComplementClause 
      ? `Complement clause detected (score: ${complementScore})` 
      : `Insufficient evidence for complement clause (score: ${complementScore})`,
    construction: isComplementClause ? 'finite_complement' : 'other'
  };
}

/**
 * Detect subjunctive mood in the clause following "avant que"
 * @param {string} text - The full sentence
 * @param {number} avantQuePosition - Position where "avant que" was found
 * @returns {Object} Subjunctive analysis
 */
export function analyzeSubjunctiveMood(text, avantQuePosition) {
  const normalizedText = normalizeText(text.toLowerCase());
  
  // Find the position after "avant que" or "avant qu'"
  const avantQueMatch = normalizedText.slice(avantQuePosition).match(/avant\s+qu(?:e\s+|')/i);
  if (!avantQueMatch) {
    return {
      hasSubjunctive: false,
      confidence: 0,
      reason: 'Could not locate avant que construction'
    };
  }
  
  const afterAvantQue = normalizedText.slice(avantQuePosition + avantQueMatch[0].length);
  
  // Look for subjunctive patterns, prioritizing high-confidence matches
  let bestMatch = null;
  let highestPriority = 0;
  
  for (const [type, pattern] of Object.entries(SUBJUNCTIVE_PATTERNS)) {
    const match = afterAvantQue.match(pattern.pattern);
    if (match && pattern.priority >= highestPriority) {
      bestMatch = {
        type,
        verb: match[0],
        priority: pattern.priority,
        examples: pattern.examples,
        position: avantQuePosition + avantQueMatch[0].length + match.index
      };
      highestPriority = pattern.priority;
    }
  }
  
  if (bestMatch) {
    // Calculate confidence based on priority and specificity
    let confidence = 0.5; // Base confidence
    
    if (bestMatch.priority === 3) {
      confidence = 0.95; // High confidence for irregular verbs
    } else if (bestMatch.priority === 2) {
      confidence = 0.85; // Good confidence for common verbs
    } else if (bestMatch.priority === 1) {
      confidence = 0.70; // Moderate confidence for regular patterns
    }
    
    return {
      hasSubjunctive: true,
      confidence,
      verbType: bestMatch.type,
      verb: bestMatch.verb,
      priority: bestMatch.priority,
      position: bestMatch.position,
      reason: `Subjunctive ${bestMatch.type} detected: "${bestMatch.verb}"`
    };
  }
  
  return {
    hasSubjunctive: false,
    confidence: 0.8, // High confidence in absence
    reason: 'No subjunctive patterns detected in complement clause'
  };
}

/**
 * Comprehensive analysis of "avant que" constructions
 * @param {string} text - The full sentence
 * @param {Object} triggerInfo - Information about the detected "avant que" trigger
 * @returns {Object} Enhanced analysis including complement clause and subjunctive mood
 */
export function analyzeAvantQueConstruction(text, triggerInfo) {
  if (!triggerInfo || !triggerInfo.trigger.includes('avant')) {
    return {
      isAvantQue: false,
      reason: 'Not an avant que construction'
    };
  }
  
  const complementAnalysis = analyzeComplementClause(text, triggerInfo.position);
  const subjunctiveAnalysis = analyzeSubjunctiveMood(text, triggerInfo.position);
  
  // Calculate expletive negation likelihood based on both factors
  let expletiveLikelihood = 0;
  let confidenceFactors = [];
  let reasoning = [];
  
  // Factor 1: Complement clause presence (required for expletive ne)
  if (complementAnalysis.isComplementClause) {
    expletiveLikelihood += 0.4;
    confidenceFactors.push('Complement clause present');
    reasoning.push(`✓ Finite complement clause detected (${complementAnalysis.confidence * 100}% confidence)`);
  } else {
    reasoning.push(`✗ No finite complement clause (${complementAnalysis.reason})`);
  }
  
  // Factor 2: Subjunctive mood (strongly favors expletive ne)
  if (subjunctiveAnalysis.hasSubjunctive) {
    expletiveLikelihood += 0.5;
    confidenceFactors.push('Subjunctive mood present');
    reasoning.push(`✓ Subjunctive mood confirmed: "${subjunctiveAnalysis.verb}" (${subjunctiveAnalysis.confidence * 100}% confidence)`);
  } else {
    reasoning.push(`✗ No subjunctive mood detected`);
  }
  
  // Determine final classification
  const bothConditionsMet = complementAnalysis.isComplementClause && subjunctiveAnalysis.hasSubjunctive;
  const overallConfidence = bothConditionsMet 
    ? Math.min((complementAnalysis.confidence + subjunctiveAnalysis.confidence) / 2, 0.95)
    : Math.max(complementAnalysis.confidence, subjunctiveAnalysis.confidence) * 0.6;
  
  let classification = 'No Expletive';
  let classificationReason = '';
  
  if (bothConditionsMet) {
    classification = 'Expletive';
    classificationReason = 'Both complement clause and subjunctive mood present - expletive negation highly likely';
  } else if (complementAnalysis.isComplementClause && !subjunctiveAnalysis.hasSubjunctive) {
    classification = 'No Expletive';
    classificationReason = 'Complement clause present but no subjunctive mood - expletive negation unlikely';
  } else if (!complementAnalysis.isComplementClause && subjunctiveAnalysis.hasSubjunctive) {
    classification = 'No Expletive';
    classificationReason = 'Subjunctive present but no finite complement clause - expletive negation unlikely';
  } else {
    classification = 'No Expletive';
    classificationReason = 'Neither complement clause nor subjunctive mood detected - expletive negation not possible';
  }
  
  return {
    isAvantQue: true,
    classification,
    confidence: overallConfidence,
    expletiveLikelihood,
    
    // Detailed analysis components
    complementClause: complementAnalysis,
    subjunctiveMood: subjunctiveAnalysis,
    
    // Summary
    bothConditionsMet,
    confidenceFactors,
    reasoning,
    classificationReason,
    
    // Enhanced evidence for display
    evidence: {
      trigger: triggerInfo.trigger,
      category: 'TEMPORAL',
      subcategory: triggerInfo.subcategory || 'ENHANCED_AVANT_QUE',
      hasComplementClause: complementAnalysis.isComplementClause,
      hasSubjunctive: subjunctiveAnalysis.hasSubjunctive,
      complementClauseConfidence: complementAnalysis.confidence,
      subjunctiveConfidence: subjunctiveAnalysis.confidence,
      linguisticFactors: [
        ...complementAnalysis.indicators || [],
        ...(subjunctiveAnalysis.hasSubjunctive ? [`Subjunctive: ${subjunctiveAnalysis.verb}`] : [])
      ]
    }
  };
}

/**
 * Integration function for existing analysis pipeline
 * @param {string} text - The sentence to analyze
 * @param {Object} existingTriggerInfo - Trigger info from existing analysis
 * @returns {Object} Enhanced analysis or null if not avant que
 */
export function enhanceAvantQueAnalysis(text, existingTriggerInfo) {
  if (!existingTriggerInfo || !existingTriggerInfo.trigger.includes('avant')) {
    return null;
  }
  
  return analyzeAvantQueConstruction(text, existingTriggerInfo);
}
