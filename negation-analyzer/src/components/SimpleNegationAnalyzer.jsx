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

  // Expected JSON structure:
  // [
  //   {
  //     "text": string (required),
  //     "has_expletive_ne": boolean (required),
  //     "classification": boolean (required),
  //     "trigger": string (defaults to ""),
  //     "ne_position": integer or null (defaults to null)
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
            
            // Validate array structure
            if (!Array.isArray(rawData)) {
              throw new Error('JSON must be an array of objects.');
            }

            // Validate each object has required fields with correct types
            const validData = rawData.every(item => 
              item && 
              typeof item === 'object' &&
              typeof item.text === 'string' &&
              typeof item.has_expletive_ne === 'boolean' &&
              typeof item.classification === 'boolean'
            );

            if (!validData) {
              throw new Error('Each item must have: text (string), has_expletive_ne (boolean), and classification (boolean).');
            }

            // Process data with defaults for optional fields
            const processedData = rawData.map(item => ({
              text: item.text,
              has_expletive_ne: item.has_expletive_ne,
              classification: item.classification,
              trigger: item.trigger || "",
              ne_position: item.ne_position ? Math.round(Number(item.ne_position)) : null
            }));

            jsonData = { examples: processedData };
          } else {
            throw new Error('Please upload a JSON file.');
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
                  category: analysis.evidence.category,
                  subcategory: analysis.evidence.subcategory
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
                
                // Create properly formatted analysis object
                const analysisObj = {
                    classification: trainingAnalysis.classification ? 'Expletive' : 'No Expletive',
                    confidence: trainingAnalysis.confidence,
                    analysis: {
                        trigger: trainingAnalysis.context?.trigger ? {
                            trigger: trainingAnalysis.context.trigger,
                            category: trainingAnalysis.context.category,
                            subcategory: trainingAnalysis.context.subcategory,
                            context: sentence
                        } : null,
                        trainingData: {
                            similarExamples: trainingAnalysis.matches || []
                        }
                    },
                    evidence: {
                        hasKnownTrigger: trainingAnalysis.context?.category != null,
                        triggerCategory: trainingAnalysis.context?.category,
                        triggerSubcategory: trainingAnalysis.context?.subcategory,
                        weightedEvidence: {
                            expletive: trainingAnalysis.weightedVotes?.expletive || 0,
                            nonExpletive: trainingAnalysis.weightedVotes?.nonExpletive || 0
                        }
                    },
                    details: [
                        trainingAnalysis.message,
                        ...(trainingAnalysis.context?.details || [])
                    ]
                };
                
                // Only show training data analysis
                formattedResult = formatTrainingResult(analysisObj);
                classification = analysisObj.classification;
                
                // Generate proposed sentence if expletive
                if (trainingAnalysis.classification && trainingAnalysis.context?.trigger) {
                    const triggerInfo = {
                        trigger: trainingAnalysis.context.trigger,
                        position: sentence.toLowerCase().indexOf(trainingAnalysis.context.trigger.toLowerCase()),
                        category: trainingAnalysis.context.category,
                        subcategory: trainingAnalysis.context.subcategory
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
            // Use the classification directly from the analysis
            classification: formattedResult.includes('Classification: Expletive') ? 'Expletive' : 
                          formattedResult.includes('Classification: No Expletive') ? 'No Expletive' : 
                          'Unknown',
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

      {/* Training Data Section */}
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
