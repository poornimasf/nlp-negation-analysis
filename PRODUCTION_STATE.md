# Production State Documentation

## Current System Status
- **Version**: 2.6.2
- **Last Updated**: August 2, 2025
- **Status**: ✅ Active and Stable
- **URL**: https://main.d1gx30ivteuneq.amplifyapp.com/

## System Overview
The French Negation Type Prediction System is a specialized linguistic analysis platform that predicts whether a French sentence can have expletive negation. The system uses rule-based pattern matching and training data analysis to make predictions.

## Current Features

### Analysis Modes
1. **Rule-Based Analysis**
   - Binary classification (expletive/non-expletive)
   - Three official triggers:
     * "peur que"
     * "avant que"
     * "peu s'en faut"
   - Subjunctive mood detection
   - Confidence-based scoring

2. **Training Data Analysis**
   - Example-based learning
   - Pattern matching with triggers
   - User-provided examples
   - Transparent decision making

### Core Functionality
- **Binary Classification**: Expletive vs Non-expletive only
- **Confidence Scoring**: Based on triggers and subjunctive
- **Training Data Management**: Upload and validate examples
- **Error Handling**: Graceful degradation with clear messages

### Results Display
- **Analysis Results**: Binary classification with confidence
- **Evidence Details**: Triggers and subjunctive detection
- **Clear Feedback**: Detailed reasoning for predictions

### Classification Rules
1. **Expletive Requirements**
   - Must have one of the official triggers
   - Must have subjunctive mood
   - Optional 'ne' increases confidence

2. **Non-Expletive Cases**
   - No official triggers found
   - Has trigger but missing subjunctive
   - Any other cases default to non-expletive

3. **Confidence Scoring**
   - Expletive with 'ne': 0.95
   - Expletive without 'ne': 0.85
   - Non-expletive (no trigger): 0.95
   - Non-expletive (trigger, no subjunctive): 0.90

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
- **Branch**: main
- **Build Status**: ✅ Successful
- **Last Deployment**: August 2, 2025

### Environment Variables
- **Build Settings**: Automatic deployment on git push
- **Domain**: Custom domain with SSL certificate

### Monitoring
- **CloudWatch**: Performance and error monitoring
- **Amplify Console**: Deployment status and logs
- **Error Tracking**: Client-side error reporting

## Known Issues and Limitations

### Current Limitations
1. **Binary Classification**: Only expletive vs non-expletive
2. **Limited Triggers**: Only three official triggers supported
3. **Subjunctive Required**: Must detect subjunctive for expletive
4. **No Data Persistence**: Client-side only (by design)

### Planned Improvements
1. **Performance**: Optimize pattern matching
2. **Triggers**: Consider additional validated patterns
3. **Documentation**: Expand examples and guides
4. **Testing**: Increase test coverage

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
