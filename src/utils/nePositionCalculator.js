/**
 * Calculate the position of 'ne' in a French sentence
 * @param {string} text - The French sentence containing 'ne'
 * @returns {number|null} - The position of 'ne' (1-based) or null if not found
 */
export const calculateNePosition = (text) => {
  if (!text || typeof text !== 'string') return null;
  
  // Split the text into words, handling contractions and apostrophes
  const words = text
    .replace(/(['''])/g, " $1 ")  // Add spaces around apostrophes
    .split(/\s+/)                 // Split on whitespace
    .filter(word => word.length > 0); // Remove empty strings
    
  // Find the position of 'ne' or 'n''
  const neIndex = words.findIndex(word => 
    word === 'ne' || 
    word === "n'" || 
    word === "n'" || 
    word === "n'");
    
  // Return 1-based position or null if not found
  return neIndex >= 0 ? neIndex + 1 : null;
};

/**
 * Process training data to add nePosition
 * @param {Object} trainingData - The training data object
 * @returns {Object} - Training data with calculated nePositions
 */
export const processTrainingData = (trainingData) => {
  if (!trainingData || !trainingData.examples) return trainingData;
  
  return {
    ...trainingData,
    examples: trainingData.examples.map(example => ({
      ...example,
      nePosition: calculateNePosition(example.text)
    }))
  };
};

/**
 * Extract NE position patterns for a trigger
 * @param {Object} trainingData - The training data object
 * @param {string} trigger - The trigger pattern to analyze
 * @returns {Object} - Statistics about NE placement for the trigger
 */
export const analyzeNePositionPattern = (trainingData, trigger) => {
  if (!trainingData?.examples || !trigger) return null;
  
  const relevantExamples = trainingData.examples.filter(
    ex => ex.trigger === trigger && ex.classification === "Expletive"
  );
  
  if (relevantExamples.length === 0) return null;
  
  const positions = relevantExamples
    .map(ex => calculateNePosition(ex.text))
    .filter(pos => pos !== null);
    
  // Find most common position
  const positionCounts = positions.reduce((acc, pos) => {
    acc[pos] = (acc[pos] || 0) + 1;
    return acc;
  }, {});
  
  const mostCommonPosition = Object.entries(positionCounts)
    .sort(([,a], [,b]) => b - a)[0]?.[0];
    
  return {
    trigger,
    mostCommonPosition: mostCommonPosition ? Number(mostCommonPosition) : null,
    totalExamples: relevantExamples.length,
    positionDistribution: positionCounts
  };
};

/**
 * Suggest NE position for a new sentence based on training data
 * @param {string} text - The sentence to analyze
 * @param {string} trigger - The identified trigger
 * @param {Object} trainingData - The training data object
 * @returns {number|null} - Suggested NE position
 */
export const suggestNePosition = (text, trigger, trainingData) => {
  if (!text || !trigger || !trainingData) return null;
  
  const pattern = analyzeNePositionPattern(trainingData, trigger);
  if (!pattern?.mostCommonPosition) return null;
  
  // Split the new text to validate the suggested position
  const words = text
    .replace(/(['''])/g, " $1 ")
    .split(/\s+/)
    .filter(word => word.length > 0);
    
  // Ensure the suggested position is within bounds
  const suggestedPosition = pattern.mostCommonPosition;
  return suggestedPosition <= words.length ? suggestedPosition : null;
};
