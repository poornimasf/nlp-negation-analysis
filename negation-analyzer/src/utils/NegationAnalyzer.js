import { normalizeText } from './textProcessing';

class NegationAnalyzer {
  constructor() {
    // Logical negation markers
    this.LOGICAL_MARKERS = [
      /\b(?:pas|point|plus|jamais|rien|personne|aucun[e]?|gu[eèé]re|nullement)\b/i
    ];

    // Potentially ambiguous triggers that can be either expletive or logical
    this.AMBIGUOUS_TRIGGERS = {
      STRONG: [
        // Fear expressions with complete construction
        /\b(?:j'ai|tu as|il a|elle a|on a|nous avons|vous avez|ils ont)\s+(?:(?:tr[eèé]s\s+)?grand[e]?\s+)?peur\s+qu[e']/i,
        // Temporal expressions with precision
        /\b(?:juste|bien|peu|longtemps)\s+avant\s+qu[e']/i,
        // Peu s'en faut with impersonal construction
        /\bil\s+s['']en\s+(?:faut|fallait|faudra|faudrait)\s+(?:de\s+)?peu\s+qu[e']/i,
        // Strong fear verbs
        /\b(?:je|tu|il|elle|on)\s+crains?\s+qu[e']/i
      ],
      MEDIUM: [
        // Basic fear expressions
        /\bpeur\s+qu[e']/i,
        // Basic temporal expressions
        /\bavant\s+qu[e']/i,
        // Basic peu s'en faut
        /\bpeu\s+s['']en\s+(?:faut|fallait|faudra|faudrait)\s+qu[e']/i,
        // Medium strength verbs
        /\b(?:craindre|craignons|craignez|craignent)\s+qu[e']/i
      ],
      WEAK: [
        // Doubt expressions
        /\b(?:doute[rz]?|dout(?:ons|ez|ent))\s+qu[e']/i,
        // Other expletive triggers
        /\b(?:redouter|redoute[zsnt]?)\s+qu[e']/i,
        /\b(?:[eéè]viter|[eéè]vite[zsnt]?)\s+qu[e']/i,
        /\b(?:emp[eêè]cher|emp[eêè]che[zsnt]?)\s+qu[e']/i
      ]
    };

    // Subjunctive patterns with accents
    this.SUBJUNCTIVE_PATTERNS = [
      // être
      /\b(?:sois|soit|soyons|soyez|soient)\b/i,
      // avoir
      /\b(?:aie|aies|ait|ayons|ayez|aient)\b/i,
      // faire
      /\b(?:fasse|fasses|fasse|fassions|fassiez|fassent)\b/i,
      // pouvoir
      /\b(?:puisse|puisses|puisse|puissions|puissiez|puissent)\b/i,
      // venir
      /\b(?:vienne|viennes|vienne|venions|veniez|viennent)\b/i,
      // prendre
      /\b(?:prenne|prennes|prenne|prenions|preniez|prennent)\b/i,
      // tenir
      /\b(?:tienne|tiennes|tienne|tenions|teniez|tiennent)\b/i,
      // réussir
      /\b(?:r[eéè]ussisse|r[eéè]ussisses|r[eéè]ussissions|r[eéè]ussissiez|r[eéè]ussissent)\b/i,
      // partir
      /\b(?:parte|partes|parte|partions|partiez|partent)\b/i
    ];

    // Expletive ne pattern (ne without pas/point etc.)
    this.EXPLETIVE_NE = /\b(?:n['e])\s+(?!pas|point|plus|jamais|rien|personne|aucun|guère|nullement)\b/i;
  }

  async analyzeNegation(text) {
    // Check for logical negation markers
    const logicalMarkers = this.findLogicalMarkers(text);
    
    // Check for potentially ambiguous triggers
    const triggers = this.findAmbiguousTriggers(text);
    
    // Check for subjunctive
    const hasSubjunctive = this.hasSubjunctive(text);

    // Check for expletive ne
    const hasExpletiveNe = this.hasExpletiveNe(text);

    // If we have logical markers, it's likely logical
    if (logicalMarkers.length > 0) {
      return {
        type: 'LOGICAL',
        confidence: 0.9,
        evidence: {
          markers: logicalMarkers.length,
          details: 'Contains logical negation markers',
          hasSubjunctive,
          hasExpletiveNe,
          triggers: {
            strong: triggers.strong.length,
            medium: triggers.medium.length,
            weak: triggers.weak.length
          }
        }
      };
    }

    // If we have strong triggers, likely expletive
    if (triggers.strong.length > 0) {
      return {
        type: 'LIKELY_EXPLETIVE',
        confidence: hasSubjunctive || hasExpletiveNe ? 0.85 : 0.75,
        evidence: {
          triggers: {
            strong: triggers.strong.length,
            medium: triggers.medium.length,
            weak: triggers.weak.length
          },
          hasSubjunctive,
          hasExpletiveNe,
          details: hasSubjunctive ? 
            'Contains strong expletive triggers with subjunctive' :
            'Contains strong expletive triggers'
        }
      };
    }

    // If we have medium triggers
    if (triggers.medium.length > 0) {
      const isLikelyExpletive = hasSubjunctive || hasExpletiveNe;
      
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
          hasExpletiveNe,
          details: isLikelyExpletive ? 
            'Contains medium expletive triggers with supporting context' :
            'Contains ambiguous triggers without clear indicators'
        }
      };
    }

    // If we have weak triggers
    if (triggers.weak.length > 0) {
      const isLikelyExpletive = hasSubjunctive || hasExpletiveNe;
      
      return {
        type: isLikelyExpletive ? 'LIKELY_EXPLETIVE' : 'UNCERTAIN',
        confidence: isLikelyExpletive ? 0.65 : 0.5,
        evidence: {
          triggers: {
            weak: triggers.weak.length
          },
          hasSubjunctive,
          hasExpletiveNe,
          details: isLikelyExpletive ?
            'Contains weak expletive triggers with supporting context' :
            'Contains only weak potential triggers'
        }
      };
    }

    // Default case - not enough evidence
    return {
      type: 'UNCERTAIN',
      confidence: 0.5,
      evidence: {
        details: 'Insufficient patterns for classification',
        hasSubjunctive,
        hasExpletiveNe
      }
    };
  }

  findLogicalMarkers(text) {
    const normalizedText = normalizeText(text);
    return this.LOGICAL_MARKERS.filter(pattern => pattern.test(normalizedText));
  }

  findAmbiguousTriggers(text) {
    const normalizedText = normalizeText(text);
    const triggers = {
      strong: this.AMBIGUOUS_TRIGGERS.STRONG.filter(pattern => pattern.test(normalizedText)),
      medium: this.AMBIGUOUS_TRIGGERS.MEDIUM.filter(pattern => pattern.test(normalizedText)),
      weak: this.AMBIGUOUS_TRIGGERS.WEAK.filter(pattern => pattern.test(normalizedText))
    };
    return triggers;
  }

  hasSubjunctive(text) {
    const normalizedText = normalizeText(text);
    return this.SUBJUNCTIVE_PATTERNS.some(pattern => pattern.test(normalizedText));
  }

  hasExpletiveNe(text) {
    return this.EXPLETIVE_NE.test(text);
  }
}

export default NegationAnalyzer;
