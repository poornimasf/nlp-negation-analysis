import React, { useState } from 'react';
import './NegationAnalyzer.css';
import * as XLSX from 'xlsx';
import NegationAnalyzer from '../utils/NegationAnalyzer';
import { formatErrorMessage } from '../utils/errorFormatter';
import { formatRuleBasedResult, formatHybridResult, formatTrainingResult } from '../utils/resultFormatters';
import { highlight, determineClassification } from '../utils/textProcessing';

export default function SimpleNegationAnalyzer() {
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

  // CroissantLLM classification for Hybrid mode
  const classifyExpletive = async (text) => {
    try {
      if (!text) {
        throw new Error('No text provided');
      }

      if (!process.env.REACT_APP_HF_TOKEN) {
        throw new Error('Missing HF_TOKEN');
      }

      const response = await fetch(
        'https://frwk8k50dyslyiwo.us-east-1.aws.endpoints.huggingface.cloud',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.REACT_APP_HF_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: `Analyze this French sentence where a ne has been removed. Consider both possibilities equally: ${text}`,
            parameters: {
              max_new_tokens: 256,
              temperature: 0.1,
              top_p: 0.95,
              return_full_text: false
            }
          })
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('429: Rate limit exceeded');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.generated_text || 'No analysis available';
    } catch (error) {
      console.error('CroissantLLM Error:', error);
      throw error; // Let the main error handler deal with it
    }
  };

  // Binary classifier for Training Data mode
  const classifyWithBinaryClassifier = (text) => {
    try {
      if (!text) {
        throw new Error('No text provided');
      }

      if (!trainingData.length) {
        throw new Error('No training data available');
      }

      // Find similar examples
      const similarExamples = trainingData.filter(example => {
        const similarity = calculateSimilarity(text.toLowerCase(), example.text.toLowerCase());
        return similarity > 0.7; // Threshold for similarity
      });

      if (similarExamples.length === 0) {
        return {
          matches: [],
          confidence: 0.5,
          classification: 'UNCERTAIN'
        };
      }

      // Count classifications
      const counts = similarExamples.reduce((acc, example) => {
        acc[example.classification] = (acc[example.classification] || 0) + 1;
        return acc;
      }, {});

      // Calculate confidence
      const total = similarExamples.length;
      const maxCount = Math.max(...Object.values(counts));
      const confidence = maxCount / total;

      // Get majority classification
      const classification = Object.entries(counts).reduce((a, b) => 
        counts[a] > counts[b] ? a : b
      )[0];

      return {
        matches: similarExamples.slice(0, 5), // Return top 5 matches
        confidence,
        classification
      };
    } catch (error) {
      console.error('Training Data Error:', error);
      throw error; // Let the main error handler deal with it
    }
  };

  // Calculate text similarity for training data matching
  const calculateSimilarity = (text1, text2) => {
    try {
      const words1 = text1.split(/\s+/);
      const words2 = text2.split(/\s+/);
      
      const intersection = words1.filter(word => words2.includes(word));
      const union = [...new Set([...words1, ...words2])];
      
      return intersection.length / union.length;
    } catch (error) {
      console.error('Similarity Calculation Error:', error);
      throw error;
    }
  };

  // Main classification function
  const classifyNegation = async (text) => {
    try {
      if (!text) {
        throw new Error('No text provided');
      }

      if (!analysisMode) {
        throw new Error('Invalid mode: No analysis mode selected');
      }

      // Get base pattern analysis
      const analyzer = new NegationAnalyzer();
      const baseAnalysis = await analyzer.analyzeNegation(text);

      switch (analysisMode) {
        case 'RULE_BASED':
          return formatRuleBasedResult(baseAnalysis);
          
        case 'HYBRID': {
          const llmAnalysis = await classifyExpletive(text);
          return formatHybridResult(baseAnalysis, llmAnalysis);
        }
        
        case 'TRAINING_DATA':
          if (useTrainingEnhancement && trainingData.length > 0) {
            const trainingAnalysis = await classifyWithBinaryClassifier(text);
            return formatTrainingResult(baseAnalysis, trainingAnalysis);
          }
          return formatRuleBasedResult(baseAnalysis);
          
        default:
          throw new Error('Invalid mode: Unsupported analysis mode');
      }
    } catch (error) {
      console.error('Error during classification:', error);
      throw error;
    }
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
      for (let index = 0; index < sentences.length; index++) {
        setBatchProgress({ current: index + 1, total: sentences.length });
        const sentence = sentences[index].trim();
        
        try {
          if (index > 0) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }

          const analysis = await classifyNegation(sentence);
          results.push({
            id: index + 1,
            text: sentence,
            highlightedText: highlight(sentence),
            label: analysis,
            classification: await determineClassification(sentence)
          });

          setBatchResults([...results]);
        } catch (error) {
          console.error(`Error processing sentence ${index + 1}:`, error);
          results.push({
            id: index + 1,
            text: sentence,
            highlightedText: sentence,
            label: formatErrorMessage(error),
            classification: "Error"
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

  // Rest of your component code...
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

      <div className="card" style={{ marginTop: '20px' }}>
        {/* Rest of your UI code... */}
      </div>
    </div>
  );
}
