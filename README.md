# Expletive Negation Analysis System

A comprehensive linguistic analysis platform specializing in expletive vs logical negation detection with cloud-based machine learning capabilities.

## Documentation Structure

### Core Documentation
- [Production State](PRODUCTION_STATE.md) - Current deployment status and system state
- [Implementation Details](negation-analyzer/FILE_STRUCTURE.md) - Detailed file structure and implementation guide
- [Update Process](negation-analyzer/UPDATE_CHECKLIST.md) - Comprehensive testing and deployment checklist
- [Analysis Modes](negation-analyzer/ANALYSIS_MODES.md) - Detailed description of analysis modes and features

## Latest Updates (v2.2.0 - July 25, 2025)

### New Features
- ✅ **Batch Analysis Prediction**: New system for predicting removed negation types
- ✅ **Evidence-Based Results**: Detailed supporting evidence for each prediction
- ✅ **Confidence Scoring**: Percentage-based confidence for predictions
- ✅ **Enhanced UI**: Updated color scheme and result presentation
- ✅ **Export Improvements**: Rich formatted exports with prediction details

### Technical Improvements
- Weighted scoring system for prediction confidence
- Multi-factor analysis for negation type detection
- Enhanced pattern recognition for French constructions
- Improved result presentation and organization

## Quick Links

### Production Application
- **URL**: https://main.d1gx30ivteuneq.amplifyapp.com/
- **Status**: ✅ Active with latest prediction system
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
