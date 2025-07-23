import React, { useState } from 'react';
import './NegationAnalyzer.css';

export default function SimpleNegationAnalyzer() {
  // Basic state
  const [inputText, setInputText] = useState("");
  const [batchInput, setBatchInput] = useState("");
  const [result, setResult] = useState(null);
  const [highlightedText, setHighlightedText] = useState("");
  const [batchResults, setBatchResults] = useState([]);

  // Simple triggers for French expletive negation
  const TRIGGERS = {
    en: ["craindre", "avoir peur que", "peur que", "redouter", "avant que", "regretter"],
    nonEn: ["commencer", "arrêter", "cesser", "décider", "oublier"],
  };

  // Basic analysis functions
  const hasNegation = (text) => {
    return /\bne\b([^a-zA-Z]|\s|$)/i.test(text);
  };

  const extractComplement = (text, trigger) => {
    const idx = text.indexOf(trigger);
    if (idx === -1) return "";
    const after = text.slice(idx + trigger.length);
    return after.split(/[.?!]/)[0];
  };

  const highlight = (text) => {
    let output = text;
    const triggerList = [...TRIGGERS.en, ...TRIGGERS.nonEn];
    for (const trig of triggerList) {
      const re = new RegExp(`(${trig})`, "gi");
      output = output.replace(re, '<span class="highlight-yellow">$1</span>');
    }
    output = output.replace(/\b(ne)\b/gi, '<span class="highlight-green">$1</span>');
    return output;
  };

  const classifyNegation = (text) => {
    const lowerText = text.toLowerCase();
    const enTrigger = TRIGGERS.en.find(trigger => lowerText.includes(trigger));
    const nonEnTrigger = TRIGGERS.nonEn.find(trigger => lowerText.includes(trigger));
    const negation = hasNegation(lowerText);
    
    if (!negation) return "No negation detected.";

    const matchedTrigger = enTrigger || nonEnTrigger || "";
    const relevantClause = extractComplement(lowerText, matchedTrigger);
    const clauseHasNeg = hasNegation(relevantClause);

    const isFullNegation = /\bne\b[^.?!]{0,15}\b(pas|rien|jamais|plus|personne|aucun|guère)\b/i.test(relevantClause);
    if (isFullNegation) return "Logically consistent negation. Not expletive.";

    if (!clauseHasNeg) return "Negation found, but not in the complement clause. No expletive negation.";

    if (enTrigger) {
      if (/\b(peur|craindre|redouter|regretter) que\b[^.?!]*\bne\b(?!\s+(pas|rien|jamais|plus|aucun))/i.test(lowerText)) {
        return "EN-trigger + expletive negation";
      }
      return "EN-trigger + logically consistent negation";
    } else if (nonEnTrigger) {
      return "Non-EN-trigger + logically inconsistent negation";
    } else {
      return "Trigger not clearly identified.";
    }
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
        <h2 className="title">🔬 Expletive Negation Analysis</h2>
        <p>Analyze French sentences for expletive vs logical negation patterns.</p>

        {/* Single Sentence Section */}
        <div className="form-group">
          <label htmlFor="sentence-input">Enter Sentence:</label>
          <div className="input-group">
            <input
              id="sentence-input"
              type="text"
              placeholder="Type a French sentence with negation..."
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
            <h3>Classification Result:</h3>
            <p className="classification-result">{result}</p>
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
              placeholder="Type multiple sentences (one per line)..."
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
              <div key={id} className="batch-result">
                <h4>Sentence {id}:</h4>
                <p><strong>Text:</strong> {text}</p>
                <p><strong>Classification:</strong> <span className="classification-result">{label}</span></p>
                <p><strong>Highlighted:</strong> <span dangerouslySetInnerHTML={{ __html: highlightedText }}></span></p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
