import React from 'react';
import './App.css';
import { SimpleNegationAnalyzer } from './components';

function App() {
  return (
    <div className="App">
      <div className="header">
        <h1>French Negation Analysis</h1>
        <p>Analyze expletive and logical negation in French sentences</p>
      </div>
      <SimpleNegationAnalyzer />
    </div>
  );
}

export default App;
