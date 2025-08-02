import React, { useState } from 'react';
import './NegationAnalyzer.css';

const TrainingDataSection = ({ onDataLoad }) => {
  const [error, setError] = useState(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      // Validate the data format
      if (!validateTrainingData(data)) {
        setError('Invalid training data format');
        return;
      }

      onDataLoad(data);
      setError(null);
    } catch (err) {
      setError('Error loading file: ' + err.message);
    }
  };

  const validateTrainingData = (data) => {
    if (!data.examples || !Array.isArray(data.examples)) {
      return false;
    }

    return data.examples.every(example => (
      example.text &&
      typeof example.has_expletive_ne === 'boolean' &&
      typeof example.classification === 'boolean' &&
      (example.trigger === null || ['peur que', 'avant que', 'peu s\'en faut'].includes(example.trigger)) &&
      (example.ne_position === null || typeof example.ne_position === 'number')
    ));
  };

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
      
      <div className="info-box">
        <h4>Expected JSON Format:</h4>
        <div className="format-explanation">
          <p>Upload a JSON file with the following structure:</p>
          <pre>{JSON.stringify(formatExample, null, 2)}</pre>
          
          <h5>Field Descriptions:</h5>
          <ul>
            <li><strong>text</strong>: The French sentence</li>
            <li><strong>has_expletive_ne</strong>: true if 'ne' is present</li>
            <li><strong>classification</strong>: true for expletive possible, false for not possible</li>
            <li><strong>trigger</strong>: One of: "peur que", "avant que", "peu s'en faut", or null</li>
            <li><strong>ne_position</strong>: Position of 'ne' if present (1-based), null if not</li>
          </ul>
        </div>
      </div>

      <div className="upload-section">
        <input
          type="file"
          accept=".json"
          onChange={handleFileUpload}
          className="file-input"
        />
        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
};

export default TrainingDataSection;
