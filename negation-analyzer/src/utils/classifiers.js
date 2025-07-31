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
Analysis: The verb "craindre" triggers expletive ne. There is no actual negation intended.
Classification: EXPLETIVE
Reasoning: The negation particle "ne" is used idiomatically with verbs of fear.
Conclusion: EXPLETIVE

Example 2 (Logical Negation):
Sentence: "Je ne veux pas qu'il parte."
Analysis: This sentence uses "ne ... pas" to directly negate the verb "vouloir". The negation is intentional and affects the meaning.
Classification: LOGICAL
Reasoning: The negative construction changes the speaker's intention and is semantically negative.
Conclusion: LOGICAL

Now analyze the following French sentence to determine whether the sentence previously contained **expletive negation** or **logical negation**:

"${text}"

Your task:
1. Determine if the sentence previously contained **expletive negation** (e.g., *Je crains qu'il ne vienne*) or **logical negation** (e.g., *Je ne veux pas*).
2. Analyze the **negation trigger(s)**, grammatical **structure**, and **context**.
3. Provide a final classification: \`EXPLETIVE\` or \`LOGICAL\`.

Respond in the following format: 
Analysis: [your detailed reasoning]
Classification: [EXPLETIVE or LOGICAL]
Reasoning: [explanation of the classification]
Conclusion: [EXPLETIVE or LOGICAL]`;

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
      const reasoningMatch = generatedText.match(/Reasoning:\s*(.*?)(?=Conclusion:|$)/s);
      const conclusionMatch = generatedText.match(/Conclusion:\s*(EXPLETIVE|LOGICAL)/i);
      
      return {
        analysis: analysisMatch ? analysisMatch[1].trim() : '',
        classification: (classificationMatch && classificationMatch[1]) ? 
          classificationMatch[1].toUpperCase() : 'UNCERTAIN',
        reasoning: reasoningMatch ? reasoningMatch[1].trim() : '',
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
      return classifyWithSVM(text, null, trainingData);
    case 'BINARY':
    default:
      return classifyWithBinaryClassifier(text, trainingData);
  }
};

// Export additional utilities for SVM
export { trainSVMModel } from './svmClassifier';
