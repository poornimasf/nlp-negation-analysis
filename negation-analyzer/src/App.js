import React from 'react';
import './App.css';
import SimpleNegationAnalyzer from './components/SimpleNegationAnalyzer';

function App() {
  return (
    <div className="App">
      <div className="header">
        <h1>Expletive Negation Analysis</h1>
      </div>
      <SimpleNegationAnalyzer />
    </div>
  );
}

export default App;
