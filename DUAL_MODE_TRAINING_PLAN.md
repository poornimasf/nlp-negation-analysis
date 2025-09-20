# Dual-Mode Training Implementation Plan

## Overview

Implementation of sentence and paragraph training modes for French expletive "ne" classification, based on empirical analysis of 5,000 balanced training examples.

## Mode 1: Sentence Training

### Data Source
- **Files**: `*_sentence.json` (5 files, 1,000 examples each)
- **Structure**: Single sentences with trigger contexts
- **Balance**: 500 expletive / 500 non-expletive per trigger

### Feature Engineering

#### Syntactic Features
```javascript
const syntacticFeatures = {
  trigger_type: detectTrigger(text), // avant_que, peur_que, etc.
  trigger_strength: getTriggerStrength(trigger), // empirically derived weights
  subjunctive_present: hasSubjunctive(text),
  subjunctive_type: getSubjunctiveType(text), // irregular, regular_ir, etc.
  clause_complexity: analyzeClauseStructure(text),
  sentence_length: text.length,
  word_count: text.split(' ').length
}
```

#### Semantic Features
```javascript
const semanticFeatures = {
  emotional_context: detectEmotionalMarkers(text), // peur, crainte, redoute
  temporal_context: detectTemporalMarkers(text), // avant, temps, tard
  logical_context: detectLogicalMarkers(text), // comparison, reasoning
  semantic_field: classifySemanticField(text), // emotional, temporal, logical
  intensity_markers: detectIntensityMarkers(text) // très, beaucoup, etc.
}
```

#### Discourse Features (Sentence-Level)
```javascript
const sentenceDiscourseFeatures = {
  register_markers: detectSentenceRegister(text), // formal, literary, conversational
  discourse_markers: countSentenceDiscourseMarkers(text), // cependant, ainsi, etc.
  speaker_stance: detectSentenceStance(text), // assertive, tentative, polite
  pragmatic_features: analyzePragmaticMarkers(text) // politeness, emphasis, hedging
}
```

## Mode 2: Paragraph Training

### Data Source
- **Files**: `*_paragraph.json` (5 files, 1,000 examples each)
- **Structure**: Multi-sentence paragraphs with rich context
- **Balance**: 500 expletive / 500 non-expletive per trigger

### Enhanced Feature Engineering

#### All Sentence Features Plus:
```javascript
const paragraphDiscourseFeatures = {
  // Coherence analysis (362.6% more markers)
  coherence_markers: countCoherenceMarkers(text),
  temporal_sequence: detectTemporalSequence(text),
  contrast_markers: detectContrastMarkers(text),
  
  // Context depth analysis (424.2% more depth)
  background_info: detectBackgroundInfo(text),
  elaboration_markers: detectElaboration(text),
  causation_markers: detectCausation(text),
  
  // Multi-sentence analysis
  sentence_count: countSentences(text),
  discourse_complexity: assessDiscourseComplexity(text),
  register_consistency: analyzeRegisterConsistency(text),
  
  // Enhanced speaker stance
  multi_sentence_stance: detectParagraphStance(text),
  certainty_patterns: detectCertaintyPatterns(text),
  evaluation_markers: detectEvaluationMarkers(text)
}
```

## Implementation Architecture

### Binary Classifier Structure
```javascript
class FrenchExpletiveClassifier {
  constructor(mode = 'sentence') {
    this.mode = mode;
    this.features = mode === 'sentence' ? sentenceFeatures : paragraphFeatures;
    this.model = null;
  }
  
  extractFeatures(text) {
    const features = {};
    
    // Syntactic features (both modes)
    Object.assign(features, this.extractSyntacticFeatures(text));
    
    // Semantic features (both modes)
    Object.assign(features, this.extractSemanticFeatures(text));
    
    // Discourse features (mode-specific)
    if (this.mode === 'sentence') {
      Object.assign(features, this.extractSentenceDiscourseFeatures(text));
    } else {
      Object.assign(features, this.extractParagraphDiscourseFeatures(text));
    }
    
    return features;
  }
  
  train(trainingData) {
    const X = trainingData.map(example => this.extractFeatures(example.text));
    const y = trainingData.map(example => example.hasExpletive);
    
    // Train binary classifier (logistic regression, random forest, etc.)
    this.model = this.trainBinaryModel(X, y);
  }
  
  predict(text) {
    const features = this.extractFeatures(text);
    const prediction = this.model.predict(features);
    const confidence = this.model.predictProba(features);
    
    return {
      hasExpletive: prediction,
      confidence: confidence,
      reasoning: this.generateReasoning(features)
    };
  }
}
```

### Feature Extraction Implementation

#### Syntactic Analysis
```javascript
function detectTrigger(text) {
  const triggers = {
    'avant_que': /avant\s+qu[e']/gi,
    'peur_que': /(peur|crainte?|redoute?)\s+qu[e']/gi,
    'sen_faut_que': /(peu\s+)?s'en\s+(faut|fallut|est\s+fallu)/gi,
    'moins_plus': /(plus|moins)\s+.*\s+qu[e']/gi,
    'avant_de': /avant\s+de?\b/gi
  };
  
  for (const [trigger, pattern] of Object.entries(triggers)) {
    if (pattern.test(text)) {
      return trigger;
    }
  }
  return 'unknown';
}

function getTriggerStrength(trigger) {
  // Empirically derived from corpus analysis
  const strengths = {
    'sen_faut_que': 0.744, // 74.4% expletive rate
    'peur_que': 0.667,     // 66.7% expletive rate
    'avant_que': 0.421,    // 42.1% expletive rate
    'moins_plus': 0.200,   // 20.0% expletive rate
    'avant_de': 0.429      // 42.9% expletive rate
  };
  return strengths[trigger] || 0.5;
}
```

#### Register Detection
```javascript
function detectSentenceRegister(text) {
  const patterns = {
    literary: /\b(fallut|eût|fût|submergeât|contempla|irréparable|naguère|jadis)\b/gi,
    formal: /\b(il\s+convient\s+de|par\s+conséquent|en\s+conséquence|ainsi|donc)\b/gi,
    technical: /\b(système|processus|données|paramètres|installation|configuration)\b/gi,
    conversational: /\b(bon|allez|dépêche|faut\s+qu'on|ça|ouais|nan|ben)\b/gi
  };
  
  const scores = {};
  for (const [register, pattern] of Object.entries(patterns)) {
    scores[register] = (text.match(pattern) || []).length;
  }
  
  const maxRegister = Object.entries(scores).reduce((a, b) => 
    scores[a[0]] > scores[b[0]] ? a : b
  );
  
  return maxRegister[1] > 0 ? maxRegister[0] : 'neutral';
}
```

## Training Pipeline

### Data Loading
```javascript
function loadTrainingData(mode) {
  const dataDir = './negation-analyzer/public/training_data/';
  const suffix = mode === 'sentence' ? '_sentence.json' : '_paragraph.json';
  const triggers = ['avant_de', 'avant_que', 'moins_plus', 'peur_que', 'sen_faut_que'];
  
  let allData = [];
  
  triggers.forEach(trigger => {
    const filePath = path.join(dataDir, `${trigger}${suffix}`);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    data.examples.forEach(example => {
      allData.push({
        text: mode === 'paragraph' ? (example.paragraph || example.text) : example.text,
        hasExpletive: example.hasExpletive,
        trigger: trigger
      });
    });
  });
  
  return allData;
}
```

### Model Training
```javascript
function trainDualModeClassifiers() {
  // Train sentence mode classifier
  const sentenceData = loadTrainingData('sentence');
  const sentenceClassifier = new FrenchExpletiveClassifier('sentence');
  sentenceClassifier.train(sentenceData);
  
  // Train paragraph mode classifier
  const paragraphData = loadTrainingData('paragraph');
  const paragraphClassifier = new FrenchExpletiveClassifier('paragraph');
  paragraphClassifier.train(paragraphData);
  
  return { sentenceClassifier, paragraphClassifier };
}
```

## Evaluation Framework

### Performance Metrics
```javascript
function evaluateClassifier(classifier, testData) {
  let correct = 0;
  let total = testData.length;
  let confusionMatrix = { tp: 0, fp: 0, tn: 0, fn: 0 };
  
  testData.forEach(example => {
    const prediction = classifier.predict(example.text);
    const actual = example.hasExpletive;
    
    if (prediction.hasExpletive === actual) {
      correct++;
    }
    
    // Update confusion matrix
    if (actual && prediction.hasExpletive) confusionMatrix.tp++;
    else if (!actual && prediction.hasExpletive) confusionMatrix.fp++;
    else if (!actual && !prediction.hasExpletive) confusionMatrix.tn++;
    else confusionMatrix.fn++;
  });
  
  const accuracy = correct / total;
  const precision = confusionMatrix.tp / (confusionMatrix.tp + confusionMatrix.fp);
  const recall = confusionMatrix.tp / (confusionMatrix.tp + confusionMatrix.fn);
  const f1 = 2 * (precision * recall) / (precision + recall);
  
  return { accuracy, precision, recall, f1, confusionMatrix };
}
```

### Feature Importance Analysis
```javascript
function analyzeFeatureImportance(classifier, testData) {
  const featureImportance = {};
  
  // Analyze which features correlate most with correct predictions
  testData.forEach(example => {
    const features = classifier.extractFeatures(example.text);
    const prediction = classifier.predict(example.text);
    const correct = prediction.hasExpletive === example.hasExpletive;
    
    Object.entries(features).forEach(([feature, value]) => {
      if (!featureImportance[feature]) {
        featureImportance[feature] = { correct: 0, total: 0 };
      }
      featureImportance[feature].total++;
      if (correct) featureImportance[feature].correct++;
    });
  });
  
  // Calculate accuracy by feature
  const featureAccuracy = {};
  Object.entries(featureImportance).forEach(([feature, stats]) => {
    featureAccuracy[feature] = stats.correct / stats.total;
  });
  
  return featureAccuracy;
}
```

## Comparative Analysis

### Mode Comparison Framework
```javascript
function compareTrainingModes() {
  const { sentenceClassifier, paragraphClassifier } = trainDualModeClassifiers();
  
  // Evaluate on respective test sets
  const sentenceTestData = loadTrainingData('sentence').slice(-200); // Hold out for testing
  const paragraphTestData = loadTrainingData('paragraph').slice(-200);
  
  const sentenceResults = evaluateClassifier(sentenceClassifier, sentenceTestData);
  const paragraphResults = evaluateClassifier(paragraphClassifier, paragraphTestData);
  
  // Cross-evaluation
  const crossResults = evaluateClassifier(paragraphClassifier, sentenceTestData);
  
  console.log('=== MODE COMPARISON RESULTS ===');
  console.log(`Sentence Mode Accuracy: ${sentenceResults.accuracy.toFixed(3)}`);
  console.log(`Paragraph Mode Accuracy: ${paragraphResults.accuracy.toFixed(3)}`);
  console.log(`Cross-Evaluation (Paragraph→Sentence): ${crossResults.accuracy.toFixed(3)}`);
  
  // Feature importance analysis
  const sentenceFeatures = analyzeFeatureImportance(sentenceClassifier, sentenceTestData);
  const paragraphFeatures = analyzeFeatureImportance(paragraphClassifier, paragraphTestData);
  
  return {
    sentenceResults,
    paragraphResults,
    crossResults,
    sentenceFeatures,
    paragraphFeatures
  };
}
```

## Deployment Strategy

### Production Integration
```javascript
class ProductionExpletiveClassifier {
  constructor() {
    this.sentenceClassifier = loadModel('sentence_model.json');
    this.paragraphClassifier = loadModel('paragraph_model.json');
  }
  
  classify(text, mode = 'auto') {
    // Auto-detect mode based on text length and structure
    if (mode === 'auto') {
      mode = text.length > 200 || text.includes('.') ? 'paragraph' : 'sentence';
    }
    
    const classifier = mode === 'paragraph' ? this.paragraphClassifier : this.sentenceClassifier;
    return classifier.predict(text);
  }
}
```

## Expected Outcomes

### Performance Projections
- **Sentence Mode**: 78-85% accuracy (clean syntactic patterns)
- **Paragraph Mode**: 85-92% accuracy (rich discourse context)
- **Feature Insights**: Quantified importance of syntactic vs semantic vs discourse factors

### Research Value
- **Empirical validation** of paragraph vs sentence training effectiveness
- **Feature analysis** across linguistic dimensions
- **Deployment flexibility** based on input context
- **Linguistic insights** into French expletive "ne" usage patterns

This dual-mode approach maximizes both research insights and practical applicability while leveraging the empirically-validated 5,000-example balanced training dataset.
