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

  // Normalize classification to uppercase and handle both formats
  let classification = example.classification;
  if (typeof example.has_expletive_ne === 'boolean') {
    classification = example.has_expletive_ne ? 'EXPLETIVE' : 'LOGICAL';
  } else if (classification) {
    classification = classification.toUpperCase();
  } else {
    throw new Error('Invalid classification');
  }

  if (!['EXPLETIVE', 'LOGICAL'].includes(classification)) {
    throw new Error('Invalid classification value');
  }

  return {
    ...example,
    text: normalizeText(example.text),
    classification: classification,
    trigger: example.trigger || 'unknown',
    added: example.added || new Date().toISOString()
  };
}

// Handle file upload
export function handleFileUpload(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }

    if (file.type !== 'application/json') {
      reject(new Error('File must be JSON format'));
      return;
    }

    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const jsonData = event.target.result;
        const data = JSON.parse(jsonData);

        // Handle both array and object formats
        const examples = Array.isArray(data) ? data : data.examples;
        
        if (!Array.isArray(examples)) {
          throw new Error('Invalid JSON format: missing examples array');
        }

        // Process and validate each example
        const processedData = examples.map((example) => {
          // Handle both old and new formats
          const normalizedExample = {
            text: example.text,
            classification: example.has_expletive_ne !== undefined 
              ? (example.has_expletive_ne ? 'EXPLETIVE' : 'LOGICAL')
              : example.classification,
            trigger: example.trigger || 'unknown',
            added: new Date().toISOString()
          };

          return validateExample(normalizedExample);
        });

        resolve({ processedData });
      } catch (error) {
        reject(new Error(`Failed to process file: ${error.message}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
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
  return JSON.stringify({
    examples: data.map(example => ({
      text: example.text,
      has_expletive_ne: example.classification === 'EXPLETIVE',
      trigger: example.trigger || 'unknown',
      classification: example.classification.toLowerCase()
    }))
  }, null, 2);
}

// Import training data
export function importTrainingData(jsonData) {
  try {
    const data = JSON.parse(jsonData);
    
    // Handle both array and object with examples array
    const examples = Array.isArray(data) ? data : data.examples;
    
    if (!Array.isArray(examples)) {
      throw new Error('Invalid data format');
    }

    // Validate all examples
    return examples.map(example => {
      // Handle both old and new formats
      const normalizedExample = {
        text: example.text,
        classification: example.has_expletive_ne !== undefined 
          ? (example.has_expletive_ne ? 'EXPLETIVE' : 'LOGICAL')
          : example.classification,
        trigger: example.trigger || 'unknown',
        added: new Date().toISOString()
      };

      return validateExample(normalizedExample);
    });
  } catch (error) {
    throw new Error(`Failed to import training data: ${error.message}`);
  }
}
