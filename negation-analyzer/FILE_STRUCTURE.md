# File Structure and Implementation Guide

## Project Organization

```
negation-analyzer/
├── src/
│   ├── components/
│   │   ├── SimpleNegationAnalyzer.jsx    # Main analysis component (Active in Production)
│   │   ├── BatchAnalysis.jsx             # Batch processing component (Implemented but Disabled)
│   │   ├── AnalysisModes.jsx            # Mode selection components
│   │   ├── TrainingDataSection.jsx      # Training data management
│   │   └── NegationAnalyzer.css         # Component styles
│   ├── utils/
│   │   ├── NegationAnalyzer.js          # Core analysis logic
│   │   ├── patterns.js                  # Regex patterns and triggers
│   │   ├── classifiers.js               # Classification functions
│   │   ├── textProcessing.js            # Text analysis utilities
│   │   ├── resultFormatters.js          # Result formatting utilities
│   │   ├── errorFormatter.js            # Error handling utilities
│   │   └── trainingDataManager.js       # Training data utilities
│   ├── config/
│   │   └── featureFlags.js              # Feature flag configuration
│   └── App.js                           # Root application component
├── public/
│   └── index.html                       # HTML template
└── package.json                         # Dependencies and scripts
```

## Key Components

### SimpleNegationAnalyzer.jsx
Primary component handling negation analysis with the following features:

#### Analysis Modes
1. **Rule-Based Analysis**
   - Pattern matching for expletive triggers
   - Subjunctive mood detection
   - Confidence scoring system
   - Evidence-based prediction

2. **Hybrid Analysis**
   - Pattern analysis + CroissantLLM
   - Confidence blending
   - LLM-based disambiguation
   - Enhanced prediction accuracy

3. **Training Data Analysis**
   - Example-based learning
   - Similarity matching
   - Statistics tracking
   - Training-based predictions

#### Core Functions
```javascript
// Main classification function
const classifyNegation = async (text) => {
  const analysis = await analyzer.analyzeNegation(text);
  
  switch (analysisMode) {
    case 'RULE_BASED':
      return formatRuleBasedResult(analysis);
    case 'HYBRID':
      const llmAnalysis = await classifyExpletive(text);
      return formatHybridResult(analysis, llmAnalysis);
    case 'TRAINING_DATA':
      if (useTrainingEnhancement) {
        const trainingAnalysis = classifyWithBinaryClassifier(text);
        return formatTrainingResult(analysis, trainingAnalysis);
      }
      return formatRuleBasedResult(analysis);
  }
};
```

### BatchAnalysis.jsx
Handles batch processing and export functionality:

```javascript
// Export functions
const downloadBatchResults = (format) => {
  switch (format) {
    case 'excel':
      downloadExcel(filename);
      break;
    case 'csv':
      downloadCSV(filename);
      break;
    case 'json':
      downloadJSON(filename);
      break;
  }
};
```

### TrainingDataSection.jsx
Manages training data functionality:

```javascript
// Training data validation
const validateTrainingData = (data) => {
  return data.every(item => (
    item.text &&
    typeof item.has_expletive_ne !== 'undefined' &&
    item.trigger &&
    item.classification
  ));
};
```

### AnalysisModes.jsx
Handles mode selection and information display:

```javascript
// Mode selector component
export const ModeSelector = ({ mode, setMode }) => (
  <select value={mode} onChange={(e) => setMode(e.target.value)}>
    <option value="RULE_BASED">Pattern-Based Analysis</option>
    <option value="HYBRID">Hybrid Analysis</option>
    <option value="TRAINING_DATA">Training Data Analysis</option>
  </select>
);
```

## Utility Functions

### textProcessing.js
Text analysis and prediction logic:

```javascript
// Prediction system
export const determineClassification = (text, analysis) => {
  // Check evidence strength
  const hasStrongExpletive = analysis.includes('strong expletive trigger');
  const hasLogicalMarkers = analysis.includes('logical marker');
  const hasSubjunctive = analysis.includes('subjunctive mood');
  
  if (hasStrongExpletive && hasSubjunctive && !hasLogicalMarkers) {
    return "Likely Expletive";
  }
  if (hasLogicalMarkers && !hasStrongExpletive) {
    return "Likely Logical";
  }
  
  return "Uncertain";
};
```

### classifiers.js
Classification functions:

```javascript
// CroissantLLM integration
export const classifyExpletive = async (text) => {
  const response = await fetch(
    'https://frwk8k50dyslyiwo.us-east-1.aws.endpoints.huggingface.cloud',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.REACT_APP_HF_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: text,
        parameters: {
          max_new_tokens: 256,
          temperature: 0.1
        }
      })
    }
  );
  return response.json();
};
```

### resultFormatters.js
Result formatting utilities:

```javascript
// Format training data results
export const formatTrainingResult = (analysis, trainingAnalysis) => {
  return {
    type: analysis.type,
    confidence: analysis.confidence,
    evidence: {
      pattern: analysis.evidence,
      training: trainingAnalysis.matches,
      confidence: trainingAnalysis.confidence
    }
  };
};
```

## Implementation Details

### Analysis Pipeline
1. Text input processing
2. Mode-specific analysis:
   - Rule-based: Pattern matching
   - Hybrid: Pattern + LLM
   - Training: Example matching
3. Evidence collection
4. Prediction generation
5. Result formatting

### Classification Logic
```javascript
switch (analysisMode) {
  case 'RULE_BASED':
    return patternAnalysis(text);
  case 'HYBRID':
    return combineAnalysis(patternAnalysis(text), llmAnalysis(text));
  case 'TRAINING_DATA':
    return trainingAnalysis(text, examples);
}
```

### Confidence Scoring
Each mode has its own confidence calculation:
- Rule-based: Pattern strength and validation
- Hybrid: Weighted combination of pattern and LLM
- Training: Example similarity and count

### Result Format
```javascript
{
  classification: "EXPLETIVE",
  confidence: 0.85,
  evidence: [
    "Strong expletive trigger detected",
    "Subjunctive mood present",
    "No logical markers found"
  ],
  prediction: "Likely Expletive"
}
```

## Environment Setup

### Required Variables
- REACT_APP_HF_TOKEN: Hugging Face API token
- NODE_ENV: Development/Production mode

### Error Handling
- Input validation
- API error management
- Training data validation
- User-friendly messages

## Best Practices

### Mode Selection
- Use appropriate mode for use case
- Consider performance implications
- Monitor confidence scores
- Validate results across modes

### Error Management
- Graceful degradation
- Clear error messages
- Detailed logging
- Recovery strategies

### Performance
- Batch processing optimization
- Progress tracking
- Resource management
- Error recovery

## Future Enhancements

### Planned Features
- Enhanced prediction accuracy
- Additional pattern support
- Improved confidence scoring
- Extended documentation

### Maintenance
- Regular testing
- Performance monitoring
- Error tracking
- Documentation updates
