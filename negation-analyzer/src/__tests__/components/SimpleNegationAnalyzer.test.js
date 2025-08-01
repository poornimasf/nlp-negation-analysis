import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import SimpleNegationAnalyzer from '../../components/SimpleNegationAnalyzer';

// Mock the required utilities
jest.mock('../../utils/NegationAnalyzer');
jest.mock('../../utils/classifiers');
jest.mock('../../utils/trainingDataManager');

describe('SimpleNegationAnalyzer Integration Tests', () => {
  describe('Mode Selection Tests', () => {
    test('starts in Rule-Based mode', () => {
      const { getByText } = render(<SimpleNegationAnalyzer />);
      expect(getByText('Pattern-Based Analysis')).toBeInTheDocument();
    });

    test('can switch to Training Data mode', () => {
      const { getByRole } = render(<SimpleNegationAnalyzer />);
      const select = getByRole('combobox');
      fireEvent.change(select, { target: { value: 'TRAINING_DATA' } });
      expect(select.value).toBe('TRAINING_DATA');
    });

    test('can switch to SVM mode', () => {
      const { getByRole } = render(<SimpleNegationAnalyzer />);
      const select = getByRole('combobox');
      fireEvent.change(select, { target: { value: 'SVM_ANALYSIS' } });
      expect(select.value).toBe('SVM_ANALYSIS');
    });
  });

  describe('Training Data Integration Tests', () => {
    test('shows training data section in appropriate modes', () => {
      const { getByRole, queryByText } = render(<SimpleNegationAnalyzer />);
      
      // Not visible in Rule-Based mode
      expect(queryByText('Upload Training Data (JSON):')).not.toBeInTheDocument();
      
      // Switch to Training Data mode
      const select = getByRole('combobox');
      fireEvent.change(select, { target: { value: 'TRAINING_DATA' } });
      
      // Now visible
      expect(queryByText('Upload Training Data (JSON):')).toBeInTheDocument();
    });

    test('handles file upload', async () => {
      const { getByRole, getByLabelText } = render(<SimpleNegationAnalyzer />);
      
      // Switch to Training Data mode
      const select = getByRole('combobox');
      fireEvent.change(select, { target: { value: 'TRAINING_DATA' } });
      
      // Simulate file upload
      const file = new File([
        JSON.stringify({
          examples: [{
            text: "Test",
            classification: "LOGICAL",
            trigger: "logical"
          }]
        })
      ], 'test.json', { type: 'application/json' });
      
      const input = getByLabelText(/upload training data/i);
      fireEvent.change(input, { target: { files: [file] } });
      
      // Wait for processing
      await waitFor(() => {
        expect(input.files[0]).toBe(file);
      });
    });
  });

  describe('Batch Analysis Integration Tests', () => {
    test('handles batch input', async () => {
      const { getByRole, getByPlaceholderText } = render(<SimpleNegationAnalyzer />);
      const textarea = getByPlaceholderText(/enter sentences/i);
      const analyzeButton = getByRole('button', { name: /analyze batch/i });
      
      // Enter test data
      fireEvent.change(textarea, { target: { value: "Test sentence\nAnother test" } });
      fireEvent.click(analyzeButton);
      
      // Wait for processing
      await waitFor(() => {
        expect(textarea.value).toBe("Test sentence\nAnother test");
      });
    });

    test('shows results after analysis', async () => {
      const { getByRole, getByPlaceholderText, findByText } = render(<SimpleNegationAnalyzer />);
      const textarea = getByPlaceholderText(/enter sentences/i);
      const analyzeButton = getByRole('button', { name: /analyze batch/i });
      
      // Enter and analyze
      fireEvent.change(textarea, { target: { value: "Test sentence" } });
      fireEvent.click(analyzeButton);
      
      // Wait for results
      await findByText(/results/i);
    });
  });

  describe('Error Handling Integration Tests', () => {
    test('handles empty input', async () => {
      const { getByRole, findByText } = render(<SimpleNegationAnalyzer />);
      const analyzeButton = getByRole('button', { name: /analyze batch/i });
      
      fireEvent.click(analyzeButton);
      
      await findByText(/no text provided/i);
    });

    test('handles invalid file upload', async () => {
      const { getByRole, getByLabelText, findByText } = render(<SimpleNegationAnalyzer />);
      
      // Switch to Training Data mode
      const select = getByRole('combobox');
      fireEvent.change(select, { target: { value: 'TRAINING_DATA' } });
      
      // Upload invalid file
      const file = new File(['invalid json'], 'test.json', { type: 'application/json' });
      const input = getByLabelText(/upload training data/i);
      fireEvent.change(input, { target: { files: [file] } });
      
      await findByText(/failed to process file/i);
    });
  });
});
