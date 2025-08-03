/**
 * Patterns that can trigger expletive negation
 */
const EXPLETIVE_TRIGGERS = {
  FEAR: [
    'peur que',
    'avoir peur que',
    'craindre que',
    'redouter que',
    'de peur que',
    'par peur que'
  ],
  TEMPORAL: [
    'avant que',
    'en attendant que',
    "jusqu'à ce que"
  ],
  IMPERSONAL: [
    "peu s'en faut que",
    "il s'en faut que",
    "il s'en faut de peu que"
  ]
};

/**
 * Find trigger pattern in text
 */
const findTrigger = (text) => {
  const lowerText = text.toLowerCase();
  
  for (const category of Object.values(EXPLETIVE_TRIGGERS)) {
    for (const pattern of category) {
      if (lowerText.includes(pattern)) {
        return pattern;
      }
    }
  }
  
  return null;
};

/**
 * Find position of 'ne' in text
 */
const findNePosition = (text) => {
  const words = text
    .replace(/(['''])/g, " $1 ")
    .split(/\s+/)
    .filter(word => word.length > 0);
    
  const neIndex = words.findIndex(word => 
    word === 'ne' || 
    word === "n'" || 
    word === "n'" || 
    word === "n'");
    
  return neIndex >= 0 ? neIndex + 1 : null;
};

/**
 * Analyze a sentence for expletive negation
 */
export const analyzeSentence = (text) => {
  // Find trigger pattern
  const trigger = findTrigger(text);
  
  // If no trigger, it's not an expletive context
  if (!trigger) {
    return {
      classification: false, // not expletive
      trigger: null,
      hasNe: false,
      nePosition: null,
      confidence: 1.0
    };
  }

  // Find 'ne' position
  const nePosition = findNePosition(text);
  
  // Calculate confidence based on trigger and context
  let confidence = 0.8; // Base confidence with trigger
  
  // Return analysis
  return {
    classification: true, // expletive possible
    trigger,
    hasNe: nePosition !== null,
    nePosition,
    confidence
  };
};

/**
 * Get suggested NE position for a sentence
 */
export const suggestNePosition = (text, trigger) => {
  if (!trigger) return null;
  
  const words = text
    .replace(/(['''])/g, " $1 ")
    .split(/\s+/)
    .filter(word => word.length > 0);
    
  // Find trigger position
  const triggerStart = words
    .findIndex(word => trigger.startsWith(word.toLowerCase()));
    
  if (triggerStart < 0) return null;
  
  // NE typically comes 2-3 words after the trigger
  const suggestedPos = triggerStart + 2;
  
  return suggestedPos < words.length ? suggestedPos + 1 : null;
};

/**
 * Format analysis results for display
 */
export const formatAnalysis = (analysis) => {
  return {
    classification: analysis.classification,
    type: analysis.classification ? 'Expletive Possible' : 'Not Expletive',
    trigger: analysis.trigger || 'None',
    hasNe: analysis.hasNe ? 'Yes' : 'No',
    nePosition: analysis.nePosition || 'N/A',
    confidence: `${Math.round(analysis.confidence * 100)}%`
  };
};
