import React from 'react';
import './TrainingData.css';

export const TrainingDataSection = ({ trainingData, handleFileUpload, clearTrainingData, uploadError }) => {
  // Helper function to safely check classification
  const isExpletiveClassification = (classification) => {
    if (!classification || typeof classification !== 'string') return false;
    const lowerClass = classification.toLowerCase();
    return lowerClass.includes('with') || lowerClass.includes('expletive');
  };

  return (
    <div className="training-section">
      <div className="training-upload">
        <h3>Upload Training Data</h3>
        <p>Upload a CSV or JSON file with training examples to improve the model's accuracy.</p>
        
        <div className="upload-area">
          <div className="upload-content">
            <div className="upload-icon">📄</div>
            <label htmlFor="file-upload" className="upload-label">
              Choose File or Drag & Drop
            </label>
            <div className="upload-formats">Supported formats: CSV, JSON</div>
            <input
              id="file-upload"
              type="file"
              accept=".csv,.json"
              onChange={handleFileUpload}
              className="file-input"
              onClick={(e) => e.target.value = null}
            />
          </div>
          
          {uploadError && (
            <div className="error-message">
              <strong>Error:</strong> {uploadError}
            </div>
          )}
        </div>
      </div>

      {/* Training Data Preview */}
      {trainingData?.examples?.length > 0 && (
        <div className="training-preview">
          <h3>Training Data Preview</h3>
          <div className="training-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Text</th>
                  <th>Classification</th>
                  <th>Language</th>
                </tr>
              </thead>
              <tbody>
                {trainingData.examples.slice(0, 10).map((item, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td className="text-cell">{item.text || 'N/A'}</td>
                    <td className="classification-cell">
                      {item.classification ? (
                        <span className={`classification-tag ${
                          isExpletiveClassification(item.classification)
                            ? 'with-negation' 
                            : 'without-negation'
                        }`}>
                          {item.classification}
                        </span>
                      ) : (
                        <span className="classification-tag without-negation">
                          Unclassified
                        </span>
                      )}
                    </td>
                    <td>{item.language || 'French'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {trainingData.examples.length > 10 && (
              <div className="table-footer">
                Showing 10 of {trainingData.examples.length} examples
              </div>
            )}
          </div>
        </div>
      )}

      {/* Training Stats */}
      {trainingData?.examples?.length > 0 && (
        <div className="training-stats">
          <h3>Training Data Statistics</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">{trainingData.examples.length}</div>
              <div className="stat-label">Total Examples</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {trainingData.examples.filter(ex => isExpletiveClassification(ex.classification)).length}
              </div>
              <div className="stat-label">With Negation</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {trainingData.examples.filter(ex => !isExpletiveClassification(ex.classification)).length}
              </div>
              <div className="stat-label">Without Negation</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {Math.round((trainingData.examples.filter(ex => 
                  isExpletiveClassification(ex.classification)
                ).length / trainingData.examples.length) * 100)}%
              </div>
              <div className="stat-label">Negation Ratio</div>
            </div>
          </div>
        </div>
      )}

      {/* Clear Data Button */}
      {trainingData?.examples?.length > 0 && (
        <div className="training-actions">
          <button onClick={clearTrainingData} className="clear-button">
            Clear Training Data
          </button>
        </div>
      )}
    </div>
  );
};
