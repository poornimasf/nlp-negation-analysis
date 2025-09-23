import React from 'react';
import './App.css';
import SimpleNegationAnalyzer from './components/SimpleNegationAnalyzer';

function App() {
  // Generate deployment number based on build time
  const deploymentNumber = process.env.REACT_APP_DEPLOYMENT_NUMBER || 
    `v${new Date().toISOString().slice(0,10).replace(/-/g,'')}.${Math.floor(Date.now() / 1000) % 10000}`;

  return (
    <div className="App">
      <header className="app-header">
        <h1>French Expletive Negation Analysis</h1>
      </header>
      <SimpleNegationAnalyzer />
      <footer className="app-footer">
        <div className="footer-content">
          <span className="deployment-info">Deployment: {deploymentNumber}</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
