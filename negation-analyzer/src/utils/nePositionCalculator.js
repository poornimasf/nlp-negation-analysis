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
  
  // Check for pronouns
  const pronouns = ['je', 'tu', 'il', 'elle', 'on', 'nous', 'vous', 'ils', 'elles'];
  const isPronoun = pronouns.includes(nextWord.toLowerCase());
  
  // Calculate position based on trigger category
  switch (category) {
    case 'FEAR':
      // For fear triggers, place ne after pronoun if present
      return isPronoun ? nextWordPos + nextWord.length : quePos;
      
    case 'TEMPORAL':
      // For temporal triggers like 'avant que', place after que
      return quePos;
      
    case 'IMPERSONAL':
      // For 'peu s'en faut', place after que
      return quePos;
      
    case 'RELATIVE':
      // For relative clauses, place after que
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
  return validFollowPattern.test(after);
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
