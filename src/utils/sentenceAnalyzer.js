/**
 * Common expletive triggers in French
 */
const TRIGGER_PATTERNS = {
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
 * Detect trigger pattern in a French sentence
 * @param {string} text - The French sentence to analyze
 * @returns {Object} - Detected pattern information
 */
export const detectPattern = (text) => {
  if (!text || typeof text !== 'string') return null;
  
  const lowerText = text.toLowerCase();
  
  // Check each category of patterns
  for (const [category, patterns] of Object.entries(TRIGGER_PATTERNS)) {
    for (const pattern of patterns) {
      if (lowerText.includes(pattern)) {
        return {
          category,
          pattern,
          index: lowerText.indexOf(pattern)
        };
      }
    }
  }
  
  return null;
};

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
    word.toLowerCase() === 'ne' || 
    word.toLowerCase() === "n'" || 
    word.toLowerCase() === "n'" || 
    word.toLowerCase() === "n'");
    
  // Return 1-based position or null if not found
  return neIndex >= 0 ? neIndex + 1 : null;
};

/**
 * Analyze a sentence for patterns and NE position
 * @param {string} text - The French sentence to analyze
 * @returns {Object} - Analysis results
 */
export const analyzeSentence = (text) => {
  const pattern = detectPattern(text);
  const nePosition = calculateNePosition(text);
  
  return {
    text,
    pattern: pattern?.pattern || null,
    category: pattern?.category || null,
    nePosition,
    hasNe: nePosition !== null
  };
};

/**
 * Learn patterns from training examples
 * @param {Object} trainingData - The training data object
 * @returns {Object} - Analyzed patterns and statistics
 */
export const analyzeTrainingData = (trainingData) => {
  if (!trainingData?.examples) return null;
  
  const patterns = {};
  const nePositions = {};
  
  trainingData.examples.forEach(example => {
    if (example.classification !== "Expletive") return;
    
    const analysis = analyzeSentence(example.text);
    if (!analysis.pattern) return;
    
    // Track pattern frequency
    patterns[analysis.pattern] = (patterns[analysis.pattern] || 0) + 1;
    
    // Track NE positions for this pattern
    if (analysis.nePosition) {
      if (!nePositions[analysis.pattern]) {
        nePositions[analysis.pattern] = [];
      }
      nePositions[analysis.pattern].push(analysis.nePosition);
    }
  });
  
  // Calculate most common NE position for each pattern
  const patternStats = Object.entries(patterns).map(([pattern, count]) => {
    const positions = nePositions[pattern] || [];
    const positionCounts = positions.reduce((acc, pos) => {
      acc[pos] = (acc[pos] || 0) + 1;
      return acc;
    }, {});
    
    const mostCommonPosition = Object.entries(positionCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0];
      
    return {
      pattern,
      count,
      mostCommonNePosition: mostCommonPosition ? Number(mostCommonPosition) : null,
      positions: positionCounts
    };
  });
  
  return {
    totalExamples: trainingData.examples.length,
    expletivePatterns: patternStats,
    uniquePatterns: Object.keys(patterns).length
  };
};

/**
 * Suggest NE position for a new sentence based on training data
 * @param {string} text - The sentence to analyze
 * @param {Object} trainingData - The training data object
 * @returns {number|null} - Suggested NE position
 */
export const suggestNePosition = (text, trainingData) => {
  const analysis = analyzeSentence(text);
  if (!analysis.pattern) return null;
  
  const stats = analyzeTrainingData(trainingData);
  const patternStats = stats?.expletivePatterns.find(p => p.pattern === analysis.pattern);
  
  return patternStats?.mostCommonNePosition || null;
};
