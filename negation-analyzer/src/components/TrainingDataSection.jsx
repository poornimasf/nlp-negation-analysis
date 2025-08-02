import React, { useState } from 'react';
import './NegationAnalyzer.css';

export const TrainingDataSection = ({ onDataLoad }) => {
  const [error, setError] = useState(null);
  const [showFormat, setShowFormat] = useState(false);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          // Try to parse the JSON
          let data;
          try {
            data = JSON.parse(e.target.result);
          } catch (parseError) {
            console.error('Parse error:', parseError);
            setError('Invalid JSON format. Please check the file content.');
            return;
          }

          // Clean and validate the data
          const cleanedData = cleanTrainingData(data);
          
          if (!validateTrainingData(cleanedData)) {
            setError('Invalid training data structure. Please check the format.');
            return;
          }

          onDataLoad(cleanedData);
          setError(null);
        } catch (err) {
          console.error('Processing error:', err);
          setError('Error processing file: ' + err.message);
        }
      };

      reader.onerror = () => {
        setError('Error reading file');
      };

      reader.readAsText(file);
    } catch (err) {
      console.error('File error:', err);
      setError('Error loading file: ' + err.message);
    }
  };

  const cleanTrainingData = (data) => {
    // If it's an array, wrap it in examples object
    if (Array.isArray(data)) {
      data = { examples: data };
    }

    // Clean the examples
    if (data.examples && Array.isArray(data.examples)) {
      data.examples = data.examples.map(example => ({
        ...example,
        // Trim whitespace from text
        text: example.text?.trim(),
        // Ensure boolean values
        has_expletive_ne: Boolean(example.has_expletive_ne),
        classification: Boolean(example.classification),
        // Clean trigger value
        trigger: ['peur que', 'avant que', 'peu s\'en faut'].includes(example.trigger) 
          ? example.trigger 
          : null,
        // Validate ne_position
        ne_position: validateNePosition(example.text, example.ne_position)
      }));
    }

    return data;
  };

  const validateNePosition = (text, position) => {
    if (position === null) return null;
    
    // Convert to number
    const pos = Number(position);
    
    // Check if it's a valid number
    if (isNaN(pos)) return null;
    
    // Count words in text
    const wordCount = text?.split(/\s+/).filter(Boolean).length || 0;
    
    // Position should be between 1 and word count
    if (pos < 1 || pos > wordCount) return null;
    
    return pos;
  };

  const validateTrainingData = (data) => {
    // Check basic structure
    if (!data || !data.examples || !Array.isArray(data.examples)) {
      console.error('Invalid data structure:', data);
      return false;
    }

    // Validate each example
    return data.examples.every(example => {
      const isValid = (
        example &&
        typeof example === 'object' &&
        typeof example.text === 'string' &&
        example.text.length > 0 &&
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
