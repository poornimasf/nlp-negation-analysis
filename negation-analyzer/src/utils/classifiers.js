// CroissantLLM classification for Hybrid mode
export const classifyExpletive = async (text) => {
  try {
    if (!text) {
      throw new Error('No text provided');
    }

    if (!process.env.REACT_APP_HF_TOKEN) {
      throw new Error('Missing HF_TOKEN');
    }

    const response = await fetch(
      'https://frwk8k50dyslyiwo.us-east-1.aws.endpoints.huggingface.cloud',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.REACT_APP_HF_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: `Analyze this French sentence where a ne has been removed. Consider both possibilities equally: ${text}`,
          parameters: {
            max_new_tokens: 256,
            temperature: 0.1,
            top_p: 0.95,
            return_full_text: false
          }
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
    return result.generated_text || 'No analysis available';
  } catch (error) {
    console.error('CroissantLLM Error:', error);
    throw error;
  }
};

// Binary classifier for Training Data mode
export const classifyWithBinaryClassifier = (text, trainingData) => {
  if (!text) {
    throw new Error('No text provided');
  }

  if (!trainingData || !Array.isArray(trainingData) || trainingData.length === 0) {
    throw new Error('No training data available');
  }

  // Find similar examples using text similarity
  const similarExamples = trainingData.filter(example => {
    const similarity = calculateSimilarity(text.toLowerCase(), example.text.toLowerCase());
    return similarity > 0.7; // Threshold for similarity
  });

  if (similarExamples.length === 0) {
    return {
      matches: [],
      confidence: 0.5,
      classification: 'UNCERTAIN'
    };
  }

  // Count classifications
  const counts = similarExamples.reduce((acc, example) => {
    acc[example.classification] = (acc[example.classification] || 0) + 1;
    return acc;
  }, {});

  // Calculate confidence
  const total = similarExamples.length;
  const maxCount = Math.max(...Object.values(counts));
  const confidence = maxCount / total;

  // Get majority classification
  const classification = Object.entries(counts).reduce((a, b) => 
    counts[a] > counts[b] ? a : b
  )[0];

  return {
    matches: similarExamples.slice(0, 5), // Return top 5 matches
    confidence,
    classification
  };
};

// Calculate text similarity for training data matching
const calculateSimilarity = (text1, text2) => {
  const words1 = text1.split(/\s+/);
  const words2 = text2.split(/\s+/);
  
  const intersection = words1.filter(word => words2.includes(word));
  const union = [...new Set([...words1, ...words2])];
  
  return intersection.length / union.length;
};
