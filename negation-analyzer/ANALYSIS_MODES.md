# Analysis Modes and Feature Flags Guide

## Feature Flag System

### Overview
The system uses two independent feature flags to control analysis behavior:
```javascript
const [useExpletiveLogic, setUseExpletiveLogic] = useState(true);
const [enableTrainingData, setEnableTrainingData] = useState(false);
```

### Flag Combinations

| useExpletiveLogic | enableTrainingData | Mode | Description |
|-------------------|-------------------|------|-------------|
| false | false | Basic | Simple 'ne' detection only |
| true | false | Rule-Based | Pattern-based expletive analysis |
| false | true | Pure Training | ML-based analysis only |
| true | true | Hybrid | Combined rules and ML |

## Testing Analysis Modes

### 1. Basic Logic Mode
```javascript
// Set flags
useExpletiveLogic: false
enableTrainingData: false

// Test Cases
const basicTestCases = [
  "Il ne vient pas",              // Logical negation
  "Il ne vient",                  // Simple negation
  "Je ne pense pas qu'il parte",  // Complex logical
  "Il part"                       // No negation
];
```

Expected Results:
- Should only detect presence/absence of 'ne'
- Should identify logical markers (pas, plus, jamais, etc.)
- No expletive analysis
- No training data influence

### 2. Rule-Based Mode
```javascript
// Set flags
useExpletiveLogic: true
enableTrainingData: false

// Test Cases
const ruleBasedTestCases = [
  "J'ai peur qu'il ne vienne",           // Expletive with peur que
  "Je crains qu'elle ne soit malade",    // Expletive with craindre
  "Avant qu'il ne parte",                // Expletive with avant que
  "J'ai peur qu'il ne vienne pas",       // Logical with expletive trigger
  "Je doute qu'il comprenne"             // Trigger without ne
];
```

Expected Results:
- Should identify expletive triggers
- Should analyze trigger + ne combinations
- Should differentiate expletive vs logical ne
- Should provide confidence scores
- No training data influence

### 3. Pure Training Mode
```javascript
// Set flags
useExpletiveLogic: false
enableTrainingData: true

// Required: Upload training data first
const sampleTrainingData = [
  { text: "J'ai peur qu'il ne vienne", classification: "expletive" },
  { text: "Je crains qu'elle ne soit malade", classification: "expletive" },
  { text: "Il ne vient pas", classification: "logical" }
];

// Test Cases
const trainingTestCases = [
  "J'ai peur qu'il ne parte",          // Similar to training example
  "Je crains qu'il ne fasse froid",    // Similar pattern
  "Il ne mange pas",                   // Similar logical
  "Je redoute qu'elle ne perde",       // New pattern
];
```

Expected Results:
- Should ignore rule-based logic
- Should classify based on training similarities
- Should provide confidence based on example matches
- Should indicate when no similar examples exist

### 4. Hybrid Mode
```javascript
// Set flags
useExpletiveLogic: true
enableTrainingData: true

// Test Cases
const hybridTestCases = [
  "J'ai peur qu'il ne vienne",         // Matches rules and training
  "Je crains qu'elle ne soit malade",  // Matches rules and training
  "Je redoute qu'il ne pleuve",        // Matches rules, new to training
  "Il ne vient pas",                   // Logical in both
  "Avant qu'elle ne parte",            // Rule-based, no training
];
```

Expected Results:
- Should use both rule-based and training analysis
- Should enhance confidence when both agree
- Should fallback to rules when no training matches
- Should indicate source of classification

## Testing Process

### 1. Single Sentence Testing
```javascript
// Test each mode with single sentences
const testSingleSentence = (text) => {
  // 1. Basic Mode
  setUseExpletiveLogic(false);
  setEnableTrainingData(false);
  handleAnalyze();  // Check result

  // 2. Rule-Based Mode
  setUseExpletiveLogic(true);
  setEnableTrainingData(false);
  handleAnalyze();  // Check result

  // 3. Pure Training Mode
  setUseExpletiveLogic(false);
  setEnableTrainingData(true);
  handleAnalyze();  // Check result

  // 4. Hybrid Mode
  setUseExpletiveLogic(true);
  setEnableTrainingData(true);
  handleAnalyze();  // Check result
};
```

### 2. Batch Testing
```javascript
// Test each mode with batch input
const testBatchProcessing = (sentences) => {
  // Test in each mode
  const modes = [
    { expletive: false, training: false, name: "Basic" },
    { expletive: true, training: false, name: "Rule-Based" },
    { expletive: false, training: true, name: "Pure Training" },
    { expletive: true, training: true, name: "Hybrid" }
  ];

  modes.forEach(mode => {
    setUseExpletiveLogic(mode.expletive);
    setEnableTrainingData(mode.training);
    handleBatchAnalyze();
    // Download results in each format for comparison
    downloadBatchResults('excel');
    downloadBatchResults('csv');
  });
};
```

### 3. Edge Cases
```javascript
const edgeCases = [
  "",                                    // Empty input
  "Il ne",                              // Incomplete negation
  "J'ai peur qu'il ne ne vienne pas",   // Double ne
  "Je crains qu'il ne vienne pas pas",  // Double pas
  "J'ai très peur qu'il ne vienne",     // Modified trigger
  "Il ne vient vraiment pas du tout"    // Multiple negation markers
];
```

## Feature Flag Implementation Details

### Flag State Management
```javascript
// Initial state
const [useExpletiveLogic, setUseExpletiveLogic] = useState(true);
const [enableTrainingData, setEnableTrainingData] = useState(false);
const [useTrainingEnhancement, setUseTrainingEnhancement] = useState(false);

// Training data dependency
useEffect(() => {
  if (trainingData.length > 0) {
    setUseTrainingEnhancement(true);
  } else {
    setUseTrainingEnhancement(false);
  }
}, [trainingData]);
```

### Mode Selection Logic
```javascript
const classifyNegation = (text) => {
  // Pure training-based analysis
  if (!useExpletiveLogic && enableTrainingData && useTrainingEnhancement) {
    return classifyPureTraining(text);
  }
  
  // Basic logic only
  if (!useExpletiveLogic && !enableTrainingData) {
    return classifyBasic(text);
  }
  
  // Rule-based expletive logic only
  if (useExpletiveLogic && !enableTrainingData) {
    return classifyExpletive(text);
  }
  
  // Hybrid: Training-enhanced expletive logic
  if (useExpletiveLogic && enableTrainingData && useTrainingEnhancement) {
    return classifyWithTraining(text);
  }
  
  // Fallback to appropriate base logic
  return useExpletiveLogic ? classifyExpletive(text) : classifyBasic(text);
};
```

### UI Integration
```javascript
// Feature flag toggles in UI
<div className="feature-flags">
  <label>
    <input
      type="checkbox"
      checked={useExpletiveLogic}
      onChange={(e) => setUseExpletiveLogic(e.target.checked)}
    />
    Rule-Based Expletive Logic
  </label>
  
  <label>
    <input
      type="checkbox"
      checked={enableTrainingData}
      onChange={(e) => setEnableTrainingData(e.target.checked)}
    />
    Training Data Analysis
  </label>
</div>

// Mode indicator
<div className="current-mode">
  Current Mode: {getCurrentModeDescription()}
</div>
```

### Mode Description Helper
```javascript
const getCurrentModeDescription = () => {
  if (!useExpletiveLogic && !enableTrainingData) {
    return "📝 Basic Logic Only";
  }
  if (useExpletiveLogic && !enableTrainingData) {
    return "🎯 Rule-Based Expletive Logic";
  }
  if (!useExpletiveLogic && enableTrainingData) {
    return useTrainingEnhancement 
      ? "🤖 Pure Training-Based Analysis" 
      : "📚 Training Data Available";
  }
  if (useExpletiveLogic && enableTrainingData) {
    return useTrainingEnhancement 
      ? "🔄 Hybrid Analysis" 
      : "🔄 Hybrid Mode Available";
  }
  return "Unknown mode";
};
```

## Troubleshooting

### Common Issues

1. **Training Data Not Applied**
   - Check if `enableTrainingData` is true
   - Verify training data is loaded
   - Confirm `useTrainingEnhancement` is true

2. **Unexpected Classification**
   - Verify current mode with `getCurrentModeDescription()`
   - Check feature flag states
   - Review training data if applicable

3. **Mode Switching Issues**
   - Clear results before mode change
   - Re-run analysis after flag changes
   - Check for training data dependencies

### Debugging Tips

1. **Log Mode Changes**
```javascript
useEffect(() => {
  console.log('Mode changed:', {
    useExpletiveLogic,
    enableTrainingData,
    useTrainingEnhancement,
    trainingDataCount: trainingData.length
  });
}, [useExpletiveLogic, enableTrainingData, useTrainingEnhancement]);
```

2. **Track Classification Path**
```javascript
const classifyNegation = (text) => {
  console.log('Classification started:', {
    text,
    mode: getCurrentModeDescription(),
    flags: {
      useExpletiveLogic,
      enableTrainingData,
      useTrainingEnhancement
    }
  });
  
  // ... classification logic ...
  
  console.log('Classification result:', result);
  return result;
};
```

3. **Verify Training Data**
```javascript
const verifyTrainingData = () => {
  console.log('Training data status:', {
    count: trainingData.length,
    enhancement: useTrainingEnhancement,
    enabled: enableTrainingData,
    examples: trainingData.slice(0, 3) // First 3 examples
  });
};
```
