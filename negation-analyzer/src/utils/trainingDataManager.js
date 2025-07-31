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

  // Handle both has_expletive_ne and classification fields
  let classification;
  if (typeof example.has_expletive_ne === 'boolean') {
    classification = example.has_expletive_ne ? 'EXPLETIVE' : 'LOGICAL';
  } else if (example.classification) {
    classification = example.classification.toUpperCase();
  } else {
    throw new Error('Must include either has_expletive_ne or classification');
  }

  if (!['EXPLETIVE', 'LOGICAL'].includes(classification)) {
    throw new Error('Invalid classification value');
  }

  // Validate trigger
  if (!example.trigger) {
    throw new Error('Must include trigger field');
  }

  const validTriggers = [
    "peur que", "avant que", "peu s'en faut", "logical",
    "craindre", "redouter", "douter", "éviter", "empêcher"
  ];

  if (!validTriggers.includes(example.trigger.toLowerCase())) {
    throw new Error('Invalid trigger value');
  }

  return {
    text: normalizeText(example.text),
    has_expletive_ne: classification === 'EXPLETIVE',
    trigger: example.trigger.toLowerCase(),
    classification: classification,
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

        // Handle different JSON formats
        let examples = [];
        
        if (Array.isArray(data)) {
          // Format: [{ example1 }, { example2 }]
          examples = data;
        } else if (data.examples && Array.isArray(data.examples)) {
          // Format: { "examples": [{ example1 }, { example2 }] }
          examples = data.examples;
        } else if (data.text && (data.has_expletive_ne !== undefined || data.classification)) {
          // Format: Single example object
          examples = [data];
        } else {
          throw new Error('Invalid JSON format. Expected either a single example, an array of examples, or an object with examples array');
        }

        // Process and validate each example
        const processedData = examples.map((example) => {
          try {
            return validateExample(example);
          } catch (error) {
            throw new Error(`Invalid example "${example.text}": ${error.message}`);
          }
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
      has_expletive_ne: example.has_expletive_ne,
      trigger: example.trigger,
      classification: example.classification.toLowerCase()
    }))
  }, null, 2);
}

// Import training data
export function importTrainingData(jsonData) {
  try {
    const data = JSON.parse(jsonData);
    
    // Handle different JSON formats
    let examples = [];
    
    if (Array.isArray(data)) {
      // Format: [{ example1 }, { example2 }]
      examples = data;
    } else if (data.examples && Array.isArray(data.examples)) {
      // Format: { "examples": [{ example1 }, { example2 }] }
      examples = data.examples;
    } else if (data.text && (data.has_expletive_ne !== undefined || data.classification)) {
      // Format: Single example object
      examples = [data];
    } else {
      throw new Error('Invalid JSON format. Expected either a single example, an array of examples, or an object with examples array');
    }

    // Validate all examples
    return examples.map(example => validateExample(example));
  } catch (error) {
    throw new Error(`Failed to import training data: ${error.message}`);
  }
}
