import React, { useState } from 'react';
import './NegationAnalyzer.css';

export const TrainingDataSection = ({ onDataLoad }) => {
  const [error, setError] = useState(null);
  const [showFormat, setShowFormat] = useState(false);

  const processFileContent = (content) => {
    try {
      // Parse JSON
      const jsonData = JSON.parse(content);
      console.log('Parsed JSON:', jsonData); // Debug log
      
      // If it's an array, wrap it in examples object
      const data = Array.isArray(jsonData) ? { examples: jsonData } : jsonData;
      console.log('Processed data:', data); // Debug log
      
      // Validate the data
      if (!validateTrainingData(data)) {
        setError('Invalid training data format. Check console for details.');
        return;
      }

      // Clean the data
      const cleanedData = cleanTrainingData(data);
      console.log('Cleaned data:', cleanedData); // Debug log
      
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
    if (isNaN(pos)) {
      console.warn('ne_position is not a number:', position);
      return null;
    }
    
    const words = text.split(/\s+/).filter(Boolean);
    if (pos < 1 || pos > words.length) {
      console.warn(`Invalid ne_position: ${pos} (word count: ${words.length}) for text: "${text}"`);
      return null;
    }
    
    return pos;
  };

  const validateTrainingData = (data) => {
    // Check basic structure
    if (!data) {
      console.error('Data is null or undefined');
      return false;
    }

    if (!data.examples) {
      console.error('Missing examples array');
      return false;
    }

    if (!Array.isArray(data.examples)) {
      console.error('examples is not an array');
      return false;
    }

    // Validate each example
    return data.examples.every((example, index) => {
      console.log(`Validating example ${index}:`, example); // Debug log

      const validationErrors = [];

      // Check if example exists and is an object
      if (!example || typeof example !== 'object') {
        console.error(`Example ${index} is not an object:`, example);
        return false;
      }

      // Validate text
      if (!example.text || typeof example.text !== 'string') {
        validationErrors.push('text must be a non-empty string');
      }

      // Validate has_expletive_ne
      if (typeof example.has_expletive_ne !== 'boolean') {
        validationErrors.push('has_expletive_ne must be a boolean');
      }

      // Validate classification
      if (typeof example.classification !== 'boolean') {
        validationErrors.push('classification must be a boolean');
      }

      // Validate trigger
      if (example.trigger !== null && 
          !['peur que', 'avant que', 'peu s\'en faut'].includes(example.trigger)) {
        validationErrors.push('trigger must be one of: "peur que", "avant que", "peu s\'en faut", or null');
      }

      // Validate ne_position
      if (example.ne_position !== null) {
        if (!Number.isInteger(example.ne_position)) {
          validationErrors.push('ne_position must be an integer or null');
        } else if (example.ne_position < 1) {
          validationErrors.push('ne_position must be greater than 0');
        }
      }

      if (validationErrors.length > 0) {
        console.error(`Validation errors for example ${index}:`, {
          example,
          errors: validationErrors
        });
        return false;
      }

      return true;
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
            <small>Check the console for detailed validation errors.</small>
          </div>
        )}
      </div>
    </div>
  );
};
