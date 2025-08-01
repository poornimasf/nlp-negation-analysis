import { validateExample, addTrainingExample, removeTrainingExample, getSVMModel } from '../../utils/trainingDataManager';

describe('Training Data Management Tests', () => {
  const validExample = {
    text: "Je crains qu'il ne vienne",
    classification: "EXPLETIVE",
    trigger: "craindre",
    has_expletive_ne: true
  };

  describe('Example Validation Tests', () => {
    test('validateExample accepts valid example', () => {
      const result = validateExample(validExample);
      expect(result).toHaveProperty('text');
      expect(result).toHaveProperty('classification');
      expect(result).toHaveProperty('trigger');
      expect(result.classification).toBe('EXPLETIVE');
    });

    test('validateExample handles missing text', () => {
      const invalidExample = { ...validExample, text: undefined };
      expect(() => validateExample(invalidExample))
        .toThrow('Example must include text');
    });

    test('validateExample handles invalid classification', () => {
      const invalidExample = { ...validExample, classification: 'INVALID' };
      expect(() => validateExample(invalidExample))
        .toThrow('Invalid classification');
    });
  });

  describe('Training Data Management Tests', () => {
    test('addTrainingExample adds valid example', () => {
      const existingData = [];
      const result = addTrainingExample(validExample, existingData);
      expect(result).toHaveLength(1);
      expect(result[0].classification).toBe('EXPLETIVE');
    });

    test('addTrainingExample prevents duplicates', () => {
      const existingData = [validExample];
      expect(() => addTrainingExample(validExample, existingData))
        .toThrow('Duplicate example');
    });

    test('removeTrainingExample removes example', () => {
      const existingData = [validExample];
      const result = removeTrainingExample(0, existingData);
      expect(result).toHaveLength(0);
    });
  });

  describe('SVM Model Management Tests', () => {
    test('getSVMModel returns model with valid data', () => {
      const trainingData = [validExample];
      const model = getSVMModel(trainingData);
      expect(model).toHaveProperty('supportVectors');
      expect(model).toHaveProperty('weights');
      expect(model).toHaveProperty('bias');
    });

    test('getSVMModel caches model', () => {
      const trainingData = [validExample];
      const model1 = getSVMModel(trainingData);
      const model2 = getSVMModel(trainingData);
      expect(model1).toBe(model2); // Should return cached model
    });
  });

  describe('File Format Tests', () => {
    test('validates old format', () => {
      const oldFormat = {
        text: "Je crains qu'il ne vienne",
        has_expletive_ne: true,
        trigger: "craindre"
      };
      const result = validateExample(oldFormat);
      expect(result.classification).toBe('EXPLETIVE');
    });

    test('validates new format', () => {
      const newFormat = {
        text: "Je crains qu'il ne vienne",
        classification: "EXPLETIVE",
        trigger: "craindre"
      };
      const result = validateExample(newFormat);
      expect(result.has_expletive_ne).toBe(true);
    });
  });
});
