import React, { useState } from 'react';
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
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Function to get likelihood description
  const getLikelihoodDescription = (score) => {
    if (!score) return '';
    switch(score) {
      case 1: return '(Highly Unlikely)';
      case 2: return '(Unlikely)';
      case 3: return '(Somewhat Unlikely)';
      case 4: return '(Neutral/Optional)';
      case 5: return '(Somewhat Likely)';
      case 6: return '(Likely)';
      case 7: return '(Highly Likely)';
      default: return '';
    }
  };

  // Sorting function
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Sort the results
  const sortedResults = React.useMemo(() => {
    if (!sortConfig.key) return batchResults;
    
    return [...batchResults].sort((a, b) => {
      let aValue, bValue;
      
      switch(sortConfig.key) {
        case 'text':
          aValue = a.text || '';
          bValue = b.text || '';
          break;
        case 'classification':
          aValue = a.classification || '';
          bValue = b.classification || '';
          break;
        case 'likelihood':
          aValue = a.likelihood || 0;
          bValue = b.likelihood || 0;
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [batchResults, sortConfig]);

  // Sort indicator component
  const SortIndicator = ({ column }) => {
    if (sortConfig.key !== column) {
      return <span style={{ color: '#ccc', marginLeft: '5px' }}>↕</span>;
    }
    return (
      <span style={{ marginLeft: '5px' }}>
        {sortConfig.direction === 'asc' ? '↑' : '↓'}
      </span>
    );
  };
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
                  <th 
                    style={{ 
                      padding: '12px', 
                      textAlign: 'left', 
                      borderBottom: '2px solid #dee2e6',
                      cursor: 'pointer',
                      userSelect: 'none',
                      transition: 'background-color 0.2s'
                    }}
                    onClick={() => handleSort('text')}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#e9ecef'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                  >
                    Original Sentence
                    <SortIndicator column="text" />
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>
                    Analysis
                  </th>
                  <th 
                    style={{ 
                      padding: '12px', 
                      textAlign: 'center', 
                      borderBottom: '2px solid #dee2e6',
                      cursor: 'pointer',
                      userSelect: 'none',
                      transition: 'background-color 0.2s'
                    }}
                    onClick={() => handleSort('classification')}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#e9ecef'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                  >
                    Prediction
                    <SortIndicator column="classification" />
                  </th>
                  {analysisMode === 'RULE_BASED' && (
                    <th 
                      style={{ 
                        padding: '12px', 
                        textAlign: 'center', 
                        borderBottom: '2px solid #dee2e6',
                        cursor: 'pointer',
                        userSelect: 'none',
                        transition: 'background-color 0.2s'
                      }}
                      onClick={() => handleSort('likelihood')}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#e9ecef'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                    >
                      Likelihood of NE
                      <SortIndicator column="likelihood" />
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {sortedResults.map((result, index) => {
                  // Use the classification field directly instead of parsing text
                  let prediction = result.classification || 'Uncertain';
                  
                  console.log('🔍 BATCH DISPLAY DEBUG:', {
                    id: result.id,
                    classification: result.classification,
                    likelihood: result.likelihood,
                    prediction,
                    text: result.text?.substring(0, 30) + '...',
                    fullResult: result
                  });
                  
                  return (
                    <tr key={result.id} style={{
                      backgroundColor: index % 2 === 0 ? 'white' : '#f8f9fa',
                      borderBottom: '1px solid #dee2e6'
                    }}>
                      <td style={{ padding: '12px', maxWidth: '200px', verticalAlign: 'top' }}>
                        {result.text && result.label.match(/trigger: "(.*?)"/i) ? (
                          <span dangerouslySetInnerHTML={{
                            __html: result.text.replace(
                              new RegExp(result.label.match(/trigger: "(.*?)"/i)[1], 'i'),
                              match => `<span style="background-color: #e3f2fd; padding: 2px 4px; border-radius: 2px; color: #1565c0; font-weight: 500">${match}</span>`
                            )
                          }} />
                        ) : result.text}
                      </td>
                      <td style={{ padding: '12px', verticalAlign: 'top' }}>
                        <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{result.label}</pre>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', verticalAlign: 'top' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '0.9em',
                          backgroundColor: prediction.toLowerCase().includes('expletive') ? '#e3f2fd' : '#f5f5f5',
                          color: prediction.toLowerCase().includes('expletive') ? '#1565c0' : '#757575',
                          border: `1px solid ${
                            prediction.toLowerCase().includes('expletive') ? '#bbdefb' : '#eeeeee'
                          }`
                        }}>
                          {prediction}
                        </span>
                      </td>
                      {analysisMode === 'RULE_BASED' && (
                        <td style={{ padding: '12px', textAlign: 'center', verticalAlign: 'top' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                            <span style={{
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '0.9em',
                              backgroundColor: '#f8f9fa',
                              color: '#495057',
                              border: '1px solid #dee2e6',
                              fontWeight: '500'
                            }}>
                              {result.likelihood ? `${result.likelihood}/7` : 'N/A'}
                            </span>
                            {result.likelihood && (
                              <span style={{
                                fontSize: '0.75em',
                                color: '#6c757d',
                                fontStyle: 'italic',
                                textAlign: 'center',
                                lineHeight: '1.2'
                              }}>
                                {getLikelihoodDescription(result.likelihood)}
                              </span>
                            )}
                          </div>
                        </td>
                      )}
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
