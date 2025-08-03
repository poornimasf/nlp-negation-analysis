import { normalizeText } from './textProcessing';
import { classifyWithSVM, trainSVMModel } from './svmClassifier';

// CroissantLLM classification for Hybrid mode
export const classifyExpletive = async (text) => {
  try {
    if (!text) {
      throw new Error('No text provided');
    }

    if (!process.env.REACT_APP_HF_TOKEN) {
      throw new Error('Missing HF_TOKEN');
    }

    const prompt = `Example 1 (Expletive Negation):
Sentence: "Je crains qu'il ne vienne trop tard."
Analysis: The verb "craindre" with "que" introduces a subjunctive clause. No logical negation markers (pas, point, jamais) are present. The "ne" appears in a fear context without negation markers.
Classification: EXPLETIVE
Reasoning: While "craindre que" can suggest expletive negation, the key evidence is the absence of logical negation markers and the complete subjunctive clause structure.
NE Position: After "qu'il"
Conclusion: EXPLETIVE

Example 2 (Logical Negation):
Sentence: "Je ne veux pas qu'il parte."
Analysis: Contains the complete logical negation structure "ne...pas". The negation directly modifies the verb "vouloir" and changes its meaning.
Classification: LOGICAL
Reasoning: The presence of both "ne" and "pas" forms a complete logical negation that semantically negates the action.
NE Position: Before "veux"
Conclusion: LOGICAL

Now analyze the following French sentence to determine whether it previously contained **expletive negation** or **logical negation**:

"${text}"

Your task:
1. Analyze the complete grammatical structure and context.
2. Check specifically for logical negation markers (pas, point, jamais, etc.).
3. Consider the full clause structure and semantic meaning.
4. Determine the most likely position for "ne" based on the analysis.

Important: The presence of verbs like "craindre" or expressions like "avant que" alone is NOT sufficient to determine expletive negation. Consider all contextual factors.

Respond in the following format: 
Analysis: [focus on complete structure, markers, and context]
Classification: [EXPLETIVE or LOGICAL]
Reasoning: [explain why this classification is chosen, considering all factors]
NE Position: [specify where "ne" should be placed]
Conclusion: [final EXPLETIVE or LOGICAL determination]`;

    const response = await fetch(
      'https://frwk8k50dyslyiwo.us-east-1.aws.endpoints.huggingface.cloud/',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.REACT_APP_HF_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: prompt
        })
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('429: Rate limit exceeded');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    // Extract the analysis from the response
    if (Array.isArray(result) && result.length > 0) {
      const generatedText = result[0].generated_text;
      
      // Parse the structured response
      const analysisMatch = generatedText.match(/Analysis:\s*(.*?)(?=Classification:|$)/s);
      const classificationMatch = generatedText.match(/Classification:\s*(EXPLETIVE|LOGICAL)/i);
      const reasoningMatch = generatedText.match(/Reasoning:\s*(.*?)(?=NE Position:|$)/s);
      const nePositionMatch = generatedText.match(/NE Position:\s*(.*?)(?=Conclusion:|$)/s);
      const conclusionMatch = generatedText.match(/Conclusion:\s*(EXPLETIVE|LOGICAL)/i);
      
      return {
        analysis: analysisMatch ? analysisMatch[1].trim() : '',
        classification: (classificationMatch && classificationMatch[1]) ? 
          classificationMatch[1].toUpperCase() : 'UNCERTAIN',
        reasoning: reasoningMatch ? reasoningMatch[1].trim() : '',
        nePosition: nePositionMatch ? nePositionMatch[1].trim() : '',
        conclusion: (conclusionMatch && conclusionMatch[1]) ? 
          conclusionMatch[1].toUpperCase() : undefined,
        confidence: 0.85,
        rawResponse: generatedText
      };
    }
    
    return {
      analysis: 'No analysis available',
      classification: 'UNCERTAIN',
      reasoning: '',
      confidence: 0.5,
      rawResponse: result
    };
  } catch (error) {
    console.error('CroissantLLM Error:', error);
    throw error;
  }
};

// Trigger patterns that might allow expletive ne
const TRIGGER_PATTERNS = {
  FEAR: [
    /peur\s+qu(?:e|')/i,     // peur que, peur qu'
    /craindre?\s+qu(?:e|')/i,  // craindre que, crains qu', craignent que
    /redouter?\s+qu(?:e|')/i,  // redouter que, redoute qu'
    /avoir\s+peur\s+qu(?:e|')/i,  // avoir peur que, ai peur qu', avait peur que
    // All tenses of avoir + peur
    /(?:a|ai|as|avais|avait|avaient|aurai|auras|aurait|aurais|auraient|ayant|auront|aura)\s+peur\s+qu(?:e|')/i
  ],
  TEMPORAL: [
    /avant\s+(?:que\s+de\s+|qu(?:e|'))/i,    // avant que, avant qu', avant que de
    /jusqu['']à\s+ce\s+qu(?:e|')/i  // jusqu'à ce que, jusqu'à ce qu'
  ],
  IMPERSONAL: [
    // Present, imperfect, conditional, future tenses
    /peu\s+s['']en\s+(?:faut|fallait|faudrait|faudra)\s+qu(?:e|')/i,
    // All variations of "il s'en faut/fallait/etc. de peu que"
    /il\s+s['']en\s+(?:faut|fallait|faudrait|faudra|est\s+fallu)\s+(?:de\s+)?peu\s+qu(?:e|')/i,
    // Past tense variations
    /il\s+s['']en\s+est\s+fallu\s+(?:de\s+)?peu\s+qu(?:e|')/i,
    /peu\s+s['']en\s+est\s+fallu\s+qu(?:e|')/i
  ],
  RELATIVE: [
    // Superlative constructions
    /le\s+(?:meilleur|mieux)\s+qu(?:e|')/i,
    /la\s+(?:meilleure?)\s+qu(?:e|')/i,
    /les\s+(?:meilleurs?|meilleures?)\s+qu(?:e|')/i,
    // Restrictive constructions
    /le\s+(?:seul|unique)\s+qu(?:e|')/i,
    /la\s+(?:seule|unique)\s+qu(?:e|')/i,
    /les\s+(?:seuls|seules|uniques)\s+qu(?:e|')/i,
    // Ordinal constructions
    /le\s+(?:premier|dernier)\s+qu(?:e|')/i,
    /la\s+(?:première|dernière)\s+qu(?:e|')/i,
    /les\s+(?:premiers|premières|derniers|dernières)\s+qu(?:e|')/i
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
      // If this is our best match and it has ne, that's strong evidence
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
  const confidence = Math.max(weightedVotes.expletive, weightedVotes.nonExpletive) / totalWeight;

  // Determine if ne marker would be appropriate
  // If our best match has ne, or if we have significant expletive weight, classify as expletive
  const shouldHaveNe = weightedVotes.bestMatchHasNe || weightedVotes.expletive > weightedVotes.nonExpletive;

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
  const triggerInfo = inputTrigger ? `\nTrigger: "${inputTrigger.trigger}"` : '';
  const message = `Found ${similarExamples.length} similar example${similarExamples.length > 1 ? 's' : ''} ` +
    `${contextInfo}. ${shouldHaveNe ? 'Ne marker would be appropriate' : 'Ne marker would not be appropriate'}${triggerInfo}`;

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

// Export additional utilities
export { trainSVMModel } from './svmClassifier';
export { normalizeText } from './textProcessing';
