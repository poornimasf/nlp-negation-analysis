/**
 * Enhanced avant que analyzer that uses proper clause boundary detection
 * Replaces the old avantQueAnalyzer with clause-aware analysis
 */

import { normalizeText } from './textProcessing';
import { detectSubjunctiveInClause } from './clauseBoundaryAnalyzer';

/**
 * Enhanced avant que analysis using clause boundary detection
 */
export function enhanceAvantQueAnalysisWithClause(clause, triggerInfo) {
  if (!clause || !triggerInfo || !triggerInfo.trigger.includes('avant')) {
    return {
      isAvantQue: false,
      complementClause: { isComplementClause: false, confidence: 0 },
      subjunctiveMood: { hasSubjunctive: false, confidence: 0 },
      bothConditionsMet: false,
      classificationReason: 'Not an avant que construction'
    };
  }

  const normalizedClause = normalizeText(clause.toLowerCase());
  
  // Analyze complement clause within the isolated clause
  const complementAnalysis = analyzeComplementClauseInClause(normalizedClause);
  
  // Analyze subjunctive mood within the isolated clause
  const subjunctiveAnalysis = analyzeSubjunctiveMoodInClause(clause, triggerInfo);
  
  // Determine if both conditions are met
  const bothConditionsMet = complementAnalysis.isComplementClause && subjunctiveAnalysis.hasSubjunctive;
  
  // Generate classification reasoning
  let classificationReason;
  if (bothConditionsMet) {
    classificationReason = 'Both complement clause and subjunctive mood present - expletive negation highly likely';
  } else if (complementAnalysis.isComplementClause && !subjunctiveAnalysis.hasSubjunctive) {
    classificationReason = 'Complement clause present but no subjunctive mood - expletive negation unlikely';
  } else if (!complementAnalysis.isComplementClause && subjunctiveAnalysis.hasSubjunctive) {
    classificationReason = 'Subjunctive mood present but no complement clause - expletive negation unlikely';
  } else {
    classificationReason = 'Neither complement clause nor subjunctive mood detected - expletive negation not possible';
  }
  
  return {
    isAvantQue: true,
    complementClause: complementAnalysis,
    subjunctiveMood: subjunctiveAnalysis,
    bothConditionsMet,
    classificationReason,
    analyzedClause: clause
  };
}

/**
 * Analyze complement clause within the isolated clause
 */
function analyzeComplementClauseInClause(normalizedClause) {
  console.log('🔍 Analyzing complement clause in:', normalizedClause.substring(0, 100));
  
  // Look for subject pronouns that indicate a finite clause
  const subjectPronouns = /\b(?:je|j'|tu|il|elle|on|nous|vous|ils|elles|ce|c')\b/i;
  const hasSubjectPronoun = subjectPronouns.test(normalizedClause);
  
  // Look for demonstrative pronouns - ADDED
  const demonstrativePronouns = /\b(?:celui-ci|celle-ci|ceux-ci|celles-ci|celui-là|celle-là|ceux-là|celles-là)\b/i;
  const hasDemonstrativePronoun = demonstrativePronouns.test(normalizedClause);
  
  // Look for noun subjects (articles + nouns)
  const nounSubjects = /\b(?:les?|la|l'|des?|un|une|ces?|cette|mon|ton|son|ma|ta|sa|mes|tes|ses|nos|vos|leurs)\s+\w+/i;
  const hasNounSubject = nounSubjects.test(normalizedClause);
  
  // Look for finite verb indicators (including subjunctive forms)
  const finiteVerbs = /\b(?:est|sont|a|ont|va|vont|peut|peuvent|doit|doivent|fait|font|ait|aient|soit|soient|vienne|viennent)\b/i;
  const hasFiniteVerb = finiteVerbs.test(normalizedClause);
  
  // Check for "avant que" followed by subject + verb pattern (pronouns)
  const avantQuePronouns = /avant\s+qu[e']\s+(?:ils?|elles?|on|nous|vous|tu|je|j'|ce|c')\s+\w+/i;
  const hasAvantQuePronouns = avantQuePronouns.test(normalizedClause);
  
  // Check for "avant que" followed by demonstrative pronouns + verb pattern - ADDED
  const avantQueDemonstratives = /avant\s+qu[e']\s+(?:celui-ci|celle-ci|ceux-ci|celles-ci|celui-là|celle-là|ceux-là|celles-là)\s+\w+/i;
  const hasAvantQueDemonstratives = avantQueDemonstratives.test(normalizedClause);
  
  // Check for "avant que" followed by noun subject + verb pattern
  const avantQueNouns = /avant\s+qu[e']\s+(?:les?|la|l'|des?|un|une|ces?|cette|mon|ton|son|ma|ta|sa|mes|tes|ses|nos|vos|leurs)\s+\w+\s+\w+/i;
  const hasAvantQueNouns = avantQueNouns.test(normalizedClause);
  
  const hasAvantQueSubjectVerb = hasAvantQuePronouns || hasAvantQueNouns || hasAvantQueDemonstratives;
  
  console.log('🔍 Complement clause evidence:', {
    hasSubjectPronoun,
    hasDemonstrativePronoun,
    hasNounSubject,
    hasFiniteVerb,
    hasAvantQuePronouns,
    hasAvantQueDemonstratives,
    hasAvantQueNouns,
    hasAvantQueSubjectVerb
  });
  
  // Calculate confidence based on evidence
  let confidence = 0;
  if (hasSubjectPronoun || hasNounSubject || hasDemonstrativePronoun) confidence += 0.4; // Any subject
  if (hasFiniteVerb) confidence += 0.3;
  if (hasAvantQueSubjectVerb) confidence += 0.3;
  
  const isComplementClause = confidence >= 0.4;
  
  console.log('🔍 Complement clause result:', {
    isComplementClause,
    confidence: Math.min(confidence, 1.0)
  });
  
  return {
    isComplementClause,
    confidence: Math.min(confidence, 1.0),
    evidence: {
      hasSubjectPronoun,
      hasDemonstrativePronoun, // ADDED
      hasNounSubject,
      hasFiniteVerb,
      hasAvantQueSubjectVerb
    }
  };
}

/**
 * Analyze subjunctive mood within the isolated clause
 */
function analyzeSubjunctiveMoodInClause(clause, triggerInfo) {
  // Use the enhanced subjunctive detection from clause boundary analyzer
  const subjunctiveResult = detectSubjunctiveInClause(clause, triggerInfo);
  
  if (subjunctiveResult) {
    return {
      hasSubjunctive: true,
      confidence: subjunctiveResult.confidence,
      verb: subjunctiveResult.verb,
      type: subjunctiveResult.type,
      priority: subjunctiveResult.priority
    };
  }
  
  return {
    hasSubjunctive: false,
    confidence: 0,
    verb: null,
    type: null,
    priority: 0
  };
}

/**
 * Enhanced classification logic for avant que constructions
 */
export function classifyAvantQueWithClause(clause, triggerInfo) {
  const analysis = enhanceAvantQueAnalysisWithClause(clause, triggerInfo);
  
  if (!analysis.isAvantQue) {
    return {
      classification: false,
      confidence: 0.1,
      reason: 'Not an avant que construction'
    };
  }
  
  if (analysis.bothConditionsMet) {
    return {
      classification: true,
      confidence: 0.92,
      reason: 'Both complement clause and subjunctive mood present'
    };
  }
  
  if (analysis.complementClause.isComplementClause && !analysis.subjunctiveMood.hasSubjunctive) {
    return {
      classification: false,
      confidence: 0.75,
      reason: 'Complement clause present but missing subjunctive mood'
    };
  }
  
  if (!analysis.complementClause.isComplementClause && analysis.subjunctiveMood.hasSubjunctive) {
    return {
      classification: false,
      confidence: 0.70,
      reason: 'Subjunctive mood present but missing complement clause'
    };
  }
  
  return {
    classification: false,
    confidence: 0.85,
    reason: 'Neither complement clause nor subjunctive mood detected'
  };
}
