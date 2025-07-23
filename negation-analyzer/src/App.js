import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <div className="header">
        <h1>Expletive Negation Analysis</h1>
        <p>French Expletive Negation Detection System</p>
      </div>
      <div style={{ padding: '20px', backgroundColor: 'white', margin: '20px', borderRadius: '8px' }}>
        <h2>🔬 Test Interface</h2>
        <p>If you can see this, the basic React app is working!</p>
        <input 
          type="text" 
          placeholder="Test input field..." 
          style={{ padding: '10px', width: '300px', margin: '10px 0' }}
        />
        <br />
        <button style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>
          Test Button
        </button>
      </div>
    </div>
  );
}

export default App;
