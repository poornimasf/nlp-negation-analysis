import { normalizeText } from './textProcessing';
import UnifiedEmpiricalAnalyzer from './unifiedEmpiricalAnalyzer';

/**
 * Simplified NegationAnalyzer using unified September 2025 empirical approach
 * Replaces all competing analyzers with single, consistent system
 */
class NegationAnalyzer {
  constructor() {
    this.unifiedAnalyzer = new UnifiedEmpiricalAnalyzer();
  }

  /**
   * Main analysis method - now uses only unified empirical analyzer
   */
  async analyzeNegationEnhanced(text, analysisMode = 'RULE_BASED', trainingData = null, mode = 'sentence') {
    console.log('🎯 SIMPLIFIED ANALYSIS: Using unified September 2025 empirical analyzer');
    
    // Normalize input text
    const normalizedText = normalizeText(text);
    
    // Use unified empirical analyzer for all sentences
    const result = this.unifiedAnalyzer.analyze(normalizedText, mode);
    
    // Add compatibility fields for existing UI
    result.analysisVersion = '3.0.0-unified';
    result.corpusEnhanced = true;
    result.mode = analysisMode;
    
    console.log('✅ UNIFIED ANALYSIS COMPLETE:', {
      prediction: result.prediction,
      confidence: `${(result.confidence * 100).toFixed(1)}%`,
      trigger: result.trigger,
      register: result.register
    });
    
    return result;
  }

  /**
   * Legacy method for backward compatibility
   */
  async analyzeNegation(text) {
    return this.analyzeNegationEnhanced(text, 'RULE_BASED', null, 'sentence');
  }

  /**
   * Build evidence for display (simplified)
   */
  buildEnhancedEvidence(result, text) {
    return result.evidence || [
      '🔬 Unified September 2025 Empirical Analysis',
      `Prediction: ${result.prediction}`,
      `Confidence: ${(result.confidence * 100).toFixed(1)}%`,
      `Reasoning: ${result.reasoning}`
    ];
  }

  /**
   * Build training enhanced evidence (compatibility)
   */
  buildTrainingEnhancedEvidence(result, text) {
    return this.buildEnhancedEvidence(result, text);
  }

  /**
   * Build peur que evidence (compatibility)
   */
  buildPeurQueEvidence(result, text) {
    return this.buildEnhancedEvidence(result, text);
  }
}

export default NegationAnalyzer;
