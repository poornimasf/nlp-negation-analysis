import React, { useState } from 'react';
import { analyzeSentence, formatAnalysis, suggestNePosition } from '../utils/ruleBasedAnalyzer';
import './NegationAnalyzer.css';

const NegationAnalyzer = () => {
  const [inputText, setInputText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);

  const handleInputChange = (event) => {
    setInputText(event.target.value);
    setAnalysis(null);
    setError(null);
  };

  const handleAnalyze = () => {
    try {
      const text = inputText.trim();
      if (!text) {
        setError('Please enter a sentence to analyze');
        return;
      }

      // Perform analysis
      const result = analyzeSentence(text);
      
      // Get NE position suggestion if expletive
      if (result.classification) {
        result.suggestedNePosition = suggestNePosition(text, result.trigger);
      }

      // Format results
      setAnalysis(formatAnalysis(result));
      setError(null);
    } catch (err) {
      console.error('Analysis error:', err);
      setError('Error analyzing sentence: ' + err.message);
    }
  };

  return (
    <div className="negation-analyzer">
      <h2>French Negation Analyzer</h2>
      
      <div className="description">
        <p>
          Analyze French sentences for expletive negation patterns. 
          The analyzer will identify potential expletive negation contexts 
          and suggest 'ne' placement where appropriate.
        </p>
      </div>
      
      <div className="input-section">
        <textarea
          value={inputText}
          onChange={handleInputChange}
          placeholder="Enter French sentence to analyze..."
          rows={4}
        />
        <button onClick={handleAnalyze}>
          Analyze
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {analysis && (
        <div className="analysis-results">
          <h3>Analysis Results</h3>
          <table>
            <tbody>
              <tr>
                <th>Classification:</th>
                <td>{analysis.type}</td>
              </tr>
              {analysis.classification && (
                <>
                  <tr>
                    <th>Trigger Found:</th>
                    <td>{analysis.trigger}</td>
                  </tr>
                  <tr>
                    <th>Has NE:</th>
                    <td>{analysis.hasNe}</td>
                  </tr>
                  <tr>
                    <th>NE Position:</th>
                    <td>{analysis.nePosition}</td>
                  </tr>
                  {analysis.suggestedNePosition && (
                    <tr>
                      <th>Suggested NE Position:</th>
                      <td>{analysis.suggestedNePosition}</td>
                    </tr>
                  )}
                </>
              )}
              <tr>
                <th>Confidence:</th>
                <td>{analysis.confidence}</td>
              </tr>
            </tbody>
          </table>

          {analysis.classification && (
            <div className="sentence-visualization">
              <h4>Sentence Structure</h4>
              <div className="sentence-breakdown">
                {inputText.split(/\s+/).map((word, index) => (
                  <span 
                    key={index} 
                    className={`
                      word
                      ${word.toLowerCase().includes(analysis.trigger) ? 'trigger' : ''}
                      ${(index + 1) === analysis.nePosition ? 'current-ne' : ''}
                      ${(index + 1) === analysis.suggestedNePosition ? 'suggested-ne' : ''}
                    `}
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NegationAnalyzer;
