# File Structure and Implementation Guide

## Project Organization

```
negation-analyzer/
├── src/
│   ├── components/
│   │   ├── SimpleNegationAnalyzer.jsx    # Main analysis component
│   │   └── NegationAnalyzer.css          # Component styles
│   ├── utils/
│   │   ├── patterns.js                   # Regex patterns and triggers
│   │   ├── CamemBERTClassifier.js        # Deep learning classifier
│   │   ├── ClassifierFactory.js          # Analysis mode factory
│   │   └── AnalysisModes.js              # Mode definitions
│   ├── config/
│   │   └── featureFlags.js               # Feature flag configuration
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
   - CroissantLLM syntax validation
   - Confidence scoring system

2. **Training Data Analysis**
   - Text similarity comparison
   - Example-based classification
   - Confidence calculation from matches

3. **CamemBERT Analysis (Beta)**
   - Deep learning model integration
   - Neural classification with pattern validation
   - Confidence scoring with evidence collection

#### Core Functions
- `classifyNegation()`: Main classification dispatcher
- `classifyExpletive()`: Rule-based analysis
- `classifyWithTraining()`: Training-based analysis
- `determineClassification()`: Final classification logic

### CamemBERTClassifier.js
Deep learning classifier implementation:
- Hugging Face inference integration
- Error handling and validation
- Pattern-enhanced predictions
- Confidence scoring system

### ClassifierFactory.js
Factory pattern for classifier instantiation:
- Mode-based classifier selection
- Initialization handling
- Error management
- Feature flag integration

### AnalysisModes.js
Analysis mode configuration:
- Mode definitions and descriptions
- Feature flag integration
- Available modes management
- Mode-specific documentation

### featureFlags.js
Feature flag management:
- CamemBERT feature flag
- Environment variable integration
- Flag validation
- Default configurations

## Implementation Details

### Analysis Pipeline
1. Analysis mode selection
2. Classifier instantiation via factory
3. Text input processing
4. Mode-specific analysis:
   - Rule-based: Pattern matching and CroissantLLM validation
   - Training: Example comparison and confidence scoring
   - CamemBERT: Deep learning prediction with pattern validation
5. Result formatting and display

### Classification Logic
```javascript
switch (analysisMode) {
  case 'RULE_BASED':
    return await classifyExpletive(text);
  case 'TRAINING_DATA':
    return await classifyWithTraining(text);
  case 'CAMEMBERT':
    return await classifyWithCamemBERT(text);
}
```

### Confidence Scoring
Each mode has its own confidence calculation:
- Rule-based: Pattern strength and validation
- Training: Example similarity and count
- CamemBERT: Model confidence with pattern validation

### Result Formatting
```javascript
{
  classification: "EXPLETIVE NEGATION",
  confidence: 0.85,
  evidence: [
    "Model prediction: Expletive (85% confidence)",
    "Pattern validation: expletive trigger found",
    "Supporting evidence: subjunctive form"
  ]
}
```

## Environment Setup

### Required Variables
- REACT_APP_HF_TOKEN: Hugging Face API token
- REACT_APP_ENABLE_CAMEMBERT: Feature flag for CamemBERT

### Error Handling
- Token validation
- Model availability checks
- API error management
- User-friendly error messages

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
- Cached model initialization
- Efficient batch processing
- Resource management
- Progress tracking

## Future Enhancements

### Planned Features
- Model performance optimization
- Additional language models
- Enhanced pattern validation
- Improved confidence scoring

### Maintenance
- Regular model updates
- Performance monitoring
- Error tracking
- Documentation updates
