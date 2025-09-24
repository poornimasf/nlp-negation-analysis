import React from 'react';
import './App.css';
import SimpleNegationAnalyzer from './components/SimpleNegationAnalyzer';

// Force rebuild: 2025-09-23T19:38:16.570-06:00
function App() {
  return (
    <div className="App">
      <header className="app-header">
        <h1>French Expletive Negation Analysis</h1>
      </header>
      <SimpleNegationAnalyzer />
    </div>
  );
}

export default App;
