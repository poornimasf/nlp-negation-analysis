import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import NegationAnalyzer from '../components/NegationAnalyzer';

describe('NegationAnalyzer', () => {
  // Single sentence test
  test('analyzes single sentence', async () => {
    render(<NegationAnalyzer />);
    
    // Find input field and evaluate button
    const inputField = screen.getByPlaceholderText(/Type a sentence/i);
    const evaluateButton = screen.getByRole('button', { name: /^Evaluate$/i });
    
    // Enter text and click evaluate
    fireEvent.change(inputField, { target: { value: "J'ai peur qu'il ne vienne" } });
    fireEvent.click(evaluateButton);
    
    // Wait for result section
    await waitFor(() => {
      expect(screen.getByText(/Classification Result:/i)).toBeInTheDocument();
    });
  });

  // Batch processing test
  test('processes multiple sentences', async () => {
    render(<NegationAnalyzer />);
    
    // Find textarea and evaluate batch button
    const textarea = screen.getByPlaceholderText(/One sentence per line/i);
    const evaluateButton = screen.getByRole('button', { name: /Evaluate Batch/i });
    
    // Enter text and click evaluate
    fireEvent.change(textarea, { target: { value: "J'ai peur qu'il ne vienne\\nJe crains qu'il ne soit malade" } });
    fireEvent.click(evaluateButton);
    
    // Wait for results table
    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument();
    });
  });

  // Error handling tests
  test('handles empty input', async () => {
    render(<NegationAnalyzer />);
    
    // Find evaluate button and click it without input
    const evaluateButton = screen.getByRole('button', { name: /^Evaluate$/i });
    fireEvent.click(evaluateButton);
    
    // Wait for and check error message
    await waitFor(() => {
      expect(screen.getByText('No negation detected.')).toBeInTheDocument();
    });
  });

  test('handles file upload', async () => {
    render(<NegationAnalyzer />);
    
    // Find file input
    const fileInput = screen.getByLabelText(/Upload Training Data/i, { selector: 'input[type="file"]' });
    
    // Create a mock file and trigger upload
    const file = new File(['test data'], 'test.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    Object.defineProperty(fileInput, 'files', { value: [file] });
    fireEvent.change(fileInput);
    
    // Wait for stats section to appear
    await waitFor(() => {
      expect(screen.getByText(/Learned Patterns/i)).toBeInTheDocument();
    });
  });
});
