import { normalizeText } from './textProcessing';
import { TRIGGER_PATTERNS, SUBJUNCTIVE_PATTERNS, CONFIDENCE_LEVELS } from './patterns';
import { enhanceAvantQueAnalysis } from './avantQueAnalyzer';
import { PeurQueAnalyzer } from './peurQueAnalyzer';
import { analyzeLogicalNegationContext } from './logicalNegationDetector';
import { analyzeTextEnhanced } from './ruleBasedAnalyzer';
import { analyzeWithCorpusInsights } from './enhancedTrainingAnalyzer';

class NegationAnalyzer {
  constructor() {
    this.TRIGGER_PATTERNS = TRIGGER_PATTERNS;
    this.SUBJUNCTIVE_PATTERNS = SUBJUNCTIVE_PATTERNS;
    this.CONFIDENCE_LEVELS = CONFIDENCE_LEVELS;
  }

  // Check for "peur que" constructions
  detectPeurQue(text) {
    const peurQuePatterns = [
      /j'ai peur qu[e']/i,
      /j'avais peur qu[e']/i,
      /tu as peur qu[e']/i,
      /as-tu peur qu[e']/i,
      /il a peur qu[e']/i,
      /elle a peur qu[e']/i,
      /nous avons peur qu[e']/i,
      /vous avez peur qu[e']/i,
      /ils ont peur qu[e']/i,
      /elles ont peur qu[e']/i,
      /de peur qu[e']/i,
      /dans la crainte qu[e']/i
    ];

    for (const pattern of peurQuePatterns) {
      if (pattern.test(text)) {
        return {
          found: true,
          pattern: pattern.source,
          trigger: 'peur que'
        };
      }
    }
    return { found: false };
  }

  // Extract trigger with subcategory
  extractTrigger(text) {
    const normalizedText = normalizeText(text.toLowerCase());
    
    // Check TEMPORAL category with subcategories
    if (this.TRIGGER_PATTERNS.TEMPORAL) {
      for (const [subcategory, patterns] of Object.entries(this.TRIGGER_PATTERNS.TEMPORAL)) {
        for (const pattern of patterns) {
          const match = normalizedText.match(pattern);
          if (match) {
            return {
              category: 'TEMPORAL',
              subcategory,
              pattern: pattern.source,
              trigger: match[0],
              position: match.index
            };
          }
        }
      }
    }

    // Check other categories
    for (const [category, patterns] of Object.entries(this.TRIGGER_PATTERNS)) {
      if (category === 'TEMPORAL') continue;
      
      const categoryPatterns = Array.isArray(patterns) ? patterns : [patterns];
      for (const pattern of categoryPatterns) {
        const match = normalizedText.match(pattern);
        if (match) {
          return {
            category,
            pattern: pattern.source,
            trigger: match[0],
            position: match.index
          };
        }
      }
    }
    return null;
  }

  // Check for subjunctive forms
  hasSubjunctive(text) {
    for (const [type, pattern] of Object.entries(this.SUBJUNCTIVE_PATTERNS)) {
      if (pattern.pattern.test(text)) {
        return {
          found: true,
          type,
          priority: pattern.priority || 0
        };
      }
    }
    return { found: false };
  }

  // Find que/qu' position
  findQuePosition(text, triggerInfo) {
    if (!triggerInfo) return null;
    
    const normalizedText = normalizeText(text.toLowerCase());
    const triggerEnd = triggerInfo.position + triggerInfo.trigger.length;
    
    const afterTrigger = normalizedText.slice(triggerEnd);
    const queMatch = afterTrigger.match(/qu[e']/i);
    
    if (queMatch) {
      const quePos = triggerEnd + queMatch.index + queMatch[0].length;
      const betweenText = normalizedText.slice(triggerEnd, triggerEnd + queMatch.index);
      const hasIntervening = /[.!?]|\bet\b|\bmais\b/.test(betweenText);
      
      if (!hasIntervening) {
        return quePos;
      }
    }
    return null;
  }

  /**
   * Corpus-enhanced negation analysis - addresses overcorrection problem
   * Uses semantic hierarchy: Logical > Expletive > Syntactic
   * NOW INCLUDES: PeurQueAnalyzer integration for "peur que" constructions
   */
  async analyzeNegationEnhanced(text, analysisMode = 'RULE_BASED', trainingData = null) {
    console.log('🧠 CORPUS-ENHANCED ANALYSIS:', { text: text.substring(0, 50), mode: analysisMode });
    
    try {
      // Check for "peur que" constructions first (highest priority)
      const peurQueDetection = this.detectPeurQue(text);
      if (peurQueDetection.found) {
        console.log('🎯 Using corpus-enhanced PeurQueAnalyzer for "peur que" construction');
        
        const peurQueResult = PeurQueAnalyzer.analyze(text);
        
        // Convert to enhanced analysis format
        const result = {
          prediction: peurQueResult.prediction,
          confidence: peurQueResult.confidence / 100, // Convert to decimal
          likelihood: peurQueResult.likelihood,
          mode: 'PEUR_QUE_CORPUS_ENHANCED',
          evidence: this.buildPeurQueEvidence(peurQueResult, text),
          peurQueAnalysis: peurQueResult,
          corpusEnhanced: true,
          analysisVersion: '2.1.0',
          correctionApplied: peurQueResult.antiExpletiveFactor ? 'anti-expletive-override' : 
                           peurQueResult.proExpletiveFactor ? 'pro-expletive-boost' : 'none'
        };
        
        console.log('✅ PEUR QUE CORPUS-ENHANCED ANALYSIS COMPLETE:', {
          prediction: result.prediction,
          confidence: result.confidence,
          expletiveRate: peurQueResult.expletiveRate
        });
        
        return result;
      }
      
      let result;
      
      if (analysisMode === 'RULE_BASED') {
        console.log('🔧 Using enhanced rule-based analysis...');
        // Use enhanced rule-based analysis with corpus insights
        result = analyzeTextEnhanced(text);
        console.log('📊 Enhanced analysis result:', result);
        
        // Add standard fields for compatibility
        result.mode = 'RULE_BASED_ENHANCED';
        result.evidence = this.buildEnhancedEvidence(result, text);
        
      } else if (analysisMode === 'TRAINING_DATA' && trainingData) {
        console.log('🔧 Using enhanced training data analysis...');
        // Use corpus-enhanced training data analysis
        result = analyzeWithCorpusInsights(text, trainingData);
        
        // Add standard fields for compatibility
        result.mode = 'TRAINING_DATA_ENHANCED';
        result.evidence = this.buildTrainingEnhancedEvidence(result, text);
        
      } else {
        // Fallback to original analysis
        console.log('⚠️  Falling back to original analysis - mode:', analysisMode, 'trainingData:', !!trainingData);
        return await this.analyzeNegation(text);
      }
      
      // Add corpus-specific metadata
      result.corpusEnhanced = true;
      result.analysisVersion = '2.1.0';
      result.overcorrectionAddressed = true;
      
      console.log('✅ CORPUS-ENHANCED ANALYSIS COMPLETE:', {
        prediction: result.prediction,
        confidence: result.confidence,
        correctionApplied: result.correctionApplied || 'none'
      });
      
      return result;
      
    } catch (error) {
      console.error('❌ Corpus-enhanced analysis failed:', error);
      console.log('🔄 Falling back to original analysis due to error');
      // Fallback to original analysis
      return await this.analyzeNegation(text);
    }
  }
  
  /**
   * Build evidence for PeurQueAnalyzer results
   */
  buildPeurQueEvidence(peurQueResult, text) {
    const evidence = {
      trigger: 'peur que',
      category: 'EMOTIONAL',
      subcategory: 'fear_expression',
      hasSubjunctive: true,
      hasOptionalNe: /\b(?:n['e])\b/i.test(text),
      details: []
    };
    
    // Add corpus-enhanced analysis details
    evidence.details.push(`Corpus-enhanced "peur que" analysis`);
    evidence.details.push(`Prediction: ${peurQueResult.prediction} (${peurQueResult.confidence}% confidence)`);
    evidence.details.push(`Expletive likelihood: ${peurQueResult.likelihood}/7`);
    evidence.details.push(`Corpus baseline: ${(peurQueResult.corpusBaseline * 100).toFixed(0)}%`);
    
    // Add contextual rate information
    if (peurQueResult.expletiveRate !== peurQueResult.corpusBaseline) {
      evidence.details.push(`Contextual rate: ${(peurQueResult.expletiveRate * 100).toFixed(1)}%`);
    }
    
    // Add semantic domain information
    if (peurQueResult.semanticDomains && peurQueResult.semanticDomains.length > 0) {
      evidence.details.push(`Semantic domains: ${peurQueResult.semanticDomains.join(', ')}`);
    }
    
    // Add emotional intensity
    if (peurQueResult.emotionalIntensity && peurQueResult.emotionalIntensity !== 'neutral') {
      evidence.details.push(`Emotional intensity: ${peurQueResult.emotionalIntensity}`);
    }
    
    // Add factor-specific overrides
    if (peurQueResult.antiExpletiveFactor) {
      evidence.details.push(`🚫 Anti-expletive override: ${peurQueResult.antiExpletiveFactor}`);
    }
    
    if (peurQueResult.proExpletiveFactor) {
      evidence.details.push(`✨ Pro-expletive enhancement: ${peurQueResult.proExpletiveFactor}`);
    }
    
    // Add discourse markers if present
    if (peurQueResult.discourseMarkers && peurQueResult.discourseMarkers.length > 0) {
      const markers = peurQueResult.discourseMarkers.map(m => m.type).join(', ');
      evidence.details.push(`Discourse markers: ${markers}`);
    }
    
    // Add reasoning
    evidence.details.push(`Reasoning: ${peurQueResult.reasoning}`);
    
    return evidence;
  }
  
  /**
   * Build enhanced evidence for rule-based analysis
   */
  buildEnhancedEvidence(result, text) {
    const evidence = {
      trigger: null,
      category: null,
      hasSubjunctive: false,
      details: []
    };
    
    // Extract trigger information from semantic analysis
    if (result.semanticAnalysis?.syntacticAnalysis?.triggers?.length > 0) {
      const trigger = result.semanticAnalysis.syntacticAnalysis.triggers[0];
      evidence.trigger = trigger.trigger;
      evidence.category = trigger.type.toUpperCase();
      evidence.details.push(`Found trigger "${trigger.trigger}" (${trigger.type})`);
    }
    
    // Add logical analysis details
    if (result.semanticAnalysis?.logicalAnalysis?.level !== 'none') {
      const logical = result.semanticAnalysis.logicalAnalysis;
      evidence.details.push(`Logical strength: ${logical.level} (score: ${logical.score.toFixed(1)})`);
      if (logical.indicators.length > 0) {
        evidence.details.push(`Logical indicators: ${logical.indicators.map(i => i.indicator).join(', ')}`);
      }
    }
    
    // Add expletive context details
    if (result.semanticAnalysis?.expletiveAnalysis?.strength !== 'none') {
      const expletive = result.semanticAnalysis.expletiveAnalysis;
      evidence.details.push(`Expletive context: ${expletive.strength} (score: ${expletive.score.toFixed(1)})`);
      if (expletive.contexts.length > 0) {
        evidence.details.push(`Expletive contexts: ${expletive.contexts.map(c => c.context).join(', ')}`);
      }
    }
    
    // Add correction information
    if (result.correctionApplied) {
      evidence.details.push(`Corpus correction: ${result.correctionApplied}`);
    }
    
    // Add corpus insights
    if (result.corpusInsights?.length > 0) {
      result.corpusInsights.forEach(insight => {
        evidence.details.push(`${insight.type}: ${insight.message}`);
      });
    }
    
    return evidence;
  }
  
  /**
   * Build enhanced evidence for training data analysis
   */
  buildTrainingEnhancedEvidence(result, text) {
    const evidence = {
      trigger: null,
      category: null,
      hasSubjunctive: false,
      details: []
    };
    
    // Add training data analysis details
    if (result.originalReasoning) {
      evidence.details.push(`Training analysis: ${result.originalReasoning}`);
    }
    
    // Add semantic analysis details
    if (result.semanticAnalysis) {
      const semantic = result.semanticAnalysis;
      
      if (semantic.logicalAnalysis?.level !== 'none') {
        evidence.details.push(`Logical strength: ${semantic.logicalAnalysis.level}`);
      }
      
      if (semantic.expletiveAnalysis?.strength !== 'none') {
        evidence.details.push(`Expletive context: ${semantic.expletiveAnalysis.strength}`);
      }
      
      if (semantic.conflictAnalysis?.hasConflict) {
        evidence.details.push(`Conflict resolution: ${semantic.conflictAnalysis.resolution.reasoning}`);
      }
    }
    
    // Add corpus correction information
    if (result.correctionApplied) {
      evidence.details.push(`Corpus correction: ${result.correctionApplied}`);
    }
    
    // Add boost information
    if (result.boostApplied !== undefined) {
      evidence.details.push(`Training boost: ${result.boostApplied ? 'applied' : 'not applied'}`);
    }
    
    // Add corpus insights
    if (result.corpusInsights?.length > 0) {
      result.corpusInsights.forEach(insight => {
        evidence.details.push(`${insight.type}: ${insight.message}`);
      });
    }
    
    return evidence;
  }

  /**
   * Original analysis method - ENHANCED with PeurQueAnalyzer integration
   */
  async analyzeNegation(text) {
    const normalizedText = normalizeText(text);
    
    // Check for "peur que" constructions first (corpus-enhanced analysis)
    const peurQueDetection = this.detectPeurQue(normalizedText);
    if (peurQueDetection.found) {
      console.log('🎯 Detected "peur que" construction - using corpus-enhanced analyzer');
      
      try {
        const peurQueResult = PeurQueAnalyzer.analyze(text);
        
        // Convert PeurQueAnalyzer result to NegationAnalyzer format
        const evidence = {
          trigger: peurQueDetection.trigger,
          category: 'EMOTIONAL',
          subcategory: 'fear_expression',
          hasSubjunctive: true, // peur que typically requires subjunctive
          hasOptionalNe: /\b(?:n['e])\b/i.test(normalizedText),
          details: [
            `Corpus-enhanced "peur que" analysis: ${peurQueResult.prediction}`,
            `Confidence: ${peurQueResult.confidence}% (corpus-derived)`,
            `Expletive likelihood: ${peurQueResult.likelihood}/7`,
            `Corpus baseline: ${(peurQueResult.corpusBaseline * 100).toFixed(0)}%`,
            `Contextual rate: ${(peurQueResult.expletiveRate * 100).toFixed(1)}%`,
            `Trigger pattern: weight ${peurQueResult.triggerPattern ? '0.85' : 'N/A'}, frequency 312`
          ]
        };

        // Add semantic domain information
        if (peurQueResult.semanticDomains && peurQueResult.semanticDomains.length > 0) {
          evidence.details.push(`Semantic domains: ${peurQueResult.semanticDomains.join(', ')}`);
        }

        // Add emotional intensity
        if (peurQueResult.emotionalIntensity && peurQueResult.emotionalIntensity !== 'neutral') {
          evidence.details.push(`Emotional intensity: ${peurQueResult.emotionalIntensity}`);
        }

        // Add factor-specific details
        if (peurQueResult.antiExpletiveFactor) {
          evidence.details.push(`Anti-expletive override: ${peurQueResult.antiExpletiveFactor}`);
        }
        if (peurQueResult.proExpletiveFactor) {
          evidence.details.push(`Pro-expletive enhancement: ${peurQueResult.proExpletiveFactor}`);
        }

        // Add reasoning summary
        evidence.details.push(`Analysis: ${peurQueResult.reasoning}`);

        return {
          type: peurQueResult.prediction,
          classification: peurQueResult.prediction,
          confidence: peurQueResult.confidence / 100, // Convert percentage to decimal
          likelihood: peurQueResult.likelihood, // 1-7 scale
          evidence,
          peurQueAnalysis: peurQueResult, // Include full analysis
          corpusEnhanced: true,
          analysisVersion: '2.1.0'
        };
        
      } catch (error) {
        console.error('❌ PeurQueAnalyzer failed, falling back to standard analysis:', error);
        // Continue with standard analysis below
      }
    }
    
    // Find trigger with subcategory (standard analysis)
    const foundTrigger = this.extractTrigger(normalizedText);
    
    // Check for subjunctive
    const subjunctiveInfo = this.hasSubjunctive(normalizedText);
    
    // Find que position
    const quePosition = foundTrigger ? this.findQuePosition(normalizedText, foundTrigger) : null;
    
    // Check for optional ne
    const hasOptionalNe = /\b(?:n['e])\b/i.test(normalizedText);

    // Enhanced avant que analysis
    let enhancedAvantQue = null;
    if (foundTrigger && foundTrigger.trigger.includes('avant')) {
      enhancedAvantQue = enhanceAvantQueAnalysis(text, foundTrigger);
    }

    // Build evidence object
    const evidence = {
      trigger: foundTrigger?.trigger || null,
      category: foundTrigger?.category || null,
      subcategory: foundTrigger?.subcategory || null,
      hasSubjunctive: subjunctiveInfo.found,
      subjunctiveType: subjunctiveInfo.type,
      hasOptionalNe,
      quePosition,
      details: []
    };

    // Add trigger evidence
    if (foundTrigger) {
      evidence.details.push(`Found trigger "${foundTrigger.trigger}"`);
      if (foundTrigger.category === 'TEMPORAL' && foundTrigger.subcategory) {
        evidence.details.push(`Temporal usage: ${foundTrigger.subcategory.toLowerCase()}`);
      }
    } else {
      evidence.details.push('No expletive triggers found');
    }

    // Add subjunctive evidence
    if (subjunctiveInfo.found) {
      evidence.details.push(`Found subjunctive form (${subjunctiveInfo.type})`);
    } else if (foundTrigger) {
      evidence.details.push('Missing required subjunctive mood');
    }

    // Enhanced avant que analysis takes precedence
    if (enhancedAvantQue && enhancedAvantQue.isAvantQue) {
      // Add enhanced analysis details to evidence
      evidence.details.push(`Enhanced avant que analysis: ${enhancedAvantQue.classificationReason}`);
      if (enhancedAvantQue.complementClause.isComplementClause) {
        evidence.details.push('Complement clause detected');
      }
      if (enhancedAvantQue.subjunctiveMood.hasSubjunctive) {
        evidence.details.push(`Subjunctive mood confirmed: ${enhancedAvantQue.subjunctiveMood.verb}`);
      }

      return {
        type: enhancedAvantQue.classification,
        classification: enhancedAvantQue.classification,
        confidence: enhancedAvantQue.confidence,
        evidence,
        enhancedAvantQue // Include enhanced analysis in results
      };
    }

    // Determine classification and confidence using original logic
    if (foundTrigger && subjunctiveInfo.found) {
      // CRITICAL: Check for logical negation context before classifying as expletive
      const logicalNegationAnalysis = analyzeLogicalNegationContext(text, { trigger: foundTrigger.trigger });
      
      if (logicalNegationAnalysis.isLogicalNegation && logicalNegationAnalysis.confidence > 0.4) {
        // This is logical negation, not expletive
        evidence.details.push(`Logical negation detected: ${logicalNegationAnalysis.reasoning}`);
        evidence.details.push(`Evidence: ${logicalNegationAnalysis.evidence.join(', ')}`);
        
        return {
          type: 'No Expletive',
          classification: 'No Expletive',
          confidence: Math.min(0.9, 0.7 + logicalNegationAnalysis.confidence * 0.2),
          evidence,
          logicalNegationOverride: true
        };
      }
      
      // Expletive case: Has trigger and subjunctive (no logical negation detected)
      return {
        type: 'Expletive',
        classification: 'Expletive',  // Add explicit classification
        confidence: hasOptionalNe ? 
          this.CONFIDENCE_LEVELS.NO_TRIGGER : 
          this.CONFIDENCE_LEVELS.EXPLETIVE,
        evidence
      };
    } else if (foundTrigger && !subjunctiveInfo.found) {
      // Has trigger but no subjunctive
      return {
        type: 'No Expletive',
        classification: 'No Expletive',  // Add explicit classification
        confidence: this.CONFIDENCE_LEVELS.NO_SUBJUNCTIVE,
        evidence
      };
    } else {
      // No expletive triggers
      return {
        type: 'No Expletive',
        classification: 'No Expletive',  // Add explicit classification
        confidence: this.CONFIDENCE_LEVELS.NO_TRIGGER,
        evidence
      };
    }
  }
}

export default NegationAnalyzer;
