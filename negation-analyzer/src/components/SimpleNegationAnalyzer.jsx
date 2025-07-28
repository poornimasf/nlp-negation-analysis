import React, { useState } from 'react';
import './NegationAnalyzer.css';
import * as XLSX from 'xlsx';
import NegationAnalyzer from '../utils/NegationAnalyzer';

export default function SimpleNegationAnalyzer() {
  // State definitions remain the same
  const [batchInput, setBatchInput] = useState("");
  const [batchResults, setBatchResults] = useState([]);
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });
  const [analysisMode, setAnalysisMode] = useState('RULE_BASED');
  const [useTrainingEnhancement, setUseTrainingEnhancement] = useState(false);
  const [infoBoxExpanded, setInfoBoxExpanded] = useState(false);
  const [trainingData, setTrainingData] = useState([]);

  // Format functions for each mode
  const formatRuleBasedResult = (analysis) => {
    const output = [];
    
    switch (analysis.type) {
      case 'LOGICAL':
        output.push(`✅ LOGICAL NEGATION (${Math.round(analysis.confidence * 100)}% confidence)\n`);
        output.push('🔍 PATTERN ANALYSIS:');
        output.push(`• Found ${analysis.evidence.markers} logical marker(s)`);
        output.push('• No expletive triggers detected');
        if (analysis.evidence.hasSubjunctive) {
          output.push('• Contains subjunctive mood');
        }
        break;

      case 'EXPLETIVE':
        output.push(`✅ EXPLETIVE NEGATION (${Math.round(analysis.confidence * 100)}% confidence)\n`);
        output.push('🔍 PATTERN ANALYSIS:');
        if (analysis.evidence.triggers.strong > 0) {
          output.push('• Found strong expletive trigger(s)');
        }
        if (analysis.evidence.triggers.medium > 0) {
          output.push('• Found medium expletive trigger(s)');
        }
        if (analysis.evidence.hasSubjunctive) {
          output.push('• Contains subjunctive mood');
        }
        output.push('• No logical markers detected');
        break;

      case 'AMBIGUOUS':
        output.push(`⚠️ AMBIGUOUS CASE (${Math.round(analysis.confidence * 100)}% confidence)\n`);
        output.push('🔍 PATTERN ANALYSIS:');
        output.push(`• Found ${analysis.evidence.logical.markers} logical marker(s)`);
        output.push('• Found expletive trigger(s):');
        if (analysis.evidence.expletive.triggers.strong > 0) {
          output.push('  - Strong triggers: ' + analysis.evidence.expletive.triggers.strong);
        }
        if (analysis.evidence.expletive.triggers.medium > 0) {
          output.push('  - Medium triggers: ' + analysis.evidence.expletive.triggers.medium);
        }
        if (analysis.evidence.expletive.hasSubjunctive) {
          output.push('• Contains subjunctive mood');
        }
        break;

      default:
        output.push(`❓ UNCERTAIN (${Math.round(analysis.confidence * 100)}% confidence)\n`);
        output.push('🔍 PATTERN ANALYSIS:');
        output.push('• Insufficient patterns for classification');
    }

    return output.join('\n');
  };

  const formatHybridResult = async (patternAnalysis, llmText) => {
    const output = [];
    
    output.push('🔄 HYBRID ANALYSIS\n');
    
    // Pattern Analysis Section
    output.push('📊 PATTERN EVIDENCE:');
    switch (patternAnalysis.type) {
      case 'LOGICAL':
        output.push(`• Found ${patternAnalysis.evidence.markers} logical marker(s)`);
        output.push('• Pattern confidence: ' + Math.round(patternAnalysis.confidence * 100) + '%');
        break;
      case 'EXPLETIVE':
        if (patternAnalysis.evidence.triggers.strong > 0) {
          output.push('• Found strong expletive trigger(s)');
        }
        if (patternAnalysis.evidence.triggers.medium > 0) {
          output.push('• Found medium expletive trigger(s)');
        }
        if (patternAnalysis.evidence.hasSubjunctive) {
          output.push('• Contains subjunctive mood');
        }
        output.push('• Pattern confidence: ' + Math.round(patternAnalysis.confidence * 100) + '%');
        break;
      case 'AMBIGUOUS':
        output.push('• Found conflicting patterns');
        output.push('• Requires LLM disambiguation');
        break;
    }
    output.push('');
    
    // LLM Analysis Section
    output.push('🤖 LLM ANALYSIS:');
    output.push(llmText);
    
    return output.join('\n');
  };

  const formatTrainingResult = (patternAnalysis, trainingAnalysis) => {
    const output = [];
    
    output.push('📚 TRAINING DATA ANALYSIS\n');
    
    // Pattern Analysis
    output.push('📊 PATTERN EVIDENCE:');
    output.push(`• Base classification: ${patternAnalysis.type}`);
    output.push(`• Pattern confidence: ${Math.round(patternAnalysis.confidence * 100)}%\n`);
    
    // Training Data Analysis
    output.push('🎯 SIMILAR EXAMPLES:');
    if (trainingAnalysis.matches && trainingAnalysis.matches.length > 0) {
      trainingAnalysis.matches.forEach(match => {
        output.push(`• ${match.text} (${match.classification})`);
      });
      output.push(`\n💡 Training data confidence: ${Math.round(trainingAnalysis.confidence * 100)}%`);
    } else {
      output.push('• No similar examples found in training data');
    }
    
    return output.join('\n');
  };

  // Main classification function
  const classifyNegation = async (text) => {
    try {
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
          return formatRuleBasedResult(baseAnalysis);
      }
    } catch (error) {
      console.error('Error during classification:', error);
      return `Error during analysis: ${error.message}`;
    }
  };

  // Rest of the component remains the same
  // ...

  return (
    <div className="container">
      <div className="card" style={{ marginTop: '20px' }}>
        {/* Analysis Mode Selection */}
        <div style={{ 
          backgroundColor: '#e3f2fd', 
          padding: '15px', 
          borderRadius: '8px', 
          marginBottom: '20px',
          border: '2px solid #2196f3'
        }}>
          <h4>🔍 Analysis Mode:</h4>
          <select
            value={analysisMode}
            onChange={(e) => setAnalysisMode(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              marginBottom: '10px',
              borderRadius: '4px',
              border: '1px solid #2196f3',
              fontSize: '16px'
            }}
          >
            <option value="RULE_BASED">Pattern-Based Analysis</option>
            <option value="HYBRID">Hybrid (Patterns + CroissantLLM)</option>
            <option value="TRAINING_DATA">Training Data Analysis</option>
          </select>
          
          <p style={{ 
            marginTop: '10px',
            padding: '10px',
            backgroundColor: 'rgba(255,255,255,0.7)',
            borderRadius: '4px',
            border: '1px solid #2196f3'
          }}>
            {analysisMode === 'RULE_BASED' && (
              "🔍 Analyzes French linguistic patterns and markers"
            )}
            {analysisMode === 'HYBRID' && (
              "🔄 Combines pattern analysis with CroissantLLM for enhanced accuracy"
            )}
            {analysisMode === 'TRAINING_DATA' && (
              "📚 Uses your examples to train a custom classifier"
            )}
          </p>
        </div>

        {/* Mode-specific Info Boxes */}
        {analysisMode === 'RULE_BASED' && (
          <div style={{ 
            backgroundColor: '#e3f2fd', 
            border: '1px solid #2196f3',
            borderRadius: '8px', 
            marginBottom: '20px',
            overflow: 'hidden'
          }}>
            <div 
              onClick={() => setInfoBoxExpanded(!infoBoxExpanded)}
              style={{
                padding: '12px 15px',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#e3f2fd',
                borderBottom: infoBoxExpanded ? '1px solid #2196f3' : 'none'
              }}
            >
              <h4 style={{ margin: 0, fontSize: '14px' }}>🔍 Pattern-Based Analysis</h4>
              <span style={{ fontSize: '12px', color: '#1565c0' }}>
                {infoBoxExpanded ? '▼ Hide Details' : '▶ Show Details'}
              </span>
            </div>
            {infoBoxExpanded && (
              <div style={{ padding: '15px' }}>
                <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
                  <li>Detects logical negation markers</li>
                  <li>Identifies expletive triggers</li>
                  <li>Analyzes subjunctive mood</li>
                  <li>Provides confidence-based results</li>
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Rest of the component remains the same */}
        {/* ... */}
      </div>
    </div>
  );
}
