import React, { useState, useCallback } from 'react';
import './NegationAnalyzer.css';

export const TrainingDataSection = ({ onDataLoad = () => {} }) => {
  const [error, setError] = useState(null);
  const [showFormat, setShowFormat] = useState(false);

  const handleFileUpload = useCallback((event) => {
    setError(null);
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.addEventListener('load', (event) => {
      try {
        const content = event.target?.result;
        if (typeof content !== 'string') {
          throw new Error('Invalid file content');
        }

        // Parse JSON
        const jsonData = JSON.parse(content);
        console.log('Parsed JSON:', jsonData);
        
        // Convert array to object if needed
        const data = Array.isArray(jsonData) ? { examples: jsonData } : jsonData;
        console.log('Processed data:', data);

        // Validate structure
        if (!data || !data.examples || !Array.isArray(data.examples)) {
          throw new Error('Invalid data structure. Expected { examples: [...] }');
        }

        // Process each example
        const processedData = {
          examples: data.examples.map((example, index) => {
            if (!example || typeof example !== 'object') {
              throw new Error(`Invalid example at index ${index}`);
            }

            // Clean and validate the example
            return {
              text: String(example.text || '').trim(),
              has_expletive_ne: Boolean(example.has_expletive_ne),
              classification: Boolean(example.classification),
              trigger: ['peur que', 'avant que', 'peu s\'en faut'].includes(example.trigger) 
                ? example.trigger 
                : null,
              ne_position: example.ne_position !== null ? Number(example.ne_position) : null
            };
          })
        };

        console.log('Final processed data:', processedData);
        onDataLoad(processedData);
      } catch (err) {
        console.error('Error processing file:', err);
        setError(`Error processing file: ${err.message}`);
      }
    });

    reader.addEventListener('error', () => {
      setError('Error reading file');
    });

    try {
      reader.readAsText(file);
    } catch (err) {
      setError(`Error reading file: ${err.message}`);
    }
  }, [onDataLoad]);

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
