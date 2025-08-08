import { normalizeText } from './textProcessing';
import { TRIGGER_PATTERNS, SUBJUNCTIVE_PATTERNS, CONFIDENCE_LEVELS } from './patterns';
import { enhanceAvantQueAnalysis } from './avantQueAnalyzer';

class NegationAnalyzer {
  constructor() {
    this.TRIGGER_PATTERNS = TRIGGER_PATTERNS;
    this.SUBJUNCTIVE_PATTERNS = SUBJUNCTIVE_PATTERNS;
    this.CONFIDENCE_LEVELS = CONFIDENCE_LEVELS;
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

  async analyzeNegation(text) {
    const normalizedText = normalizeText(text);
    
    // Find trigger with subcategory
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
      // Expletive case: Has trigger and subjunctive
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
