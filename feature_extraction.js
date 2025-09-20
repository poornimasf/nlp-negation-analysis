const fs = require('fs');

class FeatureExtractor {
  constructor() {
    // Empirically derived trigger strengths from corpus analysis
    this.triggerStrengths = {
      'sen_faut_que': 0.744, // 74.4% expletive rate
      'peur_que': 0.667,     // 66.7% expletive rate
      'avant_que': 0.421,    // 42.1% expletive rate
      'avant_de': 0.429,     // 42.9% expletive rate
      'moins_plus': 0.200    // 20.0% expletive rate
    };
  }

  // Syntactic feature extraction
  extractSyntacticFeatures(text) {
    const features = {};
    
    // Trigger detection
    features.trigger_type = this.detectTrigger(text);
    features.trigger_strength = this.triggerStrengths[features.trigger_type] || 0.5;
    
    // Subjunctive analysis
    features.subjunctive_present = this.hasSubjunctive(text);
    features.subjunctive_type = this.getSubjunctiveType(text);
    
    // Sentence structure
    features.sentence_length = text.length;
    features.word_count = text.split(/\s+/).length;
    features.clause_complexity = this.analyzeClauseComplexity(text);
    
    return features;
  }

  // Semantic feature extraction
  extractSemanticFeatures(text) {
    const features = {};
    
    // Context detection
    features.emotional_context = this.detectEmotionalContext(text);
    features.temporal_context = this.detectTemporalContext(text);
    features.logical_context = this.detectLogicalContext(text);
    
    // Semantic field classification
    features.semantic_field = this.classifySemanticField(text);
    
    return features;
  }

  // Discourse feature extraction (sentence-level)
  extractSentenceDiscourseFeatures(text) {
    const features = {};
    
    // Register detection
    features.register = this.detectRegister(text);
    features.register_score = this.calculateRegisterScore(text);
    
    // Discourse markers
    features.discourse_markers = this.countDiscourseMarkers(text);
    features.speaker_stance = this.detectSpeakerStance(text);
    
    return features;
  }

  // Enhanced discourse features (paragraph-level)
  extractParagraphDiscourseFeatures(text) {
    const features = this.extractSentenceDiscourseFeatures(text);
    
    // Coherence analysis
    features.coherence_markers = this.countCoherenceMarkers(text);
    features.context_depth = this.analyzeContextDepth(text);
    
    // Multi-sentence analysis
    features.sentence_count = this.countSentences(text);
    features.discourse_complexity = this.assessDiscourseComplexity(text);
    
    return features;
  }

  // Trigger detection
  detectTrigger(text) {
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

  // Subjunctive detection
  hasSubjunctive(text) {
    const subjunctivePatterns = [
      /\b(soit|soient|ait|aient|fasse|fassent|vienne|viennent)\b/gi,
      /\b(puisse|puissent|veuille|veuillent|sache|sachent)\b/gi,
      /\b(aille|aillent)\b/gi
    ];
    
    return subjunctivePatterns.some(pattern => pattern.test(text));
  }

  getSubjunctiveType(text) {
    if (/\b(soit|soient|ait|aient|fasse|fassent)\b/gi.test(text)) {
      return 'irregular';
    }
    if (/\b\w+isse\b/gi.test(text)) {
      return 'regular_ir';
    }
    if (/\b\w+e\b/gi.test(text)) {
      return 'regular_er';
    }
    return 'none';
  }

  // Clause complexity analysis
  analyzeClauseComplexity(text) {
    const clauseMarkers = (text.match(/qu[e']/gi) || []).length;
    const conjunctions = (text.match(/\b(et|ou|mais|car|donc|or|ni)\b/gi) || []).length;
    return clauseMarkers + conjunctions;
  }

  // Emotional context detection
  detectEmotionalContext(text) {
    const emotionalMarkers = [
      /\b(peur|crainte?|redoute?|anxiét|inquiét|effrai)\b/gi,
      /\b(joie|bonheur|plaisir|content|heureux)\b/gi,
      /\b(colère|rage|fureur|irrité|fâché)\b/gi
    ];
    
    return emotionalMarkers.some(pattern => pattern.test(text));
  }

  // Temporal context detection
  detectTemporalContext(text) {
    const temporalMarkers = [
      /\b(avant|après|pendant|durant|lors)\b/gi,
      /\b(temps|moment|instant|époque|période)\b/gi,
      /\b(tôt|tard|rapidement|lentement)\b/gi
    ];
    
    return temporalMarkers.some(pattern => pattern.test(text));
  }

  // Logical context detection
  detectLogicalContext(text) {
    const logicalMarkers = [
      /\b(plus|moins|autant|davantage)\b/gi,
      /\b(parce\s+que|car|donc|ainsi|par\s+conséquent)\b/gi,
      /\b(si|condition|cas|supposer)\b/gi
    ];
    
    return logicalMarkers.some(pattern => pattern.test(text));
  }

  // Semantic field classification
  classifySemanticField(text) {
    if (this.detectEmotionalContext(text)) return 'emotional';
    if (this.detectTemporalContext(text)) return 'temporal';
    if (this.detectLogicalContext(text)) return 'logical';
    return 'neutral';
  }

  // Register detection (empirically validated patterns)
  detectRegister(text) {
    const registerPatterns = {
      literary: /\b(fallut|eût|fût|submergeât|contempla|irréparable|naguère|jadis|désormais)\b/gi,
      formal: /\b(il\s+convient\s+de|par\s+conséquent|en\s+conséquence|ainsi|donc|monsieur|madame)\b/gi,
      technical: /\b(système|processus|données|paramètres|installation|configuration|procédure)\b/gi,
      conversational: /\b(bon|allez|dépêche|faut\s+qu'on|ça|ouais|nan|ben|alors)\b/gi
    };
    
    const scores = {};
    for (const [register, pattern] of Object.entries(registerPatterns)) {
      scores[register] = (text.match(pattern) || []).length;
    }
    
    const maxRegister = Object.entries(scores).reduce((a, b) => 
      scores[a[0]] > scores[b[0]] ? a : b
    );
    
    return maxRegister[1] > 0 ? maxRegister[0] : 'neutral';
  }

  // Register score calculation
  calculateRegisterScore(text) {
    const register = this.detectRegister(text);
    // Empirically derived correlations from corpus analysis
    const registerCorrelations = {
      literary: 2.53,      // 2.53x correlation with expletive
      formal: 1.77,        // 1.77x correlation
      conversational: 1.24, // 1.24x correlation
      technical: 0.67,     // 0.67x correlation (favors non-expletive)
      neutral: 1.0
    };
    
    return registerCorrelations[register] || 1.0;
  }

  // Discourse markers counting
  countDiscourseMarkers(text) {
    const discourseMarkers = [
      /\b(cependant|néanmoins|toutefois|pourtant)\b/gi,
      /\b(ainsi|donc|par\s+conséquent|en\s+effet)\b/gi,
      /\b(d'ailleurs|de\s+plus|en\s+outre|notamment)\b/gi
    ];
    
    let count = 0;
    discourseMarkers.forEach(pattern => {
      count += (text.match(pattern) || []).length;
    });
    
    return count;
  }

  // Speaker stance detection
  detectSpeakerStance(text) {
    const stancePatterns = {
      assertive: /\b(certainement|sûrement|évidemment|clairement|assurément)\b/gi,
      tentative: /\b(peut-être|probablement|sans\s+doute|il\s+semble|apparemment)\b/gi,
      polite: /\b(s'il\s+vous\s+plaît|veuillez|pourriez|auriez\s+l'amabilité)\b/gi
    };
    
    for (const [stance, pattern] of Object.entries(stancePatterns)) {
      if (pattern.test(text)) {
        return stance;
      }
    }
    return 'neutral';
  }

  // Coherence markers (paragraph-level)
  countCoherenceMarkers(text) {
    const coherenceMarkers = [
      /\b(d'abord|ensuite|puis|enfin|finalement)\b/gi,
      /\b(premièrement|deuxièmement|troisièmement)\b/gi,
      /\b(en\s+premier\s+lieu|en\s+second\s+lieu)\b/gi
    ];
    
    let count = 0;
    coherenceMarkers.forEach(pattern => {
      count += (text.match(pattern) || []).length;
    });
    
    return count;
  }

  // Context depth analysis (paragraph-level)
  analyzeContextDepth(text) {
    const contextMarkers = [
      /\b(parce\s+que|car|puisque|étant\s+donné)\b/gi,
      /\b(c'est-à-dire|autrement\s+dit|en\s+d'autres\s+termes)\b/gi,
      /\b(par\s+exemple|notamment|en\s+particulier)\b/gi
    ];
    
    let depth = 0;
    contextMarkers.forEach(pattern => {
      depth += (text.match(pattern) || []).length;
    });
    
    return depth;
  }

  // Sentence counting
  countSentences(text) {
    return (text.match(/[.!?]+/g) || []).length;
  }

  // Discourse complexity assessment
  assessDiscourseComplexity(text) {
    const coherence = this.countCoherenceMarkers(text);
    const context = this.analyzeContextDepth(text);
    const discourse = this.countDiscourseMarkers(text);
    
    const complexityScore = coherence + context + discourse;
    
    if (complexityScore >= 5) return 'complex';
    if (complexityScore >= 2) return 'medium';
    return 'simple';
  }
}

module.exports = FeatureExtractor;
