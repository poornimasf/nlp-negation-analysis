# File Structure and Implementation Guide

## Project Organization

```
negation-analyzer/
├── src/
│   ├── components/
│   │   ├── SimpleNegationAnalyzer.jsx    # Main analysis component
│   │   └── NegationAnalyzer.css          # Component styles
│   ├── utils/
│   │   └── patterns.js                   # Regex patterns and triggers
│   └── App.js                            # Root application component
├── public/
│   └── index.html                        # HTML template
└── package.json                          # Dependencies and scripts
```

## Key Components

### SimpleNegationAnalyzer.jsx
Primary component handling negation analysis with the following key features:

#### Analysis Modes
1. **Rule-Based Analysis**
   - Pattern matching for expletive triggers
   - Subjunctive form detection
   - Confidence scoring system

2. **Pure Training Analysis**
   - Text similarity comparison
   - Example-based classification
   - Confidence calculation from matches

3. **Hybrid Analysis**
   - Combined rule-based and training analysis
   - Enhanced confidence scoring
   - Clear section separation in results

#### Core Functions
- `classifyNegation()`: Main classification dispatcher
- `classifyExpletive()`: Rule-based analysis
- `classifyWithTraining()`: Training-enhanced analysis
- `determineClassification()`: Final classification logic

#### Data Processing
- `processTrainingData()`: Training data validation and processing
- `calculateConfidence()`: Multi-factor confidence scoring
- `formatDetailedResult()`: Result formatting with sections

#### Batch Processing
- `handleBatchAnalyze()`: Batch text processing
- `downloadBatchResults()`: Multiple export formats
- `sortResults()`: Result sorting and organization

### patterns.js
Contains regex patterns for:
- Expletive triggers (peur que, avant que)
- Subjunctive forms
- Logical negation markers

## Implementation Details

### Analysis Pipeline
1. Text input processing
2. Pattern matching and trigger detection
3. Subjunctive analysis
4. Training data comparison (if enabled)
5. Confidence calculation
6. Result formatting and display

### Classification Logic
```javascript
if (hasStrongEvidence) {
  return "✅ EXPLETIVE NEGATION";
} else if (hasModerateEvidence) {
  return "LIKELY EXPLETIVE NEGATION";
} else {
  return "UNCERTAIN CLASSIFICATION";
}
```

### Confidence Scoring
- Base confidence: 0.5
- Trigger presence: +0.2
- Subjunctive: +0.2
- Complete construction: +0.1
- Training match: Up to +0.2

### Result Formatting
```javascript
{
  classification: "EXPLETIVE NEGATION",
  confidence: 0.85,
  evidence: [
    "Found trigger pattern: 'peur que'",
    "Contains subjunctive form",
    "Training data match: 90%"
  ]
}
```

## Export Formats

### Excel Export
- Multiple sheets (Results, Summary, Training Stats)
- Color-coded classifications
- Detailed statistics and analysis

### CSV Export
- Basic format for compatibility
- All essential fields included
- Analysis results in plain text

### JSON Export
- Complete data structure
- Includes metadata and confidence scores
- Full analysis details

### Text Export
- Human-readable format
- Numbered entries
- Formatted analysis results

## Best Practices

### Pattern Matching
- Use complete trigger phrases
- Include variations and conjugations
- Consider context and position

### Confidence Calculation
- Multiple evidence sources
- Weighted scoring system
- Clear confidence thresholds

### Training Data
- Validate format and content
- Process incrementally
- Maintain example quality

### Result Display
- Clear section separation
- Consistent formatting
- Informative confidence levels

## Performance Considerations

### Optimization
- Cached pattern compilation
- Efficient text processing
- Batch operation priority

### Memory Management
- Training data chunking
- Result set pagination
- Export file size limits

## Future Enhancements

### Planned Features
- Enhanced pattern matching
- Additional export formats
- Advanced confidence scoring

### Maintenance
- Regular pattern updates
- Performance monitoring
- Documentation updates
