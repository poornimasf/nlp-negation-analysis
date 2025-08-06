import React from 'react';
import './App.css';
import NegationAnalyzer from './components/NegationAnalyzer';

function App() {
  return (
    <div className="App">
      <header className="app-header">
        <h1>French Expletive Negation Analysis</h1>
      </header>
      <NegationAnalyzer />
    </div>
  );
}

export default App;
