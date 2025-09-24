import React from 'react';
import './App.css';
import SimpleNegationAnalyzer from './components/SimpleNegationAnalyzer';

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
