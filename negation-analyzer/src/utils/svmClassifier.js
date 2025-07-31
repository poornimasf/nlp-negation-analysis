import { normalizeText } from './textProcessing';

// Feature extraction for SVM
function extractFeatures(text) {
  const normalizedText = normalizeText(text.toLowerCase());
  
  // Initialize feature vector
  const features = {
    // Trigger patterns
    hasFearTrigger: 0,
    hasTemporalTrigger: 0,
    hasImpersonalTrigger: 0,
    
    // Structural features
    hasSubjunctive: 0,
    hasNegationParticle: 0,
    hasSecondVerb: 0,
    
    // Contextual features
    wordCount: 0,
    hasQue: 0,
    hasConditional: 0
  };
  
  // Check for trigger patterns
  if (/peur\s+que|craindre|redouter|douter/i.test(normalizedText)) {
    features.hasFearTrigger = 1;
  }
  if (/avant\s+que|jusqu['']à\s+ce\s+que/i.test(normalizedText)) {
    features.hasTemporalTrigger = 1;
  }
  if (/peu\s+s['']en\s+faut|il\s+s['']en\s+faut/i.test(normalizedText)) {
    features.hasImpersonalTrigger = 1;
  }
  
  // Check for structural patterns
  features.hasSubjunctive = /(?:que|qu[''])\s+\w+(?:e|es|ent)\b/i.test(normalizedText);
  features.hasNegationParticle = /\bne\b/i.test(normalizedText);
  features.hasSecondVerb = /(?:que|qu[''])\s+\w+\s+\w+(?:e|es|ent)\b/i.test(normalizedText);
  
  // Count words
  features.wordCount = normalizedText.split(/\s+/).length;
  
  // Check for que/qu'
  features.hasQue = /\b(?:que|qu[''])\b/i.test(normalizedText) ? 1 : 0;
  
  // Check for conditional
  features.hasConditional = /\b(?:si|pourvu\s+que|à\s+condition\s+que)\b/i.test(normalizedText) ? 1 : 0;
  
  return features;
}

// Convert features object to vector
function featuresToVector(features) {
  return Object.values(features);
}

// Linear kernel implementation
function linearKernel(x1, x2) {
  return x1.reduce((sum, val, i) => sum + val * x2[i], 0);
}

// SVM prediction with linear kernel
function svmPredict(features, supportVectors, weights, bias) {
  const featureVector = featuresToVector(features);
  
  // Calculate decision function
  const decision = supportVectors.reduce((sum, sv, i) => {
    return sum + weights[i] * linearKernel(featureVector, sv);
  }, 0) + bias;
  
  // Calculate confidence based on distance from decision boundary
  const confidence = Math.min(Math.abs(decision) / 2, 0.95);
  
  return {
    classification: decision > 0 ? 'EXPLETIVE' : 'LOGICAL',
    confidence,
    decisionValue: decision
  };
}

// Train SVM model
export function trainSVMModel(trainingData) {
  // Extract features from all training examples
  const features = trainingData.map(example => ({
    features: extractFeatures(example.text),
    label: example.classification === 'EXPLETIVE' ? 1 : -1
  }));
  
  // Simple implementation of linear SVM training
  // In practice, you might want to use a library like libsvm-js
  const supportVectors = features.map(f => featuresToVector(f.features));
  const labels = features.map(f => f.label);
  
  // Calculate weights and bias (simplified version)
  const weights = supportVectors.map((_, i) => {
    return labels[i] / supportVectors.length;
  });
  
  const bias = 0; // In practice, this would be optimized
  
  return {
    supportVectors,
    weights,
    bias
  };
}

// Main classification function for SVM mode
export function classifyWithSVM(text, model, trainingData) {
  if (!text) {
    throw new Error('No text provided');
  }

  if (!trainingData || !Array.isArray(trainingData) || trainingData.length === 0) {
    throw new Error('No training data available');
  }

  if (!model) {
    // Train model if not provided
    model = trainSVMModel(trainingData);
  }

  const features = extractFeatures(text);
  const result = svmPredict(features, model.supportVectors, model.weights, model.bias);

  // Find similar examples for explanation
  const similarExamples = trainingData
    .filter(example => example.classification === result.classification)
    .slice(0, 3);

  return {
    ...result,
    matches: similarExamples,
    message: `Classification based on ${model.supportVectors.length} support vectors. ` +
      `Found ${similarExamples.length} similar example${similarExamples.length !== 1 ? 's' : ''}.`
  };
}
