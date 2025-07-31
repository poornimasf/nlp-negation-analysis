import { normalizeText } from './textProcessing';
import { classifyWithSVM, trainSVMModel } from './svmClassifier';

// CroissantLLM classification for Hybrid mode
export const classifyExpletive = async (text) => {
  // ... [Previous CroissantLLM implementation remains unchanged]
};

// Common trigger patterns
const TRIGGER_PATTERNS = {
  // ... [Previous trigger patterns remain unchanged]
};

// Extract trigger pattern from text
function extractTrigger(text) {
  // ... [Previous extractTrigger implementation remains unchanged]
}

// Calculate text similarity considering trigger patterns
function calculateSimilarity(text1, text2) {
  // ... [Previous calculateSimilarity implementation remains unchanged]
}

// Binary classifier for Training Data mode
export const classifyWithBinaryClassifier = (text, trainingData) => {
  // ... [Previous binary classifier implementation remains unchanged]
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
