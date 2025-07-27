// Cross-validation and model reliability assessment utilities

/**
 * Performs k-fold cross-validation on the classifier
 * @param {Array} trainingData - Full training dataset
 * @param {number} k - Number of folds (default: 5)
 * @returns {Object} Validation results and metrics
 */
export const performCrossValidation = (trainingData, k = 5) => {
  if (!trainingData || trainingData.length === 0) {
    return {
      error: "No training data provided",
      recommendation: "Add training examples to enable validation"
    };
  }

  // Ensure k is not larger than the dataset
  k = Math.min(k, trainingData.length);
  
  // Shuffle the data
  const shuffledData = shuffleArray([...trainingData]);
  
  // Split into k folds
  const folds = createFolds(shuffledData, k);
  
  // Metrics for each fold
  const foldMetrics = [];
  
  // Cross-validate each fold
  for (let i = 0; i < k; i++) {
    // Create training and validation sets
    const validationSet = folds[i];
    const trainingSet = folds.filter((_, index) => index !== i)
                            .flat();
    
    // Validate the fold
    const foldResult = validateFold(trainingSet, validationSet);
    foldMetrics.push(foldResult);
  }

  // Calculate aggregate metrics
  const aggregateMetrics = calculateAggregateMetrics(foldMetrics);

  return {
    foldMetrics,
    aggregateMetrics,
    reliability: assessReliability(aggregateMetrics),
    recommendations: generateRecommendations(aggregateMetrics)
  };
};

/**
 * Validates a single fold against a training set
 * @param {Array} trainingSet - Training data for this fold
 * @param {Array} validationSet - Validation data for this fold
 * @returns {Object} Metrics for this fold
 */
const validateFold = (trainingSet, validationSet) => {
  const metrics = {
    total: validationSet.length,
    correct: 0,
    expletive: { true_positive: 0, false_positive: 0, true_negative: 0, false_negative: 0 },
    logical: { true_positive: 0, false_positive: 0, true_negative: 0, false_negative: 0 },
    confusionMatrix: new Map(),
    triggerAccuracy: new Map()
  };

  // Validate each example
  for (const example of validationSet) {
    const prediction = classifyWithTrainingSet(example.text, trainingSet);
    const actual = example.has_expletive_ne;
    
    // Update confusion matrix
    updateConfusionMatrix(metrics, prediction, actual);
    
    // Track trigger-specific accuracy
    updateTriggerAccuracy(metrics, example, prediction);
    
    // Track overall accuracy
    if (prediction.prediction === (actual ? "EXPLETIVE" : "LOGICAL")) {
      metrics.correct++;
    }
  }

  // Calculate additional metrics
  return {
    ...metrics,
    accuracy: metrics.correct / metrics.total,
    expletiveMetrics: calculateClassMetrics(metrics.expletive),
    logicalMetrics: calculateClassMetrics(metrics.logical),
    triggerReliability: calculateTriggerReliability(metrics.triggerAccuracy)
  };
};

/**
 * Calculate metrics for a specific class (expletive or logical)
 * @param {Object} classMetrics - Metrics for the class
 * @returns {Object} Precision, recall, and F1 score
 */
const calculateClassMetrics = (classMetrics) => {
  const precision = classMetrics.true_positive / 
    (classMetrics.true_positive + classMetrics.false_positive) || 0;
  
  const recall = classMetrics.true_positive / 
    (classMetrics.true_positive + classMetrics.false_negative) || 0;
  
  const f1 = 2 * (precision * recall) / (precision + recall) || 0;

  return { precision, recall, f1 };
};

/**
 * Calculate aggregate metrics across all folds
 * @param {Array} foldMetrics - Metrics from each fold
 * @returns {Object} Aggregate metrics
 */
const calculateAggregateMetrics = (foldMetrics) => {
  const aggregates = {
    accuracy: {
      mean: 0,
      stdDev: 0,
      min: 1,
      max: 0
    },
    expletive: {
      precision: { mean: 0, stdDev: 0 },
      recall: { mean: 0, stdDev: 0 },
      f1: { mean: 0, stdDev: 0 }
    },
    logical: {
      precision: { mean: 0, stdDev: 0 },
      recall: { mean: 0, stdDev: 0 },
      f1: { mean: 0, stdDev: 0 }
    },
    triggerReliability: new Map(),
    confidenceCalibration: {
      reliability: 0,
      sharpness: 0
    }
  };

  // Calculate means
  foldMetrics.forEach(metrics => {
    // Accuracy
    aggregates.accuracy.mean += metrics.accuracy;
    aggregates.accuracy.min = Math.min(aggregates.accuracy.min, metrics.accuracy);
    aggregates.accuracy.max = Math.max(aggregates.accuracy.max, metrics.accuracy);
    
    // Class metrics
    ['expletive', 'logical'].forEach(className => {
      ['precision', 'recall', 'f1'].forEach(metric => {
        aggregates[className][metric].mean += metrics[`${className}Metrics`][metric];
      });
    });
    
    // Trigger reliability
    metrics.triggerReliability.forEach((reliability, trigger) => {
      if (!aggregates.triggerReliability.has(trigger)) {
        aggregates.triggerReliability.set(trigger, { sum: 0, count: 0 });
      }
      const stats = aggregates.triggerReliability.get(trigger);
      stats.sum += reliability;
      stats.count++;
    });
  });

  // Calculate means and standard deviations
  const n = foldMetrics.length;
  aggregates.accuracy.mean /= n;
  
  ['expletive', 'logical'].forEach(className => {
    ['precision', 'recall', 'f1'].forEach(metric => {
      aggregates[className][metric].mean /= n;
    });
  });

  // Calculate standard deviations
  foldMetrics.forEach(metrics => {
    // Accuracy
    const accDiff = metrics.accuracy - aggregates.accuracy.mean;
    aggregates.accuracy.stdDev += accDiff * accDiff;
    
    // Class metrics
    ['expletive', 'logical'].forEach(className => {
      ['precision', 'recall', 'f1'].forEach(metric => {
        const diff = metrics[`${className}Metrics`][metric] - aggregates[className][metric].mean;
        aggregates[className][metric].stdDev += diff * diff;
      });
    });
  });

  // Finalize standard deviations
  aggregates.accuracy.stdDev = Math.sqrt(aggregates.accuracy.stdDev / n);
  
  ['expletive', 'logical'].forEach(className => {
    ['precision', 'recall', 'f1'].forEach(metric => {
      aggregates[className][metric].stdDev = 
        Math.sqrt(aggregates[className][metric].stdDev / n);
    });
  });

  // Finalize trigger reliability
  aggregates.triggerReliability.forEach((stats, trigger) => {
    stats.mean = stats.sum / stats.count;
  });

  // Calculate confidence calibration
  aggregates.confidenceCalibration = calculateConfidenceCalibration(foldMetrics);

  return aggregates;
};

/**
 * Calculate confidence calibration metrics
 * @param {Array} foldMetrics - Metrics from each fold
 * @returns {Object} Calibration metrics
 */
const calculateConfidenceCalibration = (foldMetrics) => {
  const confidenceBins = new Map();
  
  // Collect predictions by confidence level
  foldMetrics.forEach(fold => {
    fold.predictions?.forEach(pred => {
      const binKey = Math.floor(pred.confidence * 10) / 10;
      if (!confidenceBins.has(binKey)) {
        confidenceBins.set(binKey, { correct: 0, total: 0 });
      }
      const bin = confidenceBins.get(binKey);
      bin.total++;
      if (pred.correct) bin.correct++;
    });
  });

  // Calculate calibration metrics
  let reliability = 0;
  let sharpness = 0;
  let totalPredictions = 0;

  confidenceBins.forEach((bin, confidence) => {
    const accuracy = bin.correct / bin.total;
    const calibrationError = Math.abs(accuracy - confidence);
    reliability += calibrationError * bin.total;
    sharpness += Math.abs(confidence - 0.5) * bin.total;
    totalPredictions += bin.total;
  });

  return {
    reliability: 1 - (reliability / totalPredictions),
    sharpness: sharpness / totalPredictions,
    bins: Array.from(confidenceBins.entries()).map(([confidence, bin]) => ({
      confidence,
      accuracy: bin.correct / bin.total,
      samples: bin.total
    }))
  };
};

/**
 * Assess overall model reliability
 * @param {Object} metrics - Aggregate metrics
 * @returns {Object} Reliability assessment
 */
const assessReliability = (metrics) => {
  const assessment = {
    overall: "UNKNOWN",
    score: 0,
    factors: [],
    recommendations: []
  };

  // Score components
  const accuracyScore = scoreMetric(metrics.accuracy.mean, 0.7, 0.9);
  const consistencyScore = 1 - metrics.accuracy.stdDev;
  const calibrationScore = metrics.confidenceCalibration.reliability;
  
  // Calculate overall score
  assessment.score = (accuracyScore * 0.4 + consistencyScore * 0.3 + calibrationScore * 0.3);

  // Determine overall rating
  if (assessment.score >= 0.8) assessment.overall = "HIGH";
  else if (assessment.score >= 0.6) assessment.overall = "MODERATE";
  else assessment.overall = "LOW";

  // Analyze contributing factors
  assessment.factors = analyzeReliabilityFactors(metrics);

  // Generate recommendations
  assessment.recommendations = generateReliabilityRecommendations(assessment.factors);

  return assessment;
};

/**
 * Generate recommendations based on metrics
 * @param {Object} metrics - Aggregate metrics
 * @returns {Array} List of recommendations
 */
const generateRecommendations = (metrics) => {
  const recommendations = [];

  // Sample size recommendations
  if (metrics.accuracy.stdDev > 0.1) {
    recommendations.push({
      type: "data_quantity",
      priority: "HIGH",
      message: "Add more training examples to reduce variance",
      details: `Current accuracy standard deviation: ${metrics.accuracy.stdDev.toFixed(3)}`
    });
  }

  // Class balance recommendations
  const expletiveRecall = metrics.expletive.recall.mean;
  const logicalRecall = metrics.logical.recall.mean;
  if (Math.abs(expletiveRecall - logicalRecall) > 0.2) {
    recommendations.push({
      type: "class_balance",
      priority: "MEDIUM",
      message: "Add more examples for the underrepresented class",
      details: `Expletive recall: ${expletiveRecall.toFixed(2)}, Logical recall: ${logicalRecall.toFixed(2)}`
    });
  }

  // Trigger coverage recommendations
  metrics.triggerReliability.forEach((stats, trigger) => {
    if (stats.count < 10) {
      recommendations.push({
        type: "trigger_coverage",
        priority: "MEDIUM",
        message: `Add more examples for "${trigger}" trigger`,
        details: `Current examples: ${stats.count}`
      });
    }
  });

  // Confidence calibration recommendations
  if (metrics.confidenceCalibration.reliability < 0.7) {
    recommendations.push({
      type: "calibration",
      priority: "HIGH",
      message: "Improve confidence calibration",
      details: `Current reliability: ${metrics.confidenceCalibration.reliability.toFixed(2)}`
    });
  }

  return recommendations;
};

// Helper functions
const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const createFolds = (data, k) => {
  const folds = Array(k).fill().map(() => []);
  data.forEach((item, index) => {
    folds[index % k].push(item);
  });
  return folds;
};

const scoreMetric = (value, min, max) => {
  return Math.min(1, Math.max(0, (value - min) / (max - min)));
};

export const __testing = {
  validateFold,
  calculateClassMetrics,
  calculateAggregateMetrics,
  calculateConfidenceCalibration,
  assessReliability,
  generateRecommendations
};
