  {/* Training Data Management Section */}
      {analysisMode === 'TRAINING_DATA' && (
        <div className="card">
          <h3 className="title">📚 User Training Data Management</h3>
          <div style={{
            backgroundColor: '#e8f5e8',
            border: '1px solid #c3e6cb',
            borderRadius: '6px',
            padding: '12px',
            marginBottom: '15px',
            fontSize: '14px'
          }}>
            <strong>🎯 Complete User Control:</strong> Upload your own training examples to enhance analysis accuracy. 
            The system uses ONLY your uploaded data - no hidden datasets or external training sources.
          </div>
          
          <div style={{ 
            backgroundColor: '#e8f5e8', 
            border: '1px solid #4caf50',
            borderRadius: '8px', 
            marginBottom: '20px',
            overflow: 'hidden'
          }}>
            <div 
              onClick={() => setInfoBoxExpanded(!infoBoxExpanded)}
              style={{
                padding: '12px 15px',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#e8f5e8',
                borderBottom: infoBoxExpanded ? '1px solid #4caf50' : 'none'
              }}
            >
              <h4 style={{ margin: 0, fontSize: '14px' }}>📋 Expected File Format (JSON)</h4>
              <span style={{ fontSize: '12px', color: '#2e7d32' }}>
                {infoBoxExpanded ? '▼ Hide Format' : '▶ Show Format'}
              </span>
            </div>
            {infoBoxExpanded && (
              <div style={{ padding: '15px' }}>
                <p><strong>Required fields:</strong> text, has_expletive_ne, trigger, classification</p>
                <p><strong>Example JSON:</strong></p>
                <pre style={{ fontSize: '12px', backgroundColor: 'white', padding: '10px', borderRadius: '4px' }}>
{`{
  "examples": [
    {
      "text": "J'ai peur qu'il vienne",
      "has_expletive_ne": true,
      "trigger": "peur que",
      "classification": "expletive"
    },
    {
      "text": "Avant qu'elle parte",
      "has_expletive_ne": true,
      "trigger": "avant que",
      "classification": "expletive"
    }
  ]
}`}
                </pre>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="training-file-upload">Upload Training Data:</label>
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
                          ["peur que", "avant que", "peu s'en faut"].includes(item.trigger.toLowerCase()) || 
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
          </div>

          {/* Training Data Statistics */}
          {trainingData.length > 0 && (
            <div style={{ 
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
      )}
