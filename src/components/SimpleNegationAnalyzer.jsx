import React, { useState } from 'react';
import './NegationAnalyzer.css';
import NegationAnalyzer from '../utils/NegationAnalyzer';
import { formatErrorMessage } from '../utils/errorFormatter';
import { formatRuleBasedResult } from '../utils/resultFormatters';
import { highlight } from '../utils/textProcessing';
import { calculateNePosition, formatWithNe } from '../utils/nePositionCalculator';
import { BatchAnalysis } from './BatchAnalysis';

const SimpleNegationAnalyzer = () => {
  // State definitions
  const [batchInput, setBatchInput] = useState("");
  const [batchResults, setBatchResults] = useState([]);
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });
  const analysisMode = 'RULE_BASED'; // Fixed to rule-based mode
  const [trainingData] = useState({ examples: [] }); // Minimal training data for compatibility
  const [error, setError] = useState(null);

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

          // Always use enhanced analysis for rule-based mode
          const analysis = await analyzer.analyzeNegationEnhanced(sentence, analysisMode, trainingData);
          const formattedResult = formatRuleBasedResult(analysis);
          // Use the analysis result directly instead of parsing formatted text
          const classification = analysis.prediction || analysis.type || 'Unknown';
          console.log('🔍 BATCH DEBUG - Classification values:', {
            prediction: analysis.prediction,
            type: analysis.type,
            likelihood: analysis.likelihood,
            finalClassification: classification,
            sentence: sentence.substring(0, 50) + '...',
            fullAnalysis: analysis
          });
          
          // Generate proposed sentence if expletive
          let proposedSentence = null;
          if (classification === 'Expletive' && analysis.evidence?.trigger) {
            const triggerInfo = {
              trigger: analysis.evidence.trigger,
              position: sentence.toLowerCase().indexOf(analysis.evidence.trigger.toLowerCase()),
              category: analysis.evidence.triggerType
            };
            const nePosition = calculateNePosition(sentence, triggerInfo, 'RULE_BASED');
            proposedSentence = formatWithNe(sentence, nePosition);
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
            likelihood: analysis.likelihood,
            proposedSentence
          });
          
          console.log('🔍 BATCH DEBUG - Results entry:', {
            id: index + 1,
            classification,
            sentence: sentence.substring(0, 30) + '...'
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
            likelihood: null,
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

      {/* Mode selector removed - now fixed to RULE_BASED */}

      {/* Training Data Section removed - not needed for rule-based mode */}

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
