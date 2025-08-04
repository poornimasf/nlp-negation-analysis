// Valid triggers for expletive negation
const VALID_TRIGGERS = ['peur que', 'avant que', 'peu s\'en faut'];

/**
 * Validate a single training example
 * @param {Object} example - The training example to validate
 * @returns {Object} - Validation result {isValid, errors}
 */
const validateExample = (example) => {
  const errors = [];
  
  // Required fields
  if (!example.text) errors.push('Missing text');
  if (typeof example.has_expletive_ne !== 'boolean') errors.push('has_expletive_ne must be boolean');
  if (typeof example.classification !== 'boolean') errors.push('classification must be boolean');
  
  // Trigger validation
  if (example.classification === true) {
    if (!example.trigger) {
      errors.push('Trigger required for expletive examples');
    } else if (!VALID_TRIGGERS.includes(example.trigger)) {
      errors.push(`Invalid trigger. Must be one of: ${VALID_TRIGGERS.join(', ')}`);
    }
  }
  
  // NE position validation
  if (example.has_expletive_ne === true) {
    if (typeof example.ne_position !== 'number') {
      errors.push('ne_position required when has_expletive_ne is true');
    } else {
      // Validate that ne_position is a valid word index
      const wordCount = example.text.trim().split(/\s+/).length;
      if (example.ne_position < 0 || example.ne_position >= wordCount) {
        errors.push(`ne_position (${example.ne_position}) must be a valid word index (0 to ${wordCount - 1})`);
      }
    }
  }
  if (example.has_expletive_ne === false && example.ne_position !== null) {
    errors.push('ne_position must be null when has_expletive_ne is false');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Convert text position to word index
 * @param {string} text - The full text
 * @param {number} charPosition - Character position in the text
 * @returns {number} - Word index at that position
 */
const charPositionToWordIndex = (text, charPosition) => {
  const beforePosition = text.slice(0, charPosition);
  return beforePosition.trim().split(/\s+/).length - 1;
};

/**
 * Find NE position relative to trigger
 * @param {string} text - The sentence text
 * @param {string} trigger - The trigger phrase
 * @param {number} neWordIndex - The word index where ne appears (0-based)
 * @returns {boolean} - Whether the ne appears after the trigger
 */
const isNeAfterTrigger = (text, trigger, neWordIndex) => {
  const words = text.toLowerCase().split(/\s+/);
  const triggerWords = trigger.toLowerCase().split(/\s+/);
  
  // Find trigger's last word position
  for (let i = 0; i <= words.length - triggerWords.length; i++) {
    if (triggerWords.every((word, j) => words[i + j].includes(word))) {
      const triggerLastWordIndex = i + triggerWords.length - 1;
      return neWordIndex > triggerLastWordIndex;
    }
  }
  return false;
};

/**
 * Find most common NE position for a trigger
 * @param {Array} examples - Training examples
 * @param {string} trigger - The trigger to analyze
 * @returns {Object|null} - Position information or null
 */
export const findCommonNePosition = (examples, trigger) => {
  // Only consider examples where ne appears after the trigger
  const relevantExamples = examples.filter(ex => 
    ex.trigger === trigger && 
    ex.has_expletive_ne &&
    isNeAfterTrigger(ex.text, trigger, ex.ne_position)
  );
  
  if (relevantExamples.length === 0) return null;
  
  // Count position frequencies
  const positionCounts = {};
  relevantExamples.forEach(ex => {
    // Store both position and the word that follows ne
    const words = ex.text.split(/\s+/);
    const followingWord = words[ex.ne_position + 1] || '';
    
    if (!positionCounts[ex.ne_position]) {
      positionCounts[ex.ne_position] = {
        count: 0,
        examples: [],
        followingWords: new Set()
      };
    }
    positionCounts[ex.ne_position].count++;
    positionCounts[ex.ne_position].examples.push(ex.text);
    positionCounts[ex.ne_position].followingWords.add(followingWord.toLowerCase());
  });
  
  // Find most common position
  const [position, stats] = Object.entries(positionCounts)
    .sort(([,a], [,b]) => b.count - a.count)[0];
    
  return {
    position: Number(position),
    frequency: stats.count / relevantExamples.length,
    examples: stats.examples.slice(0, 3),
    followingWords: Array.from(stats.followingWords)
  };
};

/**
 * Check if a sentence matches training data patterns
 * @param {string} text - The sentence to analyze
 * @param {Array} examples - Training examples
 * @returns {Object} - Analysis result with word-based positions
 */
export const analyzeSentence = (text, examples) => {
  // Find matching trigger
  const trigger = VALID_TRIGGERS.find(t => text.toLowerCase().includes(t));
  if (!trigger) {
    return {
      classification: false,
      trigger: null,
      suggestedPosition: null
    };
  }
  
  // Get suggested NE position from training data
  const positionInfo = findCommonNePosition(examples, trigger);
  
  return {
    classification: true,
    trigger,
    suggestedPosition: positionInfo?.position ?? null,
    positionInfo
  };
};
