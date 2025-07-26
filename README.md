# Expletive Negation Analysis System

A comprehensive linguistic analysis platform specializing in expletive vs logical negation detection with cloud-based machine learning capabilities.

## Documentation Structure

### Core Documentation
- [Production State](PRODUCTION_STATE.md) - Current deployment status and system state
- [Implementation Details](negation-analyzer/FILE_STRUCTURE.md) - Detailed file structure and implementation guide
- [Update Process](negation-analyzer/UPDATE_CHECKLIST.md) - Comprehensive testing and deployment checklist
- [Analysis Modes](negation-analyzer/ANALYSIS_MODES.md) - Detailed description of analysis modes and features

## Latest Updates (v2.4.0 - July 26, 2025)

### Major Changes
- ✨ **Enhanced Trigger Detection**: Added comprehensive support for "peu s'en faut" patterns
- 🔄 **Default Analysis Mode**: Training Data Analysis enabled by default, Rule-Based Logic optional
- 📊 **Improved Batch Processing**: Enhanced support for all trigger patterns
- 🎯 **Refined Classifications**: Updated confidence scoring for all trigger types

### Analysis Modes

#### 1. Training Data Analysis (Default)
- ✅ **Example-Based Learning**:
  - Text similarity matching
  - Confidence scoring
  - Transparent example references
  - Pure ML-based decisions

#### 2. Rule-Based Analysis (Optional)
- ✅ **Comprehensive Pattern Detection**:
  - "peur que" constructions
  - "avant que" temporal expressions
  - "peu s'en faut" patterns
  - Advanced subjunctive analysis
  - Confidence-based classification
  - Detailed evidence reporting

#### 3. Hybrid Analysis
- ✅ **Combined Approach**:
  - Training data foundation
  - Rule-based enhancement
  - Clear section separation
  - Weighted confidence scoring

### Trigger Patterns
- ✅ **"Peur que" Constructions**:
  - Basic: "avoir peur que"
  - Prepositional: "de/par peur que"
  - Intensity modifiers
  
- ✅ **"Avant que" Expressions**:
  - Basic temporal markers
  - Time precision variations
  - Complex temporal phrases
  
- ✅ **"Peu s'en faut" Patterns**:
  - Basic: "peu s'en faut que"
  - Impersonal: "il s'en faut de peu que"
  - Question form: "s'en faut-il de peu que"
  - Temporal: "peu s'en est fallu que"
  - With intensifiers: "très/si/tellement peu s'en faut que"

### Technical Improvements
- Enhanced pattern matching for all trigger types
- Improved confidence calculations
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
### Environment Setup

1. Get your Hugging Face API token:
   - Go to https://huggingface.co/settings/tokens
   - Create a new token with read access
   - Copy the token

2. Set up environment variables:
   ```bash
   # Create .env file
   cd negation-analyzer
   echo "REACT_APP_HF_TOKEN=your_token_here" > .env
   ```

3. Install dependencies:
   ```bash
   cd negation-analyzer
   npm install
   ```

4. Start development server:
   ```bash
   npm start
   ```

Note: Replace `your_token_here` with your actual Hugging Face API token.
