import React from 'react';
import JsonFormatGuide from './JsonFormatGuide';

const TrainingDataPreview = ({ data }) => {
  if (!data || !data.examples) {
    return (
      <div className="training-data-preview">
        <JsonFormatGuide />
        <p>No training data loaded</p>
      </div>
    );
  }

  return (
    <div className="training-data-preview">
      <JsonFormatGuide />
      
      <h3>Current Training Data</h3>
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
            <tr key={index}>
              <td>{example.text}</td>
              <td>{example.has_expletive_ne ? 'Yes' : 'No'}</td>
              <td>{example.classification ? 'Yes' : 'No'}</td>
              <td>{example.trigger || '-'}</td>
              <td>{example.ne_position || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="statistics">
        <h4>Statistics</h4>
        <ul>
          <li>Total examples: {data.examples.length}</li>
          <li>With NE: {data.examples.filter(ex => ex.has_expletive_ne).length}</li>
          <li>Expletive possible: {data.examples.filter(ex => ex.classification).length}</li>
          <li>By trigger:
            <ul>
              {['peur que', 'avant que', 'peu s\'en faut'].map(trigger => (
                <li key={trigger}>
                  {trigger}: {data.examples.filter(ex => ex.trigger === trigger).length}
                </li>
              ))}
            </ul>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default TrainingDataPreview;
