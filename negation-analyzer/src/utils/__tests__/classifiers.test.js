const { classify } = require('../classifiers');
const testCases = require('./test_cases.json');

describe('French Negation Classifier', () => {
  const trainingData = testCases.examples;

  // Test cases for expletive triggers
  describe('Expletive Triggers', () => {
    const testSentences = [
      {
        input: "J'ai peur qu'il réussisse",
        expectedType: true,
        trigger: "peur que",
        description: "Fear trigger (peur que)"
      },
      {
        input: "Je crains qu'elle parte trop tôt",
        expectedType: true,
        trigger: "craindre que",
        description: "Fear trigger (craindre que)"
      },
      {
        input: "Avant qu'il ne sorte",
        expectedType: true,
        trigger: "avant que",
        description: "Temporal trigger (avant que)"
      }
    ];

    testSentences.forEach(({ input, expectedType, trigger, description }) => {
      test(`should classify ${description} correctly`, () => {
        const result = classify(input, trainingData);
        expect(result.classification).toBe(expectedType);
        expect(result.context.triggerType).toContain(trigger.split(' ')[0].toUpperCase());
        expect(result.nePosition).not.toBeNull();
      });
    });
  });

  // Test cases for relative clause triggers
  describe('Relative Clause Triggers', () => {
    const testSentences = [
      {
        input: "C'est le meilleur film que j'ai vu",
        expectedType: true,
        trigger: "le meilleur que",
        description: "Superlative construction"
      },
      {
        input: "C'est le seul livre qu'il comprenne",
        expectedType: true,
        trigger: "le seul que",
        description: "Restrictive construction"
      }
    ];

    testSentences.forEach(({ input, expectedType, trigger, description }) => {
      test(`should classify ${description} correctly`, () => {
        const result = classify(input, trainingData);
        expect(result.classification).toBe(expectedType);
        expect(result.context.triggerType).toBe('RELATIVE');
        expect(result.nePosition).not.toBeNull();
      });
    });
  });

  // Test cases for non-expletive sentences
  describe('Non-Expletive Cases', () => {
    const testSentences = [
      {
        input: "Je vais à la bibliothèque",
        expectedType: false,
        description: "Simple statement without trigger"
      },
      {
        input: "Il lit un livre intéressant",
        expectedType: false,
        description: "Complex statement without trigger"
      }
    ];

    testSentences.forEach(({ input, expectedType, description }) => {
      test(`should classify ${description} correctly`, () => {
        const result = classify(input, trainingData);
        expect(result.classification).toBe(expectedType);
        expect(result.nePosition).toBeNull();
      });
    });
  });

  // Test position calculation
  describe('NE Position Calculation', () => {
    const testSentences = [
      {
        input: "J'ai peur qu'il parte",
        expectedPosition: 14,
        description: "Fear construction"
      },
      {
        input: "C'est le meilleur film que j'aie vu",
        expectedPosition: 27,
        description: "Relative clause"
      }
    ];

    testSentences.forEach(({ input, expectedPosition, description }) => {
      test(`should calculate correct NE position for ${description}`, () => {
        const result = classify(input, trainingData);
        expect(result.nePosition).toBe(expectedPosition);
      });
    });
  });

  // Test confidence scoring
  describe('Confidence Scoring', () => {
    test('should have high confidence for exact trigger match', () => {
      const result = classify("J'ai peur qu'il vienne", trainingData);
      expect(result.confidence).toBeGreaterThan(0.8);
    });

    test('should have lower confidence for similar but not exact match', () => {
      const result = classify("J'ai très peur qu'il parte", trainingData);
      expect(result.confidence).toBeLessThan(0.9);
      expect(result.confidence).toBeGreaterThan(0.5);
    });
  });

  // Test error cases
  describe('Error Handling', () => {
    test('should handle empty input', () => {
      expect(() => classify('', trainingData)).toThrow('No text provided');
    });

    test('should handle empty training data', () => {
      expect(() => classify("J'ai peur qu'il vienne", [])).toThrow('No training data available');
    });
  });
});
