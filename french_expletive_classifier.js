const FeatureExtractor = require('./feature_extraction');

class FrenchExpletiveClassifier {
  constructor(mode = 'sentence') {
    this.mode = mode;
    this.featureExtractor = new FeatureExtractor();
    this.model = null;
    this.featureNames = [];
    this.trainingStats = null;
  }

  // Extract features based on mode
  extractFeatures(text) {
    const features = {};
    
    // Syntactic features (both modes)
    Object.assign(features, this.featureExtractor.extractSyntacticFeatures(text));
    
    // Semantic features (both modes)
    Object.assign(features, this.featureExtractor.extractSemanticFeatures(text));
    
    // Discourse features (mode-specific)
    if (this.mode === 'sentence') {
      Object.assign(features, this.featureExtractor.extractSentenceDiscourseFeatures(text));
    } else {
      Object.assign(features, this.featureExtractor.extractParagraphDiscourseFeatures(text));
    }
    
    return features;
  }

  // Convert features to numerical array
  featuresToArray(features) {
    if (this.featureNames.length === 0) {
      this.featureNames = Object.keys(features);
    }
    
    return this.featureNames.map(name => {
      const value = features[name];
      
      // Convert different types to numbers
      if (typeof value === 'boolean') return value ? 1 : 0;
      if (typeof value === 'number') return value;
      if (typeof value === 'string') {
        // Convert categorical to numerical
        return this.categoricalToNumber(name, value);
      }
      return 0;
    });
  }

  // Convert categorical features to numbers
  categoricalToNumber(featureName, value) {
    const mappings = {
      trigger_type: {
        'sen_faut_que': 5, 'peur_que': 4, 'avant_que': 3, 
        'avant_de': 2, 'moins_plus': 1, 'unknown': 0
      },
      subjunctive_type: {
        'irregular': 3, 'regular_ir': 2, 'regular_er': 1, 'none': 0
      },
      semantic_field: {
        'emotional': 3, 'temporal': 2, 'logical': 1, 'neutral': 0
      },
      register: {
        'literary': 4, 'formal': 3, 'conversational': 2, 'technical': 1, 'neutral': 0
      },
      speaker_stance: {
        'assertive': 3, 'polite': 2, 'tentative': 1, 'neutral': 0
      },
      discourse_complexity: {
        'complex': 3, 'medium': 2, 'simple': 1
      }
    };
    
    return mappings[featureName]?.[value] || 0;
  }

  // Simple logistic regression implementation
  train(trainingData) {
    console.log(`Training ${this.mode} mode classifier on ${trainingData.length} examples...`);
    
    // Extract features for all training examples
    const X = trainingData.map(example => {
      const text = this.mode === 'paragraph' ? 
        (example.paragraph || example.text) : example.text;
      const features = this.extractFeatures(text);
      return this.featuresToArray(features);
    });
    
    const y = trainingData.map(example => example.hasExpletive ? 1 : 0);
    
    // Simple logistic regression training
    this.model = this.trainLogisticRegression(X, y);
    
    // Calculate training statistics
    this.trainingStats = this.calculateTrainingStats(trainingData);
    
    console.log(`Training completed. Features: ${this.featureNames.length}`);
    console.log(`Training accuracy: ${this.trainingStats.accuracy.toFixed(3)}`);
  }

  // Simple logistic regression implementation
  trainLogisticRegression(X, y, learningRate = 0.01, iterations = 1000) {
    const numFeatures = X[0].length;
    let weights = new Array(numFeatures).fill(0);
    let bias = 0;
    
    for (let iter = 0; iter < iterations; iter++) {
      let totalLoss = 0;
      
      for (let i = 0; i < X.length; i++) {
        // Forward pass
        const z = X[i].reduce((sum, x, j) => sum + x * weights[j], 0) + bias;
        const prediction = this.sigmoid(z);
        
        // Calculate loss
        const loss = y[i] * Math.log(prediction + 1e-15) + 
                    (1 - y[i]) * Math.log(1 - prediction + 1e-15);
        totalLoss -= loss;
        
        // Backward pass
        const error = prediction - y[i];
        
        // Update weights
        for (let j = 0; j < numFeatures; j++) {
          weights[j] -= learningRate * error * X[i][j];
        }
        bias -= learningRate * error;
      }
      
      // Print progress every 100 iterations
      if (iter % 100 === 0) {
        console.log(`Iteration ${iter}, Loss: ${(totalLoss / X.length).toFixed(4)}`);
      }
    }
    
    return { weights, bias };
  }

  // Sigmoid activation function
  sigmoid(z) {
    return 1 / (1 + Math.exp(-Math.max(-250, Math.min(250, z))));
  }

  // Make prediction
  predict(text) {
    if (!this.model) {
      throw new Error('Model not trained. Call train() first.');
    }
    
    const features = this.extractFeatures(text);
    const featureArray = this.featuresToArray(features);
    
    // Calculate prediction
    const z = featureArray.reduce((sum, x, i) => 
      sum + x * this.model.weights[i], 0) + this.model.bias;
    const probability = this.sigmoid(z);
    
    const hasExpletive = probability > 0.5;
    const confidence = hasExpletive ? probability : 1 - probability;
    
    return {
      hasExpletive,
      probability,
      confidence,
      features,
      reasoning: this.generateReasoning(features, probability)
    };
  }

  // Generate explanation for prediction
  generateReasoning(features, probability) {
    const reasons = [];
    
    // Trigger strength
    if (features.trigger_strength > 0.6) {
      reasons.push(`Strong trigger (${features.trigger_type}: ${(features.trigger_strength * 100).toFixed(1)}% expletive rate)`);
    } else if (features.trigger_strength < 0.4) {
      reasons.push(`Weak trigger (${features.trigger_type}: ${(features.trigger_strength * 100).toFixed(1)}% expletive rate)`);
    }
    
    // Register effects
    if (features.register_score > 1.5) {
      reasons.push(`${features.register} register favors expletive (${features.register_score.toFixed(2)}x correlation)`);
    } else if (features.register_score < 0.8) {
      reasons.push(`${features.register} register disfavors expletive (${features.register_score.toFixed(2)}x correlation)`);
    }
    
    // Subjunctive presence
    if (features.subjunctive_present) {
      reasons.push(`Subjunctive detected (${features.subjunctive_type})`);
    }
    
    // Semantic context
    if (features.semantic_field !== 'neutral') {
      reasons.push(`${features.semantic_field} semantic context`);
    }
    
    // Discourse complexity (paragraph mode)
    if (this.mode === 'paragraph' && features.discourse_complexity === 'complex') {
      reasons.push(`Complex discourse structure (${features.coherence_markers} coherence markers)`);
    }
    
    const prediction = probability > 0.5 ? 'EXPLETIVE' : 'NON-EXPLETIVE';
    return `${prediction} (${(probability * 100).toFixed(1)}%): ${reasons.join(', ')}`;
  }

  // Calculate training statistics
  calculateTrainingStats(trainingData) {
    let correct = 0;
    const predictions = [];
    
    trainingData.forEach(example => {
      const text = this.mode === 'paragraph' ? 
        (example.paragraph || example.text) : example.text;
      const prediction = this.predict(text);
      predictions.push(prediction);
      
      if (prediction.hasExpletive === example.hasExpletive) {
        correct++;
      }
    });
    
    return {
      accuracy: correct / trainingData.length,
      totalExamples: trainingData.length,
      correctPredictions: correct
    };
  }

  // Evaluate on test data
  evaluate(testData) {
    let correct = 0;
    let confusionMatrix = { tp: 0, fp: 0, tn: 0, fn: 0 };
    const predictions = [];
    
    testData.forEach(example => {
      const text = this.mode === 'paragraph' ? 
        (example.paragraph || example.text) : example.text;
      const prediction = this.predict(text);
      const actual = example.hasExpletive;
      
      predictions.push({
        text: text.substring(0, 100) + '...',
        actual,
        predicted: prediction.hasExpletive,
        confidence: prediction.confidence,
        reasoning: prediction.reasoning
      });
      
      if (prediction.hasExpletive === actual) {
        correct++;
      }
      
      // Update confusion matrix
      if (actual && prediction.hasExpletive) confusionMatrix.tp++;
      else if (!actual && prediction.hasExpletive) confusionMatrix.fp++;
      else if (!actual && !prediction.hasExpletive) confusionMatrix.tn++;
      else confusionMatrix.fn++;
    });
    
    const accuracy = correct / testData.length;
    const precision = confusionMatrix.tp / (confusionMatrix.tp + confusionMatrix.fp) || 0;
    const recall = confusionMatrix.tp / (confusionMatrix.tp + confusionMatrix.fn) || 0;
    const f1 = precision + recall > 0 ? 2 * (precision * recall) / (precision + recall) : 0;
    
    return {
      accuracy,
      precision,
      recall,
      f1,
      confusionMatrix,
      predictions: predictions.slice(0, 10) // Show first 10 predictions
    };
  }

  // Save model to file
  saveModel(filepath) {
    const modelData = {
      mode: this.mode,
      model: this.model,
      featureNames: this.featureNames,
      trainingStats: this.trainingStats
    };
    
    require('fs').writeFileSync(filepath, JSON.stringify(modelData, null, 2));
    console.log(`Model saved to ${filepath}`);
  }

  // Load model from file
  loadModel(filepath) {
    const modelData = JSON.parse(require('fs').readFileSync(filepath, 'utf8'));
    
    this.mode = modelData.mode;
    this.model = modelData.model;
    this.featureNames = modelData.featureNames;
    this.trainingStats = modelData.trainingStats;
    
    console.log(`Model loaded from ${filepath}`);
  }
}

module.exports = FrenchExpletiveClassifier;
