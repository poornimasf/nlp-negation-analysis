import React, { useState } from 'react';
import './NegationAnalyzer.css';
import NegationAnalyzer from '../utils/NegationAnalyzer';
import { formatErrorMessage } from '../utils/errorFormatter';
import { formatRuleBasedResult, formatHybridResult, formatTrainingResult } from '../utils/resultFormatters';
import { highlight, determineClassification } from '../utils/textProcessing';
import { classifyExpletive, classify } from '../utils/classifiers';
import { calculateNePosition, formatWithNe } from '../utils/nePositionCalculator';
import { BatchAnalysis } from './BatchAnalysis';
import { ModeSelector, ModeInfoBox } from './AnalysisModes';
import { TrainingDataSection } from './TrainingDataSection';

const SimpleNegationAnalyzer = () => {
  // State definitions
  const [batchInput, setBatchInput] = useState("");
  const [batchResults, setBatchResults] = useState([]);
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });
  const [analysisMode, setAnalysisMode] = useState('TRAINING_DATA');
  const [useTrainingEnhancement, setUseTrainingEnhancement] = useState(false);
  const [infoBoxExpanded, setInfoBoxExpanded] = useState(false);
  const [trainingData, setTrainingData] = useState({ examples: [] });
  const [error, setError] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  // File upload handler
  // Expected JSON structure:
  // [
  //   {
  //     "text": "Qu'en était-il de la vie de vos personnages avant qu'ils ne soient des aventuriers?",
  //     "has_expletive_ne": true,
  //     "classification": true,
  //     "trigger": "avant que",
  //     "ne_position": 60
  //   }
  // ]
  const handleFileUpload = async (event) => {
    event.preventDefault();
    const file = event.target.files[0];
    setUploadError(null);

    if (!file) return;

    try {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const content = e.target.result;
          let jsonData;

          if (file.name.endsWith('.json')) {
            const rawData = JSON.parse(content);
            // Check if it's an array of objects with the expected structure
            if (Array.isArray(rawData) && rawData.length > 0 && 
                rawData[0].hasOwnProperty('text') && 
                (rawData[0].hasOwnProperty('has_expletive_ne') || 
                 rawData[0].hasOwnProperty('classification'))) {
              jsonData = { examples: rawData };
            } else {
              throw new Error('Invalid JSON structure. Expected array of objects with text and classification fields.');
            }
          } else if (file.name.endsWith('.csv')) {
            // Simple CSV parsing
            const lines = content.split('\n').filter(line => line.trim());
            const headers = lines[0].toLowerCase().split(',');
            const requiredFields = ['text'];
            const missingFields = requiredFields.filter(field => !headers.includes(field));
            
            if (missingFields.length > 0) {
              throw new Error(`Missing required fields in CSV: ${missingFields.join(', ')}`);
            }

            const examples = lines.slice(1).map(line => {
              const values = line.split(',');
              const obj = {
                text: '',
                has_expletive_ne: false,
                classification: false,
                trigger: '',
                ne_position: null
              };
              
              headers.forEach((header, index) => {
                const value = values[index]?.trim();
                if (header === 'text') {
                  obj.text = value || '';
                } else if (header === 'has_expletive_ne' || header === 'classification') {
                  obj[header] = value?.toLowerCase() === 'true';
                } else if (header === 'trigger') {
                  obj.trigger = value || '';
                } else if (header === 'ne_position') {
                  // Accept both integer and decimal numbers
                  const position = parseInt(value, 10);
                  obj.ne_position = isNaN(position) ? null : position;
                }
              });
              return obj;
            });
            
            jsonData = { examples };
          } else {
            throw new Error('Unsupported file format. Please use JSON or CSV files.');
          }
          
          setTrainingData(jsonData);
          setUseTrainingEnhancement(true);
        } catch (err) {
          console.error('Error processing file:', err);
          setUploadError(formatErrorMessage(err));
        }
      };

      reader.onerror = () => {
        setUploadError('Error reading file');
      };

      reader.readAsText(file);
    } catch (error) {
      console.error('File upload error:', error);
      setUploadError(formatErrorMessage(error));
    }
  };

  // Clear training data
  const clearTrainingData = () => {
    setTrainingData({ examples: [] });
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
          let proposedSentence = null;

          switch (analysisMode) {
            case 'RULE_BASED':
              formattedResult = formatRuleBasedResult(analysis);
              classification = await determineClassification(sentence, formattedResult);
              // Generate proposed sentence if expletive
              if (classification === 'Expletive' && analysis.evidence?.trigger) {
                const triggerInfo = {
                  trigger: analysis.evidence.trigger,
                  position: sentence.toLowerCase().indexOf(analysis.evidence.trigger.toLowerCase()),
                  category: analysis.evidence.triggerType
                };
                const nePosition = calculateNePosition(sentence, triggerInfo, 'RULE_BASED');
                proposedSentence = formatWithNe(sentence, nePosition);
              }
              break;

            case 'HYBRID': {
              const llmAnalysis = await classifyExpletive(sentence);
              formattedResult = formatHybridResult(analysis, llmAnalysis);
              classification = llmAnalysis.classification || await determineClassification(sentence, formattedResult);
              // Generate proposed sentence based on LLM analysis
              if (llmAnalysis.classification === 'EXPLETIVE' && llmAnalysis.nePosition) {
                const nePos = sentence.indexOf(llmAnalysis.nePosition.replace('After ', ''));
                if (nePos !== -1) {
                  proposedSentence = formatWithNe(sentence, nePos);
                }
              }
              break;
            }

            case 'TRAINING_DATA':
            case 'SVM_ANALYSIS':
              if (useTrainingEnhancement && trainingData.examples.length > 0) {
                const mode = analysisMode === 'SVM_ANALYSIS' ? 'SVM' : 'BINARY';
                const trainingAnalysis = classify(sentence, trainingData.examples, mode);
                
                // Map boolean classification to display format
                const displayType = trainingAnalysis.classification === true ? 'Expletive' : 'No Expletive';
                
                // Create analysis object with display format and trigger info
                const analysisObj = {
                  type: displayType,
                  confidence: trainingAnalysis.confidence,
                  evidence: {
                    details: trainingAnalysis.message,
                    trigger: trainingAnalysis.context?.trigger || null,
                    hasSubjunctive: trainingAnalysis.context?.hasSubjunctive || false,
                    nePosition: trainingAnalysis.nePosition
                  }
                };
                
                formattedResult = formatTrainingResult(analysisObj, trainingAnalysis);
                classification = displayType;
                
                // Generate proposed sentence if expletive
                if (trainingAnalysis.classification === true && trainingAnalysis.context?.trigger) {
                  const triggerInfo = {
                    trigger: trainingAnalysis.context.trigger,
                    position: sentence.toLowerCase().indexOf(trainingAnalysis.context.trigger.toLowerCase()),
                    category: trainingAnalysis.context.triggerType
                  };
                  const nePosition = calculateNePosition(sentence, triggerInfo, mode);
                  proposedSentence = formatWithNe(sentence, nePosition);
                }
              } else {
                formattedResult = formatRuleBasedResult(analysis);
                classification = await determineClassification(sentence, formattedResult);
              }
              break;

            default:
              formattedResult = formatRuleBasedResult(analysis);
              classification = await determineClassification(sentence, formattedResult);
          }

          // Add debug logging
          console.log('Analysis Mode:', analysisMode);
          console.log('Classification:', classification);
          console.log('Proposed Sentence:', proposedSentence);

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
          setInfoBoxExpanded={setInfoBoxExpanded}
          isInfoBoxExpanded={infoBoxExpanded}
        />

        <ModeInfoBox
          mode={analysisMode}
          isExpanded={infoBoxExpanded}
          setExpanded={setInfoBoxExpanded}
        />
      </div>

      {/* Training Data Section with JSON Format */}
      {(analysisMode === 'TRAINING_DATA' || analysisMode === 'SVM_ANALYSIS') && (
        <div className="card">
          <TrainingDataSection
            trainingData={trainingData}
            handleFileUpload={handleFileUpload}
            clearTrainingData={clearTrainingData}
            uploadError={uploadError}
          />
        </div>
      )}

      <BatchAnalysis
        batchInput={batchInput}
        setBatchInput={setBatchInput}
        batchResults={batchResults}
        batchLoading={batchLoading}
        batchProgress={batchProgress}
        handleBatchAnalyze={handleBatchAnalyze}
        analysisMode={analysisMode}
      />
    </div>
  );
};

export default SimpleNegationAnalyzer;
