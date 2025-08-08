/**
 * Tests for enhanced avant que analysis
 */

import { 
  analyzeComplementClause, 
  analyzeSubjunctiveMood, 
  analyzeAvantQueConstruction,
  enhanceAvantQueAnalysis 
} from '../avantQueAnalyzer';

describe('Enhanced Avant Que Analysis', () => {
  
  describe('analyzeComplementClause', () => {
    test('should detect complement clause with subject pronoun', () => {
      const text = "Il faut partir avant qu'elle arrive";
      const result = analyzeComplementClause(text, text.indexOf('avant'));
      
      expect(result.isComplementClause).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.5);
      expect(result.indicators).toContain('Subject pronoun: "elle"');
    });

    test('should detect infinitive construction', () => {
      const text = "Il faut partir avant de manger";
      const result = analyzeComplementClause(text, text.indexOf('avant'));
      
      expect(result.isComplementClause).toBe(false);
      expect(result.construction).toBe('infinitive');
    });

    test('should detect nominal construction', () => {
      const text = "Il faut partir avant le dîner";
      const result = analyzeComplementClause(text, text.indexOf('avant'));
      
      expect(result.isComplementClause).toBe(false);
      expect(result.construction).toBe('nominal');
    });
  });

  describe('analyzeSubjunctiveMood', () => {
    test('should detect high-priority subjunctive verbs', () => {
      const text = "Il faut partir avant qu'elle soit prête";
      const result = analyzeSubjunctiveMood(text, text.indexOf('avant'));
      
      expect(result.hasSubjunctive).toBe(true);
      expect(result.verbType).toBe('ETRE');
      expect(result.verb).toBe('soit');
      expect(result.confidence).toBeGreaterThan(0.9);
    });

    test('should detect regular subjunctive verbs', () => {
      const text = "Il faut partir avant qu'elle parte";
      const result = analyzeSubjunctiveMood(text, text.indexOf('avant'));
      
      expect(result.hasSubjunctive).toBe(true);
      expect(result.verbType).toBe('PARTIR');
      expect(result.verb).toBe('parte');
    });

    test('should not detect indicative verbs as subjunctive', () => {
      const text = "Il faut partir avant qu'elle partira";
      const result = analyzeSubjunctiveMood(text, text.indexOf('avant'));
      
      expect(result.hasSubjunctive).toBe(false);
    });
  });

  describe('analyzeAvantQueConstruction', () => {
    test('should classify as expletive when both conditions are met', () => {
      const text = "Il faut partir avant qu'elle parte";
      const triggerInfo = {
        trigger: 'avant que',
        position: text.indexOf('avant'),
        category: 'TEMPORAL'
      };
      
      const result = analyzeAvantQueConstruction(text, triggerInfo);
      
      expect(result.isAvantQue).toBe(true);
      expect(result.classification).toBe('Expletive');
      expect(result.bothConditionsMet).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.8);
    });

    test('should classify as no expletive when complement clause is missing', () => {
      const text = "Il faut partir avant de manger";
      const triggerInfo = {
        trigger: 'avant de',
        position: text.indexOf('avant'),
        category: 'TEMPORAL'
      };
      
      const result = analyzeAvantQueConstruction(text, triggerInfo);
      
      expect(result.classification).toBe('No Expletive');
      expect(result.bothConditionsMet).toBe(false);
    });

    test('should classify as no expletive when subjunctive is missing', () => {
      const text = "Il faut partir avant qu'elle partira";
      const triggerInfo = {
        trigger: 'avant que',
        position: text.indexOf('avant'),
        category: 'TEMPORAL'
      };
      
      const result = analyzeAvantQueConstruction(text, triggerInfo);
      
      expect(result.classification).toBe('No Expletive');
      expect(result.bothConditionsMet).toBe(false);
    });
  });

  describe('enhanceAvantQueAnalysis', () => {
    test('should return null for non-avant que constructions', () => {
      const text = "J'ai peur qu'il vienne";
      const triggerInfo = {
        trigger: 'peur que',
        position: text.indexOf('peur'),
        category: 'FEAR'
      };
      
      const result = enhanceAvantQueAnalysis(text, triggerInfo);
      expect(result).toBeNull();
    });

    test('should return enhanced analysis for avant que constructions', () => {
      const text = "Il faut partir avant qu'elle parte";
      const triggerInfo = {
        trigger: 'avant que',
        position: text.indexOf('avant'),
        category: 'TEMPORAL'
      };
      
      const result = enhanceAvantQueAnalysis(text, triggerInfo);
      
      expect(result).not.toBeNull();
      expect(result.isAvantQue).toBe(true);
      expect(result.classification).toBe('Expletive');
    });
  });

  describe('Real-world examples', () => {
    const testCases = [
      {
        text: "Il faut partir avant qu'elle arrive",
        expected: 'Expletive',
        reason: 'complement clause + subjunctive'
      },
      {
        text: "Il faut partir avant qu'elle soit prête",
        expected: 'Expletive',
        reason: 'complement clause + high-priority subjunctive'
      },
      {
        text: "Il faut partir avant de manger",
        expected: 'No Expletive',
        reason: 'infinitive construction'
      },
      {
        text: "Il faut partir avant le dîner",
        expected: 'No Expletive',
        reason: 'nominal construction'
      },
      {
        text: "Il faut partir avant qu'elle partira",
        expected: 'No Expletive',
        reason: 'complement clause but no subjunctive'
      }
    ];

    testCases.forEach(({ text, expected, reason }) => {
      test(`should classify "${text}" as ${expected} (${reason})`, () => {
        const triggerInfo = {
          trigger: text.includes('avant que') ? 'avant que' : 'avant de',
          position: text.indexOf('avant'),
          category: 'TEMPORAL'
        };
        
        const result = analyzeAvantQueConstruction(text, triggerInfo);
        expect(result.classification).toBe(expected);
      });
    });
  });
});
