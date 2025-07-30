import React, { useState } from 'react';
import './NegationAnalyzer.css';
import NegationAnalyzer from '../utils/NegationAnalyzer';
import { formatErrorMessage } from '../utils/errorFormatter';
import { formatRuleBasedResult, formatHybridResult, formatTrainingResult } from '../utils/resultFormatters';
import { highlight, determineClassification } from '../utils/textProcessing';
import { handleFileUpload as processFileUpload } from '../utils/trainingDataManager';
import { classifyExpletive, classifyWithBinaryClassifier } from '../utils/classifiers';
import proposeNePlacement from '../utils/neProposer';
import { BatchAnalysis } from './BatchAnalysis';
import { ModeSelector, ModeInfoBox } from './AnalysisModes';
import { TrainingDataSection } from './TrainingDataSection';

const SimpleNegationAnalyzer = () => {
  // State definitions
  const [batchInput, setBatchInput] = useState("");
  const [batchResults, setBatchResults] = useState([]);
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });
  const [analysisMode, setAnalysisMode] = useState('RULE_BASED');
  const [useTrainingEnhancement, setUseTrainingEnhancement] = useState(false);
  const [infoBoxExpanded, setInfoBoxExpanded] = useState(false);
  const [trainingData, setTrainingData] = useState([]);
  const [error, setError] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  // File upload handler
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    setUploadError(null);

    if (!file) return;

    try {
      const { processedData } = await processFileUpload(file);
      setTrainingData(processedData);
      
      if (processedData.length > 0) {
        setUseTrainingEnhancement(true);
      }
    } catch (error) {
      console.error('File upload error:', error);
      setUploadError(formatErrorMessage(error));
    }
  };

  // Clear training data
  const clearTrainingData = () => {
    setTrainingData([]);
    setUseTrainingEnhancement(false);
    setUploadError(null);
  };

  // Batch analysis handler
  const handleBatchAnalyze = async () => {
    if (!batchInput.trim()) {
      setError(formatErrorMessage(new Error('No text provided')));
      return;
    }

    setBatchLoading(true);
    setError(null);
    const sentences = batchInput.split("\n").filter(line => line.trim());
    setBatchProgress({ current: 0, total: sentences.length });
    const results = [];
    
    try {
      const analyzer = new NegationAnalyzer();
      
      for (let index = 0; index < sentences.length; index++) {
        setBatchProgress({ current: index + 1, total: sentences.length });
        const sentence = sentences[index].trim();
        
        try {
          if (index > 0) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }

          const analysis = await analyzer.analyzeNegation(sentence);
          let formattedResult;
          let classification;
          const proposedSentence = proposeNePlacement(sentence, analysisMode, trainingData);

          switch (analysisMode) {
            case 'RULE_BASED':
              formattedResult = formatRuleBasedResult(analysis);
              classification = await determineClassification(sentence, formattedResult);
              break;

            case 'HYBRID': {
              const llmAnalysis = await classifyExpletive(sentence);
              formattedResult = formatHybridResult(analysis, llmAnalysis);
              classification = await determineClassification(sentence, formattedResult);
              break;
            }

            case 'TRAINING_DATA':
              if (useTrainingEnhancement && trainingData.length > 0) {
                const trainingAnalysis = classifyWithBinaryClassifier(sentence, trainingData);
                formattedResult = formatTrainingResult(analysis, trainingAnalysis);
                const prediction = formattedResult.match(/Prediction:\s*(.*?)(?:\n|$)/);
                classification = prediction ? prediction[1].trim() : "Uncertain";
              } else {
                formattedResult = formatRuleBasedResult(analysis);
                classification = await determineClassification(sentence, formattedResult);
              }
              break;

            default:
              formattedResult = formatRuleBasedResult(analysis);
              classification = await determineClassification(sentence, formattedResult);
          }

          results.push({
            id: index + 1,
            text: sentence,
            highlightedText: highlight(sentence),
            label: formattedResult,
            classification,
            proposedSentence
          });

          setBatchResults([...results]);
        } catch (error) {
          console.error(`Error processing sentence ${index + 1}:`, error);
          results.push({
            id: index + 1,
            text: sentence,
            highlightedText: sentence,
            label: formatErrorMessage(error),
            classification: "Error",
            proposedSentence: sentence
          });
          setBatchResults([...results]);
        }
      }
    } catch (error) {
      console.error('Batch analysis failed:', error);
      setError(formatErrorMessage(error));
    } finally {
      setBatchLoading(false);
      setBatchProgress({ current: 0, total: 0 });
    }
  };

  return (
    <div className="container">
      {error && (
        <div className="error-message" style={{
          backgroundColor: '#ffebee',
          border: '1px solid #ef5350',
          borderRadius: '4px',
          padding: '15px',
          margin: '10px 0',
          position: 'relative'
        }}>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{error}</pre>
          <button 
            onClick={() => setError(null)}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '20px',
              color: '#ef5350'
            }}
          >
            ×
          </button>
        </div>
      )}

      <div className="card">
        <ModeSelector 
          analysisMode={analysisMode}
          setAnalysisMode={setAnalysisMode}
        />

        <ModeInfoBox
          mode={analysisMode}
          isExpanded={infoBoxExpanded}
          setExpanded={setInfoBoxExpanded}
        />
      </div>

      {/* Training Data Section */}
      {analysisMode === 'TRAINING_DATA' && (
        <>
          <TrainingDataSection
            trainingData={trainingData}
            handleFileUpload={handleFileUpload}
            clearTrainingData={clearTrainingData}
            uploadError={uploadError}
          />
          
          {/* JSON Format Example Card */}
          <div className="card" style={{ marginTop: '20px' }}>
            <h4 style={{ marginBottom: '15px', color: '#333' }}>Expected Training Data Format</h4>
            <pre style={{
              backgroundColor: '#f8f9fa',
              padding: '15px',
              borderRadius: '4px',
              overflowX: 'auto',
              fontSize: '14px',
              lineHeight: '1.5',
              border: '1px solid #e9ecef'
            }}>
{`[
  {
    "text": "J'ai peur qu'il vienne",
    "pattern": "avoir peur que",
    "nePosition": 3,
    "classification": "Expletive",
    "confidence": 0.85
  },
  {
    "text": "Avant qu'elle parte",
    "pattern": "avant que",
    "nePosition": 2,
    "classification": "Expletive",
    "confidence": 0.9
  },
  {
    "text": "Je doute qu'il soit là",
    "pattern": "douter que",
    "nePosition": 3,
    "classification": "Expletive",
    "confidence": 0.8
  }
]`}
            </pre>
            <div style={{ 
              marginTop: '15px', 
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
                <li><code>pattern</code>: The trigger pattern for NE placement</li>
                <li><code>nePosition</code>: Word index where NE should be placed (0-based)</li>
                <li><code>classification</code>: "Expletive" or "Logical"</li>
                <li><code>confidence</code>: Confidence score (0.0 to 1.0)</li>
              </ul>
            </div>
          </div>
        </>
      )}

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
            <h3>Results ({batchResults.length} sentences):</h3>
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
                    <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #dee2e6' }}>
                      Prediction
                    </th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>
                      Highlighted
                    </th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>
                      Proposed Sentence
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
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '0.9em',
                          backgroundColor: result.classification === 'Expletive' ? '#e3f2fd' :
                                         result.classification === 'Logical' ? '#fff3e0' :
                                         result.classification.includes('Likely') ? '#f3e5f5' : '#f5f5f5',
                          color: result.classification === 'Expletive' ? '#1565c0' :
                                 result.classification === 'Logical' ? '#ef6c00' :
                                 result.classification.includes('Likely') ? '#7b1fa2' : '#757575',
                          border: `1px solid ${
                            result.classification === 'Expletive' ? '#bbdefb' :
                            result.classification === 'Logical' ? '#ffe0b2' :
                            result.classification.includes('Likely') ? '#e1bee7' : '#eeeeee'
                          }`
                        }}>
                          {result.classification}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div dangerouslySetInnerHTML={{ __html: result.highlightedText }}></div>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div dangerouslySetInnerHTML={{ 
                          __html: result.proposedSentence ? 
                            result.proposedSentence.replace(/\bNE\b/g, 
                              '<span style="background-color: #fff3cd; padding: 2px 4px; border-radius: 2px; font-weight: 500">NE</span>'
                            ) : 'N/A'
                        }}></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleNegationAnalyzer;
