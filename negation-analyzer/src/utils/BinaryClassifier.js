class BinaryClassifier {
  constructor() {
    this.trainingData = [];
    this.initialized = false;
  }

  async train(trainingData) {
    this.trainingData = trainingData;
    this.initialized = true;
  }

  async classifyNegation(text) {
    if (!this.initialized || !this.trainingData || this.trainingData.length === 0) {
      return {
        classification: "UNCERTAIN",
        confidence: 0.5,
        evidence: "No training data available for statistical analysis",
        details: {
          reason: "missing_training_data",
          recommendation: "Please provide training examples to enable statistical analysis"
        }
      };
    }

    // Extract features from input text
    const features = this._extractFeatures(text);
    
    // Calculate statistics from training data
    const stats = this._analyzeTrainingData(text, features);
    
    // Generate detailed analysis
    const analysis = this._generateAnalysis(features, stats);
    
    // Calculate probability and confidence
    const { probability, confidence, reasoning } = this._calculateProbability(features, stats);
    
    // Add probability reasoning to analysis
    analysis.probabilityAnalysis = reasoning;

    // Format the result text first to get the analysis
    const formattedAnalysis = this._formatAnalysis(analysis);

    // Determine classification based on probability and confidence thresholds
    let type;
    if (confidence < 0.3) {
      type = "UNCERTAIN";
    } else if (Math.abs(probability - 0.5) < 0.2) {
      type = "AMBIGUOUS";
    } else if (probability > 0.7) {
      type = "EXPLETIVE";
    } else if (probability < 0.3) {
      type = "LOGICAL";
    } else {
      type = probability > 0.5 ? "LIKELY_EXPLETIVE" : "LIKELY_LOGICAL";
    }

    return {
      classification: type,
      confidence: confidence,
      evidence: formattedAnalysis,
      details: {
        features,
        stats,
        probabilityBreakdown: reasoning,
        dataPoints: stats.relevantExamples.length,
        reliability: this._assessReliability(stats)
      }
    };
  }

  _extractFeatures(text) {
    // Define the peu s'en faut pattern with all variations
    const peuSenFautPattern = /\b(?:peu\s+s['']en\s+(?:faut|fallait|faudra|faudrait)|(?:peu\s+)?s['']en\s+(?:est|fût)\s+fallu(?:\s+de\s+peu)?|peu\s+s['']en\s+est\s+fallu|(?:il\s+)?s['']en\s+fallut(?:\s+de\s+peu)?|(?:il\s+)?s['']en\s+fut\s+fallu|(?:il\s+)?(?:ne\s+)?s['']en\s+(?:faut|fallait|faudra|faudrait)\s+de\s+peu|il\s+s['']en\s+est\s+fallu\s+de\s+peu|(?:il\s+)?ne\s+s['']en\s+(?:faut|fallait|faudra|faudrait)\s+pas\s+de\s+beaucoup|peu\s+qu[''](?:un|il\s+fût))\b/i;

    return {
      // Trigger patterns
      triggers: {
        peurQue: {
          present: /\b(peur|crainte)\s+que?\b/i.test(text),
          matches: text.match(/\b(peur|crainte)\s+que?\b/gi) || [],
          context: this._extractContext(text, /\b(peur|crainte)\s+que?\b/i)
        },
        avantQue: {
          present: /\bavant\s+que?\b/i.test(text),
          matches: text.match(/\bavant\s+que?\b/gi) || [],
          context: this._extractContext(text, /\bavant\s+que?\b/i)
        },
        peuSenFaut: {
          present: peuSenFautPattern.test(text),
          matches: text.match(peuSenFautPattern) || [],
          context: this._extractContext(text, peuSenFautPattern)
        }
      },
      
      // Grammatical features
      grammar: {
        hasSubjunctive: this._hasSubjunctive(text),
        subjunctiveVerbs: this._findSubjunctiveVerbs(text),
        hasNegationMarkers: this._findNegationMarkers(text),
        clauseStructure: this._analyzeClauseStructure(text)
      },
      
      // Contextual features
      context: {
        precedingWords: this._extractPrecedingWords(text),
        followingWords: this._extractFollowingWords(text),
        clausePosition: this._determineClausePosition(text)
      }
    };
  }

  _analyzeTrainingData(text, features) {
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
    const relevantExamples = this._findRelevantExamples(text, features);
    stats.relevantExamples = relevantExamples;

    // Analyze each relevant example
    relevantExamples.forEach(example => {
      // Track trigger statistics
      this._updateTriggerStats(stats.triggers, example);
      
      // Track contextual features
      this._updateContextualStats(stats.contextual, example);
      
      // Calculate similarity score
      const similarity = this._calculateSimilarity(text, example.text);
      stats.similarityScores.push({
        example: example.text,
        score: similarity,
        classification: example.has_expletive_ne ? 'expletive' : 'logical'
      });

      // Track pattern distribution
      this._updatePatternDistribution(stats.patternDistribution, example);
    });

    return stats;
  }

  _generateAnalysis(features, stats) {
    return {
      featureAnalysis: this._analyzeFeatures(features),
      statisticalAnalysis: this._analyzeStatistics(stats),
      patternAnalysis: this._analyzePatterns(features, stats),
      similarityAnalysis: this._analyzeSimilarity(stats.similarityScores),
      contextualAnalysis: this._analyzeContext(features.context, stats),
      reliabilityAssessment: this._assessReliability(stats)
    };
  }

  _calculateProbability(features, stats) {
    const reasoning = [];
    let totalWeight = 0;
    let weightedSum = 0;

    // Calculate trigger-based probabilities
    Object.entries(features.triggers).forEach(([trigger, data]) => {
      if (data.present && stats.triggers[trigger].total > 0) {
        const triggerStats = stats.triggers[trigger];
        const probability = triggerStats.expletive / triggerStats.total;
        const weight = Math.log(triggerStats.total + 1);
        
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
      const weight = Math.log(stats.contextual.withSubjunctive.total + 1) * 0.5;
      
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
      const similarityProb = this._calculateSimilarityProbability(stats.similarityScores);
      const weight = Math.log(stats.similarityScores.length + 1) * 0.3;
      
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
    const confidence = this._calculateConfidence(finalProbability, stats);

    return {
      probability: finalProbability,
      confidence,
      reasoning
    };
  }

  _formatAnalysis(analysis) {
    const sections = [];

    // Statistical Overview
    sections.push("📊 STATISTICAL ANALYSIS");
    sections.push(this._formatStatisticalOverview(analysis.statisticalAnalysis));

    // Pattern Analysis
    sections.push("\n🔍 PATTERN ANALYSIS");
    sections.push(this._formatPatternAnalysis(analysis.patternAnalysis));

    // Contextual Analysis
    sections.push("\n📝 CONTEXTUAL EVIDENCE");
    sections.push(this._formatContextualAnalysis(analysis.contextualAnalysis));

    // Probability Breakdown
    sections.push("\n🎯 PROBABILITY CALCULATION");
    sections.push(this._formatProbabilityAnalysis(analysis.probabilityAnalysis));

    // Reliability Assessment
    sections.push("\n⚖️ RELIABILITY ASSESSMENT");
    sections.push(this._formatReliabilityAssessment(analysis.reliabilityAssessment));

    return sections.join("\n");
  }

  // Helper methods
  _findSubjunctiveVerbs(text) {
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
  }

  _findNegationMarkers(text) {
    const NEGATION_MARKERS = [
      'pas', 'point', 'plus', 'jamais', 'rien', 'personne',
      'aucun', 'aucune', 'guère', 'nullement'
    ];
    
    return NEGATION_MARKERS.filter(marker => 
      new RegExp(`\\b${marker}\\b`, 'i').test(text)
    );
  }

  _hasSubjunctive(text) {
    return this._findSubjunctiveVerbs(text).length > 0;
  }

  _extractContext(text, pattern) {
    const match = text.match(pattern);
    if (!match) return '';
    
    const start = Math.max(0, match.index - 20);
    const end = Math.min(text.length, match.index + match[0].length + 20);
    return text.slice(start, end);
  }

  _findRelevantExamples(text, features) {
    return this.trainingData.filter(example => {
      // Check for trigger pattern matches
      const hasMatchingTrigger = Object.entries(features.triggers).some(
        ([trigger, data]) => data.present && example.text.includes(data.matches[0])
      );

      // Check for similar grammatical structure
      const hasSimilarStructure = 
        features.grammar.hasSubjunctive === this._hasSubjunctive(example.text) ||
        features.grammar.hasNegationMarkers.some(marker => 
          example.text.includes(marker)
        );

      return hasMatchingTrigger || hasSimilarStructure;
    });
  }

  _calculateSimilarity(text1, text2) {
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    return intersection.size / union.size;
  }

  _calculateConfidence(probability, stats) {
    // Base confidence on:
    // 1. Sample size
    const sampleSizeConfidence = Math.min(
      Math.log(stats.relevantExamples.length + 1) / Math.log(10),
      1
    );

    // 2. Probability extremity
    const probabilityConfidence = Math.abs(probability - 0.5) * 2;

    // 3. Pattern consistency
    const patternConsistency = this._calculatePatternConsistency(stats);

    // Weighted combination
    return (
      sampleSizeConfidence * 0.4 +
      probabilityConfidence * 0.4 +
      patternConsistency * 0.2
    );
  }

  _calculatePatternConsistency(stats) {
    let consistency = 0;
    let totalPatterns = 0;

    stats.patternDistribution.forEach((count, pattern) => {
      const patternRatio = count / stats.relevantExamples.length;
      consistency += patternRatio * patternRatio;
      totalPatterns++;
    });

    return totalPatterns > 0 ? consistency / totalPatterns : 0;
  }

  _assessReliability(stats) {
    const reliability = {
      score: 0,
      factors: [],
      recommendation: ''
    };

    // Sample size assessment
    const sampleSize = stats.relevantExamples.length;
    if (sampleSize < 5) {
      reliability.factors.push('Very limited training data');
      reliability.score = 0.2;
    } else if (sampleSize < 10) {
      reliability.factors.push('Limited training data');
      reliability.score = 0.4;
    } else if (sampleSize < 20) {
      reliability.factors.push('Moderate amount of training data');
      reliability.score = 0.6;
    } else if (sampleSize < 50) {
      reliability.factors.push('Good amount of training data');
      reliability.score = 0.8;
    } else {
      reliability.factors.push('Excellent amount of training data');
      reliability.score = 1.0;
    }

    // Pattern consistency
    const consistency = this._calculatePatternConsistency(stats);
    if (consistency < 0.3) {
      reliability.factors.push('Low pattern consistency');
    } else if (consistency > 0.7) {
      reliability.factors.push('High pattern consistency');
    }

    // Generate recommendation
    if (reliability.score < 0.5) {
      reliability.recommendation = 'Consider adding more training examples';
    } else if (consistency < 0.3) {
      reliability.recommendation = 'Consider reviewing pattern consistency';
    } else {
      reliability.recommendation = 'Analysis meets reliability thresholds';
    }

    return reliability;
  }

  // Formatting helper methods
  _formatStatisticalOverview(stats) {
    return `Based on ${stats.relevantExamples.length} relevant training examples`;
  }

  _formatPatternAnalysis(analysis) {
    return analysis.patterns.map(p => `• ${p}`).join('\n');
  }

  _formatContextualAnalysis(analysis) {
    return analysis.factors.map(f => `• ${f}`).join('\n');
  }

  _formatProbabilityAnalysis(analysis) {
    return analysis.map(a => 
      `• ${a.feature}: ${Math.round(a.probability * 100)}% (${a.explanation})`
    ).join('\n');
  }

  _formatReliabilityAssessment(assessment) {
    return [
      `Reliability Score: ${Math.round(assessment.score * 100)}%`,
      'Factors:',
      ...assessment.factors.map(f => `• ${f}`),
      `\nRecommendation: ${assessment.recommendation}`
    ].join('\n');
  }

  // Additional helper methods as needed
  _extractPrecedingWords(text) {
    // Implementation
    return [];
  }

  _extractFollowingWords(text) {
    // Implementation
    return [];
  }

  _determineClausePosition(text) {
    // Implementation
    return 'unknown';
  }

  _analyzeClauseStructure(text) {
    // Implementation
    return {};
  }

  _analyzeFeatures(features) {
    // Implementation
    return {};
  }

  _analyzeStatistics(stats) {
    return {
      relevantExamples: stats.relevantExamples.length
    };
  }

  _analyzePatterns(features, stats) {
    return {
      patterns: []
    };
  }

  _analyzeSimilarity(scores) {
    // Implementation
    return {};
  }

  _analyzeContext(context, stats) {
    return {
      factors: []
    };
  }

  _updateTriggerStats(triggers, example) {
    // Implementation
  }

  _updateContextualStats(contextual, example) {
    // Implementation
  }

  _updatePatternDistribution(distribution, example) {
    // Implementation
  }

  _calculateSimilarityProbability(scores) {
    return scores.reduce((sum, score) => sum + score.score, 0) / scores.length;
  }
}

export default BinaryClassifier;
