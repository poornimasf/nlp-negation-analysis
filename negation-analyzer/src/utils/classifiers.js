import { normalizeText } from './textProcessing';
import { classifyWithSVM, trainSVMModel } from './svmClassifier';

// Trigger patterns that might allow expletive ne
const TRIGGER_PATTERNS = {
  FEAR: [
    /peur\s+qu[e']/i,
    /craindre?\s+qu[e']/i,
    /redouter?\s+qu[e']/i
  ],
  TEMPORAL: [
    /avant\s+qu[e']/i
  ],
  IMPERSONAL: [
    /peu\s+s['']en\s+faut\s+qu[e']/i
  ],
  RELATIVE: [
    // Superlative constructions
    /le\s+(?:meilleur|mieux)\s+qu[e']/i,
    // Restrictive constructions
    /le\s+(?:seul|unique)\s+qu[e']/i,
    // Ordinal constructions
    /le\s+(?:premier|dernier)\s+qu[e']/i
  ]
};

// Extract trigger with its position
function extractTrigger(text) {
  const normalizedText = normalizeText(text.toLowerCase());
  
  for (const [category, patterns] of Object.entries(TRIGGER_PATTERNS)) {
    for (const pattern of patterns) {
      const match = normalizedText.match(pattern);
      if (match) {
        return {
          category,
          pattern: pattern.source,
          trigger: match[0],
          position: match.index,
          isRelative: category === 'RELATIVE'
        };
      }
    }
  }
  return null;
}

// Find que/qu' position with context
function findQuePosition(text, triggerInfo) {
  if (!triggerInfo) return null;
  
  const normalizedText = normalizeText(text.toLowerCase());
  const triggerEnd = triggerInfo.position + triggerInfo.trigger.length;
  
  // Look for que/qu' after the trigger
  const afterTrigger = normalizedText.slice(triggerEnd);
  const queMatch = afterTrigger.match(/qu[e']/i);
  
  if (queMatch) {
    const quePos = triggerEnd + queMatch.index + queMatch[0].length;
    
    // Verify this que belongs to our trigger
    const betweenText = normalizedText.slice(triggerEnd, triggerEnd + queMatch.index);
    const hasIntervening = /[.!?]|\bet\b|\bmais\b/.test(betweenText);
    
    if (!hasIntervening) {
      return quePos;
    }
  }
  
  return null;
}

// Calculate similarity between sentences
function calculateSimilarity(text1, text2) {
  const norm1 = normalizeText(text1.toLowerCase());
  const norm2 = normalizeText(text2.toLowerCase());

  // Get triggers
  const trigger1 = extractTrigger(norm1);
  const trigger2 = extractTrigger(norm2);

  // Check for same trigger category
  const triggerMatch = trigger1 && trigger2 && trigger1.category === trigger2.category;
  
  // Get words (excluding common words and ne)
  const commonWords = new Set(['le', 'la', 'les', 'un', 'une', 'des', 'de', 'du', 'à', 'au', 'aux', 'ne', 'n']);
  const words1 = norm1.split(/\s+/).filter(w => !commonWords.has(w));
  const words2 = norm2.split(/\s+/).filter(w => !commonWords.has(w));

  // Calculate word similarity
  const intersection = words1.filter(word => words2.includes(word));
  const union = [...new Set([...words1, ...words2])];
  
  let similarity = intersection.length / union.length;

  // Boost score for matching triggers
  if (triggerMatch) {
    similarity += 0.3;
  }

  // Cap at 0.95
  return Math.min(similarity, 0.95);
}

// Binary classifier focusing on ne marker appropriateness
export const classifyWithBinaryClassifier = (text, trainingData) => {
  if (!text) {
    throw new Error('No text provided');
  }

  if (!trainingData || !Array.isArray(trainingData) || trainingData.length === 0) {
    throw new Error('No training data available');
  }

  // Extract trigger and find que position
  const inputTrigger = extractTrigger(text);
  const quePosition = findQuePosition(text, inputTrigger);

  // Find similar examples
  const similarExamples = trainingData
    .map(example => ({
      ...example,
      similarity: calculateSimilarity(text, example.text),
      trigger: extractTrigger(example.text)
    }))
    .filter(example => {
      // Require matching trigger category and reasonable similarity
      return example.trigger?.category === inputTrigger?.category &&
             example.similarity > 0.3;
    })
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 5); // Keep top 5 matches

  if (similarExamples.length === 0) {
    return {
      matches: [],
      confidence: 0.5,
      classification: false, // Default to no expletive if no matches
      message: 'No similar examples found in training data',
      nePosition: null
    };
  }

  // Analyze similar examples to determine if ne marker would be appropriate
  const weightedVotes = similarExamples.reduce((acc, example) => {
    const weight = example.similarity;
    // Check if the example has expletive ne
    if (example.has_expletive_ne === true) {
      acc.expletive += weight;
    } else {
      acc.nonExpletive += weight;
    }
    return acc;
  }, { expletive: 0, nonExpletive: 0 });

  // Calculate confidence and determine classification
  const totalWeight = weightedVotes.expletive + weightedVotes.nonExpletive;
  const confidence = Math.max(weightedVotes.expletive, weightedVotes.nonExpletive) / totalWeight;

  // Determine if ne marker would be appropriate
  const shouldHaveNe = weightedVotes.expletive > weightedVotes.nonExpletive;

  // If ne is appropriate, determine position
  let nePosition = null;
  if (shouldHaveNe && quePosition) {
    // Get positions from similar examples with ne
    const examplesWithNe = similarExamples.filter(ex => ex.has_expletive_ne && ex.ne_position !== null);
    if (examplesWithNe.length > 0) {
      // Use position from most similar example with ne
      const bestExample = examplesWithNe[0];
      const exampleQue = findQuePosition(bestExample.text, extractTrigger(bestExample.text));
      if (exampleQue && bestExample.ne_position) {
        // Calculate relative position from que and apply to new sentence
        const relativePos = bestExample.ne_position - exampleQue;
        nePosition = quePosition + relativePos;
      } else {
        // Fallback: place after que
        nePosition = quePosition;
      }
    } else {
      // Fallback: place after que
      nePosition = quePosition;
    }
  }

  // Generate detailed message
  const contextInfo = inputTrigger?.isRelative ? ' (relative clause)' : '';
  const message = `Found ${similarExamples.length} similar example${similarExamples.length > 1 ? 's' : ''} ` +
    `${contextInfo}. ${shouldHaveNe ? 'Ne marker would be appropriate' : 'Ne marker would not be appropriate'}`;

  return {
    matches: similarExamples,
    confidence,
    classification: shouldHaveNe,
    message,
    nePosition,
    originalText: text,
    context: {
      triggerType: inputTrigger?.category || null,
      quePosition
    }
  };
};

// Main classification function
export const classify = (text, trainingData, mode = 'BINARY') => {
  if (!text) {
    throw new Error('No text provided');
  }

  if (!trainingData || !Array.isArray(trainingData) || trainingData.length === 0) {
    throw new Error('No training data available');
  }

  // Use appropriate classifier based on mode
  switch (mode) {
    case 'SVM':
      const svmModel = trainSVMModel(trainingData);
      return classifyWithSVM(text, svmModel, trainingData);
    case 'BINARY':
    default:
      return classifyWithBinaryClassifier(text, trainingData);
  }
};

// Export additional utilities
export { trainSVMModel } from './svmClassifier';
