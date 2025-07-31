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
Analysis: The verb "craindre" in this context introduces a fear clause with "que", triggering expletive ne. The presence of "que" followed by subjunctive mood without "pas" indicates expletive usage.
Classification: EXPLETIVE
Reasoning: The ne particle appears without "pas" in a fear context, serving as an expletive marker rather than negation.
NE Position: After "qu'il"
Conclusion: EXPLETIVE

Example 2 (Logical Negation):
Sentence: "Je ne veux pas qu'il parte."
Analysis: The verb "vouloir" is directly negated using "ne...pas" construction. This indicates true semantic negation of the desire.
Classification: LOGICAL
Reasoning: The presence of both "ne" and "pas" creates a complete negative construction that changes the meaning of the verb.
NE Position: Before "veux"
Conclusion: LOGICAL

Now analyze the following French sentence to determine whether it previously contained **expletive negation** or **logical negation**:

"${text}"

Your task:
1. Analyze the complete grammatical structure and context.
2. Consider whether any verbs present are being negated (logical) or are part of an expletive construction.
3. Look for contextual clues like "pas", subjunctive mood, or fear/doubt expressions.
4. Determine the most likely position for "ne" based on the analysis.

Respond in the following format: 
Analysis: [focus on grammatical structure and contextual evidence]
Classification: [EXPLETIVE or LOGICAL]
Reasoning: [explain why this is expletive or logical negation]
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

// Common trigger patterns
const TRIGGER_PATTERNS = {
  FEAR: [
    /peur\s+que/i,
    /craindre/i,
    /redouter/i,
    /douter/i
  ],
  TEMPORAL: [
    /avant\s+que/i,
    /jusqu['']à\s+ce\s+que/i
  ],
  IMPERSONAL: [
    /peu\s+s['']en\s+faut/i,
    /il\s+s['']en\s+faut/i
  ]
};

// Extract trigger pattern from text
function extractTrigger(text) {
  const normalizedText = normalizeText(text.toLowerCase());
  
  for (const [category, patterns] of Object.entries(TRIGGER_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(normalizedText)) {
        return {
          category,
          pattern: pattern.source
        };
      }
    }
  }
  return null;
}

// Calculate text similarity considering trigger patterns
function calculateSimilarity(text1, text2) {
  // Normalize texts
  const norm1 = normalizeText(text1.toLowerCase());
  const norm2 = normalizeText(text2.toLowerCase());

  // Get words (excluding common words)
  const commonWords = new Set(['le', 'la', 'les', 'un', 'une', 'des', 'de', 'du', 'à', 'au', 'aux']);
  const words1 = norm1.split(/\s+/).filter(w => !commonWords.has(w));
  const words2 = norm2.split(/\s+/).filter(w => !commonWords.has(w));

  // Check for shared trigger patterns
  const trigger1 = extractTrigger(norm1);
  const trigger2 = extractTrigger(norm2);
  const triggerBonus = (trigger1 && trigger2 && trigger1.category === trigger2.category) ? 0.3 : 0;

  // Calculate word similarity
  const intersection = words1.filter(word => words2.some(w2 => w2.includes(word) || word.includes(w2)));
  const union = [...new Set([...words1, ...words2])];
  
  const baseSimilarity = intersection.length / union.length;
  
  // Add trigger bonus but cap at 0.95
  return Math.min(baseSimilarity + triggerBonus, 0.95);
}

// Binary classifier for Training Data mode
export const classifyWithBinaryClassifier = (text, trainingData) => {
  if (!text) {
    throw new Error('No text provided');
  }

  if (!trainingData || !Array.isArray(trainingData) || trainingData.length === 0) {
    throw new Error('No training data available');
  }

  // Extract trigger from input text
  const inputTrigger = extractTrigger(text);

  // Find similar examples
  const similarExamples = trainingData
    .map(example => ({
      ...example,
      similarity: calculateSimilarity(text, example.text)
    }))
    .filter(example => {
      // Lower threshold for examples with matching trigger patterns
      const threshold = inputTrigger && extractTrigger(example.text)?.category === inputTrigger.category
        ? 0.3  // Lower threshold for matching triggers
        : 0.4; // Higher threshold for non-matching triggers
      
      return example.similarity > threshold;
    })
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 5); // Keep top 5 matches

  if (similarExamples.length === 0) {
    return {
      matches: [],
      confidence: 0.5,
      classification: 'UNCERTAIN',
      message: 'No similar examples found in training data'
    };
  }

  // Weight examples by similarity
  const weightedCounts = similarExamples.reduce((acc, example) => {
    const weight = example.similarity;
    acc[example.classification] = (acc[example.classification] || 0) + weight;
    return acc;
  }, {});

  // Calculate confidence and get majority classification
  const totalWeight = Object.values(weightedCounts).reduce((a, b) => a + b, 0);
  const maxWeight = Math.max(...Object.values(weightedCounts));
  const confidence = maxWeight / totalWeight;

  const classification = Object.entries(weightedCounts)
    .reduce((a, b) => weightedCounts[a[0]] > weightedCounts[b[0]] ? a : b)[0];

  // Generate detailed message
  const message = `Found ${similarExamples.length} similar example${similarExamples.length > 1 ? 's' : ''} ` +
    `(best match: ${Math.round(similarExamples[0].similarity * 100)}% similar)`;

  return {
    matches: similarExamples,
    confidence,
    classification,
    message
  };
};

// Main classification function that handles both modes
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

// Export additional utilities for SVM
export { trainSVMModel } from './svmClassifier';
