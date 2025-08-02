import React, { useState } from 'react';
import './NegationAnalyzer.css';

// Using named export to match the import in SimpleNegationAnalyzer
export const TrainingDataSection = ({ trainingData, handleFileUpload, clearTrainingData, uploadError }) => {
  const [error, setError] = useState(null);
  const [showFormat, setShowFormat] = useState(false);

  const formatExample = {
    "examples": [
      {
        "text": "J'ai peur qu'il ne vienne",
        "has_expletive_ne": true,
        "classification": true,
        "trigger": "peur que",
        "ne_position": 3
      },
      {
        "text": "Je vais au cinéma",
        "has_expletive_ne": false,
        "classification": false,
        "trigger": null,
        "ne_position": null
      }
    ]
  };

  return (
    <div className="training-data-section">
      <h3>Training Data Analysis</h3>
      <p className="section-description">
        Upload JSON file in the format shown below.
      </p>
      
      <div className="format-toggle" onClick={() => setShowFormat(!showFormat)}>
        <span className="toggle-icon">{showFormat ? '▼' : '▶'}</span>
        <span className="toggle-text">Show JSON Format Details</span>
      </div>
      
      {showFormat && (
        <div className="info-box">
          <h4>Expected JSON Format:</h4>
          <div className="format-explanation">
            <p>Required format:</p>
            <pre>{JSON.stringify(formatExample, null, 2)}</pre>
            
            <h5>Field Descriptions:</h5>
            <ul>
              <li><strong>text</strong>: The French sentence (whitespace will be trimmed)</li>
              <li><strong>has_expletive_ne</strong>: true if 'ne' is present</li>
              <li><strong>classification</strong>: true for expletive possible, false for not possible</li>
              <li><strong>trigger</strong>: One of: "peur que", "avant que", "peu s'en faut", or null</li>
              <li><strong>ne_position</strong>: Position of 'ne' if present (1-based), null if not</li>
            </ul>
          </div>
        </div>
      )}

      <div className="upload-section">
        <input
          type="file"
          accept=".json"
          onChange={handleFileUpload}
          className="file-input"
        />
        {uploadError && (
          <div className="error-message">
            {uploadError}
            <br />
            <small>Check the console for more details.</small>
          </div>
        )}
        {trainingData && trainingData.length > 0 && (
          <button onClick={clearTrainingData} className="clear-button">
            Clear Training Data
          </button>
        )}
      </div>
    </div>
  );
};
