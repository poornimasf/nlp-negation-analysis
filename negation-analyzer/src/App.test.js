import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Negation Analyzer title', () => {
  render(<App />);
  const titleElement = screen.getByRole('heading', { level: 1, name: /Negation Analyzer/i });
  expect(titleElement).toBeInTheDocument();
});
