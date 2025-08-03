import React, { useState } from 'react';
import './NegationAnalyzer.css';
import NegationAnalyzer from '../utils/NegationAnalyzer';
import { formatErrorMessage } from '../utils/errorFormatter';
import { formatRuleBasedResult, formatHybridResult, formatTrainingResult } from '../utils/resultFormatters';
import { highlight, determineClassification } from '../utils/textProcessing';
import { handleFileUpload as processFileUpload } from '../utils/trainingDataManager';
import { classifyExpletive, classify } from '../utils/classifiers';
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
  const [trainingData, setTrainingData] = useState({ examples: [] });
  const [error, setError] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  // File upload handler
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    setUploadError(null);

    if (!file) return;

    try {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const content = e.target.result;
          const jsonData = JSON.parse(content);
          
          // Convert array to object if needed
          const processedData = Array.isArray(jsonData) ? { examples: jsonData } : jsonData;
          
          // Validate structure
          if (!processedData || !processedData.examples || !Array.isArray(processedData.examples)) {
            throw new Error('Invalid data structure. Expected { examples: [...] }');
          }
          
          setTrainingData(processedData);
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
              break;

            case 'HYBRID': {
              const llmAnalysis = await classifyExpletive(sentence);
              formattedResult = formatHybridResult(analysis, llmAnalysis);
              classification = llmAnalysis.classification || await determineClassification(sentence, formattedResult);
              break;
            }

            case 'TRAINING_DATA':
            case 'SVM_ANALYSIS':
              if (useTrainingEnhancement && trainingData.examples.length > 0) {
                const mode = analysisMode === 'SVM_ANALYSIS' ? 'SVM' : 'BINARY';
                const trainingAnalysis = classify(sentence, trainingData.examples, mode);
                
                // Map boolean classification to display format
                const displayType = trainingAnalysis.classification === true ? 'Expletive' : 'No Expletive';
                
                // Create analysis object with display format
                const analysisObj = {
                  type: displayType,
                  confidence: trainingAnalysis.confidence,
                  evidence: {
                    details: trainingAnalysis.message,
                    trigger: trainingAnalysis.context?.triggerType || null,
                    hasSubjunctive: trainingAnalysis.context?.hasSubjunctive || false,
                    nePosition: trainingAnalysis.nePosition
                  }
                };
                
                formattedResult = formatTrainingResult(analysisObj, trainingAnalysis);
                classification = displayType;
                
                // Generate proposed sentence if expletive
                if (trainingAnalysis.classification === true && trainingAnalysis.nePosition !== null) {
                  const beforeNe = sentence.slice(0, trainingAnalysis.nePosition);
                  const afterNe = sentence.slice(trainingAnalysis.nePosition);
                  proposedSentence = `${beforeNe}ne ${afterNe}`;
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
