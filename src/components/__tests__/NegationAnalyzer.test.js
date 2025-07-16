import { render, fireEvent, waitFor } from '@testing-library/react';
import NegationAnalyzer from '../NegationAnalyzer';

describe('NegationAnalyzer', () => {
  // Single sentence tests
  describe('Single Sentence Analysis', () => {
    test.each(singleSentenceTests.french.cases)(
      '$description',
      async ({ input, expected }) => {
        const { getByPlaceholderText, getByText } = render(<NegationAnalyzer />);
        const inputField = getByPlaceholderText('Type a sentence with a negation...');
        
        fireEvent.change(inputField, { target: { value: input } });
        fireEvent.click(getByText('Evaluate'));
        
        await waitFor(() => {
          const result = getByText(/Classification Result/);
          expect(result).toHaveTextContent(expected);
        });
      }
    );
  });

  // Batch processing tests
  describe('Batch Processing', () => {
    test('processes multiple sentences correctly', async () => {
      const { getByPlaceholderText, getByText } = render(<NegationAnalyzer />);
      const textarea = getByPlaceholderText('One sentence per line...');
      
      fireEvent.change(textarea, { target: { value: batchProcessingTests.input } });
      fireEvent.click(getByText('Evaluate Batch'));
      
      await waitFor(() => {
        batchProcessingTests.expectedResults.forEach(expected => {
          expect(getByText(expected)).toBeInTheDocument();
        });
      });
    });
  });

  // Training data tests
  describe('Training Data Processing', () => {
    test('processes valid training data file', async () => {
      const { getByLabelText } = render(<NegationAnalyzer />);
      const file = new File(
        ['test data'],
        'PEUR_QUE vs. PEUR_QUE_NE annotated.xlsx',
        { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
      );
      
      const input = getByLabelText('Upload Training Data (Excel)');
      Object.defineProperty(input, 'files', { value: [file] });
      fireEvent.change(input);
      
      await waitFor(() => {
        expect(getByText('Total examples: 200')).toBeInTheDocument();
      });
    });
  });

  // Pattern learning tests
  describe('Pattern Learning', () => {
    test.each(patternLearningTests)(
      '$description',
      async ({ input, expectedScore }) => {
        const { getByPlaceholderText, getByText } = render(<NegationAnalyzer />);
        const inputField = getByPlaceholderText('Type a sentence with a negation...');
        
        // First upload training data
        await uploadTrainingData();
        
        // Then test pattern recognition
        fireEvent.change(inputField, { target: { value: input.text } });
        fireEvent.click(getByText('Evaluate'));
        
        await waitFor(() => {
          const result = getByText(/Classification Result/);
          expect(result).toHaveTextContent(/based on training data/);
        });
      }
    );
  });

  // Edge cases
  describe('Edge Cases and Error Handling', () => {
    test.each(edgeCaseTests)(
      '$description',
      async ({ input, expectedError, expectedResult }) => {
        const { getByPlaceholderText, getByText } = render(<NegationAnalyzer />);
        const inputField = getByPlaceholderText('Type a sentence with a negation...');
        
        if (typeof input === 'string') {
          fireEvent.change(inputField, { target: { value: input } });
          fireEvent.click(getByText('Evaluate'));
          
          if (expectedError) {
            await waitFor(() => {
              expect(getByText(/error/i)).toBeInTheDocument();
            });
          } else {
            await waitFor(() => {
              expect(getByText(expectedResult)).toBeInTheDocument();
            });
          }
        }
      }
    );
  });
});
