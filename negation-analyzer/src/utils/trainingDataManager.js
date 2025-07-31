import { normalizeText } from './textProcessing';
import { trainSVMModel } from './svmClassifier';

// Cache for trained models
let modelCache = {
  svm: null,
  lastUpdate: null
};

// Validate training example format
export function validateExample(example) {
  if (!example || typeof example !== 'object') {
    throw new Error('Invalid example format');
  }

  if (!example.text || typeof example.text !== 'string') {
    throw new Error('Example must include text');
  }

  if (!example.classification || 
      !['EXPLETIVE', 'LOGICAL'].includes(example.classification)) {
    throw new Error('Invalid classification');
  }

  return {
    ...example,
    text: normalizeText(example.text),
    added: example.added || new Date().toISOString()
  };
}

// Add new training example
export function addTrainingExample(example, existingData = []) {
  const validatedExample = validateExample(example);
  
  // Check for duplicates
  const isDuplicate = existingData.some(
    ex => normalizeText(ex.text) === validatedExample.text
  );
  
  if (isDuplicate) {
    throw new Error('Duplicate example');
  }

  // Reset model cache when new data is added
  modelCache = {
    svm: null,
    lastUpdate: null
  };

  return [...existingData, validatedExample];
}

// Remove training example
export function removeTrainingExample(index, existingData = []) {
  if (index < 0 || index >= existingData.length) {
    throw new Error('Invalid index');
  }

  // Reset model cache when data is removed
  modelCache = {
    svm: null,
    lastUpdate: null
  };

  return existingData.filter((_, i) => i !== index);
}

// Get or train SVM model
export function getSVMModel(trainingData) {
  // Check if we have a cached model and data hasn't changed
  const dataHash = JSON.stringify(trainingData);
  if (modelCache.svm && modelCache.lastUpdate === dataHash) {
    return modelCache.svm;
  }

  // Train new model
  const model = trainSVMModel(trainingData);

  // Update cache
  modelCache = {
    svm: model,
    lastUpdate: dataHash
  };

  return model;
}

// Export training data
export function exportTrainingData(data) {
  return JSON.stringify(data, null, 2);
}

// Import training data
export function importTrainingData(jsonData) {
  try {
    const data = JSON.parse(jsonData);
    if (!Array.isArray(data)) {
      throw new Error('Invalid data format');
    }

    // Validate all examples
    return data.map(example => validateExample(example));
  } catch (error) {
    throw new Error(`Failed to import training data: ${error.message}`);
  }
}
