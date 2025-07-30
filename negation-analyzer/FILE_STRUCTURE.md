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
│   │   ├── neProposer.js               # NE placement logic
│   │   ├── patterns.js                  # Regex patterns and triggers
│   │   ├── classifiers.js               # Classification functions
│   │   ├── textProcessing.js            # Text analysis utilities
│   │   ├── resultFormatters.js          # Result formatting utilities
│   │   ├── errorFormatter.js            # Error handling utilities
│   │   └── trainingDataManager.js       # Training data utilities
│   ├── config/
│   │   └── featureFlags.js              # Feature flag configuration
│   └── App.js                           # Root application component
├── docs/
│   └── ANALYSIS_RULES.md                # Detailed analysis documentation
├── public/
│   └── index.html                       # HTML template
└── package.json                         # Dependencies and scripts
```

## Key Components

### SimpleNegationAnalyzer.jsx
Primary component handling negation analysis with:

#### Analysis Modes
1. **Rule-Based Analysis**
   - Pattern and context analysis
   - Confidence scoring system
   - Always proposes NE placement
   - Multiple validation steps

2. **Training Data Analysis**
   - Pure example-based learning
   - No rule-based fallback
   - Always proposes NE placement
   - Independent verification

#### Core Functions
```javascript
// Main classification and proposal function
const analyzeText = async (text) => {
  const analysis = await analyzer.analyzeNegation(text);
  const proposal = proposeNePlacement(text, analysisMode, trainingData);
  
  return {
    analysis,
    proposal,
    confidence: calculateConfidence(analysis)
  };
};
```

### neProposer.js
Handles NE placement logic:

```javascript
// Rule-Based NE placement
function proposeFromRules(text) {
  // Pattern analysis
  // Context validation
  // Confidence calculation
  // Always returns proposal with NE
}

// Training Data NE placement
function proposeFromTrainingData(text, trainingData) {
  // Example matching
  // Position determination
  // Always returns proposal with NE
}
```

### Results Display
```javascript
// Results table with NE proposals
<td style={{ padding: '12px' }}>
  <div dangerouslySetInnerHTML={{ 
    __html: result.proposedSentence.replace(/\bNE\b/g, 
      '<span style="background-color: #fff3cd; padding: 2px 4px; border-radius: 2px; font-weight: 500">NE</span>'
    )
  }}></div>
</td>
```

## Implementation Details

### Analysis Pipeline
1. Text input processing
2. Mode-specific analysis:
   - Rule-based: Pattern + context analysis
   - Training: Example matching
3. NE placement proposal
4. Result formatting
5. Display with highlighting

### Confidence Scoring
```javascript
// Rule-Based scoring
const confidence = calculateConfidence({
  hasPattern: 0.3,          // Pattern presence
  hasCompleteStructure: 0.3, // Structure analysis
  noLogicalMarkers: 0.2,    // Negation check
  validContext: 0.2         // Context analysis
});

// Training Data scoring
const confidence = matchQuality ? 0.8 : 0.1;
```

### NE Placement Logic
1. Rule-Based Mode:
   - Pattern match: Primary placement
   - Verb position: Secondary placement
   - Beginning: Fallback placement

2. Training Data Mode:
   - Example match: Use position
   - No match: Beginning placement

## Error Handling
- Input validation
- Pattern matching errors
- Training data validation
- Graceful fallbacks

## Best Practices

### Mode Selection
- Use appropriate mode for case
- Consider data availability
- Monitor confidence scores
- Validate results

### Error Management
- Graceful degradation
- Clear error messages
- Detailed logging
- Recovery strategies

### Performance
- Efficient pattern matching
- Quick training data lookup
- Responsive UI updates
- Error recovery

## Future Enhancements

### Planned Features
- Enhanced pattern detection
- Improved confidence scoring
- Extended documentation
- Additional test cases

### Maintenance
- Regular testing
- Performance monitoring
- Error tracking
- Documentation updates
