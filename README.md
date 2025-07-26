# Expletive Negation Analysis System

A comprehensive linguistic analysis platform specializing in expletive vs logical negation detection with cloud-based machine learning capabilities.

## Documentation Structure

### Core Documentation
- [Production State](PRODUCTION_STATE.md) - Current deployment status and system state
- [Implementation Details](negation-analyzer/FILE_STRUCTURE.md) - Detailed file structure and implementation guide
- [Update Process](negation-analyzer/UPDATE_CHECKLIST.md) - Comprehensive testing and deployment checklist
- [Analysis Modes](negation-analyzer/ANALYSIS_MODES.md) - Detailed description of analysis modes and features

## Latest Updates (v2.2.0 - July 25, 2025)

### Analysis Modes

#### 1. Rule-Based Analysis
- ✅ **Comprehensive "peur que" Detection**:
  - Complete "avoir peur que" conjugations
  - Prepositional forms (par/de/dans peur que)
  - Intensity modifiers (très/grand peur que)
  - Nominal and adjectival constructions

- ✅ **Advanced "avant que" Analysis**:
  - Basic temporal markers
  - Time precision (juste/bien/peu avant que)
  - Complex temporal expressions
  - Compound constructions

- ✅ **Sophisticated Subjunctive Detection**:
  - Common verb forms (être, avoir, aller)
  - Irregular subjunctive forms
  - Position-aware analysis after "que"

#### 2. Pure Training Analysis (Updated)
- ✅ **True Example-Based Learning**:
  - No rule-based interference
  - Pure text similarity matching
  - Context-aware analysis
  - Transparent example references

- ✅ **Similarity Measures**:
  - Word overlap analysis
  - Context matching
  - Confidence based on similar examples
  - Average similarity scoring

- ✅ **Training Data Integration**:
  - Uses only user-provided examples
  - No predefined patterns
  - No external datasets
  - Clear example matching

#### 3. Hybrid Analysis
- ✅ **Combined Approach**:
  - Rule-based foundation
  - Training data enhancement
  - Weighted confidence scoring
  - Best of both methods

### Technical Improvements
- Removed rule-based logic from pure training mode
- Enhanced similarity matching algorithms
- Improved confidence calculations
- Better result presentation

## Quick Links

### Production Application
- **URL**: https://main.d1gx30ivteuneq.amplifyapp.com/
- **Status**: ✅ Active with enhanced analysis modes
- **Last Updated**: July 25, 2025

### Development Setup
```bash
# Clone repository
git clone <repository-url>

# Install dependencies
cd negation-analyzer
npm install

# Start development server
npm start
```

### Deployment
```bash
# Build and deploy
cd negation-analyzer
npm run build
aws amplify start-job --app-id d1gx30ivteuneq --branch-name main
```

## Support and Resources

### Documentation
- See detailed documentation in the negation-analyzer/ directory
- Review PRODUCTION_STATE.md for current system status
- Check UPDATE_CHECKLIST.md before making changes

### Development
- Follow FILE_STRUCTURE.md for implementation details
- Use UPDATE_CHECKLIST.md for testing and deployment
- Review ANALYSIS_MODES.md for feature documentation

### Monitoring
- AWS CloudWatch for performance metrics
- Amplify Console for deployment status
- Error tracking and logging active

For detailed implementation and deployment information, please refer to the documentation files in the negation-analyzer/ directory.
