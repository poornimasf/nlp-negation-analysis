import React, { useState } from 'react';
import './NegationAnalyzer.css';

export const TrainingDataSection = ({ trainingData, handleFileUpload, clearTrainingData, uploadError }) => {
  const [error, setError] = useState(null);
  const [showFormat, setShowFormat] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

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

  const renderPreview = () => {
    if (!trainingData || !trainingData.examples || trainingData.examples.length === 0) {
      return null;
    }

    const stats = {
      total: trainingData.examples.length,
      withNe: trainingData.examples.filter(ex => ex.has_expletive_ne).length,
      expletivePossible: trainingData.examples.filter(ex => ex.classification).length,
      triggers: {
        'peur que': 0,
        'avant que': 0,
        'peu s\'en faut': 0
      }
    };

    // Count triggers
    trainingData.examples.forEach(ex => {
      if (ex.trigger && stats.triggers.hasOwnProperty(ex.trigger)) {
        stats.triggers[ex.trigger]++;
      }
    });

    return (
      <div className="preview-section">
        <div className="preview-header">
          <h4>Training Data Preview</h4>
          <button onClick={() => setShowPreview(!showPreview)} className="toggle-button">
            {showPreview ? 'Hide' : 'Show'} Preview
          </button>
        </div>

        {showPreview && (
          <>
            <div className="stats-section">
              <h5>Statistics</h5>
              <div className="stats-grid">
                <div className="stats-column">
                  <p>Total examples: {stats.total}</p>
                  <p>With NE: {stats.withNe}</p>
                  <p>Expletive possible: {stats.expletivePossible}</p>
                </div>
                <div className="stats-column">
                  <p>Triggers:</p>
                  <ul>
                    {Object.entries(stats.triggers).map(([trigger, count]) => (
                      <li key={trigger}>{trigger}: {count}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="examples-preview">
              <h5>Examples</h5>
              <div className="examples-table-container">
                <table className="examples-table">
                  <thead>
                    <tr>
                      <th>Text</th>
                      <th>Has NE</th>
                      <th>Expletive</th>
                      <th>Trigger</th>
                      <th>NE Position</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trainingData.examples.slice(0, 5).map((example, index) => (
                      <tr key={index} className={example.has_expletive_ne ? 'has-ne' : ''}>
                        <td>{example.text}</td>
                        <td>{example.has_expletive_ne ? 'Yes' : 'No'}</td>
                        <td>{example.classification ? 'Yes' : 'No'}</td>
                        <td>{example.trigger || '-'}</td>
                        <td>{example.ne_position || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {trainingData.examples.length > 5 && (
                  <p className="more-examples">
                    And {trainingData.examples.length - 5} more examples...
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    );
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
        {trainingData && trainingData.examples && trainingData.examples.length > 0 && (
          <button onClick={clearTrainingData} className="clear-button">
            Clear Training Data
          </button>
        )}
      </div>

      {renderPreview()}
    </div>
  );
};
