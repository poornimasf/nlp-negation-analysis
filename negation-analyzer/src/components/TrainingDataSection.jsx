import React, { useState } from 'react';

export const TrainingDataSection = ({
  trainingData,
  handleFileUpload,
  clearTrainingData,
  uploadError
}) => {
  const [isJsonFormatExpanded, setIsJsonFormatExpanded] = useState(false);

  return (
    <div className="card">
      <h3 className="title">📚 Training Data Analysis</h3>

      
      {/* File Upload Section */}
      <div className="form-group">
        <label htmlFor="training-file-upload">Upload Training Data (JSON):</label>
        <div className="input-group">
          <input
            id="training-file-upload"
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="input"
          />
          {trainingData.length > 0 && (
            <button onClick={clearTrainingData} className="button" style={{ backgroundColor: '#dc3545' }}>
              Clear Data
            </button>
          )}
        </div>
        {uploadError && (
          <p style={{ color: '#dc3545', marginTop: '10px' }}>{uploadError}</p>
        )}

        {/* Collapsible JSON Format Section */}
        <div style={{ marginTop: '15px' }}>
          <button
            onClick={() => setIsJsonFormatExpanded(!isJsonFormatExpanded)}
            style={{
              backgroundColor: '#f8f9fa',
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              padding: '8px 12px',
              width: '100%',
              textAlign: 'left',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              color: '#495057',
              fontSize: '14px'
            }}
          >
            <span>📋 Expected JSON Format</span>
            <span style={{ 
              transition: 'transform 0.2s',
              transform: isJsonFormatExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
            }}>
              ▼
            </span>
          </button>
          
          {isJsonFormatExpanded && (
            <div style={{
              marginTop: '10px',
              backgroundColor: '#f8f9fa',
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              padding: '15px'
            }}>
              <pre style={{ 
                backgroundColor: 'white',
                padding: '10px',
                borderRadius: '4px',
                fontSize: '12px'
              }}>
{`{
  "text": "Je veux pas qu'il parte",
  "has_expletive_ne": false,
  "trigger": "logical",
  "classification": "logical"
}`}
              </pre>
              <div style={{ 
                marginTop: '10px',
                fontSize: '14px',
                color: '#666',
                backgroundColor: '#fff8e1',
                padding: '12px',
                borderRadius: '4px',
                border: '1px solid #ffe082'
              }}>
                <strong>Fields Explanation:</strong>
                <ul style={{ marginTop: '8px', marginBottom: '0', paddingLeft: '20px' }}>
                  <li><code>text</code>: The original French sentence</li>
                  <li><code>has_expletive_ne</code>: Boolean indicating presence of expletive ne</li>
                  <li><code>trigger</code>: The trigger pattern or "logical" for logical negation</li>
                  <li><code>classification</code>: "expletive" or "logical"</li>
                </ul>
                <div style={{ marginTop: '12px', fontSize: '13px', color: '#666' }}>
                  Note: You can also provide multiple examples as an array or wrap them in an "examples" array.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Training Data Preview */}
        {trainingData.length > 0 && (
          <div style={{ 
            marginTop: '20px',
            backgroundColor: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: '8px',
            padding: '15px'
          }}>
            <h4 style={{ marginBottom: '15px', color: '#495057' }}>
              🔍 Training Data Preview
            </h4>
            <div style={{ 
              maxHeight: '300px', 
              overflowY: 'auto',
              backgroundColor: 'white',
              border: '1px solid #e9ecef',
              borderRadius: '4px'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ 
                    backgroundColor: '#e9ecef',
                    position: 'sticky',
                    top: 0
                  }}>
                    <th style={{ padding: '8px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Text</th>
                    <th style={{ padding: '8px', textAlign: 'center', borderBottom: '2px solid #dee2e6' }}>Trigger</th>
                    <th style={{ padding: '8px', textAlign: 'center', borderBottom: '2px solid #dee2e6' }}>Type</th>
                    <th style={{ padding: '8px', textAlign: 'center', borderBottom: '2px solid #dee2e6' }}>Valid</th>
                  </tr>
                </thead>
                <tbody>
                  {trainingData.slice(0, 10).map((item, index) => {
                    // Validate trigger type
                    const isValidTrigger = item.trigger && (
                      ["peur que", "avant que", "peu s'en faut", "logical"].includes(item.trigger.toLowerCase()) || 
                      ['craindre', 'redouter', 'douter', 'éviter', 'empêcher'].includes(item.trigger.toLowerCase())
                    );
                    
                    // Check for proper structure
                    const hasValidStructure = item.text && 
                      typeof item.has_expletive_ne !== 'undefined' &&
                      item.trigger &&
                      item.classification;

                    return (
                      <tr key={index} style={{ 
                        borderBottom: '1px solid #dee2e6',
                        backgroundColor: index % 2 === 0 ? 'white' : '#f8f9fa'
                      }}>
                        <td style={{ padding: '8px', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.text}
                        </td>
                        <td style={{ padding: '8px', textAlign: 'center' }}>
                          <span style={{
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '0.9em',
                            backgroundColor: isValidTrigger ? '#e8f5e9' : '#ffebee',
                            color: isValidTrigger ? '#2e7d32' : '#c62828',
                            border: `1px solid ${isValidTrigger ? '#c8e6c9' : '#ffcdd2'}`
                          }}>
                            {item.trigger}
                          </span>
                        </td>
                        <td style={{ padding: '8px', textAlign: 'center' }}>
                          <span style={{
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '0.9em',
                            backgroundColor: item.has_expletive_ne ? '#e3f2fd' : '#fff3e0',
                            color: item.has_expletive_ne ? '#1565c0' : '#ef6c00',
                            border: `1px solid ${item.has_expletive_ne ? '#bbdefb' : '#ffe0b2'}`
                          }}>
                            {item.has_expletive_ne ? 'Expletive' : 'Logical'}
                          </span>
                        </td>
                        <td style={{ padding: '8px', textAlign: 'center' }}>
                          {hasValidStructure ? (
                            <span style={{ color: '#2e7d32' }}>✓</span>
                          ) : (
                            <span style={{ color: '#c62828' }}>✗</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {trainingData.length > 10 && (
              <div style={{ 
                marginTop: '10px', 
                textAlign: 'center',
                color: '#666',
                fontSize: '0.9em'
              }}>
                Showing first 10 of {trainingData.length} examples
              </div>
            )}
          </div>
        )}

        {/* Training Data Statistics */}
        {trainingData.length > 0 && (
          <div style={{ 
            marginTop: '20px',
            backgroundColor: '#e8f5e8', 
            padding: '15px', 
            borderRadius: '8px', 
            border: '1px solid #4caf50'
          }}>
            <h4>📊 Training Data Statistics:</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              <div>
                <strong>Total Examples:</strong> {trainingData.length}<br/>
                <strong>Expletive Examples:</strong> {trainingData.filter(d => d.has_expletive_ne).length}<br/>
                <strong>Logical Examples:</strong> {trainingData.filter(d => !d.has_expletive_ne).length}
              </div>
              <div>
                <strong>"Peur que" Examples:</strong> {trainingData.filter(d => d.trigger?.toLowerCase().includes('peur')).length}<br/>
                <strong>"Avant que" Examples:</strong> {trainingData.filter(d => d.trigger?.toLowerCase().includes('avant')).length}<br/>
                <strong>"Peu s'en faut" Examples:</strong> {trainingData.filter(d => d.trigger?.toLowerCase().includes('peu s\'en')).length}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
