import { classifyExpletive, classifyWithBinaryClassifier, classify } from '../../utils/classifiers';

// Mock training data
const mockTrainingData = [
  {
    text: "Je crains qu'il ne vienne",
    classification: "EXPLETIVE",
    trigger: "craindre",
    has_expletive_ne: true
  },
  {
    text: "Je ne veux pas qu'il parte",
    classification: "LOGICAL",
    trigger: "logical",
    has_expletive_ne: false
  }
];

describe('Classifier Functionality Tests', () => {
  describe('Binary Classifier Tests', () => {
    test('classifyWithBinaryClassifier handles expletive patterns', () => {
      const result = classifyWithBinaryClassifier("Je crains qu'il vienne", mockTrainingData);
      expect(result).toHaveProperty('classification');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('matches');
      expect(result.matches.length).toBeGreaterThan(0);
    });

    test('classifyWithBinaryClassifier handles logical patterns', () => {
      const result = classifyWithBinaryClassifier("Je ne veux pas qu'il parte", mockTrainingData);
      expect(result).toHaveProperty('classification');
      expect(result).toHaveProperty('confidence');
      expect(result.matches.length).toBeGreaterThan(0);
    });

    test('classifyWithBinaryClassifier handles unknown patterns', () => {
      const result = classifyWithBinaryClassifier("Une phrase quelconque", mockTrainingData);
      expect(result.classification).toBe('UNCERTAIN');
      expect(result.matches.length).toBe(0);
    });
  });

  describe('SVM Classifier Tests', () => {
    test('classify with SVM mode returns expected structure', () => {
      const result = classify("Je crains qu'il vienne", mockTrainingData, 'SVM');
      expect(result).toHaveProperty('classification');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('matches');
    });
  });

  describe('LLM Classifier Tests', () => {
    test('classifyExpletive returns expected structure', async () => {
      try {
        const result = await classifyExpletive("Je crains qu'il vienne");
        expect(result).toHaveProperty('analysis');
        expect(result).toHaveProperty('classification');
        expect(result).toHaveProperty('reasoning');
        expect(result).toHaveProperty('nePosition');
      } catch (error) {
        // Allow API errors to pass test
        expect(error.message).toMatch(/Missing HF_TOKEN|429|HTTP error/);
      }
    });
  });

  describe('Error Handling Tests', () => {
    test('classifyWithBinaryClassifier handles empty input', () => {
      expect(() => classifyWithBinaryClassifier("", mockTrainingData))
        .toThrow('No text provided');
    });

    test('classifyWithBinaryClassifier handles missing training data', () => {
      expect(() => classifyWithBinaryClassifier("Test", []))
        .toThrow('No training data available');
    });
  });
});
