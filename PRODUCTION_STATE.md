# Production State Documentation

## Current System Status
- **Version**: 2.6.3
- **Last Updated**: August 8, 2025
- **Status**: ✅ Active and Stable
- **URL**: https://main.d1gx30ivteuneq.amplifyapp.com/

## System Overview
The French Negation Type Prediction System is a specialized linguistic analysis platform that predicts whether a French sentence can have expletive negation. The system uses rule-based pattern matching, enhanced linguistic analysis, and training data analysis to make predictions.

## System Architecture

### Component Flow
```
SimpleNegationAnalyzer.jsx (Main Production Component)
    ↓
NegationAnalyzer.js (Core Analysis Engine)
    ↓
avantQueAnalyzer.js (Enhanced Avant Que Analysis)
    ↓
resultFormatters.js (Output Formatting)
    ↓
User Interface Display
```

### Key Components
1. **SimpleNegationAnalyzer.jsx**: Main production component handling user interface and batch processing
2. **NegationAnalyzer.js**: Core analysis engine with pattern detection and linguistic analysis
3. **avantQueAnalyzer.js**: Enhanced linguistic analysis for "avant que" constructions
4. **resultFormatters.js**: Formats analysis results for display
5. **classifiers.js**: Training data analysis and similarity matching

## Current Features

### Analysis Modes
1. **Rule-Based Analysis**
   - Binary classification (expletive/non-expletive)
   - Enhanced "avant que" analysis with complement clause and subjunctive detection
   - Three official triggers:
     * "peur que"
     * "avant que" (with enhanced linguistic analysis)
     * "peu s'en faut"
   - Subjunctive mood detection with priority-based matching
   - Confidence-based scoring

2. **Training Data Analysis**
   - Example-based learning with similarity matching
   - Pattern matching with triggers
   - User-provided examples with detailed analysis
   - Transparent decision making with best match display
   - Weighted voting from multiple similar examples

3. **SVM Analysis**
   - Support Vector Machine classification
   - Statistical analysis with confidence scoring
   - Training data integration

4. **Hybrid Analysis**
   - CroissantLLM integration for context-aware analysis
   - Combined rule-based and AI-powered analysis

### Enhanced Avant Que Analysis
For "avant que" constructions, the system provides sophisticated linguistic analysis:

#### Analysis Criteria
1. **Complement Clause Detection**
   - Identifies finite clauses with subject pronouns
   - Distinguishes from infinitive constructions ("avant de")
   - Detects nominal constructions

2. **Subjunctive Mood Analysis**
   - Priority-based verb matching (high/medium/low confidence)
   - Comprehensive subjunctive pattern recognition
   - Context-aware confidence scoring

#### Classification Logic
- **Both Conditions Met** (Complement + Subjunctive) → **Expletive** (90-95% confidence)
- **Complement Only** (No Subjunctive) → **No Expletive** (60-80% confidence)
- **Subjunctive Only** (No Complement) → **No Expletive** (60-80% confidence)
- **Neither Condition** → **No Expletive** (80-90% confidence)

### Core Functionality
- **Binary Classification**: Expletive vs Non-expletive
- **Enhanced Linguistic Analysis**: Detailed grammatical structure analysis
- **Confidence Scoring**: Multi-factor confidence calculation
- **Training Data Management**: Upload, preview, and validate examples
- **Batch Processing**: Analyze multiple sentences with progress tracking
- **Export Options**: Excel, CSV, JSON, TXT formats
- **Error Handling**: Graceful degradation with clear messages

### Results Display
- **Analysis Results**: Binary classification with detailed confidence breakdown
- **Evidence Details**: Triggers, subjunctive detection, and linguistic factors
- **Enhanced Avant Que Display**: Complement clause and subjunctive analysis
- **Training Data Insights**: Best matches and similarity scores
- **Clear Feedback**: Detailed reasoning for predictions with linguistic explanations

### Classification Rules
1. **Expletive Requirements**
   - Must have one of the official triggers
   - For "avant que": Must have complement clause AND subjunctive mood
   - For other triggers: Must have subjunctive mood
   - Optional 'ne' increases confidence

2. **Non-Expletive Cases**
   - No official triggers found
   - Has trigger but missing required linguistic conditions
   - "Avant que" with infinitive or nominal constructions
   - Any other cases default to non-expletive

3. **Confidence Scoring**
   - Enhanced avant que (both conditions): 0.90-0.95
   - Standard expletive with 'ne': 0.95
   - Standard expletive without 'ne': 0.85
   - Non-expletive (no trigger): 0.95
   - Non-expletive (trigger, missing conditions): 0.60-0.90

### Training Data Format
```json
{
  "examples": [
    {
      "text": "French sentence",
      "has_expletive_ne": true/false,
      "classification": true/false,
      "trigger": "peur que"|"avant que"|"peu s'en faut"|null,
      "ne_position": number|null
    }
  ]
}
```

## Technical Architecture
- **Frontend**: React with responsive design
- **Data Processing**: Client-side only
- **Cloud Hosting**: AWS Amplify
- **Performance**: Real-time analysis

## Deployment Information

### AWS Amplify Configuration
- **App ID**: d1gx30ivteuneq
- **Region**: us-east-2
- **Branch**: main
- **Build Status**: ✅ Successful (Build #841)
- **Last Deployment**: August 8, 2025
- **Latest Features**: Enhanced avant que analysis with complement clause detection

### Environment Variables
- **Build Settings**: Automatic deployment on git push
- **Domain**: Custom domain with SSL certificate

### Monitoring
- **CloudWatch**: Performance and error monitoring
- **Amplify Console**: Deployment status and logs
- **Error Tracking**: Client-side error reporting

## Known Issues and Limitations

### Current Limitations
1. **Binary Classification**: Only expletive vs non-expletive (by design)
2. **Enhanced Analysis Scope**: Advanced linguistic analysis currently limited to "avant que" constructions
3. **Training Data Dependency**: Some analysis modes require user-uploaded training data
4. **No Data Persistence**: Client-side only processing (by design for privacy)
5. **CroissantLLM Dependency**: Hybrid mode requires external API availability

### Recent Improvements (v2.6.3)
1. **Enhanced Avant Que Analysis**: Added complement clause and subjunctive mood detection
2. **Improved Confidence Scoring**: Multi-factor confidence calculation
3. **Better Training Data Display**: Detailed analysis with best match examples
4. **Comprehensive Documentation**: Updated guides and architecture documentation

### Planned Improvements
1. **Extended Enhanced Analysis**: Consider applying linguistic analysis to other trigger types
2. **Performance Optimization**: Optimize pattern matching for large batch processing
3. **Additional Export Formats**: Consider PDF or other specialized formats
4. **Enhanced Testing**: Increase test coverage for new linguistic analysis features

## Security and Privacy

### Data Handling
- **No Persistence**: All data processed client-side only
- **Privacy First**: No user data stored
- **Secure Transmission**: HTTPS only
- **Content Security**: No storage of user content

### Access Control
- **Public Access**: No authentication required
- **CORS**: Properly configured
- **Content Security**: No user data storage

## Support and Maintenance

### Regular Maintenance
1. **Dependencies**: Monthly security updates
2. **Performance**: Weekly monitoring
3. **Error Logs**: Daily review
4. **User Feedback**: Continuous improvement

### Support Channels
- **Documentation**: Repository guides
- **Issue Tracking**: GitHub issues
- **Development**: Active maintenance

## Development Process

### Version Control
- **Repository**: GitHub
- **Branch Strategy**: Main branch only
- **Deployment**: Automatic via AWS Amplify

### Code Quality
- **Testing**: Unit tests for core logic
- **Documentation**: Inline and README docs
- **Standards**: ESLint and Prettier
- **Reviews**: Required for all changes
