import { formatRuleBasedResult, formatHybridResult, formatTrainingResult } from '../../utils/resultFormatters';

describe('Result Formatter Tests', () => {
  describe('Rule-Based Formatter Tests', () => {
    const mockAnalysis = {
      type: 'LOGICAL',
      confidence: 0.85,
      evidence: {
        markers: 2,
        hasSubjunctive: true,
        hasExpletiveNe: false
      }
    };

    test('formatRuleBasedResult formats logical negation', () => {
      const result = formatRuleBasedResult(mockAnalysis);
      expect(result).toContain('LOGICAL NEGATION');
      expect(result).toContain('85% confidence');
      expect(result).toContain('Found 2 logical marker(s)');
    });

    test('formatRuleBasedResult formats expletive negation', () => {
      const expletiveAnalysis = {
        type: 'LIKELY_EXPLETIVE',
        confidence: 0.75,
        evidence: {
          triggers: { strong: 1, medium: 0, weak: 0 },
          hasSubjunctive: true,
          hasExpletiveNe: true
        }
      };
      const result = formatRuleBasedResult(expletiveAnalysis);
      expect(result).toContain('LIKELY EXPLETIVE');
      expect(result).toContain('75% confidence');
      expect(result).toContain('Found strong expletive trigger(s)');
    });
  });

  describe('Hybrid Formatter Tests', () => {
    const mockPatternAnalysis = {
      type: 'LOGICAL',
      confidence: 0.85,
      evidence: {
        markers: 2,
        hasSubjunctive: true
      }
    };

    const mockLLMResponse = {
      analysis: 'Test analysis',
      classification: 'LOGICAL',
      reasoning: 'Test reasoning',
      nePosition: 'Before verb',
      confidence: 0.9
    };

    test('formatHybridResult includes both analyses', () => {
      const result = formatHybridResult(mockPatternAnalysis, mockLLMResponse);
      expect(result).toContain('HYBRID ANALYSIS');
      expect(result).toContain('PATTERN EVIDENCE');
      expect(result).toContain('SEMANTIC ANALYSIS');
    });

    test('formatHybridResult handles missing LLM response', () => {
      const result = formatHybridResult(mockPatternAnalysis, null);
      expect(result).toContain('PATTERN EVIDENCE');
      expect(result).toContain('No semantic analysis available');
    });
  });

  describe('Training Data Formatter Tests', () => {
    const mockPatternAnalysis = {
      type: 'LOGICAL',
      confidence: 0.85,
      evidence: {
        markers: 2
      }
    };

    const mockTrainingAnalysis = {
      matches: [
        {
          text: "Je ne veux pas qu'il parte",
          classification: 'LOGICAL'
        }
      ],
      confidence: 0.8
    };

    test('formatTrainingResult includes pattern and training data', () => {
      const result = formatTrainingResult(mockPatternAnalysis, mockTrainingAnalysis);
      expect(result).toContain('TRAINING DATA ANALYSIS');
      expect(result).toContain('PATTERN EVIDENCE');
      expect(result).toContain('SIMILAR EXAMPLES');
    });

    test('formatTrainingResult handles no matches', () => {
      const noMatchesAnalysis = {
        ...mockTrainingAnalysis,
        matches: []
      };
      const result = formatTrainingResult(mockPatternAnalysis, noMatchesAnalysis);
      expect(result).toContain('No similar examples found');
    });

    test('formatTrainingResult shows prediction from pattern analysis', () => {
      const result = formatTrainingResult(mockPatternAnalysis, mockTrainingAnalysis);
      expect(result).toContain('Prediction: LOGICAL');
      expect(result).toContain('Pattern confidence: 85%');
    });
  });
});
