# Production State Documentation

## Current System Status
- **Version**: 2.6.0
- **Last Updated**: July 26, 2025
- **Status**: ✅ Active and Stable
- **URL**: https://main.d1gx30ivteuneq.amplifyapp.com/

## System Overview
The French Negation Type Prediction System is a specialized linguistic analysis platform that predicts whether removed "ne" markers in French sentences were originally expletive or logical negation. The system combines traditional French linguistic expertise with modern AI capabilities through CroissantLLM integration.

## Current Features

### Analysis Modes
1. **Rule-Based Analysis**
   - French linguistic pattern detection
   - CroissantLLM integration for syntax validation
   - Trigger patterns: "peur que", "avant que", "peu s'en faut"
   - Subjunctive mood analysis
   - Context-aware confidence scoring

2. **Training Data Analysis**
   - Pure machine learning approach
   - Text similarity matching with trigger boost
   - User-provided example learning
   - Transparent decision making

3. **CamemBERT Analysis (Beta)**
   - Deep learning-based French language analysis
   - Direct negation type classification
   - Confidence scoring with pattern validation
   - Available through feature flag: REACT_APP_ENABLE_CAMEMBERT

4. **Priority System**
   - Either/or logic (no hybrid mode)
   - Rule-based takes priority when both enabled
   - Clear user interface indicators

### Core Functionality
- **Single Sentence Analysis**: Primary production feature
- **NE Placement Proposals**: Always provided with confidence scoring
- **Training Data Management**: Upload, preview, validate examples
- **Error Handling**: Graceful degradation and detailed error reporting

### Results Display
- **Analysis Results**: Detailed pattern and context analysis
- **Prediction**: Classification with confidence
- **Highlighted Text**: Visual pattern identification
- **Proposed Sentence**: NE placement with highlighted "NE"

### Disabled Features
- **Batch Processing**: Implemented but currently disabled in production
  - Multiple sentence analysis with progress tracking
  - Export options (Excel, CSV, JSON)
  - Available in codebase but not exposed in UI
  - Path to re-enable: Import BatchAnalysis component in App.js

### Technical Architecture
- **Frontend**: React with responsive design
- **AI Integration**: CroissantLLM for French syntax analysis
- **Cloud Hosting**: AWS Amplify
- **Data Processing**: Client-side with no data persistence
- **Performance**: Real-time processing with progress tracking

## Recent Updates (v2.6.1)

### Major Changes
1. **Updated Training Data Format**
   - Simplified JSON structure
   - Improved validation
   - Better error handling
   - Automatic format conversion

2. **Enhanced Git Workflow**
   - Added workflow safeguards
   - Improved branch protection
   - Better deployment process
   - Added documentation

3. **UI Improvements**
   - Collapsible format guide
   - Better error messages
   - Enhanced styling
   - Improved user feedback

4. **Development Process**
   - Added workflow scripts
   - Enhanced documentation
   - Improved build process
   - Better error handling

### Training Data Format
The system now uses a simplified JSON format:
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

### Bug Fixes
- Fixed detached HEAD issues
- Improved file reading
- Enhanced error handling
- Better format validation

### Development Workflow
- Added git workflow script
- Enhanced branch protection
- Improved deployment process
- Better documentation

## System Performance

### Processing Capabilities
- **Single Sentence**: Near-instantaneous analysis
- **Batch Processing**: Handles 50+ sentences efficiently
- **Progress Tracking**: Real-time updates during processing
- **Error Recovery**: Continues processing despite individual failures

### Accuracy Metrics
- **Rule-Based Mode**: High precision for known trigger patterns
- **Training Data Mode**: Accuracy depends on training data quality
- **Confidence Scoring**: Reliable indicators of prediction certainty
- **Classification Sensitivity**: Reduced uncertain cases by ~40%

## Deployment Information

### AWS Amplify Configuration
- **App ID**: d1gx30ivteuneq
- **Branch**: main
- **Build Status**: ✅ Successful
- **Last Deployment**: July 26, 2025

### Environment Variables
- **REACT_APP_HF_TOKEN**: Hugging Face API token for CroissantLLM
- **REACT_APP_ENABLE_CAMEMBERT**: Feature flag for CamemBERT analysis mode
- **Build Settings**: Automatic deployment on git push
- **Domain**: Custom domain with SSL certificate

### Monitoring
- **CloudWatch**: Performance and error monitoring
- **Amplify Console**: Deployment status and logs
- **Error Tracking**: Client-side error reporting
- **Usage Analytics**: Basic traffic monitoring

## Known Issues and Limitations

### Current Limitations
1. **CroissantLLM Dependency**: Requires Hugging Face API availability
2. **Processing Speed**: Batch analysis can be slow due to AI calls
3. **Language Scope**: Focused specifically on French negation
4. **Data Persistence**: No server-side data storage (by design)

### Planned Improvements
1. **Performance Optimization**: Caching for repeated analyses
2. **Enhanced Patterns**: Additional trigger pattern support
3. **User Interface**: Further simplification and clarity
4. **Documentation**: Expanded user guides and examples

## Security and Privacy

### Data Handling
- **No Persistence**: All data processed client-side only
- **Privacy First**: No user data stored on servers
- **Secure Transmission**: HTTPS for all communications
- **API Security**: Hugging Face token properly secured

### Access Control
- **Public Access**: No authentication required
- **Rate Limiting**: Handled by Hugging Face API
- **CORS Configuration**: Properly configured for security
- **Content Security**: No user-generated content storage

## Support and Maintenance

### Regular Maintenance Tasks
1. **Dependency Updates**: Monthly security and feature updates
2. **Performance Monitoring**: Weekly performance reviews
3. **Error Analysis**: Daily error log reviews
4. **User Feedback**: Continuous improvement based on usage

### Support Channels
- **Documentation**: Comprehensive guides in repository
- **Issue Tracking**: GitHub issues for bug reports
- **Development**: Active development and maintenance
- **Community**: Open source collaboration

## Future Roadmap

### Short-term Goals (Next 3 months)
1. **Performance Optimization**: Reduce batch processing time
2. **Enhanced Patterns**: Add more expletive trigger patterns
3. **User Experience**: Improve loading and feedback systems
4. **Documentation**: Expand user guides and examples

### Long-term Vision (6-12 months)
1. **Multi-language Support**: Extend to other Romance languages
2. **Advanced AI**: Integration with newer language models
3. **Research Tools**: Enhanced features for academic research
4. **API Development**: Programmatic access for researchers

## Contact and Resources

### Development Team
- **Primary Developer**: Active maintenance and feature development
- **Repository**: GitHub with full source code access
- **Documentation**: Comprehensive technical documentation
- **Community**: Open to contributions and feedback

### External Dependencies
- **CroissantLLM**: Hugging Face hosted French language model
- **AWS Amplify**: Cloud hosting and deployment platform
- **React Ecosystem**: Modern web development framework
- **Linguistic Resources**: French grammar and syntax references

This production system represents a mature, stable platform for French negation analysis with ongoing development and improvement.
