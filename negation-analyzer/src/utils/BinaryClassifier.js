// Binary classifier with statistical learning from training data
export const classifyWithBinaryClassifier = async (text, trainingData) => {
  if (!trainingData || trainingData.length === 0) {
    return {
      prediction: "UNCERTAIN",
      confidence: 0.5,
      analysis: "No training data available for statistical analysis",
      details: {
        reason: "missing_training_data",
        recommendation: "Please provide training examples to enable statistical analysis"
      }
    };
  }

  // Extract features from input text
  const features = extractFeatures(text);
  
  // Calculate statistics from training data
  const stats = analyzeTrainingData(text, features, trainingData);
  
  // Generate detailed analysis
  const analysis = generateAnalysis(features, stats);
  
  // Calculate probability and confidence
  const { probability, confidence, reasoning } = calculateProbability(features, stats);
  
  // Add probability reasoning to analysis
  analysis.probabilityAnalysis = reasoning;

  // Perform cross-validation if enough data is available
  let validationResults = null;
  if (trainingData.length >= 10) {
    validationResults = performCrossValidation(trainingData);
  }

  return {
    prediction: probability > 0.5 ? "EXPLETIVE" : "LOGICAL",
    confidence: confidence,
    probability: probability,
    analysis: formatAnalysis(analysis),
    details: {
      features,
      stats,
      probabilityBreakdown: reasoning,
      dataPoints: stats.relevantExamples.length,
      reliability: assessReliability(stats),
      validation: validationResults ? {
        accuracy: validationResults.aggregateMetrics.accuracy,
        classMetrics: {
          expletive: validationResults.aggregateMetrics.expletive,
          logical: validationResults.aggregateMetrics.logical
        },
        triggerReliability: Object.fromEntries(validationResults.aggregateMetrics.triggerReliability),
        confidenceCalibration: validationResults.aggregateMetrics.confidenceCalibration,
        recommendations: validationResults.recommendations
      } : {
        status: "insufficient_data",
        message: "Need at least 10 training examples for validation",
        availableExamples: trainingData.length
      }
    }
  };
};

const extractFeatures = (text) => {
  return {
    // Trigger patterns
    triggers: {
      peurQue: {
        present: /\b(peur|crainte)\s+que?\b/i.test(text),
        matches: text.match(/\b(peur|crainte)\s+que?\b/gi) || [],
        context: extractContext(text, /\b(peur|crainte)\s+que?\b/i)
      },
      avantQue: {
        present: /\bavant\s+que?\b/i.test(text),
        matches: text.match(/\bavant\s+que?\b/gi) || [],
        context: extractContext(text, /\bavant\s+que?\b/i)
      },
      peuSenFaut: {
        present: /\b(peu\s+s['']en\s+faut|s['']en\s+faut)/i.test(text),
        matches: text.match(/\b(peu\s+s['']en\s+faut|s['']en\s+faut)/gi) || [],
        context: extractContext(text, /\b(peu\s+s['']en\s+faut|s['']en\s+faut)/i)
      }
    },
    
    // Grammatical features
    grammar: {
      hasSubjunctive: hasSubjunctive(text),
      subjunctiveVerbs: findSubjunctiveVerbs(text),
      hasNegationMarkers: findNegationMarkers(text),
      clauseStructure: analyzeClauseStructure(text)
    },
    
    // Contextual features
    context: {
      precedingWords: extractPrecedingWords(text),
      followingWords: extractFollowingWords(text),
      clausePosition: determineClausePosition(text)
    }
  };
};

const analyzeTrainingData = (text, features, trainingData) => {
  const stats = {
    triggers: {
      peurQue: { total: 0, expletive: 0, logical: 0, examples: [] },
      avantQue: { total: 0, expletive: 0, logical: 0, examples: [] },
      peuSenFaut: { total: 0, expletive: 0, logical: 0, examples: [] }
    },
    contextual: {
      withSubjunctive: { total: 0, expletive: 0, logical: 0 },
      withNegation: { total: 0, expletive: 0, logical: 0 },
      clausePositions: { initial: 0, middle: 0, final: 0 }
    },
    relevantExamples: [],
    similarityScores: [],
    patternDistribution: new Map()
  };

  // Find relevant examples based on features
  const relevantExamples = findRelevantExamples(text, features, trainingData);
  stats.relevantExamples = relevantExamples;

  // Analyze each relevant example
  relevantExamples.forEach(example => {
    // Track trigger statistics
    updateTriggerStats(stats.triggers, example);
    
    // Track contextual features
    updateContextualStats(stats.contextual, example);
    
    // Calculate similarity score
    const similarity = calculateSimilarity(text, example.text);
    stats.similarityScores.push({
      example: example.text,
      score: similarity,
      classification: example.has_expletive_ne ? 'expletive' : 'logical'
    });

    // Track pattern distribution
    updatePatternDistribution(stats.patternDistribution, example);
  });

  return stats;
};

const generateAnalysis = (features, stats) => {
  return {
    featureAnalysis: analyzeFeatures(features),
    statisticalAnalysis: analyzeStatistics(stats),
    patternAnalysis: analyzePatterns(features, stats),
    similarityAnalysis: analyzeSimilarity(stats.similarityScores),
    contextualAnalysis: analyzeContext(features.context, stats),
    reliabilityAssessment: assessReliability(stats)
  };
};

const calculateProbability = (features, stats) => {
  const reasoning = [];
  let totalWeight = 0;
  let weightedSum = 0;

  // Calculate trigger-based probabilities
  Object.entries(features.triggers).forEach(([trigger, data]) => {
    if (data.present && stats.triggers[trigger].total > 0) {
      const triggerStats = stats.triggers[trigger];
      const probability = triggerStats.expletive / triggerStats.total;
      const weight = Math.log(triggerStats.total + 1); // Logarithmic weight based on sample size
      
      weightedSum += probability * weight;
      totalWeight += weight;
      
      reasoning.push({
        feature: trigger,
        probability,
        weight,
        samples: triggerStats.total,
        explanation: `Based on ${triggerStats.expletive}/${triggerStats.total} expletive cases`
      });
    }
  });

  // Add contextual feature probabilities
  if (features.grammar.hasSubjunctive && stats.contextual.withSubjunctive.total > 0) {
    const subjProb = stats.contextual.withSubjunctive.expletive / stats.contextual.withSubjunctive.total;
    const weight = Math.log(stats.contextual.withSubjunctive.total + 1) * 0.5; // Half weight for contextual features
    
    weightedSum += subjProb * weight;
    totalWeight += weight;
    
    reasoning.push({
      feature: 'subjunctive',
      probability: subjProb,
      weight,
      samples: stats.contextual.withSubjunctive.total,
      explanation: `Subjunctive correlation from ${stats.contextual.withSubjunctive.total} examples`
    });
  }

  // Calculate similarity-based probability
  if (stats.similarityScores.length > 0) {
    const similarityProb = calculateSimilarityProbability(stats.similarityScores);
    const weight = Math.log(stats.similarityScores.length + 1) * 0.3; // 0.3 weight for similarity
    
    weightedSum += similarityProb * weight;
    totalWeight += weight;
    
    reasoning.push({
      feature: 'similarity',
      probability: similarityProb,
      weight,
      samples: stats.similarityScores.length,
      explanation: `Based on ${stats.similarityScores.length} similar examples`
    });
  }

  // If no statistical evidence, return uncertain
  if (totalWeight === 0) {
    return {
      probability: 0.5,
      confidence: 0,
      reasoning: [{
        feature: 'no_data',
        explanation: 'No statistical evidence available from training data'
      }]
    };
  }

  const finalProbability = weightedSum / totalWeight;
  const confidence = calculateConfidence(finalProbability, stats);

  return {
    probability: finalProbability,
    confidence,
    reasoning
  };
};

const findRelevantExamples = (text, features, trainingData) => {
  return trainingData.filter(example => {
    // Check for trigger pattern matches
    const hasMatchingTrigger = Object.entries(features.triggers).some(
      ([trigger, data]) => data.present && example.text.includes(data.matches[0])
    );

    // Check for similar grammatical structure
    const hasSimilarStructure = 
      features.grammar.hasSubjunctive === hasSubjunctive(example.text) ||
      features.grammar.hasNegationMarkers.some(marker => 
        example.text.includes(marker)
      );

    return hasMatchingTrigger || hasSimilarStructure;
  });
};

const calculateSimilarity = (text1, text2) => {
  // Implement text similarity calculation
  // This could use various methods:
  // - Levenshtein distance
  // - Word overlap
  // - N-gram similarity
  // For now, using a simple word overlap metric
  const words1 = new Set(text1.toLowerCase().split(/\s+/));
  const words2 = new Set(text2.toLowerCase().split(/\s+/));
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  return intersection.size / union.size;
};

const calculateConfidence = (probability, stats) => {
  // Base confidence on:
  // 1. Sample size
  const sampleSizeConfidence = Math.min(
    Math.log(stats.relevantExamples.length + 1) / Math.log(10), // Log scale
    1
  );

  // 2. Probability extremity
  const probabilityConfidence = Math.abs(probability - 0.5) * 2;

  // 3. Pattern consistency
  const patternConsistency = calculatePatternConsistency(stats);

  // Weighted combination
  return (
    sampleSizeConfidence * 0.4 +
    probabilityConfidence * 0.4 +
    patternConsistency * 0.2
  );
};

const calculatePatternConsistency = (stats) => {
  // Calculate how consistent the patterns are in the training data
  let consistency = 0;
  let totalPatterns = 0;

  stats.patternDistribution.forEach((count, pattern) => {
    const patternRatio = count / stats.relevantExamples.length;
    consistency += patternRatio * patternRatio; // Square for emphasis on strong patterns
    totalPatterns++;
  });

  return totalPatterns > 0 ? consistency / totalPatterns : 0;
};

const formatAnalysis = (analysis) => {
  const sections = [];

  // Statistical Overview
  sections.push("📊 STATISTICAL ANALYSIS");
  sections.push(formatStatisticalOverview(analysis.statisticalAnalysis));

  // Pattern Analysis
  sections.push("\n🔍 PATTERN ANALYSIS");
  sections.push(formatPatternAnalysis(analysis.patternAnalysis));

  // Contextual Analysis
  sections.push("\n📝 CONTEXTUAL EVIDENCE");
  sections.push(formatContextualAnalysis(analysis.contextualAnalysis));

  // Probability Breakdown
  sections.push("\n🎯 PROBABILITY CALCULATION");
  sections.push(formatProbabilityAnalysis(analysis.probabilityAnalysis));

  // Reliability Assessment
  sections.push("\n⚖️ RELIABILITY ASSESSMENT");
  sections.push(formatReliabilityAssessment(analysis.reliabilityAssessment));

  return sections.join("\n");
};

// Helper function to find subjunctive verbs
const findSubjunctiveVerbs = (text) => {
  const SUBJUNCTIVE_PATTERNS = {
    etre: /\b(?:sois|soit|soyons|soyez|soient)\b/gi,
    avoir: /\b(?:aie|aies|ait|ayons|ayez|aient)\b/gi,
    aller: /\b(?:aille|ailles|aille|allions|alliez|aillent)\b/gi,
    faire: /\b(?:fasse|fasses|fasse|fassions|fassiez|fassent)\b/gi,
    venir: /\b(?:vienne|viennes|vienne|venions|veniez|viennent)\b/gi,
    pouvoir: /\b(?:puisse|puisses|puisse|puissions|puissiez|puissent)\b/gi,
    savoir: /\b(?:sache|saches|sache|sachions|sachiez|sachent)\b/gi
  };

  const matches = [];
  Object.entries(SUBJUNCTIVE_PATTERNS).forEach(([verb, pattern]) => {
    const verbMatches = text.match(pattern) || [];
    matches.push(...verbMatches);
  });
  
  return matches;
};

// Helper function to find negation markers
const findNegationMarkers = (text) => {
  const NEGATION_MARKERS = [
    'pas', 'point', 'plus', 'jamais', 'rien', 'personne',
    'aucun', 'aucune', 'guère', 'nullement'
  ];
  
  return NEGATION_MARKERS.filter(marker => 
    new RegExp(`\\b${marker}\\b`, 'i').test(text)
  );
};

// Export for testing
export const __testing = {
  extractFeatures,
  analyzeTrainingData,
  calculateProbability,
  findRelevantExamples,
  calculateSimilarity,
  calculateConfidence
};
