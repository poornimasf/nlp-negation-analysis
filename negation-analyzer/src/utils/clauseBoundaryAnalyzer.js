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
    console.log('❌ No avant que match found in clause:', clause);
    return null;
  }
  
  const afterAvantQue = clause.substring(avantQueMatch.index + avantQueMatch[0].length);
  
  console.log('🔍 After avant que:', `"${afterAvantQue}"`);
  console.log('🔍 After avant que (first 50 chars):', afterAvantQue.substring(0, 50));
  
  // FIXED: Specific pattern for "les autres aient" type constructions - ADD WORD BOUNDARIES
  const lesAutresMatch = afterAvantQue.match(/\bles\s+autres\s+(\w+)/i);
  console.log('🔍 Les autres pattern match:', lesAutresMatch);
  if (lesAutresMatch) {
    const verb = lesAutresMatch[1];
    console.log('🔍 Extracted verb from les autres pattern:', verb);
    return analyzeVerbForSubjunctive(verb, afterAvantQue);
  }
  
  // FIXED: Pronoun + verb pattern (skip object pronouns) - ADD WORD BOUNDARIES
  // Pattern: subject pronoun + optional object pronouns + verb
  const pronounMatch = afterAvantQue.match(/\b(?:ils?|elles?|on|nous|vous|tu|je|j'|ce|c'|celui-ci|celle-ci|ceux-ci|celles-ci)\b\s+(?:(?:me|te|se|le|la|les|lui|leur|en|y)\s+)*(\w+)/i);
  console.log('🔍 Pronoun pattern match:', pronounMatch);
  console.log('🔍 Pronoun pattern debug:', {
    textStart: afterAvantQue.substring(0, 30),
    hasElles: afterAvantQue.includes('elles'),
    ellesPosition: afterAvantQue.indexOf('elles'),
    wordBoundaryTest: /\belles\b/.test(afterAvantQue)
  });
  if (pronounMatch) {
    const verb = pronounMatch[1];
    console.log('🔍 Extracted verb from pronoun pattern:', verb);
    return analyzeVerbForSubjunctive(verb, afterAvantQue);
  }
  
  // NEW: Proper noun + object pronouns + verb pattern (handle both cases)
  const properNounMatch = afterAvantQue.match(/^([A-Za-z]\w+)\s+(?:(me|te|se|le|la|les|lui|leur|en|y)\s+)*(\w+)/i);
  console.log('🔍 Proper noun pattern match:', properNounMatch);
  if (properNounMatch) {
    const properNoun = properNounMatch[1];
    const objectPronoun = properNounMatch[2]; // might be undefined
    const verb = properNounMatch[3];
    console.log('🔍 Proper noun pattern details:', {
      properNoun,
      objectPronoun,
      verb,
      fullMatch: properNounMatch[0]
    });
    
    // Only accept if it looks like a name (not a common word)
    const commonWords = ['que', 'qui', 'quoi', 'dont', 'où', 'comme', 'avec', 'sans', 'pour', 'dans', 'sur', 'sous', 'entre', 'parmi'];
    if (!commonWords.includes(properNoun.toLowerCase())) {
      console.log('🔍 Extracted verb from proper noun pattern:', verb);
      return analyzeVerbForSubjunctive(verb, afterAvantQue);
    } else {
      console.log('🔍 Proper noun rejected (common word):', properNoun);
    }
  }
  
  // General article + noun + verb pattern (more careful)
  const articleMatch = afterAvantQue.match(/(?:la|l'|des?|un|une|ces?|cette|mon|ton|son|ma|ta|sa|mes|tes|ses|nos|vos|leurs)\s+\w+\s+(\w+)/i);
  console.log('🔍 Article pattern match:', articleMatch);
  if (articleMatch) {
    const verb = articleMatch[1];
    console.log('🔍 Extracted verb from article pattern:', verb);
    return analyzeVerbForSubjunctive(verb, afterAvantQue);
  }
  
  // Direct verb after "qu'" (original fallback)
  const directVerbMatch = afterAvantQue.match(/^(\w+)/i);
  console.log('🔍 Direct verb match result:', directVerbMatch);
  if (directVerbMatch) {
    const verb = directVerbMatch[1];
    console.log('🔍 Extracted verb from direct pattern:', verb);
    return analyzeVerbForSubjunctive(verb, afterAvantQue);
  }
  
  console.log('❌ No verb extraction pattern matched');
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
  
  console.log('🔍 Analyzing verb for subjunctive:', {
    originalVerb: verb,
    normalizedVerb: normalizedVerb,
    context: context.substring(0, 50) + '...'
  });
  
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
    
    // aller (MISSING - add all forms)
    aille: { type: 'ALLER', priority: 3, confidence: 0.95 },
    ailles: { type: 'ALLER', priority: 3, confidence: 0.95 },
    aillions: { type: 'ALLER', priority: 3, confidence: 0.95 },
    ailliez: { type: 'ALLER', priority: 3, confidence: 0.95 },
    aillent: { type: 'ALLER', priority: 3, confidence: 0.95 },
    
    // venir (add the missing patterns)
    vienne: { type: 'VENIR', priority: 3, confidence: 0.95 },
    viennes: { type: 'VENIR', priority: 3, confidence: 0.95 },
    venions: { type: 'VENIR', priority: 3, confidence: 0.95 },
    veniez: { type: 'VENIR', priority: 3, confidence: 0.95 },
    viennent: { type: 'VENIR', priority: 3, confidence: 0.95 },
    
    // obtenir (for the specific example)
    obtienne: { type: 'OBTENIR', priority: 2, confidence: 0.85 },
    obtiennes: { type: 'OBTENIR', priority: 2, confidence: 0.85 },
    obtenions: { type: 'OBTENIR', priority: 2, confidence: 0.85 },
    obteniez: { type: 'OBTENIR', priority: 2, confidence: 0.85 },
    obtiennent: { type: 'OBTENIR', priority: 2, confidence: 0.85 }
  };
  
  console.log('🔍 Checking if verb is in patterns:', {
    isInPatterns: !!highPriorityPatterns[normalizedVerb],
    availablePatterns: Object.keys(highPriorityPatterns).filter(k => k.startsWith(normalizedVerb.charAt(0)))
  });
  
  // Check high-priority patterns first (UNCHANGED - preserves existing functionality)
  if (highPriorityPatterns[normalizedVerb]) {
    const pattern = highPriorityPatterns[normalizedVerb];
    const result = {
      verb: normalizedVerb,
      type: pattern.type,
      priority: pattern.priority,
      confidence: pattern.confidence,
      position: context.indexOf(verb)
    };
    console.log('✅ Subjunctive found:', result);
    return result;
  }
  
  // FALLBACK: Check regular verb patterns (NEW - only when hardcoded patterns fail)
  console.log('🔍 Checking regular verb patterns for:', normalizedVerb);
  
  // Regular -IR verbs (like saisir → saisisse)
  if (normalizedVerb.match(/\w+isse$/i)) {
    const result = {
      verb: normalizedVerb,
      type: 'IR_REGULAR',
      priority: 2,
      confidence: 0.80, // Lower confidence than hardcoded
      position: context.indexOf(verb)
    };
    console.log('✅ Regular -IR subjunctive found:', result);
    return result;
  }
  
  // Regular -ER verbs (like parler → parle)
  if (normalizedVerb.match(/\w+e$/i) && normalizedVerb.length > 2) {
    // Exclude common words that aren't verbs
    const excludeWords = ['que', 'de', 'le', 'me', 'te', 'se', 'ne', 'ce'];
    if (!excludeWords.includes(normalizedVerb)) {
      const result = {
        verb: normalizedVerb,
        type: 'ER_REGULAR',
        priority: 1,
        confidence: 0.60, // Lower confidence due to ambiguity
        position: context.indexOf(verb)
      };
      console.log('✅ Regular -ER subjunctive found:', result);
      return result;
    }
  }
  
  // Regular -RE verbs (like prendre → prenne)
  if (normalizedVerb.match(/\w+ne$/i) && normalizedVerb.length > 3) {
    const result = {
      verb: normalizedVerb,
      type: 'RE_REGULAR',
      priority: 2,
      confidence: 0.70,
      position: context.indexOf(verb)
    };
    console.log('✅ Regular -RE subjunctive found:', result);
    return result;
  }
  
  console.log('❌ No subjunctive pattern matched for verb:', normalizedVerb);
  return null;
  
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
