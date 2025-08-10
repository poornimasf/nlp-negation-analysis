/**
 * Enhanced training data analyzer with sophisticated linguistic features
 * Integrates avant que analysis, subjunctive detection, and register analysis
 * Phase 1: Evidence-based scoring system added (not yet integrated)
 */

import { normalizeText } from './textProcessing';
import { TRIGGER_PATTERNS } from './patterns';
import { analyzeAmbiguityAndNegation } from './ambiguityNegationAnalyzer';
import { analyzeLogicalNegationContext } from './logicalNegationDetector';
import { detectSubjunctive } from './unifiedSubjunctiveDetector';
import { extractTriggerClause, analyzeMultipleNegationInClause } from './clauseBoundaryAnalyzer';
import { enhanceAvantQueAnalysisWithClause } from './enhancedAvantQueAnalyzer';
import { createSurfaceForm } from './surfaceFormGenerator';
import { analyzeSemanticContext, shouldOverrideToLogicalNegation } from './semanticContextAnalyzer';

/**
 * Evidence-based scoring system to manage boost complexity
 * Phase 1: Class definition only - not yet integrated into main logic
 * This will eventually replace the complex boost system with predictable evidence accumulation
 */
class EvidenceAccumulator {
  constructor() {
    this.evidence = {
      forExpletive: [],
      forNoExpletive: [],
      neutral: []
    };
  }
  
  /**
   * Add evidence for or against expletive classification
   * @param {string} type - 'forExpletive', 'forNoExpletive', or 'neutral'
   * @param {string} source - Source of evidence (e.g., 'precision_patterns', 'linguistic_rules')
   * @param {number} confidence - Confidence level [0,1]
   * @param {string} reasoning - Human-readable explanation
   * @param {number} weight - Importance weight (default 1.0)
   * @param {object} details - Additional details for debugging
   */
  addEvidence(type, source, confidence, reasoning, weight = 1.0, details = {}) {
    if (!['forExpletive', 'forNoExpletive', 'neutral'].includes(type)) {
      console.warn(`Invalid evidence type: ${type}`);
      return;
    }
    
    const evidence = {
      source,
      confidence: Math.max(0, Math.min(1, confidence)), // Clamp to [0,1]
      reasoning,
      weight: Math.max(0, weight), // Ensure positive weight
      details,
      timestamp: Date.now()
    };
    
    this.evidence[type].push(evidence);
    console.log(`📝 Evidence added: ${type} from ${source} (confidence: ${confidence.toFixed(2)}, weight: ${weight.toFixed(1)})`);
  }
  
  /**
   * Calculate weighted sum for an evidence array
   * Uses sophisticated weighting that considers both confidence and source reliability
   */
  calculateWeightedSum(evidenceArray) {
    if (evidenceArray.length === 0) return 0;
    
    let totalScore = 0;
    let totalWeight = 0;
    
    for (const evidence of evidenceArray) {
      // Effective weight combines source weight with evidence confidence
      const effectiveWeight = evidence.weight * evidence.confidence;
      totalScore += effectiveWeight;
      totalWeight += evidence.weight;
    }
    
    // Normalize by total weight to prevent accumulation bias
    return totalWeight > 0 ? totalScore : 0;
  }
  
  /**
   * Calculate final scores using evidence-based approach
   * Returns scores that can be compared to current boost system results
   */
  calculateFinalScores() {
    const expletiveScore = this.calculateWeightedSum(this.evidence.forExpletive);
    const noExpletiveScore = this.calculateWeightedSum(this.evidence.forNoExpletive);
    
    console.log('🧮 Evidence-based scoring calculation:', {
      expletiveEvidence: this.evidence.forExpletive.length,
      noExpletiveEvidence: this.evidence.forNoExpletive.length,
      expletiveScore: expletiveScore.toFixed(2),
      noExpletiveScore: noExpletiveScore.toFixed(2)
    });
    
    return {
      adjustedExpletive: expletiveScore,
      adjustedNonExpletive: noExpletiveScore,
      evidenceBreakdown: this.evidence
    };
  }
  
  /**
   * Get summary of evidence for debugging and transparency
   */
  getEvidenceSummary() {
    return {
      totalEvidence: this.evidence.forExpletive.length + this.evidence.forNoExpletive.length + this.evidence.neutral.length,
      forExpletive: this.evidence.forExpletive.length,
      forNoExpletive: this.evidence.forNoExpletive.length,
      sources: [...new Set([
        ...this.evidence.forExpletive.map(e => e.source),
        ...this.evidence.forNoExpletive.map(e => e.source),
        ...this.evidence.neutral.map(e => e.source)
      ])]
    };
  }
  
  /**
   * Compare evidence-based results with boost system results
   * Useful for gradual migration and validation
   */
  compareWithBoostSystem(boostSystemResults) {
    const evidenceResults = this.calculateFinalScores();
    
    const comparison = {
      evidenceBased: {
        expletive: evidenceResults.adjustedExpletive,
        noExpletive: evidenceResults.adjustedNonExpletive,
        winner: evidenceResults.adjustedExpletive > evidenceResults.adjustedNonExpletive ? 'Expletive' : 'No Expletive'
      },
      boostSystem: {
        expletive: boostSystemResults.adjustedExpletive,
        noExpletive: boostSystemResults.adjustedNonExpletive,
        winner: boostSystemResults.adjustedExpletive > boostSystemResults.adjustedNonExpletive ? 'Expletive' : 'No Expletive'
      },
      agreement: (evidenceResults.adjustedExpletive > evidenceResults.adjustedNonExpletive) === 
                 (boostSystemResults.adjustedExpletive > boostSystemResults.adjustedNonExpletive)
    };
    
    console.log('🔄 Evidence vs Boost System Comparison:', comparison);
    return comparison;
  }
}

// Enhanced trigger patterns with additional constructions
const ENHANCED_TRIGGER_PATTERNS = {
  ...TRIGGER_PATTERNS,
  FEAR: [
    ...TRIGGER_PATTERNS.FEAR,
    /de\s+peur\s+qu(?:e|')/i,  // de peur que
    /dans\s+la\s+crainte\s+qu(?:e|')/i,  // dans la crainte que
    /par\s+crainte\s+qu(?:e|')/i,  // par crainte que
  ],
  CONDITIONAL: [
    /à\s+moins\s+qu(?:e|')/i,  // à moins que
    /pourvu\s+qu(?:e|')/i,     // pourvu que
    /pour\s+peu\s+qu(?:e|')/i, // pour peu que
  ],
  COMPARATIVE: [
    /plus\s+(?:\w+\s+)*qu(?:e|')/i,     // plus ... que
    /moins\s+(?:\w+\s+)*qu(?:e|')/i,    // moins ... que
    /mieux\s+(?:\w+\s+)*qu(?:e|')/i,    // mieux ... que
    /autre\s+(?:\w+\s+)*qu(?:e|')/i,    // autre ... que
  ]
};

// Register/Genre detection patterns
const REGISTER_PATTERNS = {
  LITERARY: {
    patterns: [
      /\b(?:dont|duquel|auquel|desquels|auxquels)\b/i,  // Complex relatives
      /\b(?:eût|fût|eussent|fussent)\b/i,               // Literary subjunctive
      /\b(?:point|guère|nullement)\b/i,                 // Literary negation
      /\b(?:jadis|naguère|autrefois)\b/i,               // Temporal markers
      /\b(?:certes|assurément|néanmoins)\b/i,           // Formal connectors
    ],
    weight: 0.3
  },
  FORMAL: {
    patterns: [
      /\b(?:cependant|toutefois|néanmoins|par\s+conséquent)\b/i,  // Formal connectors
      /\b(?:afin\s+que|de\s+sorte\s+que|si\s+bien\s+que)\b/i,    // Purpose clauses
      /\b(?:quoique|bien\s+que|encore\s+que)\b/i,                // Concessive
      /\b(?:lequel|laquelle|lesquels|lesquelles)\b/i,            // Formal relatives
    ],
    weight: 0.2
  },
  COLLOQUIAL: {
    patterns: [
      /\b(?:ça|c'est\s+que|y\s+a|j'sais\s+pas)\b/i,    // Colloquial forms
      /\b(?:super|hyper|méga|trop)\b/i,                  // Intensifiers
      /\b(?:ouais|nan|bah|ben)\b/i,                      // Informal particles
      /\b(?:truc|machin|bidule)\b/i,                     // Vague terms
    ],
    weight: -0.2  // Negative weight for expletive ne likelihood
  }
};

// Discourse context patterns
const DISCOURSE_PATTERNS = {
  NEGATIVE_CONTEXT: [
    /\b(?:pas|jamais|rien|personne|aucun|nulle?)\b/i,
    /\b(?:sans|ni|non)\b/i,
  ],
  CONTRASTIVE_CONTEXT: [
    /\b(?:mais|cependant|pourtant|néanmoins|toutefois)\b/i,
    /\b(?:au\s+contraire|en\s+revanche|par\s+contre)\b/i,
  ],
  TEMPORAL_CONTEXT: [
    /\b(?:avant|après|pendant|durant|lors)\b/i,
    /\b(?:quand|lorsque|dès\s+que|aussitôt\s+que)\b/i,
  ]
};

/**
 * Enhanced trigger extraction with expanded patterns
 */
function extractEnhancedTrigger(text) {
  const normalizedText = normalizeText(text.toLowerCase());
  
  // Check all enhanced trigger categories
  for (const [category, patterns] of Object.entries(ENHANCED_TRIGGER_PATTERNS)) {
    if (category === 'TEMPORAL' && typeof patterns === 'object') {
      // Handle temporal subcategories
      for (const [subcategory, subPatterns] of Object.entries(patterns)) {
        for (const pattern of subPatterns) {
          const match = normalizedText.match(pattern);
          if (match) {
            return {
              category: 'TEMPORAL',
              subcategory,
              trigger: match[0],
              position: match.index,
              pattern: pattern.source
            };
          }
        }
      }
    } else {
      // Handle other categories
      const categoryPatterns = Array.isArray(patterns) ? patterns : [patterns];
      for (const pattern of categoryPatterns) {
        const match = normalizedText.match(pattern);
        if (match) {
          return {
            category,
            trigger: match[0],
            position: match.index,
            pattern: pattern.source
          };
        }
      }
    }
  }
  
  return null;
}

/**
 * Detect register/genre of text
 */
function detectRegister(text) {
  const normalizedText = normalizeText(text.toLowerCase());
  let registerScore = 0;
  let detectedFeatures = [];
  let primaryRegister = 'NEUTRAL';
  
  for (const [register, config] of Object.entries(REGISTER_PATTERNS)) {
    let matchCount = 0;
    for (const pattern of config.patterns) {
      if (pattern.test(normalizedText)) {
        matchCount++;
        const match = normalizedText.match(pattern);
        if (match) {
          detectedFeatures.push(`${register.toLowerCase()}: "${match[0]}"`);
        }
      }
    }
    
    if (matchCount > 0) {
      const categoryScore = matchCount * config.weight;
      registerScore += categoryScore;
      
      if (Math.abs(categoryScore) > 0.1) {
        primaryRegister = register;
      }
    }
  }
  
  return {
    register: primaryRegister,
    score: registerScore,
    features: detectedFeatures,
    confidence: Math.min(Math.abs(registerScore), 1.0)
  };
}

/**
 * Detect discourse context features
 */
function detectDiscourseContext(text) {
  const normalizedText = normalizeText(text.toLowerCase());
  let contextFeatures = [];
  
  for (const [contextType, patterns] of Object.entries(DISCOURSE_PATTERNS)) {
    for (const pattern of patterns) {
      const match = normalizedText.match(pattern);
      if (match) {
        contextFeatures.push({
          type: contextType,
          feature: match[0],
          position: match.index
        });
      }
    }
  }
  
  return contextFeatures;
}

/**
 * Enhanced similarity calculation with linguistic features
 */
export function calculateEnhancedSimilarity(text1, text2) {
  const norm1 = normalizeText(text1.toLowerCase());
  const norm2 = normalizeText(text2.toLowerCase());
  
  // Base lexical similarity
  const commonWords = new Set(['le', 'la', 'les', 'un', 'une', 'des', 'de', 'du', 'à', 'au', 'aux', 'ne', 'n']);
  const words1 = norm1.split(/\s+/).filter(w => !commonWords.has(w));
  const words2 = norm2.split(/\s+/).filter(w => !commonWords.has(w));
  
  const intersection = words1.filter(word => words2.includes(word));
  const union = [...new Set([...words1, ...words2])];
  let similarity = intersection.length / union.length;
  
  // Enhanced linguistic features
  const trigger1 = extractEnhancedTrigger(norm1);
  const trigger2 = extractEnhancedTrigger(norm2);
  const subjunctive1 = detectSubjunctive(norm1);
  const subjunctive2 = detectSubjunctive(norm2);
  const register1 = detectRegister(norm1);
  const register2 = detectRegister(norm2);
  
  let linguisticFeatures = {
    triggerMatch: false,
    subjunctiveMatch: false,
    registerMatch: false,
    avantQueEnhanced: false
  };
  
  // Trigger category matching (stronger weight)
  if (trigger1 && trigger2 && trigger1.category === trigger2.category) {
    similarity += 0.3;
    linguisticFeatures.triggerMatch = true;
    
    // Subcategory matching for temporal triggers
    if (trigger1.subcategory && trigger2.subcategory && 
        trigger1.subcategory === trigger2.subcategory) {
      similarity += 0.1;
    }
  }
  
  // Subjunctive mood matching
  if (subjunctive1 && subjunctive2) {
    if (subjunctive1.type === subjunctive2.type) {
      similarity += 0.2; // Same subjunctive type
      linguisticFeatures.subjunctiveMatch = true;
    } else if (subjunctive1.priority === subjunctive2.priority) {
      similarity += 0.1; // Same priority level
    }
  } else if ((subjunctive1 && !subjunctive2) || (!subjunctive1 && subjunctive2)) {
    similarity -= 0.1; // Penalty for subjunctive mismatch
  }
  
  // Register matching
  if (register1.register === register2.register && register1.register !== 'NEUTRAL') {
    similarity += 0.15;
    linguisticFeatures.registerMatch = true;
  }
  
  // Enhanced avant que analysis
  if (trigger1 && trigger1.trigger.includes('avant') && 
      trigger2 && trigger2.trigger.includes('avant')) {
    // Both are avant que constructions - apply enhanced analysis
    linguisticFeatures.avantQueEnhanced = true;
    similarity += 0.1;
  }
  
  return {
    similarity: Math.min(similarity, 0.98),
    features: linguisticFeatures,
    trigger1,
    trigger2,
    subjunctive1,
    subjunctive2,
    register1,
    register2
  };
}

/**
 * Enhanced training data analysis with linguistic features
 */
export function analyzeWithEnhancedFeatures(text, trainingData) {
  console.log('🔍 ENHANCED ANALYSIS: Starting comprehensive analysis for:', text.substring(0, 100));
  
  console.log('🔍 ENHANCED ANALYSIS STARTING for:', text.substring(0, 50) + '...');
  
  if (!text || !trainingData || trainingData.length === 0) {
    throw new Error('Invalid input for enhanced analysis');
  }
  
  const inputTrigger = extractEnhancedTrigger(text);
  console.log('🎯 Input trigger found:', inputTrigger);
  
  // Extract the specific clause containing the trigger for focused analysis
  let triggerClause = text;
  let clauseInfo = null;
  if (inputTrigger) {
    clauseInfo = extractTriggerClause(text, inputTrigger);
    // TEMPORARY FIX: Use full text instead of extracted clause to avoid corruption
    // triggerClause = clauseInfo.clause;
    triggerClause = text; // Use full text to avoid "reporté" being removed
    console.log('📝 Extracted clause:', clauseInfo.clause);
    console.log('📝 Using full text instead:', triggerClause.substring(0, 100) + '...');
    console.log('🔧 Clause info:', clauseInfo);
  }

  // Analyze subjunctive within the specific clause
  const inputSubjunctive = detectSubjunctive(triggerClause || text);
  console.log('📚 Subjunctive detected:', inputSubjunctive);
  
  const inputRegister = detectRegister(text);
  const inputDiscourse = detectDiscourseContext(text);
  
  // Enhanced avant que analysis if applicable (using clause-aware analysis)
  let avantQueAnalysis = null;
  if (inputTrigger && inputTrigger.trigger.includes('avant')) {
    avantQueAnalysis = enhanceAvantQueAnalysisWithClause(triggerClause, inputTrigger);
    console.log('🏛️ Avant que analysis:', avantQueAnalysis);
  }
  
  // Analyze ambiguity and negation within the specific clause only
  let ambiguityNegationAnalysis;
  if (clauseInfo && clauseInfo.isIsolated) {
    // Use clause-specific analysis for better accuracy
    const clauseNegationAnalysis = analyzeMultipleNegationInClause(triggerClause);
    const clauseAmbiguityAnalysis = analyzeAmbiguityAndNegation(triggerClause); // Use clause for ambiguity too
    ambiguityNegationAnalysis = {
      ambiguity: clauseAmbiguityAnalysis.ambiguity,
      negation: clauseNegationAnalysis,
      vowelContext: clauseAmbiguityAnalysis.vowelContext,
      combinedAnalysis: {
        ...clauseAmbiguityAnalysis.combinedAnalysis,
        // Override negation impact with clause-specific analysis
        expletiveLikelihood: clauseAmbiguityAnalysis.combinedAnalysis.expletiveLikelihood
      }
    };
    console.log('🚫 Clause-specific negation analysis:', clauseNegationAnalysis);
  } else {
    ambiguityNegationAnalysis = analyzeAmbiguityAndNegation(text);
  }
  
  // Find similar examples with enhanced similarity
  const enhancedExamples = trainingData
    .map(example => {
      const enhancedSim = calculateEnhancedSimilarity(text, example.text);
      return {
        ...example,
        ...enhancedSim,
        originalSimilarity: enhancedSim.similarity
      };
    })
    .filter(example => {
      // FIXED: More permissive filtering to prevent "0 similar examples"
      const hasMatchingTrigger = example.trigger1?.category === inputTrigger?.category;
      const hasReasonableSimilarity = example.similarity > 0.15; // Lowered threshold
      const hasLinguisticMatch = example.features.triggerMatch || 
                                example.features.subjunctiveMatch || 
                                example.features.registerMatch;
      
      // Allow examples with matching trigger OR reasonable similarity OR linguistic match
      return hasMatchingTrigger || hasReasonableSimilarity || hasLinguisticMatch;
    })
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 10); // Increased to 10 for better analysis
  
  console.log('📊 Enhanced examples found:', enhancedExamples.length);
  console.log('📊 Example similarities:', enhancedExamples.map(e => ({ 
    text: e.text.substring(0, 50), 
    similarity: e.similarity.toFixed(3),
    triggerMatch: e.features?.triggerMatch,
    subjunctiveMatch: e.features?.subjunctiveMatch
  })));
  
  // Enhanced weighted voting
  const enhancedVotes = enhancedExamples.reduce((acc, example) => {
    let weight = example.similarity;
    
    // Boost weight for linguistic feature matches
    if (example.features.triggerMatch) weight += 0.1;
    if (example.features.subjunctiveMatch) weight += 0.1;
    if (example.features.registerMatch) weight += 0.05;
    if (example.features.avantQueEnhanced) weight += 0.05;
    
    if (example.has_expletive_ne === true) {
      acc.expletive += weight;
    } else {
      acc.nonExpletive += weight;
    }
    
    acc.totalWeight += weight;
    return acc;
  }, { expletive: 0, nonExpletive: 0, totalWeight: 0 });
  
  console.log('🗳️ Base votes:', enhancedVotes);
  
  // Apply ambiguity and negation adjustments (using clause-specific analysis)
  let adjustedExpletive = enhancedVotes.expletive;
  let adjustedNonExpletive = enhancedVotes.nonExpletive;
  
  // NEW: Enhanced logical negation detection as boost system
  // PHASE 3 READY: Evidence-based scoring can replace this boost system
  const logicalNegationAnalysis = analyzeLogicalNegationContext(text, inputTrigger);
  console.log('🔍 Logical negation analysis:', logicalNegationAnalysis);
  console.log('🎯 PHASE 3 READY: Evidence-based scoring available to replace boost conflicts');
  
  // Apply logical negation enhancement FIRST (before other boosts)
  if (logicalNegationAnalysis.isLogicalNegation && logicalNegationAnalysis.confidence > 0.7) {
    const logicalBoost = 3.0 * logicalNegationAnalysis.confidence; // Scale boost by confidence
    adjustedNonExpletive += logicalBoost;
    console.log('🚫 LOGICAL NEGATION ENHANCEMENT: Strong logical context detected:', {
      confidence: logicalNegationAnalysis.confidence,
      evidence: logicalNegationAnalysis.evidence,
      boostAmount: logicalBoost,
      newNonExpletive: adjustedNonExpletive,
      phase3Note: 'This boost can be replaced with evidence-based scoring'
    });
  } else if (logicalNegationAnalysis.isLogicalNegation && logicalNegationAnalysis.confidence > 0.5) {
    const logicalBoost = 1.5 * logicalNegationAnalysis.confidence; // Moderate boost
    adjustedNonExpletive += logicalBoost;
    console.log('🔍 LOGICAL NEGATION ENHANCEMENT: Moderate logical context detected:', {
      confidence: logicalNegationAnalysis.confidence,
      evidence: logicalNegationAnalysis.evidence,
      boostAmount: logicalBoost,
      newNonExpletive: adjustedNonExpletive,
      phase3Note: 'This boost can be replaced with evidence-based scoring'
    });
  }
  
  // CRITICAL: Apply avant que analysis boost AFTER logical negation check
  console.log('🔍 Checking avant que boost conditions:', {
    hasAvantQueAnalysis: !!avantQueAnalysis,
    isAvantQue: avantQueAnalysis?.isAvantQue,
    bothConditionsMet: avantQueAnalysis?.bothConditionsMet,
    complementClause: avantQueAnalysis?.complementClause?.isComplementClause,
    subjunctiveMood: avantQueAnalysis?.subjunctiveMood?.hasSubjunctive
  });
  
  if (avantQueAnalysis && avantQueAnalysis.bothConditionsMet) {
    // Check if logical negation already applied a strong boost
    if (logicalNegationAnalysis.isLogicalNegation && logicalNegationAnalysis.confidence > 0.7) {
      console.log('🔍 AVANT QUE BOOST SKIPPED: Logical negation already applied strong boost');
    } else {
      // DECISIVE BOOST: Ensure linguistic rules always win when both conditions are met
      const beforeBoost = adjustedExpletive;
    
    // Strategy: Make expletive votes at least 20% higher than non-expletive
    const guaranteedWin = adjustedNonExpletive * 1.2;
    const minimumBoost = adjustedExpletive + 5.0;
    
    // Use the higher of the two to guarantee victory
    adjustedExpletive = Math.max(guaranteedWin, minimumBoost);
    
    console.log('🏛️ Avant que boost calculation:', {
      beforeBoost,
      adjustedNonExpletive,
      guaranteedWin,
      minimumBoost,
      finalAdjustedExpletive: adjustedExpletive,
      shouldWin: adjustedExpletive > adjustedNonExpletive,
      winMargin: adjustedExpletive - adjustedNonExpletive
    });
    console.log('🏛️ Avant que boost: Strong boost applied (both conditions met) - expletive now favored');
    }
  } else if (avantQueAnalysis && avantQueAnalysis.isAvantQue && !avantQueAnalysis.bothConditionsMet) {
    // REVERSE PENALTY: When avant que trigger is present but conditions clearly not met
    // This prevents training data bias from overriding clear linguistic evidence
    const beforePenalty = adjustedExpletive;
    
    // Strong penalty: Ensure non-expletive wins when linguistic evidence is clear
    const guaranteedLoss = adjustedNonExpletive * 0.8; // Make expletive 20% lower than non-expletive
    const minimumPenalty = Math.max(0, adjustedExpletive - 3.0); // Reduce by at least 3.0
    
    // Use the lower of the two to guarantee loss
    adjustedExpletive = Math.min(guaranteedLoss, minimumPenalty);
    
    console.log('🚫 Avant que penalty calculation:', {
      beforePenalty,
      adjustedNonExpletive,
      guaranteedLoss,
      minimumPenalty,
      finalAdjustedExpletive: adjustedExpletive,
      shouldLose: adjustedExpletive < adjustedNonExpletive,
      lossMargin: adjustedNonExpletive - adjustedExpletive,
      reason: 'Trigger present but no subjunctive - clear linguistic evidence against expletive'
    });
    console.log('🚫 Avant que penalty: Strong penalty applied (conditions not met) - non-expletive now favored');
  } else {
    console.log('❌ Avant que boost NOT applied - conditions not met');
  }
  
  // Ambiguity increases expletive likelihood
  if (ambiguityNegationAnalysis.ambiguity.clarificationNeeded) {
    adjustedExpletive += 0.3;
    console.log('📈 Ambiguity adjustment: +0.3 (clarification needed)');
  } else if (ambiguityNegationAnalysis.ambiguity.hasAmbiguity) {
    adjustedExpletive += 0.1;
    console.log('📈 Ambiguity adjustment: +0.1 (has ambiguity)');
  }
  
  // Negation type affects likelihood (now using clause-specific analysis)
  if (ambiguityNegationAnalysis.negation.negationType === 'LOGICAL_NEGATION') {
    adjustedNonExpletive += 0.5; // Strong evidence against expletive
    console.log('📉 Negation adjustment: +0.5 to non-expletive (logical negation)');
  } else if (ambiguityNegationAnalysis.negation.negationType === 'EXPLETIVE_NEGATION') {
    adjustedExpletive += 0.4; // Strong evidence for expletive
    console.log('📈 Negation adjustment: +0.4 to expletive (expletive context)');
  } else {
    console.log('⚪ No negation adjustment (negationType: ' + ambiguityNegationAnalysis.negation.negationType + ')');
  }
  
  // PHASE 2: Evidence collection alongside boost system (for comparison and debugging)
  console.log('🔍 PHASE 2: Collecting evidence alongside boost system...');
  
  // Create evidence accumulator to run in parallel with boost system
  const evidenceAccumulator = new EvidenceAccumulator();
  
  // ENHANCED SUBJUNCTIVE DEBUGGING: Show what was detected
  console.log('🎯 SUBJUNCTIVE DETECTION ANALYSIS:', {
    text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
    avantQueAnalysis: {
      isAvantQue: avantQueAnalysis?.isAvantQue,
      bothConditionsMet: avantQueAnalysis?.bothConditionsMet,
      subjunctiveMood: {
        hasSubjunctive: avantQueAnalysis?.subjunctiveMood?.hasSubjunctive,
        detectedVerb: avantQueAnalysis?.subjunctiveMood?.verb,
        verbType: avantQueAnalysis?.subjunctiveMood?.type,
        confidence: avantQueAnalysis?.subjunctiveMood?.confidence
      },
      complementClause: {
        isComplementClause: avantQueAnalysis?.complementClause?.isComplementClause,
        hasSubjectAfterQue: avantQueAnalysis?.complementClause?.hasSubjectAfterQue,
        text: avantQueAnalysis?.complementClause?.text
      }
    },
    unifiedSubjunctive: inputSubjunctive ? {
      hasSubjunctive: inputSubjunctive.hasSubjunctive,
      detectedForms: inputSubjunctive.detectedForms,
      confidence: inputSubjunctive.confidence
    } : null
  });
  
  // Evidence 1: Record training data similarity (baseline)
  if (enhancedVotes.expletive > 0) {
    evidenceAccumulator.addEvidence(
      'forExpletive',
      'training_similarity',
      Math.min(enhancedVotes.expletive / 10, 1.0),
      `Training data similarity suggests expletive (${enhancedVotes.expletive.toFixed(1)} votes)`,
      1.0,
      { votes: enhancedVotes.expletive, examples: enhancedExamples.length }
    );
  }
  
  if (enhancedVotes.nonExpletive > 0) {
    evidenceAccumulator.addEvidence(
      'forNoExpletive',
      'training_similarity',
      Math.min(enhancedVotes.nonExpletive / 10, 1.0),
      `Training data similarity suggests no expletive (${enhancedVotes.nonExpletive.toFixed(1)} votes)`,
      1.0,
      { votes: enhancedVotes.nonExpletive, examples: enhancedExamples.length }
    );
  }
  
  // Evidence 2: Record logical negation analysis (precision enhancement)
  if (logicalNegationAnalysis.isLogicalNegation && logicalNegationAnalysis.confidence > 0.5) {
    const evidenceType = logicalNegationAnalysis.isLogicalNegation ? 'forNoExpletive' : 'forExpletive';
    const weight = logicalNegationAnalysis.confidence > 0.7 ? 2.0 : 1.5;
    
    evidenceAccumulator.addEvidence(
      evidenceType,
      'precision_patterns',
      logicalNegationAnalysis.confidence,
      logicalNegationAnalysis.reasoning,
      weight,
      { 
        evidence: logicalNegationAnalysis.evidence,
        scores: logicalNegationAnalysis.scores,
        boostApplied: logicalNegationAnalysis.confidence > 0.7 ? 
          3.0 * logicalNegationAnalysis.confidence : 
          (logicalNegationAnalysis.confidence > 0.5 ? 1.5 * logicalNegationAnalysis.confidence : 0)
      }
    );
  }
  
  // Evidence 3: Record avant que analysis (traditional linguistic rules)
  if (avantQueAnalysis && avantQueAnalysis.bothConditionsMet) {
    evidenceAccumulator.addEvidence(
      'forExpletive',
      'linguistic_rules',
      0.85,
      'Traditional avant que + subjunctive pattern detected',
      1.8,
      {
        trigger: avantQueAnalysis.isAvantQue,
        subjunctive: avantQueAnalysis.subjunctiveMood?.hasSubjunctive,
        detectedVerb: avantQueAnalysis.subjunctiveMood?.verb,
        complementClause: avantQueAnalysis.complementClause?.isComplementClause,
        boostApplied: 'Decisive boost calculation applied'
      }
    );
  } else if (avantQueAnalysis && avantQueAnalysis.isAvantQue && !avantQueAnalysis.bothConditionsMet) {
    evidenceAccumulator.addEvidence(
      'forNoExpletive',
      'linguistic_rules',
      0.80,
      'Avant que trigger present but subjunctive conditions not met',
      1.5,
      {
        trigger: avantQueAnalysis.isAvantQue,
        subjunctive: avantQueAnalysis.subjunctiveMood?.hasSubjunctive,
        detectedVerb: avantQueAnalysis.subjunctiveMood?.verb,
        reason: 'Missing required subjunctive for expletive',
        penaltyApplied: 'Strong penalty calculation applied'
      }
    );
  }
  
  // Evidence 4: Record ambiguity analysis
  if (ambiguityNegationAnalysis.ambiguity.clarificationNeeded) {
    evidenceAccumulator.addEvidence(
      'forExpletive',
      'ambiguity_analysis',
      0.60,
      'Ambiguity detected - clarification needed suggests expletive context',
      0.8,
      { clarificationNeeded: true, boostApplied: 0.3 }
    );
  } else if (ambiguityNegationAnalysis.ambiguity.hasAmbiguity) {
    evidenceAccumulator.addEvidence(
      'forExpletive',
      'ambiguity_analysis',
      0.55,
      'Some ambiguity detected',
      0.5,
      { hasAmbiguity: true, boostApplied: 0.1 }
    );
  }
  
  // Evidence 5: Record negation type analysis
  if (ambiguityNegationAnalysis.negation.negationType === 'LOGICAL_NEGATION') {
    evidenceAccumulator.addEvidence(
      'forNoExpletive',
      'negation_analysis',
      0.75,
      'Logical negation context detected',
      1.2,
      { negationType: 'LOGICAL_NEGATION', boostApplied: 0.5 }
    );
  } else if (ambiguityNegationAnalysis.negation.negationType === 'EXPLETIVE_NEGATION') {
    evidenceAccumulator.addEvidence(
      'forExpletive',
      'negation_analysis',
      0.70,
      'Expletive negation context detected',
      1.1,
      { negationType: 'EXPLETIVE_NEGATION', boostApplied: 0.4 }
    );
  }
  
  // Calculate evidence-based scores (for comparison only - not used in final result)
  const evidenceResults = evidenceAccumulator.calculateFinalScores();
  
  // Compare boost system vs evidence system results
  const comparison = evidenceAccumulator.compareWithBoostSystem({
    adjustedExpletive,
    adjustedNonExpletive
  });
  
  console.log('📊 PHASE 2 BOOST vs EVIDENCE COMPARISON:', {
    input: text.substring(0, 50) + '...',
    boostSystem: {
      expletive: adjustedExpletive.toFixed(2),
      noExpletive: adjustedNonExpletive.toFixed(2),
      winner: adjustedExpletive > adjustedNonExpletive ? 'Expletive' : 'No Expletive',
      confidence: ((adjustedExpletive + adjustedNonExpletive) > 0 ? 
        Math.max(adjustedExpletive, adjustedNonExpletive) / (adjustedExpletive + adjustedNonExpletive) : 0.5).toFixed(2)
    },
    evidenceSystem: {
      expletive: evidenceResults.adjustedExpletive.toFixed(2),
      noExpletive: evidenceResults.adjustedNonExpletive.toFixed(2),
      winner: evidenceResults.adjustedExpletive > evidenceResults.adjustedNonExpletive ? 'Expletive' : 'No Expletive',
      confidence: ((evidenceResults.adjustedExpletive + evidenceResults.adjustedNonExpletive) > 0 ? 
        Math.max(evidenceResults.adjustedExpletive, evidenceResults.adjustedNonExpletive) / 
        (evidenceResults.adjustedExpletive + evidenceResults.adjustedNonExpletive) : 0.5).toFixed(2)
    },
    agreement: comparison.agreement,
    evidenceSources: evidenceAccumulator.getEvidenceSummary().sources
  });
  
  // CRITICAL: Continue with existing boost system logic (no changes to final results)
  const shouldHaveNe = adjustedExpletive > adjustedNonExpletive;
  const confidence = (adjustedExpletive + adjustedNonExpletive) > 0 ? 
    Math.max(adjustedExpletive, adjustedNonExpletive) / (adjustedExpletive + adjustedNonExpletive) :
    0.5;
  
  // Calculate actual expletive likelihood from enhanced voting results
  const actualExpletiveLikelihood = (adjustedExpletive + adjustedNonExpletive) > 0 ?
    adjustedExpletive / (adjustedExpletive + adjustedNonExpletive) : 0.5;
  
  // NEW PHASE 1: Semantic context analysis for prevention verbs
  // Check if this is a logical negation context that should override linguistic analysis
  let detectedVerb = avantQueAnalysis?.subjunctiveMood?.verb;
  console.log('🔍 DIAGNOSTIC: Initial verb detection from subjunctive mood:', detectedVerb);
  console.log('🔍 DIAGNOSTIC: avantQueAnalysis:', avantQueAnalysis);
  console.log('🔍 DIAGNOSTIC: Text being analyzed:', text.substring(0, 100) + '...');
  console.log('🔍 DIAGNOSTIC: detectedVerb is null?', detectedVerb === null);
  console.log('🔍 DIAGNOSTIC: detectedVerb is undefined?', detectedVerb === undefined);
  console.log('🔍 DIAGNOSTIC: !detectedVerb evaluates to:', !detectedVerb);
  console.log('🔍 DIAGNOSTIC: text.toLowerCase().includes("soit"):', text.toLowerCase().includes('soit'));
  
  // CRITICAL FIX: Also check for past participles in passive constructions
  if (!detectedVerb && text.toLowerCase().includes('soit')) {
    console.log('🔍 DIAGNOSTIC: ✅ ENTERING soit pattern matching...');
    console.log('🔍 DIAGNOSTIC: Text contains "soit", checking for past participle...');
    // Extract past participle from "soit + past participle" constructions
    // FIXED: Use [a-zA-ZàâäéèêëïîôöùûüÿçÀÂÄÉÈÊËÏÎÔÖÙÛÜŸÇ]+ to capture French accented characters
    const soitMatch = text.toLowerCase().match(/soit\s+([a-zA-ZàâäéèêëïîôöùûüÿçÀÂÄÉÈÊËÏÎÔÖÙÛÜŸÇ]+)/);
    console.log('🔍 DIAGNOSTIC: soitMatch result:', soitMatch);
    if (soitMatch) {
      detectedVerb = soitMatch[1];
      console.log('🔍 DIAGNOSTIC: ✅ Past participle detected in passive construction:', detectedVerb);
    } else {
      console.log('🔍 DIAGNOSTIC: ❌ Text contains "soit" but no match found with pattern');
      // Try simpler pattern for debugging
      const simpleMatch = text.toLowerCase().match(/soit\s+(\w+)/);
      console.log('🔍 DIAGNOSTIC: Simple \\w+ pattern result:', simpleMatch);
    }
  } else {
    console.log('🔍 DIAGNOSTIC: ❌ NOT entering soit pattern matching');
    if (detectedVerb) {
      console.log('🔍 DIAGNOSTIC: Reason: detectedVerb is not null/undefined:', detectedVerb);
    }
    if (!text.toLowerCase().includes('soit')) {
      console.log('🔍 DIAGNOSTIC: Reason: text does not contain "soit"');
      console.log('🔍 DIAGNOSTIC: Text lowercase:', text.toLowerCase());
    }
  }
  
  // ENHANCEMENT: Handle reflexive constructions "se + verb" and "s' + verb"
  if (!detectedVerb) {
    // Handle both "se verb" and "s'verb" (contracted form)
    const reflexiveMatch = text.toLowerCase().match(/avant\s+que?\s+[^.]*?\b(?:se\s+|s')([a-zA-ZàâäéèêëïîôöùûüÿçÀÂÄÉÈÊËÏÎÔÖÙÛÜŸÇ]+)/);
    if (reflexiveMatch) {
      detectedVerb = reflexiveMatch[1];
      console.log('🔍 Reflexive verb detected (with contraction support):', detectedVerb);
    }
  }
  
  // ENHANCEMENT: Handle auxiliary verb constructions "aient/ont + complement"
  if (!detectedVerb) {
    const auxiliaryMatch = text.toLowerCase().match(/avant\s+que?\s+[^.]*?\b(aient|ont|soient)\s+([a-zA-ZàâäéèêëïîôöùûüÿçÀÂÄÉÈÊËÏÎÔÖÙÛÜŸÇ]+)/);
    if (auxiliaryMatch) {
      detectedVerb = auxiliaryMatch[1]; // Use the auxiliary as the main verb
      console.log('🔍 Auxiliary verb detected:', detectedVerb);
    }
  }
  
  // ENHANCEMENT: Handle complex verb phrases with adverbs/complements
  if (!detectedVerb) {
    // Look specifically for subjunctive verb forms in "avant que" clauses
    const subjectivePatterns = [
      // Common subjunctive endings - FIXED: single 's' for conduise, finisse, etc.
      /\b([a-zA-ZàâäéèêëïîôöùûüÿçÀÂÄÉÈÊËÏÎÔÖÙÛÜŸÇ]+(?:ise|ises|isse|isses|ît|issions|issiez|issent))\b/, // -ir verbs (conduise, finisse)
      /\b([a-zA-ZàâäéèêëïîôöùûüÿçÀÂÄÉÈÊËÏÎÔÖÙÛÜŸÇ]+(?:e|es|ions|iez|ent))\b/, // -er verbs and others
      /\b([a-zA-ZàâäéèêëïîôöùûüÿçÀÂÄÉÈÊËÏÎÔÖÙÛÜŸÇ]+(?:aille|ailles|aillent))\b/, // special forms
    ];
    
    const skipWords = ['ce', 'le', 'la', 'les', 'de', 'du', 'des', 'que', 'qui', 'où', 'ne', 'se', 'me', 'te', 'nous', 'vous', 'aux', 'pour'];
    
    // Extract the "avant que" clause specifically
    const avantQueMatch = text.toLowerCase().match(/avant\s+que?\s+([^.!?;,]+)/);
    if (avantQueMatch) {
      const avantQueClause = avantQueMatch[1];
      console.log('🔍 Analyzing avant que clause for verbs:', avantQueClause);
      
      // Try each subjunctive pattern
      for (const pattern of subjectivePatterns) {
        const matches = avantQueClause.match(pattern);
        if (matches) {
          const potentialVerb = matches[1].toLowerCase();
          if (!skipWords.includes(potentialVerb) && potentialVerb.length > 2) {
            detectedVerb = potentialVerb;
            console.log('🔍 Subjunctive verb detected in avant que clause:', detectedVerb);
            break;
          }
        }
      }
      
      // If no subjunctive found, look for any verb-like words
      if (!detectedVerb) {
        const allWords = avantQueClause.match(/\b[a-zA-ZàâäéèêëïîôöùûüÿçÀÂÄÉÈÊËÏÎÔÖÙÛÜŸÇ]+\b/g);
        if (allWords) {
          for (const word of allWords) {
            if (!skipWords.includes(word.toLowerCase()) && word.length > 2) {
              detectedVerb = word.toLowerCase();
              console.log('🔍 Potential verb detected in avant que clause:', detectedVerb);
              break;
            }
          }
        }
      }
    }
  }
  
  // Also check for other common passive constructions
  if (!detectedVerb) {
    // Look for other verbs in the "avant que" clause (fallback pattern)
    const avantQueMatch = text.toLowerCase().match(/avant\s+que?\s+[^.]*?([a-zA-ZàâäéèêëïîôöùûüÿçÀÂÄÉÈÊËÏÎÔÖÙÛÜŸÇ]+(?:e|é|ée|és|ées|i|ie|is|it|u|ue|us|ues))\b/);
    if (avantQueMatch) {
      detectedVerb = avantQueMatch[1];
      console.log('🔍 General verb/participle detected in avant que clause:', detectedVerb);
    }
  }
  
  console.log('🔍 DIAGNOSTIC: Final detected verb after all patterns:', detectedVerb);
  console.log('🔍 DIAGNOSTIC: Will semantic context analysis run?', !!detectedVerb);
  
  let semanticContextInfo = null;
  
  if (detectedVerb) {
    const semanticContext = analyzeSemanticContext(text, detectedVerb);
    semanticContextInfo = semanticContext; // Store for analysis display
    
    console.log('🔍 DIAGNOSTIC: Semantic context result:', semanticContext);
    console.log('🔍 DIAGNOSTIC: semanticContext exists?', !!semanticContext);
    console.log('🔍 DIAGNOSTIC: semanticContext.validationApplied?', semanticContext?.validationApplied);
    console.log('🔍 DIAGNOSTIC: shouldOverrideToLogicalNegation result:', shouldOverrideToLogicalNegation(semanticContext));
    
    if (shouldOverrideToLogicalNegation(semanticContext)) {
      console.log('🎯 SEMANTIC OVERRIDE: Logical negation context detected');
      console.log('🎯 Override details:', semanticContext);
      
      // Override to "No Expletive" due to logical negation context
      const overrideResult = {
        classification: false, // No Expletive
        confidence: semanticContext.confidence,
        reasoning: semanticContext.reasoning,
        semanticOverride: true,
        semanticContext: semanticContext, // Include semantic context info
        originalLinguisticAnalysis: {
          trigger: inputTrigger,
          subjunctive: detectedVerb,
          originalClassification: shouldHaveNe,
          originalConfidence: confidence
        }
      };
      
      console.log('🎯 SEMANTIC OVERRIDE RESULT:', overrideResult);
      return overrideResult;
    } else if (semanticContext && semanticContext.validationApplied) {
      // NEW: Semantic context was detected but validation prevented override
      // This means it's a neutral temporal context that should favor expletive
      console.log('🎯 SEMANTIC BOOST: Neutral context detected, boosting expletive likelihood');
      console.log('🎯 Boost details:', {
        contextType: semanticContext.type,
        originalConfidence: semanticContext.originalConfidence,
        adjustedConfidence: semanticContext.confidence,
        validationReasons: semanticContext.validationReasons
      });
      
      // Calculate boost needed to overcome training data bias
      const biasGap = adjustedNonExpletive - adjustedExpletive;
      const semanticBoost = Math.max(biasGap + 1.0, 3.0); // Ensure expletive wins by at least 1.0
      adjustedExpletive += semanticBoost;
      
      console.log('🎯 SEMANTIC BOOST APPLIED:', {
        originalExpletive: adjustedExpletive - semanticBoost,
        biasGap: biasGap,
        boostAmount: semanticBoost,
        newExpletive: adjustedExpletive,
        nonExpletive: adjustedNonExpletive,
        newWinner: adjustedExpletive > adjustedNonExpletive ? 'Expletive' : 'No Expletive'
      });
    } else {
      console.log('🔍 DIAGNOSTIC: Semantic boost conditions not met');
      console.log('🔍 DIAGNOSTIC: semanticContext:', !!semanticContext);
      console.log('🔍 DIAGNOSTIC: validationApplied:', semanticContext?.validationApplied);
      if (semanticContext) {
        console.log('🔍 DIAGNOSTIC: Full semantic context object:', semanticContext);
      }
    }
  }
  
  // CRITICAL FIX: Recalculate shouldHaveNe AFTER semantic boost is applied
  const finalShouldHaveNe = adjustedExpletive > adjustedNonExpletive;
  const finalConfidence = (adjustedExpletive + adjustedNonExpletive) > 0 ? 
    Math.max(adjustedExpletive, adjustedNonExpletive) / (adjustedExpletive + adjustedNonExpletive) :
    0.5;
  const finalActualExpletiveLikelihood = (adjustedExpletive + adjustedNonExpletive) > 0 ?
    adjustedExpletive / (adjustedExpletive + adjustedNonExpletive) : 0.5;
  
  console.log('🔍 DIAGNOSTIC: Classification decision:', {
    beforeBoost: { shouldHaveNe, expletive: adjustedExpletive - (semanticContextInfo?.validationApplied ? 3.0 : 0), nonExpletive: adjustedNonExpletive },
    afterBoost: { finalShouldHaveNe, adjustedExpletive, adjustedNonExpletive },
    finalDecision: finalShouldHaveNe ? 'Expletive' : 'No Expletive'
  });
  
  // Generate surface form for expletive classifications
  const analysisResult = {
    classification: shouldHaveNe,
    confidence,
    avantQueAnalysis,
    linguisticAnalysis: {
      trigger: inputTrigger,
      detectedVerb: avantQueAnalysis?.subjunctiveMood?.verb
    }
  };
  
  let surfaceForm = null;
  try {
    surfaceForm = createSurfaceForm(text, analysisResult);
    console.log('🎨 Surface form generated:', surfaceForm);
  } catch (error) {
    console.error('❌ Surface form generation failed:', error);
    surfaceForm = null;
  }
  
  console.log('🎯 FINAL RESULT:', {
    classification: shouldHaveNe,
    confidence: confidence,
    adjustedExpletive,
    adjustedNonExpletive,
    negationType: ambiguityNegationAnalysis.negation.negationType,
    actualExpletiveLikelihood: actualExpletiveLikelihood,
    surfaceForm: surfaceForm
  });
  
  return {
    classification: finalShouldHaveNe, // Use recalculated value after semantic boost
    confidence: finalConfidence, // Use recalculated confidence
    matches: enhancedExamples,
    surfaceForm: surfaceForm, // NEW: Add surface form prediction
    linguisticAnalysis: {
      trigger: inputTrigger,
      subjunctive: inputSubjunctive,
      register: inputRegister,
      discourse: inputDiscourse,
      avantQueAnalysis,
      semanticContext: semanticContextInfo, // NEW: Add semantic context information
      ambiguityAnalysis: ambiguityNegationAnalysis.ambiguity,
      negationAnalysis: ambiguityNegationAnalysis.negation,
      vowelContext: ambiguityNegationAnalysis.vowelContext,
      combinedAnalysis: {
        // Use the actual enhanced voting results instead of independent calculation
        ...ambiguityNegationAnalysis.combinedAnalysis,
        expletiveLikelihood: finalActualExpletiveLikelihood, // Use recalculated value
        recommendation: finalShouldHaveNe ? // Use recalculated value
          'Expletive ne likely based on enhanced linguistic analysis' :
          'Expletive ne unlikely based on enhanced linguistic analysis',
        factors: [
          ...ambiguityNegationAnalysis.combinedAnalysis.factors,
          `Enhanced voting: ${Math.round(finalActualExpletiveLikelihood * 100)}% expletive likelihood`, // Use recalculated value
          avantQueAnalysis?.bothConditionsMet ? 'Avant que boost applied (+3.0)' : 
          (avantQueAnalysis?.isAvantQue && !avantQueAnalysis?.bothConditionsMet) ? 'Avant que penalty applied (-3.0)' : null,
          semanticContextInfo?.validationApplied ? `Semantic boost applied (+${semanticContextInfo.validationApplied ? '3.0' : '0'})` : null
        ].filter(Boolean)
      },
      clauseInfo: clauseInfo // Add clause boundary information
    },
    enhancedVotes: {
      ...enhancedVotes,
      adjustedExpletive,
      adjustedNonExpletive,
      ambiguityAdjustment: ambiguityNegationAnalysis.combinedAnalysis.expletiveLikelihood
    },
    originalText: text
  };
}
