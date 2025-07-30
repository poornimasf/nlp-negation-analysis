import React from 'react';

export const ModeSelector = ({ analysisMode, setAnalysisMode }) => (
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
);

export const ModeInfoBox = ({ mode, isExpanded, setExpanded }) => {
  const getContent = () => {
    switch (mode) {
      case 'RULE_BASED':
        return {
          title: '🔍 Pattern-Based Analysis',
          color: '#2196f3',
          items: [
            'Detects logical negation markers',
            'Identifies expletive triggers',
            'Analyzes subjunctive mood',
            'Provides confidence-based results'
          ]
        };
      case 'HYBRID':
        return {
          title: '🔄 Hybrid Analysis',
          color: '#4caf50',
          items: [
            'Combines pattern detection with LLM',
            'Enhanced accuracy for ambiguous cases',
            'Detailed evidence collection',
            'Confidence blending'
          ]
        };
      case 'TRAINING_DATA':
        return {
          title: '📚 Training Data Analysis',
          color: '#9c27b0',
          description: '🎯 Complete User Control: Upload your own training examples to enhance analysis accuracy. The system uses ONLY your uploaded data - no hidden datasets or external training sources.',
          items: [
            'Uses your custom examples',
            'Similarity-based matching',
            'Transparent decision making',
            'Confidence from similar cases'
          ]
        };
      default:
        return null;
    }
  };

  const content = getContent();
  if (!content) return null;

  return (
    <div style={{ 
      backgroundColor: '#fff', 
      border: `1px solid ${content.color}`,
      borderRadius: '8px', 
      marginBottom: '20px',
      overflow: 'hidden'
    }}>
      <div 
        onClick={() => setExpanded(!isExpanded)}
        style={{
          padding: '12px 15px',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#fff',
          borderBottom: isExpanded ? `1px solid ${content.color}` : 'none'
        }}
      >
        <h4 style={{ margin: 0, fontSize: '14px', color: content.color }}>
          {content.title}
        </h4>
        <span style={{ fontSize: '12px', color: content.color }}>
          {isExpanded ? '▼ Hide Details' : '▶ Show Details'}
        </span>
      </div>
      {isExpanded && (
        <div style={{ padding: '15px' }}>
          {content.description && (
            <div style={{
              backgroundColor: '#f3e5f5',
              border: '1px solid #ce93d8',
              borderRadius: '6px',
              padding: '12px',
              marginBottom: '15px',
              fontSize: '14px',
              color: '#4a148c'
            }}>
              {content.description}
            </div>
          )}
          <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
            {content.items.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
