# Production File Structure and Update Guide

## Current Production Structure

```
negation-analyzer/
├── src/
│   ├── components/
│   │   ├── SimpleNegationAnalyzer.jsx    # Main application component
│   │   └── NegationAnalyzer.css          # Styling for the application
│   ├── App.js                            # Root React component
│   ├── index.js                          # Application entry point
│   └── index.css                         # Global styles
├── public/                               # Static assets
├── amplify/                              # AWS Amplify configuration
│   └── backend/                          # Backend configuration
├── amplify.yml                           # Amplify build configuration
└── package.json                          # Project dependencies
```

## Key Files and Their Purposes

### 1. SimpleNegationAnalyzer.jsx
**Location**: `/src/components/SimpleNegationAnalyzer.jsx`
**Purpose**: Main application component containing all logic and UI
**Contains**:
- Feature flags for analysis modes
- Single sentence analysis
- Batch processing
- Training data integration
- Export functionality
- All analysis logic and patterns

```javascript
// Example sections that may need updates
// 1. Feature Flags
const [useExpletiveLogic, setUseExpletiveLogic] = useState(true);
const [enableTrainingData, setEnableTrainingData] = useState(false);

// 2. Pattern Definitions
const EXPLETIVE_PATTERNS = { ... }
const LOGICAL_MARKERS = [ ... ]
const SUBJUNCTIVE_PATTERNS = [ ... ]

// 3. Analysis Functions
const classifyNegation = (text) => { ... }
const classifyBasic = (text) => { ... }
const classifyExpletive = (text) => { ... }
```

### 2. NegationAnalyzer.css
**Location**: `/src/components/NegationAnalyzer.css`
**Purpose**: Styling for the application
**Contains**:
- Component styles
- Layout definitions
- Theme colors
- Responsive design rules

### 3. App.js
**Location**: `/src/App.js`
**Purpose**: Root React component
**Contains**:
- SimpleNegationAnalyzer component integration
- Basic app structure

### 4. amplify.yml
**Location**: `/amplify.yml`
**Purpose**: AWS Amplify build configuration
**Contains**:
- Build commands
- Deployment settings
- Environment configuration

## Making Updates

### 1. Analysis Logic Updates

#### Update Pattern Definitions
```javascript
// In SimpleNegationAnalyzer.jsx
const EXPLETIVE_PATTERNS = {
  // Add or modify patterns here
  peur: [
    /\b(?:j'ai|tu as|il a|elle a|on a|nous avons|vous avez|ils ont|elles ont)\s+(?:grand[e]?\s+)?peur\s+qu[e']?\s*/gi,
    // Add new patterns
  ],
  // Add new trigger types
};

const LOGICAL_MARKERS = [
  // Update logical negation patterns
  /\bne\s+(?:pas|point)\b/gi,
  // Add new markers
];
```

#### Modify Classification Logic
```javascript
// In SimpleNegationAnalyzer.jsx
const classifyExpletive = (text) => {
  // Update expletive classification logic
};

const classifyWithTraining = (text) => {
  // Update hybrid analysis logic
};
```

### 2. UI Updates

#### Update Component Layout
```javascript
// In SimpleNegationAnalyzer.jsx
return (
  <div className="container">
    {/* Modify component structure */}
    <div className="card">
      {/* Update UI elements */}
    </div>
  </div>
);
```

#### Update Styles
```css
/* In NegationAnalyzer.css */
.container {
  /* Modify container styles */
}

.card {
  /* Update card styles */
}

/* Add new style classes */
```

### 3. Export Format Updates

#### Modify Excel Export
```javascript
// In SimpleNegationAnalyzer.jsx
const downloadExcel = (filename, analysisMode) => {
  // Update Excel format
  const wb = XLSX.utils.book_new();
  // Modify sheets and formatting
};
```

#### Update Other Export Formats
```javascript
// In SimpleNegationAnalyzer.jsx
const downloadCSV = (filename, analysisMode) => {
  // Update CSV format
};

const downloadJSON = (filename, analysisMode) => {
  // Update JSON structure
};
```

## Testing Updates

### 1. Local Testing
```bash
# Start development server
cd negation-analyzer
npm start

# Run tests
npm test
```

### 2. Test Analysis Updates
```javascript
// In SimpleNegationAnalyzer.jsx
const testCases = [
  "J'ai peur qu'il ne vienne",
  // Add test cases for new patterns
];

// Test in each mode
testCases.forEach(text => {
  console.log('Basic:', classifyBasic(text));
  console.log('Expletive:', classifyExpletive(text));
  console.log('Training:', classifyPureTraining(text));
  console.log('Hybrid:', classifyWithTraining(text));
});
```

### 3. Test UI Updates
- Check responsive design
- Verify feature flag toggles
- Test batch processing
- Validate export formats

## Deployment

### 1. Build for Production
```bash
cd negation-analyzer
npm run build
```

### 2. Deploy to AWS Amplify
```bash
aws amplify start-job \
  --app-id d1gx30ivteuneq \
  --branch-name main \
  --job-type RELEASE \
  --region us-east-2
```

### 3. Verify Deployment
- Check live site: https://main.d1gx30ivteuneq.amplifyapp.com/
- Test all analysis modes
- Verify exports work
- Check training data integration

## Best Practices

### 1. Code Organization
- Keep pattern definitions at the top of the file
- Group related functions together
- Maintain clear separation between UI and logic
- Document complex regex patterns

### 2. Testing
- Test all analysis modes after updates
- Verify edge cases
- Check export formats
- Test with and without training data

### 3. Performance
- Monitor analysis response times
- Check batch processing performance
- Verify export generation speed
- Test with large training datasets

### 4. Documentation
- Update comments for new patterns
- Document complex logic changes
- Note any UI modifications
- Keep README up to date

## Common Update Scenarios

### 1. Adding New Patterns
```javascript
// In SimpleNegationAnalyzer.jsx
const EXPLETIVE_PATTERNS = {
  // Add new pattern category
  newTrigger: [
    /\bnew\s+pattern\b/gi,
    // Add patterns
  ],
  // Or add to existing category
  peur: [
    // Add new pattern
    /\bnew\s+peur\s+pattern\b/gi,
  ]
};
```

### 2. Modifying Analysis Logic
```javascript
// In SimpleNegationAnalyzer.jsx
const classifyExpletive = (text) => {
  // Add new analysis steps
  const newFeature = checkNewFeature(text);
  
  // Modify confidence calculation
  let confidence = calculateConfidence(text, newFeature);
  
  // Update result format
  return {
    ...baseResult,
    newFeature,
    confidence
  };
};
```

### 3. Adding Export Fields
```javascript
// In SimpleNegationAnalyzer.jsx
const downloadExcel = (filename, analysisMode) => {
  // Add new columns
  const headers = [
    // Existing headers
    'New Column 1',
    'New Column 2'
  ];
  
  // Add new data
  const data = results.map(result => [
    // Existing fields
    result.newField1,
    result.newField2
  ]);
};
```

## Troubleshooting Common Issues

### 1. Pattern Matching Issues
- Check regex patterns in browser console
- Verify pattern syntax
- Test with sample texts
- Check case sensitivity

### 2. Analysis Mode Problems
- Verify feature flag states
- Check mode selection logic
- Test mode transitions
- Validate training data integration

### 3. Export Issues
- Check data structure
- Verify file generation
- Test all export formats
- Validate output content

## Support and Resources

### 1. Documentation
- This guide
- ANALYSIS_MODES.md
- README.md
- Code comments

### 2. Testing Tools
- Browser console
- React DevTools
- AWS Amplify console
- Local development server

### 3. Deployment Support
- AWS Amplify documentation
- React documentation
- Project maintainers
- Version control history
