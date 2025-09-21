/**
 * Unified September 2025 Empirical Analyzer
 * 
 * Single, clean implementation based on 5,000-example balanced corpus
 * Replaces all competing analyzers with consistent empirical approach
 */

class UnifiedEmpiricalAnalyzer {
  constructor() {
    // September 2025 empirical rates from balanced corpus
    this.triggerRates = {
      'peur_que': 0.507,      // 50.7% in emotional contexts
      'avant_que': 0.500,     // 50.0% baseline
      'avant_de': 0.636,      // 63.6% in emotional contexts  
      'sen_faut_que': 0.744,  // 74.4% in literary contexts
      'moins_plus': 0.500,    // 50.0% baseline
      'unknown': 0.100        // 10% for no clear trigger
    };

    this.registerModifiers = {
      'literary': 0.744,      // 74.4% empirical rate
      'formal': 0.667,        // 66.7% empirical rate
      'technical': 0.300,     // 30.0% (reduces likelihood)
      'conversational': 0.200, // 20.0% (reduces likelihood)
      'neutral': 0.500        // 50.0% baseline
    };
  }

  /**
   * Main analysis method - single entry point
   */
  analyze(text, mode = 'sentence') {
    console.log('🔬 UNIFIED EMPIRICAL ANALYZER (September 2025):', { 
      text: text.substring(0, 40) + '...', 
      mode 
    });

    // Step 1: Detect trigger
    const trigger = this.detectTrigger(text);
    
    // Step 2: Analyze register
    const register = this.detectRegister(text);
    
    // Step 3: Check for logical negation override
    const hasLogicalNegation = this.hasLogicalNegation(text);
    if (hasLogicalNegation) {
      return this.buildResult('No Expletive', 0.95, 'Logical negation detected', {
        trigger, register, override: 'logical-negation'
      });
    }

    // Step 4: Calculate empirical probability
    let probability = this.calculateProbability(trigger, register, text, mode);
    
    // Step 5: Apply subjunctive paradox (empirical finding)
    if (this.hasSubjunctive(text)) {
      probability -= 0.12; // Subjunctive reduces expletive likelihood
    }

    // Step 6: Clamp and determine prediction
    probability = Math.max(0.05, Math.min(0.95, probability));
    const prediction = probability > 0.5 ? 'Expletive' : 'No Expletive';
    const confidence = Math.abs(probability - 0.5) * 2;

    return this.buildResult(prediction, confidence, this.buildReasoning(trigger, register, probability), {
      trigger, register, probability, mode
    });
  }

  /**
   * Detect trigger type with empirical patterns
   */
  detectTrigger(text) {
    const patterns = {
      'peur_que': /\b(?:peur\s+(?:que|qu['']))\b/i,
      'avant_que': /\b(?:avant\s+(?:que|qu['']))\b/i,
      'avant_de': /\b(?:avant\s+de?)\b/i,
      'sen_faut_que': /\b(?:(?:peu\s+)?s['']en\s+(?:faut|fallut))\b/i,
      'moins_plus': /\b(?:plus|moins)\s+.*\s+(?:que|qu[''])\b/i
    };

    for (const [trigger, pattern] of Object.entries(patterns)) {
      if (pattern.test(text)) {
        return { name: trigger, found: true };
      }
    }
    
    return { name: 'unknown', found: false };
  }

  /**
   * Detect register with empirical markers
   */
  detectRegister(text) {
    const patterns = {
      literary: /\b(?:fallut|eût|fût|naguère|jadis|désormais|submergeât)\b/i,
      formal: /\b(?:il\s+convient|par\s+conséquent|en\s+conséquence|monsieur|madame)\b/i,
      technical: /\b(?:système|processus|données|paramètres|configuration)\b/i,
      conversational: /\b(?:bon|allez|ça|ouais|ben|alors|faut\s+qu'on)\b/i
    };

    for (const [register, pattern] of Object.entries(patterns)) {
      if (pattern.test(text)) {
        return register;
      }
    }
    
    return 'neutral';
  }

  /**
   * Check for logical negation (overrides expletive)
   */
  hasLogicalNegation(text) {
    const patterns = [
      /\b(?:pas|jamais|plus|rien|personne|aucun|nulle?)\b/i,
      /\b(?:refuse|interdit|empêche|évite)\b/i,
      /\b(?:impossible|trop\s+tard|inutile)\b/i
    ];
    
    return patterns.some(pattern => pattern.test(text));
  }

  /**
   * Check for subjunctive (paradox: reduces expletive likelihood)
   */
  hasSubjunctive(text) {
    const patterns = [
      /\b(?:sois|soit|soyons|soyez|soient)\b/i, // être
      /\b(?:aie|ait|ayons|ayez|aient)\b/i,      // avoir
      /\b(?:fasse|fasses|fassions|fassiez|fassent)\b/i, // faire
      /\b(?:vienne|viennes|venions|veniez|viennent)\b/i, // venir
      /\b(?:parte|partes|partions|partiez|partent)\b/i   // partir
    ];
    
    return patterns.some(pattern => pattern.test(text));
  }

  /**
   * Calculate empirical probability using September 2025 hierarchy
   */
  calculateProbability(trigger, register, text, mode) {
    // Priority 1: Register (primary predictor - 2.43x correlation)
    let probability = this.registerModifiers[register.name || register] || 0.5;
    
    // Priority 2: Trigger-specific adjustments
    if (trigger.found) {
      const triggerRate = this.triggerRates[trigger.name];
      
      // Special combinations
      if (trigger.name === 'sen_faut_que' && register === 'literary') {
        probability = 0.744; // Override with specific empirical rate
      } else if (trigger.name === 'peur_que' && this.hasEmotionalContext(text)) {
        probability = Math.max(probability, 0.507);
      } else if (trigger.name === 'avant_de' && this.hasEmotionalContext(text)) {
        probability = Math.max(probability, 0.636);
      } else {
        probability = Math.max(probability, triggerRate);
      }
    }
    
    // Priority 3: Mode-specific discourse analysis (paragraph mode only)
    if (mode === 'paragraph') {
      if (register === 'formal' || register === 'literary') {
        probability += 0.08; // +8% discourse boost for formal contexts
      }
      if (text.split(/[,;:]/).length > 2) {
        probability += 0.03; // +3% for complex syntax
      }
    }
    
    return probability;
  }

  /**
   * Check for emotional context
   */
  hasEmotionalContext(text) {
    return /\b(?:peur|crainte|anxiété|inquiétude|angoisse|stress|émotion)\b/i.test(text);
  }

  /**
   * Build reasoning explanation
   */
  buildReasoning(trigger, register, probability) {
    const parts = [];
    
    if (trigger.found) {
      parts.push(`Trigger: ${trigger.name} (${(this.triggerRates[trigger.name] * 100).toFixed(1)}% baseline)`);
    } else {
      parts.push('No clear trigger detected');
    }
    
    if (register !== 'neutral') {
      parts.push(`Register: ${register} (${(this.registerModifiers[register] * 100).toFixed(1)}% rate)`);
    }
    
    parts.push(`Final: ${(probability * 100).toFixed(1)}% expletive likelihood`);
    
    return parts.join(' | ');
  }

  /**
   * Build standardized result object
   */
  buildResult(prediction, confidence, reasoning, details) {
    return {
      type: prediction,
      prediction: prediction,
      confidence: confidence,
      reasoning: reasoning,
      empiricalBasis: 'September 2025 corpus (5,000 examples)',
      mode: details.mode || 'sentence',
      trigger: details.trigger?.name || 'unknown',
      register: details.register || 'neutral',
      probability: details.probability || (prediction === 'Expletive' ? 0.6 : 0.4),
      correctionApplied: details.override || 'none',
      evidence: [
        '🔬 UNIFIED EMPIRICAL ANALYSIS (September 2025)',
        `Trigger: ${details.trigger?.name || 'none'} (${details.trigger?.found ? 'detected' : 'not found'})`,
        `Register: ${details.register || 'neutral'}`,
        `Probability: ${details.probability ? (details.probability * 100).toFixed(1) + '%' : 'N/A'}`,
        `Prediction: ${prediction}`,
        `Confidence: ${(confidence * 100).toFixed(1)}%`,
        '',
        'Based on balanced corpus analysis with empirical hierarchy:',
        '1. Register analysis (primary predictor)',
        '2. Trigger-specific rates', 
        '3. Subjunctive paradox correction',
        '4. Discourse factors (paragraph mode)'
      ]
    };
  }
}

export default UnifiedEmpiricalAnalyzer;
