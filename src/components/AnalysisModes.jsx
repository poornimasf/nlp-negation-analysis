import React from 'react';
import './NegationAnalyzer.css';

const AnalysisModes = ({ currentMode, onModeChange }) => {
  return (
    <div className="analysis-modes">
      <h3>Analysis Mode</h3>
      <div className="mode-selector">
        <select 
          value={currentMode} 
          onChange={(e) => onModeChange(e.target.value)}
        >
          <option value="training">Training Data Analysis</option>
          <option value="rule">Rule-Based Analysis</option>
        </select>
      </div>

      <div className="mode-info">
        {currentMode === 'training' ? (
          <div className="info-box">
            <h4>Training Data Analysis Mode</h4>
            <p>Uses example-based learning to identify expletive negation.</p>
            <ul>
              <li>Matches against known examples</li>
              <li>Supports three trigger patterns:
                <ul>
                  <li>peur que</li>
                  <li>avant que</li>
                  <li>peu s'en faut</li>
                </ul>
              </li>
              <li>Provides NE placement suggestions based on examples</li>
            </ul>
          </div>
        ) : (
          <div className="info-box">
            <h4>Rule-Based Analysis Mode</h4>
            <p>Uses predefined linguistic rules to analyze negation.</p>
            <ul>
              <li>Pattern-based detection</li>
              <li>Comprehensive trigger analysis</li>
              <li>Context-aware classification</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisModes;
