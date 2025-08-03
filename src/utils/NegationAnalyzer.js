import { normalizeText } from './textProcessing';

class NegationAnalyzer {
  constructor() {
    // Only the three official triggers from PRODUCTION_STATE.md
    this.EXPLETIVE_TRIGGERS = [
      {
        pattern: /\b(?:avoir\s+)?peur\s+qu[e']/i,
        name: 'peur que',
        weight: 1.0
      },
      {
        pattern: /\bavant\s+qu[e']/i,
        name: 'avant que',
        weight: 1.0
      },
      {
        pattern: /\bpeu\s+s['']en\s+faut\s+qu[e']/i,
        name: 'peu s\'en faut',
        weight: 1.0
      }
    ];

    // Subjunctive is required for expletive ne
    this.SUBJUNCTIVE_PATTERNS = [
      /\b(?:sois|soit|soyons|soyez|soient)\b/i,  // être
      /\b(?:aie|aies|ait|ayons|ayez|aient)\b/i,  // avoir
      /\b(?:fasse|fasses|fasse|fassions|fassiez|fassent)\b/i,  // faire
      /\b(?:puisse|puisses|puisse|puissions|puissiez|puissent)\b/i,  // pouvoir
      /\b(?:vienne|viennes|vienne|venions|veniez|viennent)\b/i,  // venir
      /\b(?:prenne|prennes|prenne|prenions|preniez|prennent)\b/i,  // prendre
      /\b(?:tienne|tiennes|tienne|tenions|teniez|tiennent)\b/i,  // tenir
      /\b(?:parte|partes|parte|partions|partiez|partent)\b/i  // partir
    ];

    // Pattern for optional ne
    this.OPTIONAL_NE = /\b(?:n['e])\b/i;
  }

  async analyzeNegation(text) {
    const normalizedText = normalizeText(text);
    
    // Find expletive triggers
    const foundTriggers = this.EXPLETIVE_TRIGGERS.filter(trigger => 
      trigger.pattern.test(normalizedText)
    );

    // Check for subjunctive - required for expletive ne
    const hasSubjunctive = this.hasSubjunctive(normalizedText);
    
    // Check for optional ne
    const hasOptionalNe = this.OPTIONAL_NE.test(normalizedText);

    // Expletive case: Must have BOTH trigger AND subjunctive
    if (foundTriggers.length > 0 && hasSubjunctive) {
      const trigger = foundTriggers[0].name;
      return {
        type: 'EXPLETIVE',
        confidence: hasOptionalNe ? 0.95 : 0.85,
        evidence: {
          trigger,
          hasSubjunctive: true,
          hasOptionalNe,
          details: `Found expletive trigger "${trigger}" with subjunctive mood`
        }
      };
    }

    // Non-expletive cases:
    
    // 1. Has trigger but no subjunctive
    if (foundTriggers.length > 0 && !hasSubjunctive) {
      return {
        type: 'NON_EXPLETIVE',
        confidence: 0.9,
        evidence: {
          trigger: foundTriggers[0].name,
          hasSubjunctive: false,
          hasOptionalNe,
          details: 'Found trigger but missing required subjunctive mood'
        }
      };
    }

    // 2. No expletive triggers at all
    return {
      type: 'NON_EXPLETIVE',
      confidence: 0.95,
      evidence: {
        trigger: null,
        hasSubjunctive,
        hasOptionalNe,
        details: 'No expletive triggers found'
      }
    };
  }

  hasSubjunctive(text) {
    return this.SUBJUNCTIVE_PATTERNS.some(pattern => pattern.test(text));
  }
}

export default NegationAnalyzer;
