import FeatureExtractor from './featureExtraction';

class DualModeClassifier {
  constructor() {
    this.featureExtractor = new FeatureExtractor();
    this.models = {
      sentence: null,
      paragraph: null
    };
    this.loadModels();
  }

  // Load pre-trained models (simplified for production)
  loadModels() {
    // Simplified model weights from training results
    this.models.sentence = {
      weights: {
        trigger_strength: -47.087,
        register_score: 64.928,
        semantic_field: 31.165,
        subjunctive_present: -69.134,
        emotional_context: 11.788,
        temporal_context: -12.305,
        logical_context: -18.513,
        clause_complexity: 16.006,
        register: 14.859,
        discourse_markers: -6.560
      },
      bias: 0.5
    };

    this.models.paragraph = {
      weights: {
        trigger_strength: -40.817,
        register_score: 206.756,
        semantic_field: 233.933,
        subjunctive_present: -101.703,
        emotional_context: 88.218,
        temporal_context: 288.349,
        logical_context: 24.725,
        clause_complexity: 130.664,
        register: 394.135,
        coherence_markers: 230.839,
        context_depth: -266.133,
        discourse_complexity: -70.965
      },
      bias: 0.5
    };
  }

  // Classify text with specified mode
  classify(text, mode = 'auto') {
    // Auto-detect mode based on text characteristics
    if (mode === 'auto') {
      mode = this.detectMode(text);
    }

    // Extract features
    const features = this.featureExtractor.extractFeatures(text, mode);
    
    // Get model prediction
    const model = this.models[mode];
    const probability = this.calculateProbability(features, model);
    
    const hasExpletive = probability > 0.5;
    const confidence = hasExpletive ? probability : 1 - probability;

    return {
      hasExpletive,
      probability,
      confidence,
      mode,
      features,
      reasoning: this.generateReasoning(features, probability, mode)
    };
  }

  // Auto-detect appropriate mode
  detectMode(text) {
    const sentenceCount = (text.match(/[.!?]+/g) || []).length;
    const wordCount = text.split(/\s+/).length;
    
    // Use paragraph mode for longer, multi-sentence texts
    if (sentenceCount > 1 || wordCount > 50) {
      return 'paragraph';
    }
    return 'sentence';
  }

  // Calculate probability using simplified logistic regression
  calculateProbability(features, model) {
    let score = model.bias;
    
    // Apply weights to features
    for (const [feature, weight] of Object.entries(model.weights)) {
      const value = this.getFeatureValue(features[feature]);
      score += value * weight * 0.01; // Scale down weights
    }
    
    // Sigmoid activation
    return 1 / (1 + Math.exp(-score));
  }

  // Convert feature values to numbers
  getFeatureValue(value) {
    if (typeof value === 'boolean') return value ? 1 : 0;
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      // Convert categorical to numerical
      const mappings = {
        // Trigger types
        'sen_faut_que': 5, 'peur_que': 4, 'avant_que': 3, 
        'avant_de': 2, 'moins_plus': 1, 'unknown': 0,
        // Subjunctive types
        'irregular': 3, 'regular_ir': 2, 'regular_er': 1, 'none': 0,
        // Semantic fields
        'emotional': 3, 'temporal': 2, 'logical': 1, 'neutral': 0,
        // Registers
        'literary': 4, 'formal': 3, 'conversational': 2, 'technical': 1,
        // Speaker stance
        'assertive': 3, 'polite': 2, 'tentative': 1,
        // Discourse complexity
        'complex': 3, 'medium': 2, 'simple': 1
      };
      return mappings[value] || 0;
    }
    return 0;
  }

  // Generate explanation for prediction
  generateReasoning(features, probability, mode) {
    const reasons = [];
    const prediction = probability > 0.5 ? 'EXPLETIVE' : 'NON-EXPLETIVE';
    
    // Trigger analysis
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
    
    // Subjunctive analysis
    if (features.subjunctive_present) {
      reasons.push(`Subjunctive detected (${features.subjunctive_type})`);
    }
    
    // Semantic context
    if (features.semantic_field !== 'neutral') {
      reasons.push(`${features.semantic_field} semantic context`);
    }
    
    // Mode-specific features
    if (mode === 'paragraph') {
      if (features.coherence_markers > 0) {
        reasons.push(`${features.coherence_markers} coherence markers`);
      }
      if (features.discourse_complexity === 'complex') {
        reasons.push(`Complex discourse structure`);
      }
    }
    
    return `${prediction} (${(probability * 100).toFixed(1)}%): ${reasons.join(', ')}`;
  }

  // Get feature analysis for display
  getFeatureAnalysis(features, mode) {
    const analysis = {
      syntactic: {
        trigger: `${features.trigger_type} (${(features.trigger_strength * 100).toFixed(1)}% rate)`,
        subjunctive: features.subjunctive_present ? `Yes (${features.subjunctive_type})` : 'No',
        complexity: `${features.clause_complexity} clauses`
      },
      semantic: {
        field: features.semantic_field,
        emotional: features.emotional_context ? 'Yes' : 'No',
        temporal: features.temporal_context ? 'Yes' : 'No',
        logical: features.logical_context ? 'Yes' : 'No'
      },
      discourse: {
        register: `${features.register} (${features.register_score.toFixed(2)}x correlation)`,
        stance: features.speaker_stance,
        markers: features.discourse_markers
      }
    };

    // Add paragraph-specific features
    if (mode === 'paragraph') {
      analysis.discourse.coherence = features.coherence_markers;
      analysis.discourse.context_depth = features.context_depth;
      analysis.discourse.complexity = features.discourse_complexity;
      analysis.discourse.sentences = features.sentence_count;
    }

    return analysis;
  }
}

export default DualModeClassifier;
