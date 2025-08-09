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
          let trainingAnalysis = null; // Initialize trainingAnalysis in broader scope

          switch (analysisMode) {
            case 'RULE_BASED':
              formattedResult = formatRuleBasedResult(analysis);
              // Set classification directly from the analysis result
              let ruleBasedClassification = analysis.type === 'Expletive' ? 'Expletive' : 'No Expletive';
              
              // NEW: Apply semantic context analysis to rule-based analysis
              if (ruleBasedClassification === 'Expletive') {
                try {
                  // Import semantic context analyzer
                  const { analyzeSemanticContext, shouldOverrideToLogicalNegation } = await import('../utils/semanticContextAnalyzer');
                  
                  // Extract verb from analysis
                  let detectedVerb = null;
                  if (analysis.enhancedAvantQue?.subjunctiveMood?.verb) {
                    detectedVerb = analysis.enhancedAvantQue.subjunctiveMood.verb;
                  } else if (analysis.evidence?.subjunctive) {
                    detectedVerb = analysis.evidence.subjunctive;
                  }
                  
                  if (detectedVerb) {
                    console.log('🔍 RULE_BASED: Checking semantic context for verb:', detectedVerb);
                    const semanticContext = analyzeSemanticContext(sentence, detectedVerb);
                    
                    if (shouldOverrideToLogicalNegation(semanticContext)) {
                      console.log('🎯 RULE_BASED: SEMANTIC OVERRIDE applied:', semanticContext);
                      ruleBasedClassification = 'No Expletive';
                    }
                  }
                } catch (error) {
                  console.error('RULE_BASED: Error in semantic context analysis:', error);
                }
              }
              
              classification = ruleBasedClassification;
              
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
              console.log('🔍 TRAINING_DATA/SVM_ANALYSIS case entered');
              console.log('🔍 useTrainingEnhancement:', useTrainingEnhancement);
              console.log('🔍 trainingData.examples.length:', trainingData.examples.length);
              
              if (useTrainingEnhancement && trainingData.examples.length > 0) {
                console.log('🔍 Using enhanced training analysis');
                // Use enhanced training analyzer that includes surface form generation
                const { analyzeWithEnhancedFeatures } = await import('../utils/enhancedTrainingAnalyzer');
                trainingAnalysis = analyzeWithEnhancedFeatures(sentence, trainingData.examples);
                
                console.log('🎯 Full enhanced training analysis result:', trainingAnalysis);
                console.log('🎯 Surface form in enhanced result:', trainingAnalysis.surfaceForm);
                
                // Create properly formatted analysis object
                const analysisObj = {
                    classification: trainingAnalysis.classification ? 'Expletive' : 'No Expletive',
                    confidence: trainingAnalysis.confidence,
                    analysis: {
                        trigger: trainingAnalysis.analysis?.trigger ? {
                            trigger: trainingAnalysis.analysis.trigger.trigger,
                            category: trainingAnalysis.analysis.trigger.category,
                            subcategory: trainingAnalysis.analysis.trigger.subcategory,
                            context: trainingAnalysis.analysis.trigger.context
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
                // Set classification directly based on training analysis
                classification = trainingAnalysis.classification ? 'Expletive' : 'No Expletive';
                
                // Generate proposed sentence if expletive
                if (trainingAnalysis.classification && trainingAnalysis.context?.trigger) {
                    const triggerInfo = {
                        trigger: trainingAnalysis.context.trigger,
                        position: sentence.toLowerCase().indexOf(trainingAnalysis.context.trigger.toLowerCase()),
                        category: trainingAnalysis.context.category,
                        subcategory: trainingAnalysis.context.subcategory
                    };
                    const nePosition = calculateNePosition(sentence, triggerInfo, analysisMode);
                    proposedSentence = formatWithNe(sentence, nePosition);
                }
              } else {
                console.log('🔍 NOT using enhanced training analysis - falling back to rule-based with semantic context');
                console.log('🔍 Fallback reason - useTrainingEnhancement:', useTrainingEnhancement, 'examples length:', trainingData.examples.length);
                
                // NEW: Apply semantic context analysis even in rule-based fallback
                let finalClassification = analysis.type === 'Expletive' ? 'Expletive' : 'No Expletive';
                let semanticOverrideApplied = false;
                
                // Check for semantic context override
                if (analysis.type === 'Expletive') {
                  try {
                    // Import semantic context analyzer
                    const { analyzeSemanticContext, shouldOverrideToLogicalNegation } = await import('../utils/semanticContextAnalyzer');
                    
                    // Extract verb from analysis (try different sources)
                    let detectedVerb = null;
                    if (analysis.enhancedAvantQue?.subjunctiveMood?.verb) {
                      detectedVerb = analysis.enhancedAvantQue.subjunctiveMood.verb;
                    } else if (analysis.evidence?.subjunctive) {
                      detectedVerb = analysis.evidence.subjunctive;
                    }
                    
                    if (detectedVerb) {
                      console.log('🔍 Checking semantic context for verb:', detectedVerb);
                      const semanticContext = analyzeSemanticContext(sentence, detectedVerb);
                      
                      if (shouldOverrideToLogicalNegation(semanticContext)) {
                        console.log('🎯 SEMANTIC OVERRIDE in rule-based fallback:', semanticContext);
                        finalClassification = 'No Expletive';
                        semanticOverrideApplied = true;
                      }
                    }
                  } catch (error) {
                    console.error('Error in semantic context analysis:', error);
                  }
                }
                
                formattedResult = formatRuleBasedResult(analysis);
                classification = finalClassification;
                
                if (semanticOverrideApplied) {
                  console.log('🎯 Final classification after semantic override:', classification);
                }
              }
              break;

            default:
              formattedResult = formatRuleBasedResult(analysis);
              let defaultClassification = await determineClassification(sentence, formattedResult);
              
              // NEW: Apply semantic context analysis to default case
              if (defaultClassification === 'Expletive') {
                try {
                  // Import semantic context analyzer
                  const { analyzeSemanticContext, shouldOverrideToLogicalNegation } = await import('../utils/semanticContextAnalyzer');
                  
                  // Extract verb from analysis
                  let detectedVerb = null;
                  if (analysis.enhancedAvantQue?.subjunctiveMood?.verb) {
                    detectedVerb = analysis.enhancedAvantQue.subjunctiveMood.verb;
                  } else if (analysis.evidence?.subjunctive) {
                    detectedVerb = analysis.evidence.subjunctive;
                  }
                  
                  if (detectedVerb) {
                    console.log('🔍 DEFAULT: Checking semantic context for verb:', detectedVerb);
                    const semanticContext = analyzeSemanticContext(sentence, detectedVerb);
                    
                    if (shouldOverrideToLogicalNegation(semanticContext)) {
                      console.log('🎯 DEFAULT: SEMANTIC OVERRIDE applied:', semanticContext);
                      defaultClassification = 'No Expletive';
                    }
                  }
                } catch (error) {
                  console.error('DEFAULT: Error in semantic context analysis:', error);
                }
              }
              
              classification = defaultClassification;
          }

          // Add debug logging
          console.log('Analysis Mode:', analysisMode);
          console.log('Raw Analysis:', analysis);
          console.log('Formatted Result:', formattedResult);

          // Determine classification based on mode and analysis
          const displayClassification = analysis.type === 'Expletive' ? 'Expletive' : 
                                      analysis.type === 'No Expletive' ? 'No Expletive' : 
                                      'Unknown';

          console.log('Final Classification:', displayClassification);

          results.push({
            id: index + 1,
            text: sentence,
            highlightedText: highlight(sentence),
            label: formattedResult,
            classification: displayClassification,
            proposedSentence,
            surfaceForm: trainingAnalysis?.surfaceForm || null // NEW: Add surface form from analysis
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
            proposedSentence: sentence,
            surfaceForm: null // No surface form for errors
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
