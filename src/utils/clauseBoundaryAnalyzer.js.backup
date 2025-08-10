/**
 * Clause boundary analyzer for proper scope detection in French sentences
 * Fixes issues with cross-clause contamination in linguistic analysis
 */

import { normalizeText } from './textProcessing';
import { enhancedPOSAnalysis } from './posAnalyzer';

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
  
  let afterAvantQue = clause.substring(avantQueMatch.index + avantQueMatch[0].length);
  
  // PREPROCESSING BUG FIX: Remove "e " artifact from various normalization issues
  // Handles: "ça avant que" → "ça avant qu'e", "la avant que" → "la avant qu'e", etc.
  if (afterAvantQue.startsWith('e ')) {
    console.log('🔧 Removing preprocessing artifact "e " from text');
    afterAvantQue = afterAvantQue.substring(2); // Remove "e "
    console.log('🔧 Cleaned text:', `"${afterAvantQue.substring(0, 50)}"`);
  }
  
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
  
  // NEW PHASE 1: Article + noun + verb pattern (high-impact)
  // Handles: "avant que le soleil vienne", "avant que la demoiselle soit"
  const articleNounMatch = afterAvantQue.match(/\b(?:le|la|les)\s+(\w+)\s+(\w+)/i);
  console.log('🔍 Article + noun pattern match:', articleNounMatch);
  if (articleNounMatch) {
    const noun = articleNounMatch[1];
    const verb = articleNounMatch[2];
    console.log('🔍 Article + noun pattern details:', {
      noun: noun,
      verb: verb,
      fullMatch: articleNounMatch[0]
    });
    
    // Check if the "verb" is actually a noun using POS analysis
    const posAnalysis = enhancedPOSAnalysis(verb, afterAvantQue);
    if (posAnalysis.shouldSkipVerbAnalysis) {
      console.log('🔍 Article + noun pattern: second word identified as noun, skipping');
    } else {
      console.log('🔍 Extracted verb from article + noun pattern:', verb);
      return analyzeVerbForSubjunctive(verb, afterAvantQue);
    }
  }
  
  // NEW PHASE 1: Demonstrative + verb pattern  
  // Handles: "avant que ce dernier vienne", "avant que cette dernière soit"
  const demonstrativeMatch = afterAvantQue.match(/\b(?:ce dernier|cette dernière|ces derniers|ces dernières)\s+(\w+)/i);
  console.log('🔍 Demonstrative pattern match:', demonstrativeMatch);
  if (demonstrativeMatch) {
    const verb = demonstrativeMatch[1];
    console.log('🔍 Demonstrative pattern details:', {
      demonstrative: demonstrativeMatch[0].replace(verb, '').trim(),
      verb: verb,
      fullMatch: demonstrativeMatch[0]
    });
    console.log('🔍 Extracted verb from demonstrative pattern:', verb);
    return analyzeVerbForSubjunctive(verb, afterAvantQue);
  }
  
  // NEW PHASE 1: Complex subject pattern (article + noun + adjective + verb)
  // Handles: "avant que les symptômes évidents surviennent", "avant que les fruits soient utilisables"
  const complexSubjectMatch = afterAvantQue.match(/\b(?:le|la|les)\s+(\w+)\s+(\w+)\s+(\w+)/i);
  console.log('🔍 Complex subject pattern match:', complexSubjectMatch);
  if (complexSubjectMatch) {
    const noun = complexSubjectMatch[1];
    const adjective = complexSubjectMatch[2];
    const verb = complexSubjectMatch[3];
    console.log('🔍 Complex subject pattern details:', {
      noun: noun,
      adjective: adjective,
      verb: verb,
      fullMatch: complexSubjectMatch[0]
    });
    
    // Check if the "verb" is actually a noun/adjective using POS analysis
    const posAnalysis = enhancedPOSAnalysis(verb, afterAvantQue);
    if (posAnalysis.shouldSkipVerbAnalysis) {
      console.log('🔍 Complex subject pattern: third word identified as noun, skipping');
    } else {
      console.log('🔍 Extracted verb from complex subject pattern:', verb);
      return analyzeVerbForSubjunctive(verb, afterAvantQue);
    }
  }
  
  // NEW PHASE 2: Reflexive verb patterns
  // Handles: "avant qu'il se décide", "avant qu'elles se déclenchent", "avant qu'elle s'accroche"
  const reflexiveMatch = afterAvantQue.match(/\b(?:ils?|elles?|on|nous|vous|tu|je|j')\b\s+(?:me|te|se|s')\s+(\w+)/i);
  console.log('🔍 Reflexive pattern match:', reflexiveMatch);
  if (reflexiveMatch) {
    const verb = reflexiveMatch[1];
    console.log('🔍 Reflexive pattern details:', {
      subject: reflexiveMatch[0].split(' ')[0],
      reflexivePronoun: reflexiveMatch[0].split(' ')[1],
      verb: verb,
      fullMatch: reflexiveMatch[0]
    });
    console.log('🔍 Extracted verb from reflexive pattern:', verb);
    return analyzeVerbForSubjunctive(verb, afterAvantQue);
  }
  
  // NEW PHASE 2: Complex pronoun patterns (indefinite pronouns)
  // Handles: "avant qu'on récupère", "avant que quelqu'un vienne"
  const indefinitePronounMatch = afterAvantQue.match(/\b(?:on|quelqu'un|quelque chose|chacun|personne)\s+(\w+)/i);
  console.log('🔍 Indefinite pronoun pattern match:', indefinitePronounMatch);
  if (indefinitePronounMatch) {
    const verb = indefinitePronounMatch[1];
    console.log('🔍 Indefinite pronoun pattern details:', {
      pronoun: indefinitePronounMatch[0].replace(verb, '').trim(),
      verb: verb,
      fullMatch: indefinitePronounMatch[0]
    });
    console.log('🔍 Extracted verb from indefinite pronoun pattern:', verb);
    return analyzeVerbForSubjunctive(verb, afterAvantQue);
  }
  
  // NEW PHASE 2: Complex reflexive with object pronouns
  // Handles: "avant qu'il s'en aille", "avant qu'elle s'y rende"
  const complexReflexiveMatch = afterAvantQue.match(/\b(?:ils?|elles?|on|nous|vous|tu|je|j')\b\s+(?:s'en|s'y|se le|se la|se les)\s+(\w+)/i);
  console.log('🔍 Complex reflexive pattern match:', complexReflexiveMatch);
  if (complexReflexiveMatch) {
    const verb = complexReflexiveMatch[1];
    console.log('🔍 Complex reflexive pattern details:', {
      subject: complexReflexiveMatch[0].split(' ')[0],
      reflexiveComplex: complexReflexiveMatch[0].split(' ').slice(1, -1).join(' '),
      verb: verb,
      fullMatch: complexReflexiveMatch[0]
    });
    console.log('🔍 Extracted verb from complex reflexive pattern:', verb);
    return analyzeVerbForSubjunctive(verb, afterAvantQue);
  }
  
  // NEW PHASE 2: Indefinite article + noun + verb
  // Handles: "avant qu'une famille soit", "avant qu'un problème survienne"
  const indefiniteArticleMatch = afterAvantQue.match(/\b(?:un|une|des)\s+(\w+)\s+(\w+)/i);
  console.log('🔍 Indefinite article pattern match:', indefiniteArticleMatch);
  if (indefiniteArticleMatch) {
    const noun = indefiniteArticleMatch[1];
    const verb = indefiniteArticleMatch[2];
    console.log('🔍 Indefinite article pattern details:', {
      article: indefiniteArticleMatch[0].split(' ')[0],
      noun: noun,
      verb: verb,
      fullMatch: indefiniteArticleMatch[0]
    });
    
    // Check if the "verb" is actually a noun using POS analysis
    const posAnalysis = enhancedPOSAnalysis(verb, afterAvantQue);
    if (posAnalysis.shouldSkipVerbAnalysis) {
      console.log('🔍 Indefinite article pattern: second word identified as noun, skipping');
    } else {
      console.log('🔍 Extracted verb from indefinite article pattern:', verb);
      return analyzeVerbForSubjunctive(verb, afterAvantQue);
    }
  }
  
  // NEW PHASE 2: Enhanced passive voice recognition
  // Handles: "avant que les fruits soient utilisables", "avant que le rideau soit levé"
  const passiveVoiceMatch = afterAvantQue.match(/\b(?:le|la|les)\s+(\w+)\s+(soit|soient)\s+(\w+)/i);
  console.log('🔍 Passive voice pattern match:', passiveVoiceMatch);
  if (passiveVoiceMatch) {
    const noun = passiveVoiceMatch[1];
    const auxiliaryVerb = passiveVoiceMatch[2]; // soit/soient
    const pastParticiple = passiveVoiceMatch[3];
    console.log('🔍 Passive voice pattern details:', {
      noun: noun,
      auxiliaryVerb: auxiliaryVerb,
      pastParticiple: pastParticiple,
      fullMatch: passiveVoiceMatch[0]
    });
    
    // Analyze the auxiliary verb (soit/soient) as the subjunctive
    console.log('🔍 Extracted auxiliary verb from passive voice pattern:', auxiliaryVerb);
    return analyzeVerbForSubjunctive(auxiliaryVerb, afterAvantQue);
  }
  
  // NEW PHASE 2: Irregular subjunctive forms (imperfect subjunctive)
  // Handles: "avant que l'heure fut trop tardive", "avant qu'il eût fini"
  const irregularSubjunctiveMatch = afterAvantQue.match(/\b(?:le|la|les|l'|il|elle|ils|elles|on|je|tu|nous|vous)\s*(\w*)\s+(fut|fût|eût|vînt|prît|dît|fît|sût|voulût|pût)\b/i);
  console.log('🔍 Irregular subjunctive pattern match:', irregularSubjunctiveMatch);
  if (irregularSubjunctiveMatch) {
    const subject = irregularSubjunctiveMatch[1];
    const irregularVerb = irregularSubjunctiveMatch[2];
    console.log('🔍 Irregular subjunctive pattern details:', {
      subject: subject,
      irregularVerb: irregularVerb,
      fullMatch: irregularSubjunctiveMatch[0]
    });
    console.log('🔍 Extracted irregular subjunctive:', irregularVerb);
    
    // Create a special analysis for irregular subjunctives
    return {
      verb: irregularVerb,
      isSubjunctive: true,
      confidence: 0.95,
      type: 'IRREGULAR_SUBJUNCTIVE',
      reasoning: `Irregular subjunctive form: ${irregularVerb}`
    };
  }
  
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
  
  // NEW: Handle text normalization artifact "e l'..." from "avant qu'..." - FIXED FOR PUNCTUATION
  console.log('🔍 Character-by-character analysis:', {
    firstChars: afterAvantQue.substring(0, 20).split('').map((c, i) => `${i}: '${c}' (${c.charCodeAt(0)})`),
    length: afterAvantQue.length,
    startsWithE: afterAvantQue[0] === 'e',
    secondChar: `'${afterAvantQue[1]}' (${afterAvantQue.charCodeAt(1)})`,
    hasSpace: afterAvantQue[1] === ' ',
    apostropheChar: `'${afterAvantQue[3]}' (${afterAvantQue.charCodeAt(3)})`,
    isNormalApostrophe: afterAvantQue[3] === "'"
  });
  
  console.log('🔍 Testing normalization regex directly:', {
    testText: "e l'alarme retentisse ?",
    regexTest1: /^e\s+l'\s+\w+\s+\w+/.test(afterAvantQue),
    regexTest2: /^e\s+(l')\s+(\w+)\s+(\w+)/.test(afterAvantQue),
    regexTest3: /^e\s+(l')\s+(\w+)\s+(\w+)(?:\s*[?])?/.test(afterAvantQue)
  });
  
  const normalizationMatch = afterAvantQue.match(/^e\s+(l'|la|les?|des?|un|une|ces?|cette|mon|ton|son|ma|ta|sa|mes|tes|ses|nos|vos|leurs)\s+(\w+)\s+(\w+)(?:\s*[?!.,;:])?/i);
  console.log('🔍 Normalization artifact pattern match:', normalizationMatch);
  console.log('🔍 Normalization pattern debug:', {
    textStart: afterAvantQue.substring(0, 30),
    startsWithE: afterAvantQue.startsWith('e '),
    hasLAlarme: afterAvantQue.includes("l'alarme"),
    hasRetentisse: afterAvantQue.includes('retentisse')
  });
  if (normalizationMatch) {
    const article = normalizationMatch[1];
    const noun = normalizationMatch[2];
    const verb = normalizationMatch[3];
    console.log('🔍 Normalization pattern details:', { article, noun, verb });
    console.log('🔍 Extracted verb from normalization pattern:', verb);
    return analyzeVerbForSubjunctive(verb, afterAvantQue);
  }
  
  // General article + noun + verb pattern - FIXED FOR CONTRACTIONS
  const articleMatch = afterAvantQue.match(/(?:la|des?|un|une|ces?|cette|mon|ton|son|ma|ta|sa|mes|tes|ses|nos|vos|leurs)\s+\w+\s+(\w+)|(?:l')\w+\s+(\w+)/i);
  console.log('🔍 Article pattern match:', articleMatch);
  if (articleMatch) {
    // Handle both regular articles and contractions
    const verb = articleMatch[1] || articleMatch[2]; // First or second capture group
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
  
  // NEW: POS Analysis - Check if this is actually a noun
  const posAnalysis = enhancedPOSAnalysis(verb, context);
  if (posAnalysis.shouldSkipVerbAnalysis) {
    console.log(`🔍 Skipping subjunctive analysis: ${posAnalysis.reasoning}`);
    return null;
  }
  
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
  
  // Regular -ER verbs (like parler → parle, parlent)
  if (normalizedVerb.match(/\w+e$/i) || normalizedVerb.match(/\w+ent$/i)) {
    // Exclude common words that aren't verbs
    const excludeWords = ['que', 'de', 'le', 'me', 'te', 'se', 'ne', 'ce'];
    if (!excludeWords.includes(normalizedVerb) && normalizedVerb.length > 2) {
      
      // CONTEXTUAL ANALYSIS: Reduce confidence for potentially ambiguous forms
      let confidence = normalizedVerb.endsWith('ent') ? 0.65 : 0.60;
      
      // Check for indicators of indicative usage (factual/historical context)
      const indicativeIndicators = [
        // Historical/factual context indicators
        /\b(?:avait|était|fut|eut|avaient|étaient|furent|eurent)\b/i.test(context), // Past tense in context
        /\b(?:en|dans|vers|depuis)\s+\d{4}\b/i.test(context), // Year dates (historical)
        /\b(?:quelques|plusieurs)\s+(?:mois|années|jours)\b/i.test(context), // Time expressions
        /\b(?:village|ville|pays|région)\b/i.test(context), // Geographic/factual terms
        // Proper noun subjects often indicate factual usage
        /\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/.test(context) // Proper names like "Thompson arrive"
      ];
      
      const indicativeCount = indicativeIndicators.filter(Boolean).length;
      
      if (indicativeCount >= 2) {
        confidence *= 0.7; // Reduce confidence by 30% for likely indicative usage
        console.log(`🔍 Contextual analysis: ${indicativeCount} indicative indicators found, reducing confidence to ${confidence.toFixed(2)}`);
      }
      
      const result = {
        verb: normalizedVerb,
        type: 'ER_REGULAR',
        priority: 1,
        confidence: confidence,
        position: context.indexOf(verb),
        contextualNote: indicativeCount >= 2 ? 'Possibly indicative usage in historical/factual context' : null
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
  
  // Check regular subjunctive patterns as fallback
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
