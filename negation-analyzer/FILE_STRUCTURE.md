# File Structure and Implementation Guide

## Project Organization

```
negation-analyzer/
├── src/
│   ├── components/
│   │   ├── SimpleNegationAnalyzer.jsx    # Main analysis component (Active in Production)
│   │   ├── BatchAnalysis.jsx             # Batch processing component
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
```

## File Interactions

### Core Analysis Flow
```
SimpleNegationAnalyzer.jsx
    │
    ├── patterns.js (via NegationAnalyzer.js)
    │   └── Defines trigger patterns and categories
    │
    ├── NegationAnalyzer.js
    │   ├── Uses patterns.js for trigger detection
    │   ├── Performs core analysis
    │   └── Returns analysis results
    │
    ├── classifiers.js
    │   ├── Uses patterns.js for classification
    │   └── Handles training data analysis
    │
    ├── resultFormatters.js
    │   └── Formats analysis results for display
    │
    └── textProcessing.js
        └── Handles text highlighting and processing
```

### Pattern Detection Flow
```
patterns.js
    │
    ├── TRIGGER_PATTERNS
    │   ├── TEMPORAL (with subcategories)
    │   │   ├── SEQUENCE
    │   │   ├── PREVENTIVE
    │   │   ├── ANTICIPATORY
    │   │   └── DEFAULT
    │   ├── FEAR
    │   ├── IMPERSONAL
    │   └── RELATIVE
    │
    ├── SUBJUNCTIVE_PATTERNS
    │   └── Used for verb form detection
    │
    └── CONFIDENCE_LEVELS
        └── Used for scoring analysis
```

### Analysis Modes Flow

1. Rule-Based Mode:
```
Text Input → NegationAnalyzer.js → patterns.js → Analysis Result
    │                                                  │
    └──────────────> resultFormatters.js <────────────┘
```

2. Training Data Mode:
```
Text Input → classifiers.js → patterns.js → Training Analysis
    │            │               │              │
    │            └── Training Examples          │
    │                                          │
    └──────────> resultFormatters.js <─────────┘
```

3. Hybrid Mode:
```
Text Input → NegationAnalyzer.js → patterns.js → Base Analysis
    │            │                                    │
    │            └─> classifiers.js → LLM Analysis   │
    │                                                │
    └──────────> resultFormatters.js <──────────────┘
```

### Data Flow Example

For a sentence like "Prends ton parapluie avant qu'il ne pleuve":

1. SimpleNegationAnalyzer.jsx receives input
2. NegationAnalyzer.js:
   - Uses patterns.js to identify "avant qu'" as TEMPORAL trigger
   - Detects subcategory (PREVENTIVE) based on verb patterns
   - Checks for subjunctive form
   - Builds evidence object

3. Analysis Object Structure:
```javascript
{
    type: 'Expletive',
    confidence: 0.85,
    evidence: {
        trigger: 'avant qu'',
        category: 'TEMPORAL',
        subcategory: 'PREVENTIVE',
        hasSubjunctive: true,
        // ...other evidence
    }
}
```

4. resultFormatters.js formats output:
```
Trigger Analysis:
- Found: "avant qu'"
- Category: TEMPORAL
- Subcategory: PREVENTIVE
- Usage: Action to prevent something
```

## Implementation Details

### Pattern Matching Process
1. patterns.js defines trigger categories and patterns
2. NegationAnalyzer.js uses these patterns for detection
3. classifiers.js uses patterns for training data analysis
4. Results flow back to SimpleNegationAnalyzer.jsx

### Evidence Collection
1. NegationAnalyzer.js gathers evidence:
   - Trigger detection
   - Category/subcategory identification
   - Subjunctive verification
   - Position analysis

2. Evidence flows through:
   - Rule-based analysis
   - Training data comparison
   - Result formatting

### Result Processing
1. Analysis results are formatted by resultFormatters.js
2. Different formats for each analysis mode
3. Consistent structure maintained throughout

## Best Practices

### File Organization
- Keep pattern definitions in patterns.js
- Core analysis in NegationAnalyzer.js
- Formatting logic in resultFormatters.js
- UI components separate from analysis logic

### Data Flow
- Use consistent object structures
- Pass complete evidence objects
- Maintain category/subcategory information
- Handle all analysis modes consistently

### Error Handling
- Validate at each step
- Provide clear error messages
- Maintain error context
- Handle graceful fallbacks

## Future Enhancements

### Planned Features
- Enhanced pattern detection
- Additional subcategories
- Improved confidence scoring
- Extended documentation

### Maintenance
- Keep patterns.js updated
- Validate pattern interactions
- Monitor analysis accuracy
- Update documentation
