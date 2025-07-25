# French Negation Analysis System

A specialized linguistic analysis tool for detecting and classifying French negation patterns, with particular focus on expletive vs logical negation constructions.

## 🎯 Overview

This application provides analysis of French negation patterns through a web interface. It offers both rule-based linguistic analysis and optional machine learning capabilities through training data integration.

### Key Features

- **Single Sentence Analysis**: Real-time analysis of individual French sentences
- **Batch Processing**: Analyze multiple sentences with downloadable results
- **Configurable Analysis Modes**: Toggle between rule-based and training-based analysis
- **Training Data Integration**: Optional enhancement through user-provided examples
- **Export Capabilities**: Excel, CSV, JSON, and TXT export formats

## 🏗️ Architecture

### Core Component
All functionality is consolidated in a single React component:
- Location: `/src/components/SimpleNegationAnalyzer.jsx`
- Handles UI, analysis logic, and data processing
- Includes feature flags for different analysis modes
- Manages training data integration

### Analysis Modes

The system supports four analysis modes through feature flags:

1. **Basic Logic** (both flags off)
   - Simple 'ne' detection
   - Basic logical negation markers

2. **Rule-Based Logic** (expletive flag on)
   - Trigger analysis ('peur que', 'avant que', etc.)
   - Pattern-based classification
   - Confidence scoring

3. **Pure Training** (training flag on, expletive flag off)
   - Machine learning based on user examples
   - Pattern matching from training data
   - Similarity-based classification

4. **Hybrid Analysis** (both flags on)
   - Combines rule-based logic with training data
   - Enhanced confidence through example matching
   - Smart pattern resolution

## 🚀 Quick Start

### Installation

1. **Clone and install**
   ```bash
   cd negation-analyzer
   npm install
   ```

2. **Start development server**
   ```bash
   npm start
   ```

3. **Access the application**
   - Development: http://localhost:3000
   - Production: https://main.d1gx30ivteuneq.amplifyapp.com/

## 📊 Features Deep Dive

### Single Text Analysis
- Real-time French negation detection
- Configurable analysis modes via feature flags
- Pattern highlighting and classification
- Confidence-based results

### Batch Analysis
- Process multiple sentences simultaneously
- Sortable results table
- Export options:
  - Excel: Rich formatting, multiple sheets
  - CSV: Structured data
  - JSON: Programmatic access
  - TXT: Human-readable reports

### Training Data Integration
- JSON file upload support
- Training statistics tracking
- Pattern-based learning
- Confidence enhancement

## 🔧 Making Updates

### UI and Analysis Logic
All changes should be made in `/src/components/SimpleNegationAnalyzer.jsx`:

1. **Feature Flags**
   ```javascript
   const [useExpletiveLogic, setUseExpletiveLogic] = useState(true);
   const [enableTrainingData, setEnableTrainingData] = useState(false);
   ```

2. **Core Analysis Functions**
   ```javascript
   const classifyNegation = (text) => { ... }
   const classifyBasic = (text) => { ... }
   const classifyExpletive = (text) => { ... }
   const classifyPureTraining = (text) => { ... }
   const classifyWithTraining = (text) => { ... }
   ```

3. **Pattern Definitions**
   ```javascript
   const EXPLETIVE_PATTERNS = { ... }
   const LOGICAL_MARKERS = [ ... ]
   const SUBJUNCTIVE_PATTERNS = [ ... ]
   ```

### Styling Updates
CSS changes should be made in:
- `/src/components/NegationAnalyzer.css`

## 🔄 Version History

### Current Version (v2.1.0)
- Simplified architecture with consolidated component
- Feature flag system for analysis modes
- Enhanced batch processing with multiple export formats
- Improved training data integration

## 📈 Performance

- Single sentence analysis: <500ms
- Batch processing: ~100ms per sentence
- Training data processing: <1s for typical datasets

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### AWS Amplify Deployment
```bash
aws amplify start-job --app-id d1gx30ivteuneq --branch-name main --job-type RELEASE --region us-east-2
```

## 🧪 Testing

Run the test suite:
```bash
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes in SimpleNegationAnalyzer.jsx
4. Submit a pull request

## 📚 Documentation

### Analysis Modes

#### Basic Logic
```javascript
// Simple negation detection
if (!useExpletiveLogic && !enableTrainingData) {
  return classifyBasic(text);
}
```

#### Rule-Based Logic
```javascript
// Expletive negation analysis
if (useExpletiveLogic && !enableTrainingData) {
  return classifyExpletive(text);
}
```

#### Training-Based Analysis
```javascript
// Pure ML-based analysis
if (!useExpletiveLogic && enableTrainingData) {
  return classifyPureTraining(text);
}
```

#### Hybrid Analysis
```javascript
// Combined rule-based and ML analysis
if (useExpletiveLogic && enableTrainingData) {
  return classifyWithTraining(text);
}
```

---

**Live Application**: https://main.d1gx30ivteuneq.amplifyapp.com/
