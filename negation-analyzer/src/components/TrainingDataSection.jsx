import React, { useState } from 'react';
import './TrainingData.css';

export const TrainingDataSection = ({ trainingData, handleFileUpload, clearTrainingData, uploadError }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  const handleFileSelect = (e) => {
    e.preventDefault();
    const file = e.target.files[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = async (file) => {
    // Reset file input
    const fileInput = document.getElementById('file-upload');
    if (fileInput) {
      fileInput.value = '';
    }

    // Call parent handler
    handleFileUpload({ target: { files: [file] } });
  };

  return (
    <div className="training-section">
      <div className="training-upload">
        <h3>Upload Training Data</h3>
        <p>Upload a CSV or JSON file with training examples to improve the model's accuracy.</p>
        
        <div 
          className={`upload-area ${isDragging ? 'dragging' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
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
              onChange={handleFileSelect}
              className="file-input"
              onClick={(e) => e.target.value = null}  // Reset file input on click
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
      {trainingData && trainingData.examples && trainingData.examples.length > 0 && (
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
                    <td className="text-cell">{item.text}</td>
                    <td className="classification-cell">
                      <span className={`classification-tag ${
                        item.classification?.toLowerCase().includes('with') || 
                        item.classification?.toLowerCase().includes('expletive') 
                          ? 'with-negation' 
                          : 'without-negation'
                      }`}>
                        {item.classification}
                      </span>
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
      {trainingData && trainingData.examples && trainingData.examples.length > 0 && (
        <div className="training-stats">
          <h3>Training Data Statistics</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">{trainingData.examples.length}</div>
              <div className="stat-label">Total Examples</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {trainingData.examples.filter(ex => 
                  ex.classification?.toLowerCase().includes('with') || 
                  ex.classification?.toLowerCase().includes('expletive')
                ).length}
              </div>
              <div className="stat-label">With Negation</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {trainingData.examples.filter(ex => 
                  !ex.classification?.toLowerCase().includes('with') && 
                  !ex.classification?.toLowerCase().includes('expletive')
                ).length}
              </div>
              <div className="stat-label">Without Negation</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {Math.round((trainingData.examples.filter(ex => 
                  ex.classification?.toLowerCase().includes('with') || 
                  ex.classification?.toLowerCase().includes('expletive')
                ).length / trainingData.examples.length) * 100)}%
              </div>
              <div className="stat-label">Negation Ratio</div>
            </div>
          </div>
        </div>
      )}

      {/* Clear Data Button */}
      {trainingData && trainingData.examples && trainingData.examples.length > 0 && (
        <div className="training-actions">
          <button onClick={clearTrainingData} className="clear-button">
            Clear Training Data
          </button>
        </div>
      )}
    </div>
  );
};
