import React, { useState, useCallback } from 'react';
import { TrainingDataSection } from './TrainingDataSection';
import { classify } from '../utils/classifiers';
import { formatTrainingResult } from '../utils/resultFormatters';
import './NegationAnalyzer.css';

const SimpleNegationAnalyzer = () => {
  const [mode, setMode] = useState('training');
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
        : { classification: 'Rule-based mode not implemented', confidence: 0.5 };

      // Format the result for training data mode
      const formattedResult = mode === 'training'
        ? formatTrainingResult(result)
        : 'Rule-based analysis not available';

      setAnalysis(formattedResult);
      setError(null);
    } catch (err) {
      console.error('Analysis error:', err);
      setError('Error analyzing sentence: ' + err.message);
    }
  };

  return (
    <div className="negation-analyzer">
      <h2>French Negation Analyzer</h2>

      <div className="mode-selector">
        <select value={mode} onChange={(e) => setMode(e.target.value)}>
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
        <button onClick={handleAnalyze} disabled={!inputText.trim()}>
          Analyze
        </button>
      </div>

      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}

      {analysis && (
        <div className="analysis-results">
          <h3>Analysis Results</h3>
          <pre>{analysis}</pre>
        </div>
      )}
    </div>
  );
};

export default SimpleNegationAnalyzer;
