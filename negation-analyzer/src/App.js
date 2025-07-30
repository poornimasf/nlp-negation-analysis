import React from 'react';
import './App.css';
import SimpleNegationAnalyzer from './components/SimpleNegationAnalyzer';
// import BatchAnalysis from './components/BatchAnalysis';  // Currently disabled in production (v2.6.0)

/**
 * Main Application Component
 * 
 * Current Production State (v2.6.0):
 * - Only SimpleNegationAnalyzer is active
 * - BatchAnalysis component is implemented but disabled
 * 
 * To enable batch processing:
 * 1. Uncomment BatchAnalysis import
 * 2. Add <BatchAnalysis /> component to render
 * 3. Update PRODUCTION_STATE.md
 */

function App() {
  return (
    <div className="App">
      <div className="header">
        <h1>French Negation Analysis</h1>
        <p>Analyze expletive and logical negation in French sentences</p>
      </div>
      <SimpleNegationAnalyzer />
      {/* BatchAnalysis component disabled in v2.6.0 */}
      {/* <BatchAnalysis /> */}
    </div>
  );
}

export default App;
