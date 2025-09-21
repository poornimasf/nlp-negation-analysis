import React, { useState } from 'react';
import NegationAnalyzer from '../utils/NegationAnalyzer';
import { highlight } from '../utils/textProcessing';
import { formatErrorMessage } from '../utils/errorFormatter';
import { ModeSelector, ModeInfoBox } from './AnalysisModes';
import { BatchAnalysis } from './BatchAnalysis';

/**
 * Simplified NegationAnalyzer Component - Unified September 2025 Approach
 * Single analysis system, no dual-mode complexity
 */
const SimpleNegationAnalyzer = () => {
  const [analysisMode, setAnalysisMode] = useState('SENTENCE_MODE');
  const [batchInput, setBatchInput] = useState('');
  const [batchResults, setBatchResults] = useState([]);
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState(null);
  const [infoBoxExpanded, setInfoBoxExpanded] = useState(false);

  // Handle batch analysis with unified approach
  const handleBatchAnalyze = async () => {
    if (!batchInput.trim()) {
      setError('Please enter sentences to analyze');
      return;
    }

    setBatchLoading(true);
    setBatchResults([]);
    setError(null);
    
    try {
      const sentences = batchInput.split('\n').filter(s => s.trim());
      const analyzer = new NegationAnalyzer();
      const results = [];
      
      console.log('🎯 UNIFIED BATCH ANALYSIS: Starting with', sentences.length, 'sentences');
      
      for (let index = 0; index < sentences.length; index++) {
        setBatchProgress({ current: index + 1, total: sentences.length });
        const sentence = sentences[index].trim();
        
        try {
          if (index > 0) {
            await new Promise(resolve => setTimeout(resolve, 500)); // Shorter delay
          }

          console.log(`🔬 ANALYZING SENTENCE ${index + 1}:`, sentence);
          
          // Use unified empirical analyzer for all sentences
          const analysis = await analyzer.analyzeNegationEnhanced(
            sentence, 
            'RULE_BASED', 
            null, 
            analysisMode.toLowerCase().replace('_mode', '')
          );

          console.log(`✅ UNIFIED ANALYSIS COMPLETE:`, {
            prediction: analysis.prediction,
            confidence: `${(analysis.confidence * 100).toFixed(1)}%`,
            trigger: analysis.trigger,
            register: analysis.register
          });

          // Format result for display
          const formattedResult = formatUnifiedResult(analysis);
          
          // Build surface form if expletive predicted
          let proposedSentence = null;
          if (analysis.prediction === 'Expletive') {
            proposedSentence = buildSurfaceForm(sentence, analysis);
          }

          results.push({
            id: index + 1,
            text: sentence,
            highlightedText: highlight(sentence),
            label: formattedResult,
            classification: analysis.prediction,
            proposedSentence,
            analysis: analysis
          });

          setBatchResults([...results]);
          
        } catch (error) {
          console.error(`Error processing sentence ${index + 1}:`, error);
          results.push({
            id: index + 1,
            text: sentence,
            highlightedText: sentence,
            label: `Error: ${error.message}`,
            classification: "Error",
            proposedSentence: sentence,
            analysis: null
          });
          setBatchResults([...results]);
        }
      }
      
      console.log('🎉 UNIFIED BATCH ANALYSIS COMPLETE:', results.length, 'sentences processed');
      
    } catch (error) {
      console.error('Batch analysis failed:', error);
      setError(formatErrorMessage(error));
    } finally {
      setBatchLoading(false);
      setBatchProgress({ current: 0, total: 0 });
    }
  };

  // Format unified result for display
  const formatUnifiedResult = (analysis) => {
    // Use the enhanced reasoning directly from the analyzer
    return analysis.reasoning;
  };

  // Build surface form with "ne" placement
  const buildSurfaceForm = (sentence, analysis) => {
    // Simple "ne" insertion logic based on trigger
    const triggerPatterns = {
      'peur_que': /(\b(?:peur\s+)qu[e'])\s*(\w+)/i,
      'avant_que': /(\b(?:avant\s+)qu[e'])\s*(\w+)/i,
      'sen_faut_que': /(\b(?:s'en\s+faut\s+)qu[e'])\s*(\w+)/i
    };

    const pattern = triggerPatterns[analysis.trigger];
    if (pattern && pattern.test(sentence)) {
      return sentence.replace(pattern, '$1 $2 n\'$2');
    }
    
    // Fallback: suggest manual placement
    return sentence + ' (→ add "ne" before verb in subordinate clause)';
  };

  return (
    <div className="container">
      {error && (
        <div className="error-message" style={{
          backgroundColor: '#ffebee',
          border: '1px solid #ef5350',
          color: '#c62828',
          padding: '12px',
          borderRadius: '4px',
          marginBottom: '20px',
          position: 'relative'
        }}>
          {error}
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
