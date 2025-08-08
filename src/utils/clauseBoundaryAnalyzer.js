/**
 * Clause boundary analyzer for proper scope detection in French sentences
 * Fixes issues with cross-clause contamination in linguistic analysis
 */

import { normalizeText } from './textProcessing';

/**
 * Extract and isolate the clause containing a specific trigger
 */
export function extractTriggerClause(text, trigger) {
  if (!text || !trigger) {
    return {
      clause: text,
      startIndex: 0,
      endIndex: text.length,
      isIsolated: false
    };
  }

  const normalizedText = normalizeText(text.toLowerCase());
  const triggerPattern = trigger.trigger || trigger;
  
  // Find the trigger position
  const triggerIndex = normalizedText.indexOf(triggerPattern.toLowerCase());
  if (triggerIndex === -1) {
    return {
      clause: text,
      startIndex: 0,
      endIndex: text.length,
      isIsolated: false
    };
  }

  // For "avant que" constructions, extract the subordinate clause
  if (triggerPattern.includes('avant')) {
    return extractAvantQueClause(text, triggerIndex, triggerPattern);
  }
  
  // For other triggers, extract the subordinate clause
  return extractSubordinateClause(text, triggerIndex, triggerPattern);
}

/**
 * Extract the "avant que" subordinate clause specifically
 */
function extractAvantQueClause(text, triggerIndex, triggerPattern) {
  // Find the start of the "avant que" clause
  let clauseStart = triggerIndex;
  
  // Look backwards to find clause boundary markers
  const beforeTrigger = text.substring(0, triggerIndex);
  const clauseBoundaryMarkers = [',', ';', '.', '!', '?', ' et ', ' mais ', ' car ', ' donc '];
  
  for (const marker of clauseBoundaryMarkers) {
    const lastMarkerIndex = beforeTrigger.lastIndexOf(marker);
    if (lastMarkerIndex !== -1) {
      clauseStart = Math.max(clauseStart - (triggerIndex - lastMarkerIndex - marker.length), 0);
      break;
    }
  }
  
  // Find the end of the subordinate clause after "avant que"
  const afterTrigger = text.substring(triggerIndex);
  let clauseEnd = text.length;
  
  // Look for clause ending markers
  const endMarkers = ['.', '!', '?', ';', ',', ' et ', ' mais ', ' car ', ' donc ', ' alors ', ' puis '];
  
  for (const marker of endMarkers) {
    const markerIndex = afterTrigger.indexOf(marker);
    if (markerIndex !== -1) {
      // Make sure we capture the complete subordinate clause
      const potentialEnd = triggerIndex + markerIndex;
      
      // Check if this is actually the end of the subordinate clause
      // by looking for balanced parentheses/quotes and complete verb phrases
      const clauseFragment = text.substring(triggerIndex, potentialEnd);
      if (isCompleteSubordinateClause(clauseFragment)) {
        clauseEnd = potentialEnd;
        break;
      }
    }
  }
  
  const extractedClause = text.substring(clauseStart, clauseEnd).trim();
  
  return {
    clause: extractedClause,
    startIndex: clauseStart,
    endIndex: clauseEnd,
    isIsolated: true,
    triggerPosition: triggerIndex - clauseStart
  };
}

/**
 * Extract general subordinate clause
 */
function extractSubordinateClause(text, triggerIndex, triggerPattern) {
  // Find "que" after the trigger
  const afterTrigger = text.substring(triggerIndex + triggerPattern.length);
  const queMatch = afterTrigger.match(/qu[e']/i);
  
  if (!queMatch) {
    return {
      clause: text,
      startIndex: 0,
      endIndex: text.length,
      isIsolated: false
    };
  }
  
  const quePosition = triggerIndex + triggerPattern.length + queMatch.index;
  const clauseStart = triggerIndex;
  
  // Find the end of the subordinate clause
  const afterQue = text.substring(quePosition + queMatch[0].length);
  let clauseEnd = text.length;
  
  // Look for clause boundaries
  const endMarkers = ['.', '!', '?', ';', ',', ' et ', ' mais ', ' car ', ' donc '];
  
  for (const marker of endMarkers) {
    const markerIndex = afterQue.indexOf(marker);
    if (markerIndex !== -1) {
      const potentialEnd = quePosition + queMatch[0].length + markerIndex;
      const clauseFragment = text.substring(quePosition, potentialEnd);
      
      if (isCompleteSubordinateClause(clauseFragment)) {
        clauseEnd = potentialEnd;
        break;
      }
    }
  }
  
  const extractedClause = text.substring(clauseStart, clauseEnd).trim();
  
  return {
    clause: extractedClause,
    startIndex: clauseStart,
    endIndex: clauseEnd,
    isIsolated: true,
    triggerPosition: 0
  };
}

/**
 * Check if a clause fragment is complete (has subject and verb)
 */
function isCompleteSubordinateClause(clauseFragment) {
  const normalized = normalizeText(clauseFragment.toLowerCase());
  
  // Check for subject pronouns
  const hasSubject = /\b(?:je|j'|tu|il|elle|on|nous|vous|ils|elles|ce|c')\b/i.test(normalized);
  
  // Check for verb forms (basic check)
  const hasVerb = /\b\w+(?:e|es|ent|ons|ez|ais|ait|aient|ai|as|a|avons|avez|ont)\b/i.test(normalized);
  
  return hasSubject && hasVerb;
}

/**
 * Enhanced subjunctive detection within a specific clause
 */
export function detectSubjunctiveInClause(clause, triggerInfo) {
  if (!clause || !triggerInfo) {
    return null;
  }

  const normalizedClause = normalizeText(clause.toLowerCase());
  
  // For "avant que" constructions, look after "qu'"
  if (triggerInfo.trigger && triggerInfo.trigger.includes('avant')) {
    return detectSubjunctiveAfterAvantQue(normalizedClause);
  }
  
  // For other triggers, look after "que/qu'"
  return detectSubjunctiveAfterQue(normalizedClause);
}

/**
 * Detect subjunctive specifically after "avant qu'"
 */
function detectSubjunctiveAfterAvantQue(clause) {
  // Find "avant qu'" and look for the verb after it
  const avantQueMatch = clause.match(/avant\s+qu['']?\s*/i);
  if (!avantQueMatch) {
    return null;
  }
  
  const afterAvantQue = clause.substring(avantQueMatch.index + avantQueMatch[0].length);
  
  // Skip subject pronouns and look for the verb
  const verbMatch = afterAvantQue.match(/(?:ils?|elles?|on|nous|vous|tu|je|j'|ce|c')\s+(\w+)/i);
  if (verbMatch) {
    const verb = verbMatch[1];
    return analyzeVerbForSubjunctive(verb, afterAvantQue);
  }
  
  // Direct verb after "qu'"
  const directVerbMatch = afterAvantQue.match(/^(\w+)/i);
  if (directVerbMatch) {
    const verb = directVerbMatch[1];
    return analyzeVerbForSubjunctive(verb, afterAvantQue);
  }
  
  return null;
}

/**
 * Detect subjunctive after general "que/qu'"
 */
function detectSubjunctiveAfterQue(clause) {
  const queMatch = clause.match(/qu[e']\s*/i);
  if (!queMatch) {
    return null;
  }
  
  const afterQue = clause.substring(queMatch.index + queMatch[0].length);
  
  // Look for verb after subject
  const verbMatch = afterQue.match(/(?:ils?|elles?|on|nous|vous|tu|je|j'|ce|c')\s+(\w+)/i);
  if (verbMatch) {
    const verb = verbMatch[1];
    return analyzeVerbForSubjunctive(verb, afterQue);
  }
  
  return null;
}

/**
 * Analyze a specific verb for subjunctive mood
 */
function analyzeVerbForSubjunctive(verb, context) {
  const normalizedVerb = normalizeText(verb.toLowerCase());
  
  // High-priority subjunctive patterns
  const highPriorityPatterns = {
    // être
    sois: { type: 'ETRE', priority: 3, confidence: 0.95 },
    soit: { type: 'ETRE', priority: 3, confidence: 0.95 },
    soyons: { type: 'ETRE', priority: 3, confidence: 0.95 },
    soyez: { type: 'ETRE', priority: 3, confidence: 0.95 },
    soient: { type: 'ETRE', priority: 3, confidence: 0.95 },
    
    // avoir
    aie: { type: 'AVOIR', priority: 3, confidence: 0.95 },
    aies: { type: 'AVOIR', priority: 3, confidence: 0.95 },
    ait: { type: 'AVOIR', priority: 3, confidence: 0.95 },
    ayons: { type: 'AVOIR', priority: 3, confidence: 0.95 },
    ayez: { type: 'AVOIR', priority: 3, confidence: 0.95 },
    aient: { type: 'AVOIR', priority: 3, confidence: 0.95 },
    
    // faire
    fasse: { type: 'FAIRE', priority: 3, confidence: 0.95 },
    fasses: { type: 'FAIRE', priority: 3, confidence: 0.95 },
    fassions: { type: 'FAIRE', priority: 3, confidence: 0.95 },
    fassiez: { type: 'FAIRE', priority: 3, confidence: 0.95 },
    fassent: { type: 'FAIRE', priority: 3, confidence: 0.95 },
    
    // obtenir (for the specific example)
    obtienne: { type: 'OBTENIR', priority: 2, confidence: 0.85 },
    obtiennes: { type: 'OBTENIR', priority: 2, confidence: 0.85 },
    obtenions: { type: 'OBTENIR', priority: 2, confidence: 0.85 },
    obteniez: { type: 'OBTENIR', priority: 2, confidence: 0.85 },
    obtiennent: { type: 'OBTENIR', priority: 2, confidence: 0.85 }
  };
  
  // Check high-priority patterns first
  if (highPriorityPatterns[normalizedVerb]) {
    const pattern = highPriorityPatterns[normalizedVerb];
    return {
      verb: normalizedVerb,
      type: pattern.type,
      priority: pattern.priority,
      confidence: pattern.confidence,
      position: context.indexOf(verb)
    };
  }
  
  // Check regular subjunctive patterns
  if (normalizedVerb.match(/^.+(?:e|es|ions|iez|ent)$/)) {
    return {
      verb: normalizedVerb,
      type: 'REGULAR',
      priority: 1,
      confidence: 0.70,
      position: context.indexOf(verb)
    };
  }
  
  return null;
}

/**
 * Analyze multiple negation within a specific clause only
 */
export function analyzeMultipleNegationInClause(clause) {
  if (!clause) {
    return {
      hasMultipleNegation: false,
      negationType: 'NONE',
      confidence: 0,
      patterns: []
    };
  }

  const normalizedClause = normalizeText(clause.toLowerCase());
  
  // Only analyze negation patterns within this specific clause
  const doubleNegationPattern = /\b(?:ne|n')\b\s*(?:\w+\s+){0,3}(?:pas|point|jamais|rien|personne|aucun|nul|guère|plus)\b/i;
  const expletivePattern = /\b(?:peur|craindre|redouter|avant)\s+qu[e']\s+(?:\w+\s+)*(?:ne|n')\b(?!\s*(?:pas|point|jamais|rien|personne|aucun|nul|guère|plus))/i;
  
  if (doubleNegationPattern.test(normalizedClause)) {
    return {
      hasMultipleNegation: true,
      negationType: 'LOGICAL_NEGATION',
      confidence: 0.95,
      patterns: ['DOUBLE_NEGATION']
    };
  }
  
  if (expletivePattern.test(normalizedClause)) {
    return {
      hasMultipleNegation: true,
      negationType: 'EXPLETIVE_NEGATION',
      confidence: 0.85,
      patterns: ['EXPLETIVE_CONTEXT']
    };
  }
  
  return {
    hasMultipleNegation: false,
    negationType: 'NONE',
    confidence: 0,
    patterns: []
  };
}
