import { normalizeText } from './textProcessing';

class NegationAnalyzer {
  constructor() {
    // Only specific constructions that can have expletive ne
    this.EXPLETIVE_TRIGGERS = {
      // These triggers have high probability of expletive ne
      PRIMARY: [
        // Fear expressions
        /\b(?:avoir\s+)?peur\s+qu[e']/i,
        /\b(?:craindre|craigns?|craignons|craignez|craignent)\s+qu[e']/i,
        // Temporal before
        /\bavant\s+qu[e']/i,
        // Impersonal expression
        /\bpeu\s+s['']en\s+faut\s+qu[e']/i
      ],
      // These can sometimes have expletive ne but need more context
      SECONDARY: [
        /\b(?:empêcher|empêche[zsnt]?)\s+qu[e']/i,
        /\b(?:éviter|évite[zsnt]?)\s+qu[e']/i,
        /\b(?:redouter|redoute[zsnt]?)\s+qu[e']/i
      ]
    };

    // Subjunctive is required for expletive ne
    this.SUBJUNCTIVE_PATTERNS = [
      /\b(?:sois|soit|soyons|soyez|soient)\b/i,
      /\b(?:aie|aies|ait|ayons|ayez|aient)\b/i,
      /\b(?:fasse|fasses|fasse|fassions|fassiez|fassent)\b/i,
      /\b(?:puisse|puisses|puisse|puissions|puissiez|puissent)\b/i,
      /\b(?:vienne|viennes|vienne|venions|veniez|viennent)\b/i,
      /\b(?:prenne|prennes|prenne|prenions|preniez|prennent)\b/i,
      /\b(?:tienne|tiennes|tienne|tenions|teniez|tiennent)\b/i,
      /\b(?:parte|partes|parte|partions|partiez|partent)\b/i
    ];

    // Pattern for optional ne
    this.OPTIONAL_NE = /\b(?:n['e])\b/i;
  }

  async analyzeNegation(text) {
    const normalizedText = normalizeText(text);
    
    // Find primary and secondary triggers
    const triggers = {
      primary: this.EXPLETIVE_TRIGGERS.PRIMARY.filter(pattern => pattern.test(normalizedText)),
      secondary: this.EXPLETIVE_TRIGGERS.SECONDARY.filter(pattern => pattern.test(normalizedText))
    };

    // Check for subjunctive - required for expletive ne
    const hasSubjunctive = this.hasSubjunctive(normalizedText);
    
    // Check for optional ne
    const hasOptionalNe = this.OPTIONAL_NE.test(normalizedText);

    // Clear cases for expletive:
    // 1. Primary trigger + subjunctive
    if (triggers.primary.length > 0 && hasSubjunctive) {
      return {
        type: 'EXPLETIVE',
        confidence: hasOptionalNe ? 0.95 : 0.85,
        evidence: {
          triggers: triggers.primary,
          hasSubjunctive: true,
          hasOptionalNe,
          details: 'Primary expletive trigger with subjunctive mood'
        }
      };
    }

    // Clear cases for non-expletive:
    // 1. No triggers at all
    // 2. Triggers but no subjunctive
    if (triggers.primary.length === 0 && triggers.secondary.length === 0) {
      return {
        type: 'NON_EXPLETIVE',
        confidence: 0.9,
        evidence: {
          details: 'No expletive triggers found',
          hasSubjunctive,
          hasOptionalNe
        }
      };
    }

    if ((triggers.primary.length > 0 || triggers.secondary.length > 0) && !hasSubjunctive) {
      return {
        type: 'NON_EXPLETIVE',
        confidence: 0.85,
        evidence: {
          triggers: [...triggers.primary, ...triggers.secondary],
          hasSubjunctive: false,
          hasOptionalNe,
          details: 'Found triggers but missing required subjunctive mood'
        }
      };
    }

    // Secondary triggers with subjunctive - possible expletive but less certain
    if (triggers.secondary.length > 0 && hasSubjunctive) {
      return {
        type: 'EXPLETIVE',
        confidence: hasOptionalNe ? 0.8 : 0.7,
        evidence: {
          triggers: triggers.secondary,
          hasSubjunctive: true,
          hasOptionalNe,
          details: 'Secondary expletive trigger with subjunctive mood'
        }
      };
    }

    // Default case - not enough evidence for expletive
    return {
      type: 'NON_EXPLETIVE',
      confidence: 0.75,
      evidence: {
        details: 'Insufficient evidence for expletive classification',
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
