import React from 'react';
import './TrainingData.css';

const JsonFormatGuide = () => {
  const exampleJson = {
    "examples": [
      {
        "text": "J'ai peur qu'il ne vienne",
        "has_expletive_ne": true,
        "classification": true,
        "trigger": "peur que",
        "ne_position": 3
      },
      {
        "text": "Avant qu'elle parte",
        "has_expletive_ne": false,
        "classification": true,
        "trigger": "avant que",
        "ne_position": null
      },
      {
        "text": "Je vais au cinéma",
        "has_expletive_ne": false,
        "classification": false,
        "trigger": null,
        "ne_position": null
      }
    ]
  };

  return (
    <div className="json-format-guide">
      <h3>Training Data Format</h3>
      <div className="format-explanation">
        <h4>Required Fields:</h4>
        <ul>
          <li><strong>text</strong>: The French sentence</li>
          <li><strong>has_expletive_ne</strong>: true if 'ne' is present in the example</li>
          <li><strong>classification</strong>: true for expletive possible, false for not possible</li>
          <li><strong>trigger</strong>: One of: "peur que", "avant que", "peu s'en faut", or null</li>
          <li><strong>ne_position</strong>: Position of 'ne' if present (1-based), null if not</li>
        </ul>
      </div>
      <div className="example-json">
        <h4>Example:</h4>
        <pre>{JSON.stringify(exampleJson, null, 2)}</pre>
      </div>
      <div className="format-notes">
        <h4>Notes:</h4>
        <ul>
          <li>All examples must be wrapped in an "examples" array</li>
          <li>classification: true = expletive possible, false = not possible</li>
          <li>has_expletive_ne: indicates if 'ne' is present in this example</li>
          <li>ne_position: counts words from start of sentence (1-based)</li>
          <li>trigger: must be one of the three supported patterns or null</li>
        </ul>
      </div>
    </div>
  );
};

export default JsonFormatGuide;
