import React, { useState } from 'react';
import './NegationAnalyzer.css';

export default function SimpleNegationAnalyzer() {
  // Basic state
  const [inputText, setInputText] = useState("");
  const [batchInput, setBatchInput] = useState("");
  const [result, setResult] = useState(null);
  const [highlightedText, setHighlightedText] = useState("");
  const [batchResults, setBatchResults] = useState([]);

  // Focused triggers for French expletive negation
  const TRIGGERS = ["peur que", "avant que"];

  // Basic analysis functions
  const hasNegation = (text) => {
    return /\bne\b([^a-zA-Z]|\s|$)/i.test(text);
  };

  const extractComplement = (text, trigger) => {
    const idx = text.toLowerCase().indexOf(trigger);
    if (idx === -1) return "";
    const after = text.slice(idx + trigger.length);
    return after.split(/[.?!]/)[0];
  };

  const highlight = (text) => {
    let output = text;
    // Highlight the two specific triggers
    for (const trigger of TRIGGERS) {
      const re = new RegExp(`(${trigger})`, "gi");
      output = output.replace(re, '<span class="highlight-yellow">$1</span>');
    }
    // Highlight "ne"
    output = output.replace(/\b(ne)\b/gi, '<span class="highlight-green">$1</span>');
    return output;
  };

  const classifyNegation = (text) => {
    const lowerText = text.toLowerCase();
    const foundTrigger = TRIGGERS.find(trigger => lowerText.includes(trigger));
    const hasNe = hasNegation(lowerText);
    
    // No trigger found
    if (!foundTrigger) {
      if (hasNe) {
        return "Negation found, but no 'peur que' or 'avant que' trigger detected.";
      }
      return "No expletive negation triggers ('peur que' or 'avant que') found.";
    }

    // Trigger found, check for negation
    if (!hasNe) {
      return `Found '${foundTrigger}' but no 'ne' detected. No expletive negation.`;
    }

    // Both trigger and "ne" found - analyze the complement clause
    const complement = extractComplement(lowerText, foundTrigger);
    const complementHasNe = hasNegation(complement);

    if (!complementHasNe) {
      return `Found '${foundTrigger}' and 'ne', but 'ne' is not in the complement clause.`;
    }

    // Check for logical negation markers after "ne"
    const hasLogicalNegation = /\bne\b[^.?!]{0,15}\b(pas|rien|jamais|plus|personne|aucun|guère)\b/i.test(complement);
    
    if (hasLogicalNegation) {
      return `'${foundTrigger}' + logical negation (ne + pas/rien/jamais/etc.). Not expletive.`;
    }

    // Pure expletive negation detected
    return `✅ EXPLETIVE NEGATION: '${foundTrigger}' + expletive 'ne' (without logical negation markers).`;
  };

  // Event handlers
  const handleAnalyze = () => {
    if (!inputText.trim()) {
      setResult("Please enter a sentence to analyze.");
      setHighlightedText("");
      return;
    }
    
    const classification = classifyNegation(inputText);
    setResult(classification);
    setHighlightedText(highlight(inputText));
  };

  const handleBatchAnalyze = () => {
    if (!batchInput.trim()) {
      setBatchResults([]);
      return;
    }

    const sentences = batchInput.split("\n").filter(line => line.trim());
    const results = sentences.map((sentence, index) => ({
      id: index + 1,
      text: sentence.trim(),
      highlightedText: highlight(sentence.trim()),
      label: classifyNegation(sentence.trim()),
    }));
    setBatchResults(results);
  };

  return (
    <div className="container">
      <div className="card">
        <h2 className="title">🔬 French Expletive Negation Analysis</h2>
        <p>Focused analysis for <strong>"peur que"</strong> and <strong>"avant que"</strong> constructions with expletive negation.</p>
        
        <div className="info-box" style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '15px', 
          borderRadius: '8px', 
          marginBottom: '20px',
          border: '1px solid #dee2e6'
        }}>
          <h4>🎯 What this analyzes:</h4>
          <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
            <li><strong>"peur que"</strong> (fear that) + expletive "ne"</li>
            <li><strong>"avant que"</strong> (before) + expletive "ne"</li>
          </ul>
          <p><strong>Example:</strong> "J'ai peur qu'il ne vienne" (expletive) vs "J'ai peur qu'il ne vienne pas" (logical)</p>
        </div>

        {/* Single Sentence Section */}
        <div className="form-group">
          <label htmlFor="sentence-input">Enter French Sentence:</label>
          <div className="input-group">
            <input
              id="sentence-input"
              type="text"
              placeholder="e.g., J'ai peur qu'il ne vienne..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="input"
            />
            <button onClick={handleAnalyze} className="button">
              Analyze
            </button>
          </div>
        </div>

        {result && (
          <div className="result-section">
            <h3>Analysis Result:</h3>
            <p className="classification-result" style={{
              padding: '15px',
              backgroundColor: result.includes('✅ EXPLETIVE NEGATION') ? '#d4edda' : '#f8f9fa',
              border: `1px solid ${result.includes('✅ EXPLETIVE NEGATION') ? '#c3e6cb' : '#dee2e6'}`,
              borderRadius: '8px',
              fontWeight: result.includes('✅ EXPLETIVE NEGATION') ? 'bold' : 'normal'
            }}>
              {result}
            </p>
            {highlightedText && (
              <>
                <h3>Highlighted Sentence:</h3>
                <p className="sentence-text" dangerouslySetInnerHTML={{ __html: highlightedText }}></p>
              </>
            )}
          </div>
        )}
      </div>

      <div className="card">
        <h3 className="title">Batch Analysis</h3>
        <div className="form-group">
          <label htmlFor="batch-input">Enter Multiple Sentences:</label>
          <div className="input-group">
            <textarea
              id="batch-input"
              rows={6}
              placeholder={`Enter multiple sentences (one per line):\nJ'ai peur qu'il ne vienne\nAvant qu'elle ne parte\nJ'ai peur qu'il ne vienne pas`}
              value={batchInput}
              onChange={(e) => setBatchInput(e.target.value)}
              className="input"
            />
            <button onClick={handleBatchAnalyze} className="button">
              Analyze Batch
            </button>
          </div>
        </div>

        {batchResults.length > 0 && (
          <div className="result-section">
            <h3>Batch Results ({batchResults.length} sentences):</h3>
            {batchResults.map(({ id, text, label, highlightedText }) => (
              <div key={id} className="batch-result" style={{
                marginBottom: '20px',
                padding: '15px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #dee2e6'
              }}>
                <h4>Sentence {id}:</h4>
                <p><strong>Text:</strong> {text}</p>
                <p><strong>Analysis:</strong> 
                  <span className="classification-result" style={{
                    marginLeft: '10px',
                    padding: '5px 10px',
                    backgroundColor: label.includes('✅ EXPLETIVE NEGATION') ? '#d4edda' : 'white',
                    border: `1px solid ${label.includes('✅ EXPLETIVE NEGATION') ? '#c3e6cb' : '#dee2e6'}`,
                    borderRadius: '4px',
                    fontWeight: label.includes('✅ EXPLETIVE NEGATION') ? 'bold' : 'normal'
                  }}>
                    {label}
                  </span>
                </p>
                <p><strong>Highlighted:</strong> <span dangerouslySetInnerHTML={{ __html: highlightedText }}></span></p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
