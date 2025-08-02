import React, { useState } from 'react';
import './NegationAnalyzer.css';

const TrainingDataSection = ({ onDataLoad }) => {
  const [error, setError] = useState(null);
  const [showFormat, setShowFormat] = useState(false);

  const handleFileUpload = async (event) => {
    setError(null);
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Read file as text
      const text = await file.text();
      console.log('File content:', text);

      // Parse JSON
      const jsonData = JSON.parse(text);
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

export default TrainingDataSection;
