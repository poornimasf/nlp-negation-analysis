import React, { useState, useCallback } from 'react';
import { TrainingDataSection } from './TrainingDataSection';
import { analyzeSentence, formatAnalysis } from '../utils/ruleBasedAnalyzer';
import { classify } from '../utils/classifiers';
import { formatTrainingResult } from '../utils/resultFormatters';
import './NegationAnalyzer.css';

const NegationAnalyzer = () => {
  const [mode, setMode] = useState('rule');
  const [inputText, setInputText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [trainingData, setTrainingData] = useState(null);

  const handleInputChange = (event) => {
    setInputText(event.target.value);
    setAnalysis(null);
    setError(null);
  };

  const handleTrainingData = useCallback((data) => {
    console.log('Received training data:', data);
    setTrainingData(data);
    setError(null);
  }, []);

  const handleAnalyze = () => {
    try {
      const text = inputText.trim();
      if (!text) {
        setError('Please enter a sentence to analyze');
        return;
      }

      if (mode === 'training' && !trainingData) {
        setError('Please upload training data first');
        return;
      }

      // Perform analysis based on mode
      const result = mode === 'training'
        ? analyzeWithTrainingData(text, trainingData)
        : analyzeSentence(text);

      // Format the result appropriately
      const formattedResult = mode === 'training'
        ? formatTrainingResult(result)
        : formatAnalysis(result);

      setAnalysis(formattedResult);
      setError(null);
    } catch (err) {
      console.error('Analysis error:', err);
      setError('Error analyzing sentence: ' + err.message);
    }
  };

  const analyzeWithTrainingData = (text, data) => {
    try {
      // Use the proper training data classifier
      const result = classify(text, data.examples, 'BINARY');
      
      // Convert boolean classification to string format
      const classificationString = result.classification ? 'Expletive' : 'No Expletive';
      
      return {
        classification: classificationString,
        confidence: result.confidence,
        analysis: result,
        details: result.matches || [],
        evidence: {
          weightedEvidence: {
            expletive: result.matches?.filter(m => m.has_expletive_ne).length || 0,
            nonExpletive: result.matches?.filter(m => !m.has_expletive_ne).length || 0
          }
        }
      };
    } catch (error) {
      console.error('Training data analysis error:', error);
      return {
        classification: 'undefined',
        confidence: 0.5,
        analysis: null,
        details: [],
        evidence: {}
      };
    }
  };

  return (
    <div className="negation-analyzer">
      <h2>French Negation Analyzer</h2>

      <div className="mode-selector">
        <select value={mode} onChange={(e) => setMode(e.target.value)}>
          <option value="rule">Rule-Based Analysis</option>
          <option value="training">Training Data Analysis</option>
        </select>
      </div>
      
      {mode === 'training' && (
        <TrainingDataSection onDataLoad={handleTrainingData} />
      )}
      
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
