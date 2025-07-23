import React from 'react';
import './App.css';
import NegationAnalyzer from './components/NegationAnalyzer';

function App() {
  return (
    <div className="App">
      <div className="header">
        <h1>Expletive Negation Analysis</h1>
        <p>French Expletive Negation Detection System</p>
      </div>
      <NegationAnalyzer />
    </div>
  );
}

export default App;
