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
          
        } catch (error) {
          console.error(`Error analyzing sentence ${index + 1}:`, error);
          results.push({
            id: index + 1,
            text: sentence,
            highlightedText: highlight(sentence),
            label: `Error: ${formatErrorMessage(error)}`,
            classification: 'Error',
            likelihood: null,
            proposedSentence: null
          });
        }
      }
      
      setBatchResults(results);
    } catch (error) {
      console.error('Batch analysis error:', error);
      setError(formatErrorMessage(error));
    } finally {
      setBatchLoading(false);
      setBatchProgress({ current: 0, total: 0 });
    }
  };

  return (
    <div className="negation-analyzer">
      {error && (
        <div className="error-message">
          {error}
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
