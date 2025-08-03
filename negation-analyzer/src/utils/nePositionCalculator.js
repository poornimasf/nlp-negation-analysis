// Subjunctive verb patterns
const SUBJUNCTIVE_PATTERNS = [
  /\b(?:sois|soit|soyons|soyez|soient)\b/i,  // être
  /\b(?:aie|aies|ait|ayons|ayez|aient)\b/i,  // avoir
  /\b(?:fasse|fasses|fasse|fassions|fassiez|fassent)\b/i,  // faire
  /\b(?:puisse|puisses|puisse|puissions|puissiez|puissent)\b/i,  // pouvoir
  /\b(?:vienne|viennes|vienne|venions|veniez|viennent)\b/i,  // venir
  /\b(?:prenne|prennes|prenne|prenions|preniez|prennent)\b/i,  // prendre
  /\b(?:tienne|tiennes|tienne|tenions|teniez|tiennent)\b/i,  // tenir
  /\b(?:aille|ailles|aille|allions|alliez|aillent)\b/i  // aller
];

// Find the main verb in subjunctive mood
const findSubjunctiveVerb = (text, startPos) => {
  const afterPos = text.slice(startPos);
  for (const pattern of SUBJUNCTIVE_PATTERNS) {
    const match = afterPos.match(pattern);
    if (match) {
      return {
        verb: match[0],
        position: startPos + match.index
      };
    }
  }
  return null;
};

// Find the relative clause boundary
const findRelativeClauseBoundary = (text, quePos) => {
  const afterQue = text.slice(quePos);
  // Look for clause boundaries like commas, conjunctions, or end of string
  const boundaryMatch = afterQue.match(/[,;]|\bet\b|\bmais\b|\bou\b|$/i);
  return boundaryMatch ? quePos + boundaryMatch.index : text.length;
};

// Calculate ne position based on trigger type and context
export const calculateNePosition = (text, triggerInfo, mode = 'RULE_BASED') => {
  if (!text || !triggerInfo) return null;

  const { trigger, position: triggerPos, category } = triggerInfo;
  
  // Find que/qu' position
  const afterTrigger = text.slice(triggerPos + trigger.length);
  const queMatch = afterTrigger.match(/qu[e']/i);
  if (!queMatch) return null;
  
  const quePos = triggerPos + trigger.length + queMatch.index + queMatch[0].length;
  
  // Find next word after que/qu'
  const afterQue = text.slice(quePos).trim();
  const nextWordMatch = afterQue.match(/^\s*(\S+)/);
  if (!nextWordMatch) return null;
  
  const nextWord = nextWordMatch[1];
  const nextWordPos = quePos + afterQue.indexOf(nextWord);
  
  // Check for pronouns and other subject markers
  const pronouns = ['je', 'tu', 'il', 'elle', 'on', 'nous', 'vous', 'ils', 'elles'];
  const isPronoun = pronouns.includes(nextWord.toLowerCase());
  
  // Find subjunctive verb if present
  const subjunctiveInfo = findSubjunctiveVerb(text, quePos);
  
  // Calculate position based on trigger category
  switch (category) {
    case 'FEAR':
      // For fear triggers, prefer position before subjunctive verb if present
      if (subjunctiveInfo) {
        return isPronoun ? nextWordPos + nextWord.length : subjunctiveInfo.position;
      }
      return isPronoun ? nextWordPos + nextWord.length : quePos;
      
    case 'TEMPORAL':
      // For temporal triggers, place after subject but before verb
      if (subjunctiveInfo) {
        return isPronoun ? nextWordPos + nextWord.length : subjunctiveInfo.position;
      }
      return quePos;
      
    case 'IMPERSONAL':
      // For 'peu s'en faut', place after subject
      return isPronoun ? nextWordPos + nextWord.length : quePos;
      
    case 'RELATIVE':
      // For relative clauses, ensure we're within the relative clause
      const clauseBoundary = findRelativeClauseBoundary(text, quePos);
      if (subjunctiveInfo && subjunctiveInfo.position < clauseBoundary) {
        // Place before subjunctive verb within the relative clause
        return subjunctiveInfo.position;
      }
      // Default to after que but within clause
      return quePos;
      
    default:
      return quePos;
  }
};

// Validate proposed ne position
export const validateNePosition = (text, nePosition) => {
  if (!text || nePosition === null || nePosition < 0 || nePosition > text.length) {
    return false;
  }

  // Get context around proposed position
  const before = text.slice(Math.max(0, nePosition - 20), nePosition);
  const after = text.slice(nePosition, Math.min(text.length, nePosition + 20));

  // Check for invalid positions
  const invalidPatterns = [
    /\bne\b/i,  // Already has ne
    /[.!?]/,    // Sentence boundaries
    /\bet\b/i,  // Conjunctions
    /\bmais\b/i
  ];

  for (const pattern of invalidPatterns) {
    if (pattern.test(before.slice(-5))) return false;
  }

  // Check for valid following context
  const validFollowPattern = /^\s*\b(?:je|tu|il|elle|on|nous|vous|ils|elles|le|la|les|l['']|me|te|se|nous|vous)\b/i;
  
  // Check for subjunctive context
  const hasSubjunctive = SUBJUNCTIVE_PATTERNS.some(pattern => pattern.test(after));
  
  return validFollowPattern.test(after) || hasSubjunctive;
};

// Format sentence with ne marker
export const formatWithNe = (text, nePosition) => {
  if (!text || nePosition === null || !validateNePosition(text, nePosition)) {
    return text;
  }

  const beforeNe = text.slice(0, nePosition);
  const afterNe = text.slice(nePosition);
  
  // Add appropriate spacing
  const needsSpaceBefore = !beforeNe.endsWith(' ');
  const needsSpaceAfter = !afterNe.startsWith(' ');
  
  return `${beforeNe}${needsSpaceBefore ? ' ' : ''}ne${needsSpaceAfter ? ' ' : ''}${afterNe}`;
};
