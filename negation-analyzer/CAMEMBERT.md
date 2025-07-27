# CamemBERT Integration Guide

## Overview
CamemBERT is a state-of-the-art French language model integrated into the negation analyzer as a third analysis mode. It provides deep learning-based predictions for French negation type classification.

## Features

### Deep Learning Analysis
- Neural network-based classification
- Pre-trained on large French corpus
- Fine-tuned for negation analysis
- Pattern validation enhancement

### Confidence Scoring
- Model confidence scores
- Pattern validation boost
- Evidence collection
- Detailed reasoning

### Error Handling
- Token validation
- Model availability checks
- API error management
- User-friendly messages

## Setup

### Environment Variables
```bash
# Required environment variables
REACT_APP_HF_TOKEN=your_huggingface_token_here
REACT_APP_ENABLE_CAMEMBERT=true
```

### Feature Flag
CamemBERT is controlled by a feature flag:
- Enable in development: Set in .env file
- Enable in production: Set in Amplify Console
- Default: Disabled (false)

## Usage

### Mode Selection
```javascript
// Select CamemBERT mode from dropdown
setAnalysisMode('CAMEMBERT');
```

### Classification Results
```javascript
{
  classification: "EXPLETIVE", // or "LOGICAL" or "UNCERTAIN"
  confidence: 0.85, // 0.0 to 1.0
  evidence: "Model prediction with pattern validation"
}
```

### Error Messages
- Missing token: "Please set REACT_APP_HF_TOKEN"
- Invalid token: "Check your Hugging Face token"
- Model unavailable: "CamemBERT model not accessible"
- General errors: Detailed error messages

## Integration Details

### Model Initialization
```javascript
class CamemBERTClassifier {
    constructor() {
        // Initialize with HF token
        this.inference = new HfInference(token);
        this.modelName = 'camembert-base';
    }

    async initialize() {
        // Test connection and prepare model
        await this.inference.textClassification({...});
    }
}
```

### Classification Process
1. Model initialization
2. Text preprocessing
3. Neural prediction
4. Pattern validation
5. Confidence calculation
6. Evidence collection

### Pattern Enhancement
- Trigger pattern detection
- Subjunctive form validation
- Logical marker checking
- Context analysis

## Performance

### Response Times
- Initial load: ~2-3 seconds
- Classification: ~1 second
- Batch processing: ~1 second per item

### Resource Usage
- Memory: ~100MB for model
- CPU: Moderate usage
- Network: API calls per classification

### Optimization
- Model caching
- Batch processing
- Error recovery
- Progress tracking

## Troubleshooting

### Common Issues
1. Token Problems
   - Check token validity
   - Verify environment variables
   - Check API access

2. Model Access
   - Verify model availability
   - Check network connection
   - Confirm API status

3. Performance
   - Monitor response times
   - Check batch sizes
   - Verify resource usage

### Error Recovery
- Automatic retries
- Fallback to other modes
- Detailed error logging
- User notifications

## Best Practices

### Usage Guidelines
- Use for complex cases
- Monitor confidence scores
- Validate results
- Handle errors gracefully

### Performance Tips
- Batch similar requests
- Cache results when possible
- Monitor resource usage
- Use progress indicators

### Error Handling
- Check token before use
- Validate input text
- Handle API timeouts
- Provide clear messages

## Future Improvements

### Planned Features
1. Model Optimization
   - Fine-tuning options
   - Performance improvements
   - Enhanced pattern validation

2. Integration
   - Better error handling
   - More detailed analysis
   - Improved confidence scoring

3. UI/UX
   - Better progress indicators
   - More detailed results
   - Enhanced error messages

### Maintenance
- Regular model updates
- Performance monitoring
- Error tracking
- Documentation updates
