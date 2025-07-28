class NegationAnalyzer {
  constructor() {
    // Logical negation markers
    this.LOGICAL_MARKERS = [
      /\b(?:pas|point|plus|jamais|rien|personne|aucun[e]?|guère|nullement)\b/i
    ];

    // Expletive triggers with confidence levels
    this.EXPLETIVE_TRIGGERS = {
      STRONG: [
        // Fear expressions with complete construction
        /\b(?:j'ai|tu as|il a|elle a|on a|nous avons|vous avez|ils ont)\s+(?:(?:très\s+)?grand[e]?\s+)?peur\s+qu[e']/i,
        // Temporal expressions with precision
        /\b(?:juste|bien|peu|longtemps)\s+avant\s+qu[e']/i,
        // Peu s'en faut with impersonal construction
        /\bil\s+s['']en\s+(?:faut|fallait|faudra|faudrait)\s+(?:de\s+)?peu\s+qu[e']/i
      ],
      MEDIUM: [
        // Basic fear expressions
        /\bpeur\s+qu[e']/i,
        // Basic temporal expressions
        /\bavant\s+qu[e']/i,
        // Basic peu s'en faut
        /\bpeu\s+s['']en\s+(?:faut|fallait|faudra|faudrait)\s+qu[e']/i
      ],
      WEAK: [
        // Other potential triggers
        /\b(?:craindre|redouter|douter|éviter|empêcher)\s+qu[e']/i
      ]
    };

    // Subjunctive patterns
    this.SUBJUNCTIVE_PATTERNS = [
      /\b(?:sois|soit|soyons|soyez|soient)\b/i,  // être
      /\b(?:aie|aies|ait|ayons|ayez|aient)\b/i,  // avoir
      /\b(?:fasse|fasses|fasse|fassions|fassiez|fassent)\b/i,  // faire
      /\b(?:puisse|puisses|puisse|puissions|puissiez|puissent)\b/i  // pouvoir
    ];
  }

  async analyzeNegation(text) {
    // Check for logical negation markers
    const logicalMarkers = this.findLogicalMarkers(text);
    
    // Check for expletive triggers
    const expletiveTriggers = this.findExpletiveTriggers(text);
    
    // Check for subjunctive
    const hasSubjunctive = this.hasSubjunctive(text);

    // Calculate initial confidence scores
    const logicalConfidence = this.calculateLogicalConfidence(logicalMarkers);
    const expletiveConfidence = this.calculateExpletiveConfidence(expletiveTriggers, hasSubjunctive);

    // Determine classification based on evidence
    return this.determineClassification(logicalMarkers, expletiveTriggers, hasSubjunctive, logicalConfidence, expletiveConfidence);
  }

  findLogicalMarkers(text) {
    return this.LOGICAL_MARKERS.filter(pattern => pattern.test(text));
  }

  findExpletiveTriggers(text) {
    const triggers = {
      strong: this.EXPLETIVE_TRIGGERS.STRONG.filter(pattern => pattern.test(text)),
      medium: this.EXPLETIVE_TRIGGERS.MEDIUM.filter(pattern => pattern.test(text)),
      weak: this.EXPLETIVE_TRIGGERS.WEAK.filter(pattern => pattern.test(text))
    };
    return triggers;
  }

  hasSubjunctive(text) {
    return this.SUBJUNCTIVE_PATTERNS.some(pattern => pattern.test(text));
  }

  calculateLogicalConfidence(markers) {
    if (markers.length === 0) return 0;
    return Math.min(0.9, 0.7 + (markers.length * 0.1));
  }

  calculateExpletiveConfidence(triggers, hasSubjunctive) {
    let confidence = 0;
    
    // Strong triggers
    if (triggers.strong.length > 0) {
      confidence = 0.8;
    }
    // Medium triggers
    else if (triggers.medium.length > 0) {
      confidence = 0.6;
    }
    // Weak triggers
    else if (triggers.weak.length > 0) {
      confidence = 0.4;
    }

    // Boost confidence if subjunctive is present
    if (hasSubjunctive && confidence > 0) {
      confidence = Math.min(0.9, confidence + 0.1);
    }

    return confidence;
  }

  determineClassification(logicalMarkers, expletiveTriggers, hasSubjunctive, logicalConfidence, expletiveConfidence) {
    const hasLogical = logicalMarkers.length > 0;
    const hasExpletive = expletiveTriggers.strong.length > 0 || expletiveTriggers.medium.length > 0;
    
    // Both patterns present - potential ambiguity
    if (hasLogical && hasExpletive) {
      return {
        type: 'AMBIGUOUS',
        confidence: Math.max(logicalConfidence, expletiveConfidence),
        evidence: {
          logical: {
            markers: logicalMarkers.length,
            confidence: logicalConfidence
          },
          expletive: {
            triggers: {
              strong: expletiveTriggers.strong.length,
              medium: expletiveTriggers.medium.length,
              weak: expletiveTriggers.weak.length
            },
            hasSubjunctive,
            confidence: expletiveConfidence
          }
        }
      };
    }

    // Clear logical negation
    if (hasLogical) {
      return {
        type: 'LOGICAL',
        confidence: logicalConfidence,
        evidence: {
          markers: logicalMarkers.length,
          details: 'Contains logical negation markers'
        }
      };
    }

    // Clear expletive pattern
    if (hasExpletive) {
      return {
        type: 'EXPLETIVE',
        confidence: expletiveConfidence,
        evidence: {
          triggers: {
            strong: expletiveTriggers.strong.length,
            medium: expletiveTriggers.medium.length,
            weak: expletiveTriggers.weak.length
          },
          hasSubjunctive,
          details: hasSubjunctive ? 
            'Found expletive triggers with subjunctive' : 
            'Found expletive triggers without subjunctive'
        }
      };
    }

    // Weak expletive indication
    if (expletiveTriggers.weak.length > 0) {
      return {
        type: 'LIKELY_EXPLETIVE',
        confidence: expletiveConfidence,
        evidence: {
          triggers: {
            weak: expletiveTriggers.weak.length
          },
          hasSubjunctive,
          details: 'Found weak expletive triggers'
        }
      };
    }

    // Default case - not enough evidence
    return {
      type: 'UNCERTAIN',
      confidence: 0.5,
      evidence: {
        details: 'Insufficient patterns for classification'
      }
    };
  }
}

export default NegationAnalyzer;
