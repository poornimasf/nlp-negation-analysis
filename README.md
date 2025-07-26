# Expletive Negation Analysis System

A comprehensive linguistic analysis platform specializing in expletive vs logical negation detection with cloud-based machine learning capabilities.

## Documentation Structure

### Core Documentation
- [Production State](PRODUCTION_STATE.md) - Current deployment status and system state
- [Implementation Details](negation-analyzer/FILE_STRUCTURE.md) - Detailed file structure and implementation guide
- [Update Process](negation-analyzer/UPDATE_CHECKLIST.md) - Comprehensive testing and deployment checklist
- [Analysis Modes](negation-analyzer/ANALYSIS_MODES.md) - Detailed description of analysis modes and features

## Latest Updates (v2.3.0 - July 26, 2025)

### Major Changes
- ✨ **Streamlined Interface**: Removed single sentence analysis in favor of efficient batch processing
- 🔄 **Enhanced Hybrid Analysis**: Improved integration of rule-based and training data results
- 📊 **Better Result Formatting**: Clearer separation between rule-based and training analysis
- 🎯 **Refined Classifications**: Updated "Potential" cases to show clearer confidence levels

### Analysis Modes

#### 1. Rule-Based Analysis
- ✅ **Comprehensive Pattern Detection**:
  - Complete trigger pattern matching
  - Advanced subjunctive analysis
  - Confidence-based classification
  - Detailed evidence reporting

#### 2. Pure Training Analysis
- ✅ **Example-Based Learning**:
  - Text similarity matching
  - Confidence scoring
  - Transparent example references
  - Pure ML-based decisions

#### 3. Hybrid Analysis
- ✅ **Combined Approach**:
  - Rule-based foundation
  - Training data enhancement
  - Clear section separation
  - Weighted confidence scoring

### Technical Improvements
- Improved classification messaging
- Enhanced result formatting
- Better confidence calculations
- Streamlined batch processing
- Rich export options (Excel, CSV, JSON, TXT)

## Quick Links

### Production Application
- **URL**: https://main.d1gx30ivteuneq.amplifyapp.com/
- **Status**: ✅ Active with enhanced analysis modes
- **Last Updated**: July 26, 2025

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
