import React from 'react';
import { exportToXLSX } from '../utils/exportUtils';

export const BatchAnalysis = ({
  batchInput,
  setBatchInput,
  batchResults,
  batchLoading,
  batchProgress,
  handleBatchAnalyze,
  analysisMode
}) => {
  return (
    <div className="card">
      <h3 className="title">Batch Analysis</h3>
      <div className="form-group">
        <div className="input-group">
          <textarea
            id="batch-input"
            rows={6}
            placeholder={`Enter sentences (one per line):\nJ'ai peur qu'il vienne\nAvant qu'elle parte\nPeu s'en faut qu'il réussisse`}
            value={batchInput}
            onChange={(e) => setBatchInput(e.target.value)}
            className="input"
          />
          <button 
            onClick={handleBatchAnalyze}
            disabled={batchLoading || !batchInput.trim()}
            className="button"
            style={{
              backgroundColor: (batchLoading || !batchInput.trim()) ? '#ccc' : '#3182ce',
              cursor: (batchLoading || !batchInput.trim()) ? 'not-allowed' : 'pointer',
              opacity: (batchLoading || !batchInput.trim()) ? 0.7 : 1
            }}
          >
            {batchLoading ? '🔄 Processing...' : 'Analyze Batch'}
          </button>
        </div>
      </div>

      {/* Loading indicator */}
      {batchLoading && (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          margin: '20px 0',
          border: '2px dashed #dee2e6'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>🔄</div>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#495057', marginBottom: '5px' }}>
            Processing Batch Analysis...
          </div>
          <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '10px' }}>
            {batchProgress.total > 0 
              ? `Analyzing sentence ${batchProgress.current} of ${batchProgress.total}`
              : `Analyzing sentences...`
            }
          </div>
          <div style={{ 
            width: '300px', 
            height: '6px', 
            backgroundColor: '#e9ecef', 
            borderRadius: '3px', 
            margin: '15px auto',
            overflow: 'hidden'
          }}>
            <div style={{
              width: batchProgress.total > 0 ? `${(batchProgress.current / batchProgress.total) * 100}%` : '100%',
              height: '100%',
              backgroundColor: '#007bff',
              borderRadius: '3px',
              transition: 'width 0.3s ease'
            }}></div>
          </div>
        </div>
      )}

      {/* Results section */}
      {batchResults.length > 0 && !batchLoading && (
        <div className="result-section">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '15px',
            padding: '0 10px'
          }}>
            <h3>Results ({batchResults.length} sentences)</h3>
            <button
              onClick={() => exportToXLSX(batchResults, analysisMode)}
              className="download-button"
              style={{
                padding: '8px 16px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px'
              }}
            >
              <span>📥</span> Download XLSX
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              backgroundColor: 'white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              borderRadius: '8px'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>
                    Original Sentence
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>
                    Analysis
                  </th>
                </tr>
              </thead>
              <tbody>
                {batchResults.map((result, index) => {
                  return (
                    <tr key={result.id} style={{
                      backgroundColor: index % 2 === 0 ? 'white' : '#f8f9fa',
                      borderBottom: '1px solid #dee2e6'
                    }}>
                      <td style={{ padding: '12px', width: '40%', verticalAlign: 'top' }}>
                        {result.text && result.label.match(/trigger: "(.*?)"/i) ? (
                          <span dangerouslySetInnerHTML={{
                            __html: result.text.replace(
                              new RegExp(result.label.match(/trigger: "(.*?)"/i)[1], 'i'),
                              match => `<span style="background-color: #e3f2fd; padding: 2px 4px; border-radius: 2px; color: #1565c0; font-weight: 500">${match}</span>`
                            )
                          }} />
                        ) : result.text}
                      </td>
                      <td style={{ padding: '12px', width: '60%', verticalAlign: 'top' }}>
                        <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{result.label}</pre>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
/* Force rebuild Sat Sep 20 00:14:29 MDT 2025 */
