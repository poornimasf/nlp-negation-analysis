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
  if (example.has_expletive_ne === true && typeof example.ne_position !== 'number') {
    errors.push('ne_position required when has_expletive_ne is true');
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
 * Parse and validate training data
 * @param {Object} data - Raw training data
 * @returns {Object} - Parsed and validated data with statistics
 */
export const parseTrainingData = (data) => {
  if (!data || !Array.isArray(data.examples)) {
    throw new Error('Invalid training data format');
  }
  
  const validationResults = data.examples.map((example, index) => ({
    index,
    ...validateExample(example)
  }));
  
  const invalidExamples = validationResults.filter(r => !r.isValid);
  if (invalidExamples.length > 0) {
    throw new Error(
      'Invalid examples found:\n' +
      invalidExamples.map(e => 
        `Example ${e.index}: ${e.errors.join(', ')}`
      ).join('\n')
    );
  }
  
  return {
    examples: data.examples,
    stats: analyzeTrainingData(data.examples)
  };
};

/**
 * Analyze training data for patterns and statistics
 * @param {Array} examples - Validated training examples
 * @returns {Object} - Analysis statistics
 */
const analyzeTrainingData = (examples) => {
  const stats = {
    total: examples.length,
    expletive: {
      total: 0,
      withNe: 0,
      withoutNe: 0,
      byTrigger: {}
    },
    nonExpletive: 0
  };
  
  // Initialize trigger stats
  VALID_TRIGGERS.forEach(trigger => {
    stats.expletive.byTrigger[trigger] = {
      total: 0,
      withNe: 0,
      withoutNe: 0,
      nePositions: []
    };
  });
  
  // Analyze examples
  examples.forEach(example => {
    if (example.classification) {
      stats.expletive.total++;
      if (example.has_expletive_ne) {
        stats.expletive.withNe++;
      } else {
        stats.expletive.withoutNe++;
      }
      
      // Track trigger statistics
      const triggerStats = stats.expletive.byTrigger[example.trigger];
      triggerStats.total++;
      if (example.has_expletive_ne) {
        triggerStats.withNe++;
        triggerStats.nePositions.push(example.ne_position);
      } else {
        triggerStats.withoutNe++;
      }
    } else {
      stats.nonExpletive++;
    }
  });
  
  return stats;
};

/**
 * Find NE position relative to trigger
 * @param {string} text - The sentence text
 * @param {string} trigger - The trigger phrase
 * @param {number} absoluteNePosition - The absolute position of ne in the text
 * @returns {boolean} - Whether the ne appears after the trigger
 */
const isNeAfterTrigger = (text, trigger, absoluteNePosition) => {
  const triggerIndex = text.toLowerCase().indexOf(trigger.toLowerCase());
  return triggerIndex >= 0 && absoluteNePosition > triggerIndex + trigger.length;
};

/**
 * Find most common NE position for a trigger
 * @param {Array} examples - Training examples
 * @param {string} trigger - The trigger to analyze
 * @returns {number|null} - Most common NE position or null
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
    positionCounts[ex.ne_position] = (positionCounts[ex.ne_position] || 0) + 1;
  });
  
  // Find most common position
  return Number(
    Object.entries(positionCounts)
      .sort(([,a], [,b]) => b - a)[0][0]
  );
};

/**
 * Get training examples for a specific trigger
 * @param {Array} examples - Training examples
 * @param {string} trigger - The trigger to find examples for
 * @returns {Array} - Matching examples
 */
export const getExamplesForTrigger = (examples, trigger) => {
  return examples.filter(ex => ex.trigger === trigger);
};

/**
 * Check if a sentence matches training data patterns
 * @param {string} text - The sentence to analyze
 * @param {Array} examples - Training examples
 * @returns {Object} - Analysis result
 */
export const analyzeSentence = (text, examples) => {
  // Find matching trigger
  const trigger = VALID_TRIGGERS.find(t => text.toLowerCase().includes(t));
  if (!trigger) {
    return {
      classification: false,
      trigger: null,
      suggestedNePosition: null
    };
  }
  
  // Get suggested NE position from training data
  const suggestedNePosition = findCommonNePosition(examples, trigger);
  
  return {
    classification: true,
    trigger,
    suggestedNePosition
  };
};
