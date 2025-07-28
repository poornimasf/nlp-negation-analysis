class NegationAnalyzer {
  constructor() {
    // Logical negation markers
    this.LOGICAL_MARKERS = [
      /\b(?:pas|point|plus|jamais|rien|personne|aucun[e]?|guère|nullement)\b/i
    ];

    // Potentially ambiguous triggers that can be either expletive or logical
    this.AMBIGUOUS_TRIGGERS = {
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
    
    // Check for potentially ambiguous triggers
    const triggers = this.findAmbiguousTriggers(text);
    
    // Check for subjunctive
    const hasSubjunctive = this.hasSubjunctive(text);

    // If we have both logical markers and ambiguous triggers, it's likely logical negation
    if (logicalMarkers.length > 0 && (triggers.strong.length > 0 || triggers.medium.length > 0)) {
      return {
        type: 'LOGICAL',
        confidence: 0.8,
        evidence: {
          markers: logicalMarkers.length,
          details: 'Contains logical negation markers with ambiguous trigger',
          hasSubjunctive,
          triggers: {
            strong: triggers.strong.length,
            medium: triggers.medium.length,
            weak: triggers.weak.length
          }
        }
      };
    }

    // If we have logical markers without triggers, it's clearly logical
    if (logicalMarkers.length > 0) {
      return {
        type: 'LOGICAL',
        confidence: 0.9,
        evidence: {
          markers: logicalMarkers.length,
          details: 'Contains clear logical negation markers',
          hasSubjunctive
        }
      };
    }

    // If we have triggers without logical markers, analyze context
    if (triggers.strong.length > 0 || triggers.medium.length > 0) {
      // Look for additional context that suggests expletive use
      const isLikelyExpletive = hasSubjunctive || triggers.strong.length > 0;
      
      return {
        type: isLikelyExpletive ? 'LIKELY_EXPLETIVE' : 'AMBIGUOUS',
        confidence: isLikelyExpletive ? 0.7 : 0.5,
        evidence: {
          triggers: {
            strong: triggers.strong.length,
            medium: triggers.medium.length,
            weak: triggers.weak.length
          },
          hasSubjunctive,
          details: isLikelyExpletive ? 
            'Contains potential expletive triggers with supporting context' :
            'Contains ambiguous triggers without clear indicators'
        }
      };
    }

    // If we only have weak triggers
    if (triggers.weak.length > 0) {
      return {
        type: 'UNCERTAIN',
        confidence: 0.5,
        evidence: {
          triggers: {
            weak: triggers.weak.length
          },
          hasSubjunctive,
          details: 'Contains only weak potential triggers'
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

  findLogicalMarkers(text) {
    return this.LOGICAL_MARKERS.filter(pattern => pattern.test(text));
  }

  findAmbiguousTriggers(text) {
    const triggers = {
      strong: this.AMBIGUOUS_TRIGGERS.STRONG.filter(pattern => pattern.test(text)),
      medium: this.AMBIGUOUS_TRIGGERS.MEDIUM.filter(pattern => pattern.test(text)),
      weak: this.AMBIGUOUS_TRIGGERS.WEAK.filter(pattern => pattern.test(text))
    };
    return triggers;
  }

  hasSubjunctive(text) {
    return this.SUBJUNCTIVE_PATTERNS.some(pattern => pattern.test(text));
  }
}

export default NegationAnalyzer;
