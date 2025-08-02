import { normalizeText } from './textProcessing';

class NegationAnalyzer {
  constructor() {
    // Expletive triggers with confidence levels
    this.EXPLETIVE_TRIGGERS = {
      HIGH: [
        // Fear expressions with complete construction
        /\b(?:j'ai|tu as|il a|elle a|on a|nous avons|vous avez|ils ont)\s+(?:(?:tr[eèé]s\s+)?grand[e]?\s+)?peur\s+qu[e']/i,
        // Strong fear verbs
        /\b(?:je|tu|il|elle|on)\s+crains?\s+qu[e']/i,
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
        /\bpeu\s+s['']en\s+(?:faut|fallait|faudra|faudrait)\s+qu[e']/i,
        // Medium strength verbs
        /\b(?:craindre|craignons|craignez|craignent)\s+qu[e']/i
      ],
      LOW: [
        // Other potential expletive triggers
        /\b(?:redouter|redoute[zsnt]?)\s+qu[e']/i,
        /\b(?:[eéè]viter|[eéè]vite[zsnt]?)\s+qu[e']/i,
        /\b(?:emp[eêè]cher|emp[eêè]che[zsnt]?)\s+qu[e']/i
      ]
    };

    // Subjunctive patterns
    this.SUBJUNCTIVE_PATTERNS = [
      /\b(?:sois|soit|soyons|soyez|soient)\b/i,  // être
      /\b(?:aie|aies|ait|ayons|ayez|aient)\b/i,  // avoir
      /\b(?:fasse|fasses|fasse|fassions|fassiez|fassent)\b/i,  // faire
      /\b(?:puisse|puisses|puisse|puissions|puissiez|puissent)\b/i,  // pouvoir
      /\b(?:vienne|viennes|vienne|venions|veniez|viennent)\b/i,  // venir
      /\b(?:prenne|prennes|prenne|prenions|preniez|prennent)\b/i,  // prendre
      /\b(?:tienne|tiennes|tienne|tenions|teniez|tiennent)\b/i,  // tenir
      /\b(?:r[eéè]ussisse|r[eéè]ussisses|r[eéè]ussissions|r[eéè]ussissiez|r[eéè]ussissent)\b/i,  // réussir
      /\b(?:parte|partes|parte|partions|partiez|partent)\b/i  // partir
    ];

    // Optional ne pattern
    this.OPTIONAL_NE = /\b(?:n['e])\b/i;
  }

  async analyzeNegation(text) {
    const normalizedText = normalizeText(text);
    
    // Find triggers by confidence level
    const triggers = {
      high: this.EXPLETIVE_TRIGGERS.HIGH.filter(pattern => pattern.test(normalizedText)),
      medium: this.EXPLETIVE_TRIGGERS.MEDIUM.filter(pattern => pattern.test(normalizedText)),
      low: this.EXPLETIVE_TRIGGERS.LOW.filter(pattern => pattern.test(normalizedText))
    };

    // Check for subjunctive
    const hasSubjunctive = this.hasSubjunctive(normalizedText);
    
    // Check for optional ne
    const hasOptionalNe = this.OPTIONAL_NE.test(normalizedText);

    // Analysis based on triggers and context
    if (triggers.high.length > 0) {
      return {
        type: 'EXPLETIVE',
        confidence: hasSubjunctive ? 0.9 : 0.8,
        evidence: {
          triggers: triggers.high,
          hasSubjunctive,
          hasOptionalNe,
          details: 'Strong expletive context with high-confidence triggers'
        }
      };
    }

    if (triggers.medium.length > 0) {
      return {
        type: 'EXPLETIVE',
        confidence: hasSubjunctive ? 0.8 : 0.7,
        evidence: {
          triggers: triggers.medium,
          hasSubjunctive,
          hasOptionalNe,
          details: 'Expletive context with medium-confidence triggers'
        }
      };
    }

    if (triggers.low.length > 0) {
      return {
        type: hasSubjunctive ? 'EXPLETIVE' : 'NON_EXPLETIVE',
        confidence: hasSubjunctive ? 0.7 : 0.6,
        evidence: {
          triggers: triggers.low,
          hasSubjunctive,
          hasOptionalNe,
          details: hasSubjunctive ? 
            'Potential expletive context with supporting subjunctive' :
            'Weak expletive indicators without supporting context'
        }
      };
    }

    // Default case - no expletive indicators
    return {
      type: 'NON_EXPLETIVE',
      confidence: 0.8,
      evidence: {
        details: 'No expletive triggers or supporting context found',
        hasSubjunctive,
        hasOptionalNe
      }
    };
  }

  hasSubjunctive(text) {
    return this.SUBJUNCTIVE_PATTERNS.some(pattern => pattern.test(text));
  }
}

export default NegationAnalyzer;
