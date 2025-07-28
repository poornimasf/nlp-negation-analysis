import React from 'react';
import * as XLSX from 'xlsx';

export const BatchAnalysis = ({
  batchInput,
  setBatchInput,
  batchResults,
  batchLoading,
  batchProgress,
  handleBatchAnalyze,
  analysisMode
}) => {
  const downloadBatchResults = (format) => {
    if (batchResults.length === 0) {
      alert('No batch results to download. Please run batch analysis first.');
      return;
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `negation-analysis-batch-${timestamp}`;
    
    switch (format) {
      case 'excel':
        downloadExcel(filename);
        break;
      case 'csv':
        downloadCSV(filename);
        break;
      case 'json':
        downloadJSON(filename);
        break;
      default:
        console.error('Unsupported format:', format);
    }
  };

  const downloadExcel = (filename) => {
    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Prepare main results data
    const resultsData = [
      // Header row
      ['Sentence #', 'Text', 'Analysis Result', 'Prediction', 'Confidence'],
      // Data rows
      ...batchResults.map(result => {
        const confidenceMatch = result.label.match(/(\d+)%/);
        const confidence = confidenceMatch ? confidenceMatch[1] + '%' : 'N/A';
        
        return [
          result.id,
          result.text,
          result.label,
          result.classification,
          confidence
        ];
      })
    ];
    
    // Create main results worksheet
    const ws = XLSX.utils.aoa_to_sheet(resultsData);
    
    // Set column widths
    ws['!cols'] = [
      { wch: 10 },  // Sentence #
      { wch: 40 },  // Text
      { wch: 60 },  // Analysis Result
      { wch: 20 },  // Classification
      { wch: 12 }   // Confidence
    ];
    
    // Add formatting
    const headerStyle = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "4472C4" } },
      alignment: { horizontal: "center" }
    };

    // Apply header style
    const headerRange = XLSX.utils.decode_range(ws['!ref']);
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!ws[cellAddress]) continue;
      ws[cellAddress].s = headerStyle;
    }
    
    // Add the worksheet
    XLSX.utils.book_append_sheet(wb, ws, "Analysis Results");
    
    // Write file
    XLSX.writeFile(wb, `${filename}.xlsx`);
  };

  const downloadCSV = (filename) => {
    const headers = ['Sentence_Number', 'Text', 'Analysis_Result', 'Prediction', 'Confidence'];
    
    const csvData = batchResults.map(result => {
      const confidenceMatch = result.label.match(/(\d+)%/);
      const confidence = confidenceMatch ? confidenceMatch[1] + '%' : 'N/A';
      
      return [
        result.id,
        `"${result.text.replace(/"/g, '""')}"`,
        `"${result.label.replace(/"/g, '""')}"`,
        result.classification,
        confidence
      ];
    });
    
    const csvContent = [headers, ...csvData]
      .map(row => row.join(','))
      .join('\n');
    
    downloadFile(csvContent, `${filename}.csv`, 'text/csv');
  };

  const downloadJSON = (filename) => {
    const jsonData = {
      metadata: {
        timestamp: new Date().toISOString(),
        mode: analysisMode,
        totalSentences: batchResults.length
      },
      results: batchResults
    };
    
    const jsonContent = JSON.stringify(jsonData, null, 2);
    downloadFile(jsonContent, `${filename}.json`, 'application/json');
  };

  const downloadFile = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="card">
      <h3 className="title">Batch Analysis</h3>
      <div className="form-group">
        <label htmlFor="batch-input">Enter Multiple Sentences:</label>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3>Results ({batchResults.length} sentences):</h3>
            
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: '#666' }}>📥 Download:</span>
              <button 
                onClick={() => downloadBatchResults('excel')}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#217346',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
              >
                📊 Excel
              </button>
              <button 
                onClick={() => downloadBatchResults('csv')}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
              >
                📋 CSV
              </button>
              <button 
                onClick={() => downloadBatchResults('json')}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
              >
                🔧 JSON
              </button>
            </div>
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
                    Sentence
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>
                    Analysis
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>
                    Highlighted
                  </th>
                </tr>
              </thead>
              <tbody>
                {batchResults.map((result, index) => (
                  <tr key={result.id} style={{
                    backgroundColor: index % 2 === 0 ? 'white' : '#f8f9fa',
                    borderBottom: '1px solid #dee2e6'
                  }}>
                    <td style={{ padding: '12px', maxWidth: '200px' }}>
                      {result.text}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{result.label}</pre>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div dangerouslySetInnerHTML={{ __html: result.highlightedText }}></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
