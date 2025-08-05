import { normalizeText } from './textProcessing';
import { classifyWithSVM, trainSVMModel } from './svmClassifier';
import { TRIGGER_PATTERNS, CONFIDENCE_LEVELS } from './patterns';

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

  // For known triggers that allow expletive ne, use appropriate base confidence
  const isKnownTrigger = inputTrigger && ['TEMPORAL', 'FEAR', 'IMPERSONAL'].includes(inputTrigger.category);
  let baseConfidence = isKnownTrigger ? CONFIDENCE_LEVELS.EXPLETIVE : CONFIDENCE_LEVELS.FALLBACK;

  if (similarExamples.length === 0) {
    // Even with known trigger, we need training data to determine if ne was likely
    return {
      matches: [],
      confidence: baseConfidence,
      classification: false, // Default to no expletive without evidence
      message: isKnownTrigger ? 
        `"${inputTrigger.trigger}" allows optional expletive ne, but no similar examples found` :
        'No similar examples found in training data',
      nePosition: null,
      originalText: text,
      context: {
        triggerType: inputTrigger?.category || null,
        trigger: inputTrigger?.trigger || null,
        quePosition
      }
    };
  }

  // Analyze similar examples to determine if ne marker would be appropriate
  const weightedVotes = similarExamples.reduce((acc, example) => {
    const weight = example.similarity;
    if (example.has_expletive_ne === true) {
      acc.expletive += weight;
      if (weight === similarExamples[0].similarity) {
        acc.bestMatchHasNe = true;
      }
    } else {
      acc.nonExpletive += weight;
    }
    return acc;
  }, { expletive: 0, nonExpletive: 0, bestMatchHasNe: false });

  // Calculate confidence and determine classification
  const totalWeight = weightedVotes.expletive + weightedVotes.nonExpletive;
  const confidence = Math.max(
    baseConfidence,
    Math.max(weightedVotes.expletive, weightedVotes.nonExpletive) / totalWeight
  );

  // Determine if ne marker would be appropriate based on similar examples
  const shouldHaveNe = weightedVotes.expletive > weightedVotes.nonExpletive;

  // If ne is appropriate, determine position
  let nePosition = null;
  if (shouldHaveNe && quePosition) {
    const examplesWithNe = similarExamples.filter(ex => ex.has_expletive_ne && ex.ne_position !== null);
    if (examplesWithNe.length > 0) {
      const bestExample = examplesWithNe[0];
      const exampleQue = findQuePosition(bestExample.text, extractTrigger(bestExample.text));
      if (exampleQue && bestExample.ne_position) {
        const relativePos = bestExample.ne_position - exampleQue;
        nePosition = quePosition + relativePos;
      } else {
        nePosition = quePosition + 1; // Default: right after que
      }
    } else {
      nePosition = quePosition + 1; // Default: right after que
    }
  }

  // Generate detailed message
  const contextInfo = inputTrigger?.isRelative ? ' (relative clause)' : '';
  const triggerInfo = inputTrigger ? `\nTrigger: "${inputTrigger.trigger}" (${inputTrigger.category})` : '';
  const message = `Found ${similarExamples.length} similar example${similarExamples.length > 1 ? 's' : ''} ` +
    `${contextInfo}. ${shouldHaveNe ? 'Evidence suggests expletive ne was likely' : 'Evidence suggests expletive ne was unlikely'}${triggerInfo}`;

  return {
    matches: similarExamples,
    confidence,
    classification: shouldHaveNe,
    message,
    nePosition,
    originalText: text,
    context: {
      triggerType: inputTrigger?.category || null,
      trigger: inputTrigger?.trigger || null,
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
