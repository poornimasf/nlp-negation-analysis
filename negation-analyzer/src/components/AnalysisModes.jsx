import React from 'react';
import './NegationAnalyzer.css';
import './TrainingData.css';
import './InfoBox.css';

export const ModeSelector = ({ analysisMode, setAnalysisMode, setInfoBoxExpanded, isInfoBoxExpanded }) => {
  const handleInfoClick = (e) => {
    e.preventDefault();
    if (isInfoBoxExpanded) {
      setInfoBoxExpanded(false);
    } else {
      setInfoBoxExpanded(true);
      // Auto-close after 5 seconds
      setTimeout(() => {
        setInfoBoxExpanded(false);
      }, 5000);
    }
  };

  return (
    <div className="mode-selector">
      <label htmlFor="analysis-mode">Analysis Mode:</label>
      <select
        id="analysis-mode"
        value={analysisMode}
        onChange={(e) => setAnalysisMode(e.target.value)}
      >
        <option value="SENTENCE_MODE">Sentence Mode (Dual-Mode Classifier)</option>
        <option value="PARAGRAPH_MODE">Paragraph Mode (Dual-Mode Classifier)</option>
      </select>
      <button 
        onClick={handleInfoClick}
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
      case 'SENTENCE_MODE':
        return {
          title: 'Sentence Mode (Dual-Mode Classifier)',
          description: 'Optimized for analyzing individual sentences using comprehensive sentence-specific training data.',
          features: [
            'Full sentence training dataset (2,500 examples: 500 per trigger)',
            'Empirical trigger strength analysis (peur_que: 66.7%, avant_que: 42.1%)',
            'Register correlation detection (literary: 2.53x, formal: 1.77x)',
            'Semantic field classification (emotional, temporal, logical)',
            'Sentence-level context analysis optimized for short texts',
            'Color-coded predictions with confidence scoring'
          ]
        };
      case 'PARAGRAPH_MODE':
        return {
          title: 'Paragraph Mode (Dual-Mode Classifier)',
          description: 'Enhanced analysis for longer texts using comprehensive paragraph training data with discourse-level features.',
          features: [
            'Full paragraph training dataset (2,500 examples: 500 per trigger)',
            'Paragraph-level discourse analysis with enhanced context',
            'Register consistency analysis (formal/literary markers)',
            'Sentence complexity analysis for discourse coherence',
            'Enhanced confidence scoring with up to +11% discourse boost',
            'Optimized for longer texts and complex linguistic contexts'
          ]
        };
      default:
        return {
          title: 'Dual-Mode Classifier',
          description: 'Advanced empirical analysis based on corpus findings.',
          features: [
            'Corpus-derived trigger strengths and register correlations',
            'Automatic sentence/paragraph mode detection',
            'Empirical feature analysis with confidence scoring'
          ]
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
          ✕
        </button>
      </div>
      <div className="info-content">
        <p>{info.description}</p>
        <ul>
          {info.features.map((feature, index) => (
            <li key={index}>{feature}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};
