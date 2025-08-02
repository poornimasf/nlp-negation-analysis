import React from 'react';
import JsonFormatGuide from './JsonFormatGuide';
import './TrainingData.css';

const TrainingDataPreview = ({ data }) => {
  if (!data || !data.examples) {
    return (
      <div className="training-data-preview">
        <JsonFormatGuide />
        <div className="no-data-message">
          <p>No training data loaded. Please upload data in the format shown above.</p>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const stats = {
    total: data.examples.length,
    withNe: data.examples.filter(ex => ex.has_expletive_ne).length,
    expletivePossible: data.examples.filter(ex => ex.classification).length,
    byTrigger: {
      'peur que': 0,
      'avant que': 0,
      'peu s\'en faut': 0
    }
  };

  // Count trigger occurrences
  data.examples.forEach(ex => {
    if (ex.trigger && stats.byTrigger.hasOwnProperty(ex.trigger)) {
      stats.byTrigger[ex.trigger]++;
    }
  });

  return (
    <div className="training-data-preview">
      <JsonFormatGuide />
      
      <h3>Current Training Data</h3>
      <div className="training-data-table-container">
        <table className="training-data-table">
          <thead>
            <tr>
              <th>Text</th>
              <th>Has NE</th>
              <th>Expletive</th>
              <th>Trigger</th>
              <th>NE Position</th>
            </tr>
          </thead>
          <tbody>
            {data.examples.map((example, index) => (
              <tr key={index} className={example.has_expletive_ne ? 'has-ne' : ''}>
                <td>{example.text}</td>
                <td>{example.has_expletive_ne ? 'Yes' : 'No'}</td>
                <td>{example.classification ? 'Yes' : 'No'}</td>
                <td>{example.trigger || '-'}</td>
                <td>{example.ne_position || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="training-data-stats">
        <h4>Statistics</h4>
        <div className="stats-grid">
          <div className="stats-column">
            <h5>General</h5>
            <ul>
              <li>Total examples: {stats.total}</li>
              <li>With NE: {stats.withNe}</li>
              <li>Expletive possible: {stats.expletivePossible}</li>
            </ul>
          </div>
          <div className="stats-column">
            <h5>By Trigger</h5>
            <ul>
              {Object.entries(stats.byTrigger).map(([trigger, count]) => (
                <li key={trigger}>{trigger}: {count}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingDataPreview;
