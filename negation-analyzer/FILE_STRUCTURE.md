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
   - Pattern and context analysis with subcategories
   - Standardized confidence scoring
   - NE placement based on trigger type
   - Multiple validation steps

2. **Training Data Analysis**
   - Example-based learning with pattern enhancement
   - Weighted similarity scoring
   - Pattern-aware NE placement
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
    confidence: analysis.confidence
  };
};
```

### patterns.js
Defines trigger patterns and categories:

```javascript
export const TRIGGER_PATTERNS = {
    TEMPORAL: {
        SEQUENCE: [/* Pure temporal patterns */],
        PREVENTIVE: [/* Prevention patterns */],
        ANTICIPATORY: [/* Preparation patterns */],
        DEFAULT: [/* General patterns */]
    },
    FEAR: [/* Fear patterns */],
    IMPERSONAL: [/* Impersonal patterns */],
    RELATIVE: [/* Relative patterns */]
};

export const CONFIDENCE_LEVELS = {
    NO_TRIGGER: 0.95,      // No trigger found
    NO_SUBJUNCTIVE: 0.90,  // Missing required subjunctive
    EXPLETIVE: 0.85,       // Valid expletive case
    FALLBACK: 0.50        // Default case
};
```

### NegationAnalyzer.js
Core analysis implementation:

```javascript
class NegationAnalyzer {
    constructor() {
        this.TRIGGER_PATTERNS = TRIGGER_PATTERNS;
        this.SUBJUNCTIVE_PATTERNS = SUBJUNCTIVE_PATTERNS;
        this.CONFIDENCE_LEVELS = CONFIDENCE_LEVELS;
    }

    async analyzeNegation(text) {
        const foundTrigger = this.extractTrigger(text);
        const subjunctiveInfo = this.hasSubjunctive(text);
        
        return {
            type: this.determineType(foundTrigger, subjunctiveInfo),
            confidence: this.calculateConfidence(foundTrigger, subjunctiveInfo),
            evidence: this.collectEvidence(foundTrigger, subjunctiveInfo)
        };
    }
}
```

### Results Display
```javascript
Training Data Analysis
-----------------

Classification: Expletive
Confidence: 85%

Trigger Analysis:
- Found: "avant que"
- Category: TEMPORAL
- Subcategory: SEQUENCE
- Usage: Pure temporal sequence

Best Match:
- Example: "..."
- Similarity: XX%
- Classification: Expletive

Evidence Summary:
- [Evidence points]

Confidence Breakdown:
- Expletive: 85%
- Non-expletive: 15%
```

## Implementation Details

### Analysis Pipeline
1. Text input processing
2. Trigger detection with subcategory analysis
3. Subjunctive verification
4. Evidence collection
5. Confidence calculation
6. Result formatting with detailed breakdown

### Confidence Scoring
```javascript
// Standardized confidence levels
const CONFIDENCE_LEVELS = {
    NO_TRIGGER: 0.95,      // Highest confidence: no trigger
    NO_SUBJUNCTIVE: 0.90,  // High confidence: missing subjunctive
    EXPLETIVE: 0.85,       // Standard expletive confidence
    FALLBACK: 0.50        // Default/uncertain cases
};

// Training Data confidence
const confidence = Math.max(
    baseConfidence,
    weightedVotes.expletive / totalWeight
);
```

### NE Placement Logic
1. Rule-Based Mode:
   - Trigger subcategory analysis
   - Position relative to que/qu'
   - Context-aware placement
   - Fallback strategies

2. Training Data Mode:
   - Similar example matching
   - Pattern-aware positioning
   - Weighted evidence consideration
   - Default placements

## Error Handling
- Input validation
- Pattern matching validation
- Training data verification
- Subcategory detection
- Graceful fallbacks

## Best Practices

### Mode Selection
- Consider trigger subcategories
- Evaluate confidence thresholds
- Monitor similarity scores
- Validate pattern matches

### Error Management
- Detailed error reporting
- Pattern validation
- Training data verification
- Recovery strategies

### Performance
- Efficient pattern matching
- Optimized subcategory detection
- Quick training data lookup
- Responsive UI updates

## Future Enhancements

### Planned Features
- Additional trigger subcategories
- Enhanced similarity scoring
- Improved confidence calculation
- Extended pattern coverage

### Maintenance
- Pattern validation
- Subcategory verification
- Performance monitoring
- Documentation updates
