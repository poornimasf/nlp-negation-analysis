import React from 'react';
import './NegationAnalyzer.css';
import './TrainingData.css';

export const ModeSelector = ({ analysisMode, setAnalysisMode, setInfoBoxExpanded }) => {
  const handleInfoClick = (e) => {
    e.preventDefault();
    if (isExpanded) {
      setInfoBoxExpanded(false);
    } else {
      setInfoBoxExpanded(true);
      // Auto-close after 5 seconds
      setTimeout(() => {
        setInfoBoxExpanded(false);
      }, 5000);
    }
  };

  const handleInfoDoubleClick = (e) => {
    e.preventDefault();
    setInfoBoxExpanded(false);
  };

  return (
    <div className="mode-selector">
      <label htmlFor="analysis-mode">Analysis Mode:</label>
      <select
        id="analysis-mode"
        value={analysisMode}
        onChange={(e) => setAnalysisMode(e.target.value)}
      >
        <option value="TRAINING_DATA">Training Data Analysis</option>
        <option value="RULE_BASED">Rule-Based Analysis</option>
        <option value="HYBRID">Hybrid Analysis</option>
        <option value="SVM_ANALYSIS">SVM Analysis</option>
      </select>
      <button 
        onClick={handleInfoClick}
        onDoubleClick={handleInfoDoubleClick}
        className="info-button"
        aria-label="Show mode information"
        type="button"
      >
        ℹ️
      </button>
    </div>
  );
};

export const ModeInfoBox = ({ mode, isExpanded, setExpanded }) => {
  if (!isExpanded) return null;

  const handleClose = (e) => {
    e.preventDefault();
    setExpanded(false);
  };

  const getModeInfo = () => {
    switch (mode) {
      case 'TRAINING_DATA':
        return {
          title: 'Training Data Analysis Mode',
          description: 'Uses example-based learning to identify expletive negation.',
          features: [
            'Matches against known examples',
            'Supports multiple trigger patterns',
            'Provides NE placement suggestions based on examples',
            'Considers subjunctive mood and clause boundaries'
          ]
        };
      case 'RULE_BASED':
        return {
          title: 'Rule-Based Analysis Mode',
          description: 'Uses predefined linguistic rules to analyze negation.',
          features: [
            'Pattern-based detection',
            'Comprehensive trigger analysis',
            'Context-aware classification',
            'Grammatical structure analysis'
          ]
        };
      case 'HYBRID':
        return {
          title: 'Hybrid Analysis Mode',
          description: 'Combines rule-based analysis with machine learning.',
          features: [
            'Enhanced accuracy through combined approach',
            'LLM-based classification',
            'Pattern verification',
            'Context-sensitive analysis'
          ]
        };
      case 'SVM_ANALYSIS':
        return {
          title: 'SVM Analysis Mode',
          description: 'Uses Support Vector Machine learning for classification.',
          features: [
            'Machine learning based classification',
            'Feature extraction from examples',
            'Statistical pattern recognition',
            'Confidence scoring'
          ]
        };
      default:
        return {
          title: 'Analysis Mode',
          description: 'Select an analysis mode to begin.',
          features: []
        };
    }
  };

  const info = getModeInfo();

  return (
    <div className="info-box">
      <div className="info-header">
        <h4>{info.title}</h4>
        <button 
          onClick={handleClose}
          className="close-button"
          aria-label="Close information"
          type="button"
        >
          ×
        </button>
      </div>
      <p>{info.description}</p>
      <ul>
        {info.features.map((feature, index) => (
          <li key={index}>{feature}</li>
        ))}
      </ul>
    </div>
  );
};
