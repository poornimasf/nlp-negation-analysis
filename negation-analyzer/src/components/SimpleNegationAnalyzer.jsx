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
  const [analysisMode, setAnalysisMode] = useState('SENTENCE_MODE');
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

  // Calculate discourse boost for paragraph mode based on comprehensive training data
  const calculateDiscourseBoost = (sentence, trainingData) => {
    let boost = 0;
    
    // Register consistency boost
    const formalMarkers = /\b(il\s+convient|par\s+conséquent|monsieur|madame|veuillez)\b/gi;
    const literaryMarkers = /\b(fallut|eût|fût|naguère|jadis|désormais)\b/gi;
    
    if (formalMarkers.test(sentence) || literaryMarkers.test(sentence)) {
      boost += 0.08; // Formal/literary register favors expletive
    }
    
    // Sentence complexity boost (paragraph-level feature)
    const complexityMarkers = sentence.split(/[,;:]/).length;
    if (complexityMarkers > 2) {
      boost += 0.03; // Complex syntax favors expletive
    }
    
    return Math.min(0.11, boost); // Cap at 11% boost (8% + 3%)
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
      
      // Load training data once for all sentences (not per sentence)
      let trainingDataToUse = null;
      const { analyzeWithEnhancedFeatures } = await import('../utils/enhancedTrainingAnalyzer');
      
      if (analysisMode === 'PARAGRAPH_MODE') {
        // Use comprehensive paragraph training data for discourse analysis
        try {
          console.log('🔍 PARAGRAPH MODE: Loading training data once for batch...');
          // Load all available paragraph training data for discourse analysis
          const [peurQueData, avantQueData, avantDeData, senFautData, moinsPlusData] = await Promise.all([
            fetch('/training_data/peur_que_paragraph.json').then(r => r.json()).catch(e => { console.warn('Failed to load peur_que_paragraph.json:', e); return null; }),
            fetch('/training_data/avant_que_paragraph.json').then(r => r.json()).catch(e => { console.warn('Failed to load avant_que_paragraph.json:', e); return null; }),
            fetch('/training_data/avant_de_paragraph.json').then(r => r.json()).catch(e => { console.warn('Failed to load avant_de_paragraph.json:', e); return null; }),
            fetch('/training_data/sen_faut_que_paragraph.json').then(r => r.json()).catch(e => { console.warn('Failed to load sen_faut_que_paragraph.json:', e); return null; }),
            fetch('/training_data/moins_plus_paragraph.json').then(r => r.json()).catch(e => { console.warn('Failed to load moins_plus_paragraph.json:', e); return null; })
          ]);
          
          console.log('🔍 PARAGRAPH MODE: Loaded data:', {
            peurQue: peurQueData?.examples?.length || 0,
            avantQue: avantQueData?.examples?.length || 0,
            avantDe: avantDeData?.examples?.length || 0,
            senFaut: senFautData?.examples?.length || 0,
            moinsPlus: moinsPlusData?.examples?.length || 0
          });
          
          // Combine all paragraph training data for comprehensive discourse analysis
          trainingDataToUse = [];
          [peurQueData, avantQueData, avantDeData, senFautData, moinsPlusData].forEach(data => {
            if (data && data.examples) {
              trainingDataToUse.push(...data.examples); // Use ALL examples from each trigger (500 each)
            }
          });
          
          console.log(`📚 PARAGRAPH MODE: Using ${trainingDataToUse.length} paragraph training examples for discourse analysis`);
        } catch (error) {
          console.warn('Failed to load paragraph training data, using fallback:', error);
          trainingDataToUse = [
            { text: "j'ai peur qu'il vienne", hasExpletive: true, trigger: "peur_que" },
            { text: "avant qu'il parte", hasExpletive: true, trigger: "avant_que" },
            { text: "utiliser avant de partir", hasExpletive: false, trigger: "avant_de" }
          ];
        }
      } else {
        // Sentence mode uses sentence-specific training data
        try {
          console.log('🔍 SENTENCE MODE: Loading training data once for batch...');
          // Load all available sentence training data
          const [peurQueData, avantQueData, avantDeData, senFautData, moinsPlusData] = await Promise.all([
            fetch('/training_data/peur_que_sentence.json').then(r => r.json()).catch(e => { console.warn('Failed to load peur_que_sentence.json:', e); return null; }),
            fetch('/training_data/avant_que_sentence.json').then(r => r.json()).catch(e => { console.warn('Failed to load avant_que_sentence.json:', e); return null; }),
            fetch('/training_data/avant_de_sentence.json').then(r => r.json()).catch(e => { console.warn('Failed to load avant_de_sentence.json:', e); return null; }),
            fetch('/training_data/sen_faut_que_sentence.json').then(r => r.json()).catch(e => { console.warn('Failed to load sen_faut_que_sentence.json:', e); return null; }),
            fetch('/training_data/moins_plus_sentence.json').then(r => r.json()).catch(e => { console.warn('Failed to load moins_plus_sentence.json:', e); return null; })
          ]);
          
          console.log('🔍 SENTENCE MODE: Loaded data:', {
            peurQue: peurQueData?.examples?.length || 0,
            avantQue: avantQueData?.examples?.length || 0,
            avantDe: avantDeData?.examples?.length || 0,
            senFaut: senFautData?.examples?.length || 0,
            moinsPlus: moinsPlusData?.examples?.length || 0
          });
          
          // Combine all sentence training data
          trainingDataToUse = [];
          [peurQueData, avantQueData, avantDeData, senFautData, moinsPlusData].forEach(data => {
            if (data && data.examples) {
              trainingDataToUse.push(...data.examples); // Use ALL examples from each trigger (500 each)
            }
          });
          
          console.log(`📝 SENTENCE MODE: Using ${trainingDataToUse.length} sentence training examples`);
        } catch (error) {
          console.warn('Failed to load sentence training data, using fallback:', error);
          trainingDataToUse = [
            { text: "j'ai peur qu'il vienne", hasExpletive: true, trigger: "peur_que" },
            { text: "avant qu'il partie", hasExpletive: true, trigger: "avant_que" },
            { text: "utiliser avant de partir", hasExpletive: false, trigger: "avant_de" }
          ];
        }
      }
      
      for (let index = 0; index < sentences.length; index++) {
        setBatchProgress({ current: index + 1, total: sentences.length });
        const sentence = sentences[index].trim();
        
        try {
          if (index > 0) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }

          const analysis = await analyzer.analyzeNegationEnhanced(sentence, 'RULE_BASED');
          
          // NEW: Add dual-mode classifier analysis using pre-loaded training data
          let dualModeAnalysis = null;
          try {
            console.log(`🔍 DUAL-MODE: Processing sentence ${index + 1}:`, sentence.substring(0, 50) + '...');
            const enhancedResult = analyzeWithEnhancedFeatures(sentence, trainingDataToUse);
            dualModeAnalysis = enhancedResult.dualModeAnalysis;
            
            // Safety check for malformed dual-mode analysis
            if (!dualModeAnalysis || dualModeAnalysis.hasExpletive === undefined || dualModeAnalysis.confidence === undefined) {
              console.warn(`⚠️ DUAL-MODE: Malformed analysis for sentence ${index + 1}, creating fallback:`, dualModeAnalysis);
              dualModeAnalysis = {
                hasExpletive: false,
                confidence: 0.5,
                mode: analysisMode === 'PARAGRAPH_MODE' ? 'paragraph' : 'sentence',
                reasoning: 'No clear trigger detected - defaulting to no expletive',
                features: {
                  trigger_type: 'unknown',
                  trigger_strength: 0.5,
                  register: 'neutral',
                  register_score: 1.0,
                  semantic_field: 'neutral'
                }
              };
            }
            
            console.log(`✅ DUAL-MODE: Analysis complete for sentence ${index + 1}:`, {
              hasExpletive: dualModeAnalysis?.hasExpletive,
              confidence: dualModeAnalysis?.confidence,
              features: dualModeAnalysis?.features?.trigger_type
            });
            
            // Override mode based on user selection and enhance with discourse factors
            if (dualModeAnalysis) {
              console.log('🔍 DUAL-MODE: Initial analysis:', {
                hasExpletive: dualModeAnalysis.hasExpletive,
                confidence: dualModeAnalysis.confidence,
                mode: analysisMode
              });
              
              if (analysisMode === 'SENTENCE_MODE') {
                dualModeAnalysis.mode = 'sentence';
                console.log('📝 SENTENCE MODE: Set mode to sentence');
              } else if (analysisMode === 'PARAGRAPH_MODE') {
                dualModeAnalysis.mode = 'paragraph';
                console.log('📚 PARAGRAPH MODE: Set mode to paragraph');
                
                // Enhance with discourse factors for paragraph mode
                console.log('🔍 PARAGRAPH MODE: Checking discourse boost threshold:', {
                  trainingDataLength: trainingDataToUse.length,
                  threshold: 1000,
                  willApplyBoost: trainingDataToUse.length > 1000
                });
                
                if (trainingDataToUse.length > 1000) { // Updated threshold for full dataset
                  // Apply discourse-level adjustments based on comprehensive training data
                  const discourseBoost = calculateDiscourseBoost(sentence, trainingDataToUse);
                  const originalConfidence = dualModeAnalysis.confidence;
                  dualModeAnalysis.confidence = Math.min(0.95, dualModeAnalysis.confidence + discourseBoost);
                  
                  console.log('📚 PARAGRAPH MODE: Applied discourse boost:', {
                    originalConfidence: originalConfidence,
                    discourseBoost: discourseBoost,
                    newConfidence: dualModeAnalysis.confidence,
                    sentence: sentence.substring(0, 50) + '...'
                  });
                  
                  dualModeAnalysis.discourseFactors = {
                    trainingExamples: trainingDataToUse.length,
                    discourseBoost: discourseBoost,
                    registerConsistency: true
                  };
                } else {
                  console.log('📚 PARAGRAPH MODE: No discourse boost applied - insufficient training data');
                }
              }
            }
          } catch (error) {
            console.warn(`❌ DUAL-MODE: Error for sentence ${index + 1}:`, error);
            console.warn(`❌ DUAL-MODE: Sentence text:`, sentence);
          }
          
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
                // Use enhanced training analyzer that includes surface form generation and dual-mode classifier
                const { analyzeWithEnhancedFeatures } = await import('../utils/enhancedTrainingAnalyzer');
                trainingAnalysis = analyzeWithEnhancedFeatures(sentence, trainingData.examples);
                
                console.log('🎯 Full enhanced training analysis result:', trainingAnalysis);
                console.log('🎯 Surface form in enhanced result:', trainingAnalysis.surfaceForm);
                console.log('🎯 Dual-mode analysis:', trainingAnalysis.dualModeAnalysis);
                
                // Create properly formatted analysis object
                const analysisObj = {
                    classification: trainingAnalysis.classification ? 'Expletive' : 'No Expletive',
                    confidence: trainingAnalysis.confidence,
                    dualModeAnalysis: trainingAnalysis.dualModeAnalysis, // NEW: Add dual-mode results
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
                        ...(trainingAnalysis.context?.details || []),
                        // Add dual-mode classifier details
                        trainingAnalysis.dualModeAnalysis ? 
                          `Dual-Mode Classifier (${trainingAnalysis.dualModeAnalysis.mode}): ${trainingAnalysis.dualModeAnalysis.reasoning}` : 
                          null
                    ].filter(Boolean)
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
                
                // Use integration logic results directly - don't override them
                let finalClassification = analysis.prediction || analysis.type || 'No Expletive';
                let semanticOverrideApplied = false;
                
                // Only apply semantic override if integration logic didn't run (no enhanced analysis)
                if (!analysis.enhanced && analysis.type === 'Expletive') {
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
                } else if (analysis.enhanced) {
                  console.log('🎯 Using integration logic result - no UI override needed');
                }
                
                formattedResult = formatRuleBasedResult(analysis);
                classification = finalClassification;
                
                if (semanticOverrideApplied) {
                  console.log('🎯 Final classification after semantic override:', classification);
                } else if (analysis.enhanced) {
                  console.log('🎯 Final classification from integration logic:', classification);
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

          console.log(`📊 RESULTS: Adding sentence ${index + 1} to results:`, {
            sentence: sentence.substring(0, 30) + '...',
            hasDualMode: !!dualModeAnalysis,
            dualModeDetails: dualModeAnalysis ? {
              hasExpletive: dualModeAnalysis.hasExpletive,
              confidence: dualModeAnalysis.confidence,
              mode: dualModeAnalysis.mode
            } : null
          });

          results.push({
            id: index + 1,
            text: sentence,
            highlightedText: highlight(sentence),
            label: formattedResult,
            classification: displayClassification,
            proposedSentence,
            surfaceForm: trainingAnalysis?.surfaceForm || null, // NEW: Add surface form from analysis
            dualModeAnalysis: dualModeAnalysis // NEW: Add dual-mode classifier results
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

      {/* Training Data Section - Hidden for sentence/paragraph modes */}

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
