import React, { useState, useEffect } from 'react';
import { parseTrainingData, analyzeSentence } from '../utils/trainingDataParser';
import './NegationAnalyzer.css';

const NegationAnalyzer = () => {
  // State management
  const [inputText, setInputText] = useState('');
  const [trainingData, setTrainingData] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load training data on component mount
  useEffect(() => {
    loadTrainingData();
  }, []);

  // Load and parse training data
  const loadTrainingData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/data/training_data.json');
      const data = await response.json();
      const parsed = parseTrainingData(data);
      setTrainingData(parsed);
      setError(null);
    } catch (err) {
      setError('Error loading training data: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (event) => {
    setInputText(event.target.value);
  };

  // Analyze input text
  const handleAnalyze = () => {
    if (!inputText.trim()) {
      setError('Please enter a sentence to analyze');
      return;
    }

    try {
      const result = analyzeSentence(inputText, trainingData.examples);
      setAnalysis(result);
      setError(null);
    } catch (err) {
      setError('Analysis error: ' + err.message);
    }
  };

  // Format analysis results
  const formatResults = () => {
    if (!analysis) return null;

    return (
      <div className="analysis-results">
        <h3>Analysis Results</h3>
        <table>
          <thead>
            <tr>
              <th>Input</th>
              <th>Classification</th>
              <th>Trigger</th>
              <th>Suggested NE Position</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{inputText}</td>
              <td>{analysis.classification ? 'Expletive' : 'Not Expletive'}</td>
              <td>{analysis.trigger || 'None'}</td>
              <td>{analysis.suggestedNePosition || 'N/A'}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  // Format training data statistics
  const formatStats = () => {
    if (!trainingData?.stats) return null;

    const { stats } = trainingData;
    return (
      <div className="training-stats">
        <h3>Training Data Statistics</h3>
        <table>
          <tbody>
            <tr>
              <td>Total Examples:</td>
              <td>{stats.total}</td>
            </tr>
            <tr>
              <td>Expletive Examples:</td>
              <td>{stats.expletive.total}</td>
            </tr>
            <tr>
              <td>With NE:</td>
              <td>{stats.expletive.withNe}</td>
            </tr>
            <tr>
              <td>Without NE:</td>
              <td>{stats.expletive.withoutNe}</td>
            </tr>
            <tr>
              <td>Non-Expletive Examples:</td>
              <td>{stats.nonExpletive}</td>
            </tr>
          </tbody>
        </table>

        <h4>Trigger Statistics</h4>
        {Object.entries(stats.expletive.byTrigger).map(([trigger, triggerStats]) => (
          <div key={trigger} className="trigger-stats">
            <h5>{trigger}</h5>
            <table>
              <tbody>
                <tr>
                  <td>Total:</td>
                  <td>{triggerStats.total}</td>
                </tr>
                <tr>
                  <td>With NE:</td>
                  <td>{triggerStats.withNe}</td>
                </tr>
                <tr>
                  <td>Without NE:</td>
                  <td>{triggerStats.withoutNe}</td>
                </tr>
                <tr>
                  <td>Common NE Positions:</td>
                  <td>{triggerStats.nePositions.join(', ') || 'None'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="negation-analyzer">
      <h2>French Negation Analyzer</h2>
      
      {/* Error display */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div className="loading">
          Loading training data...
        </div>
      )}

      {/* Input section */}
      <div className="input-section">
        <textarea
          value={inputText}
          onChange={handleInputChange}
          placeholder="Enter French sentence to analyze..."
          rows={4}
        />
        <button 
          onClick={handleAnalyze}
          disabled={!trainingData || isLoading}
        >
          Analyze
        </button>
      </div>

      {/* Results section */}
      {formatResults()}

      {/* Training data statistics */}
      {formatStats()}
    </div>
  );
};

export default NegationAnalyzer;
