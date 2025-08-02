import React, { useState } from 'react';
import './NegationAnalyzer.css';

export const TrainingDataSection = ({ onDataLoad }) => {
  const [error, setError] = useState(null);
  const [showFormat, setShowFormat] = useState(false);

  const processFileContent = (content) => {
    try {
      // Parse JSON
      const jsonData = JSON.parse(content);
      
      // If it's an array, wrap it in examples object
      const data = Array.isArray(jsonData) ? { examples: jsonData } : jsonData;
      
      // Validate the data
      if (!validateTrainingData(data)) {
        setError('Invalid training data format. Check console for details.');
        return;
      }

      // Clean the data
      const cleanedData = cleanTrainingData(data);
      
      onDataLoad(cleanedData);
      setError(null);
    } catch (err) {
      console.error('Processing error:', err);
      setError('Error processing file: ' + err.message);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    
    // Use traditional onload assignment
    reader.onload = function() {
      processFileContent(this.result);
    };
    
    reader.onerror = function() {
      setError('Error reading file');
    };

    reader.readAsText(file);
  };

  const cleanTrainingData = (data) => {
    if (!data.examples || !Array.isArray(data.examples)) {
      return data;
    }

    return {
      examples: data.examples.map(example => ({
        ...example,
        text: example.text?.trim() || '',
        has_expletive_ne: Boolean(example.has_expletive_ne),
        classification: Boolean(example.classification),
        trigger: ['peur que', 'avant que', 'peu s\'en faut'].includes(example.trigger) 
          ? example.trigger 
          : null,
        ne_position: validateNePosition(example.text?.trim() || '', example.ne_position)
      }))
    };
  };

  const validateNePosition = (text, position) => {
    if (position === null) return null;
    
    const pos = Number(position);
    if (isNaN(pos)) return null;
    
    const words = text.split(/\s+/).filter(Boolean);
    if (pos < 1 || pos > words.length) {
      console.warn('Invalid ne_position:', pos, 'for text:', text);
      return null;
    }
    
    return pos;
  };

  const validateTrainingData = (data) => {
    if (!data || !data.examples || !Array.isArray(data.examples)) {
      console.error('Invalid data structure:', data);
      return false;
    }

    return data.examples.every(example => {
      const isValid = (
        example &&
        typeof example === 'object' &&
        typeof example.text === 'string' &&
        example.text.trim().length > 0 &&
        typeof example.has_expletive_ne === 'boolean' &&
        typeof example.classification === 'boolean' &&
        (example.trigger === null || ['peur que', 'avant que', 'peu s\'en faut'].includes(example.trigger)) &&
        (example.ne_position === null || (Number.isInteger(example.ne_position) && example.ne_position > 0))
      );

      if (!isValid) {
        console.error('Invalid example:', example);
      }

      return isValid;
    });
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
      <p className="section-description">
        Upload a JSON file containing French sentences for negation analysis. 
        The file should include examples of sentences with and without expletive negation.
      </p>
      
      <div className="format-toggle" onClick={() => setShowFormat(!showFormat)}>
        <span className="toggle-icon">{showFormat ? '▼' : '▶'}</span>
        <span className="toggle-text">Show JSON Format Details</span>
      </div>
      
      {showFormat && (
        <div className="info-box">
          <h4>Expected JSON Format:</h4>
          <div className="format-explanation">
            <p>Upload a JSON file with the following structure:</p>
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
        {error && (
          <div className="error-message">
            {error}
            <br />
            <small>Check the console for more details.</small>
          </div>
        )}
      </div>
    </div>
  );
};
