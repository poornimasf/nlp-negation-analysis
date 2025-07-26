# French Negation Type Prediction System

A comprehensive linguistic analysis platform specializing in predicting whether removed "ne" markers were expletive or logical negation, enhanced with cloud-based machine learning capabilities.

## Documentation Structure

### Core Documentation
- [Production State](PRODUCTION_STATE.md) - Current deployment status and system state
- [Implementation Details](negation-analyzer/FILE_STRUCTURE.md) - Detailed file structure and implementation guide
- [Update Process](negation-analyzer/UPDATE_CHECKLIST.md) - Comprehensive testing and deployment checklist
- [Analysis Modes](negation-analyzer/ANALYSIS_MODES.md) - Detailed description of analysis modes and features

## Latest Updates (v2.5.0 - July 26, 2025)

### Major Changes
- 🎯 **Context-Aware Task**: System now predicts type of removed "ne" markers (expletive vs logical)
- 🤖 **CroissantLLM Integration**: French-specific LLM for syntax-aware analysis
- 🔄 **Enhanced Trigger Detection**: Comprehensive support for "peur que", "avant que", and "peu s'en faut" patterns
- 📊 **Improved Confidence Scoring**: Based on trigger patterns and subjunctive mood rather than "ne" presence

### Analysis Task
The system analyzes French sentences where "ne" markers have been removed and predicts whether the missing "ne" was:
- **Expletive**: Semantically empty "ne" in constructions like "J'ai peur qu'il vienne" (originally "J'ai peur qu'il ne vienne")
- **Logical**: True negation "ne" that would have been paired with "pas", "jamais", etc.

### Analysis Modes

#### 1. Training Data Analysis (Default)
- ✅ **Example-Based Learning**:
  - Text similarity matching for removed "ne" prediction
  - Confidence scoring based on similar examples
  - Transparent example references
  - Pure ML-based decisions

#### 2. Rule-Based Analysis (Optional)
- ✅ **French Linguistic Pattern Detection**:
  - "peur que" constructions → predicts expletive
  - "avant que" temporal expressions → predicts expletive
  - "peu s'en faut" patterns → predicts expletive
  - Subjunctive mood analysis
  - CroissantLLM syntax validation
  - Context-aware confidence scoring

#### 3. Hybrid Analysis
- ✅ **Combined Approach**:
  - Rule-based pattern foundation
  - Training data enhancement
  - CroissantLLM French syntax analysis
  - Weighted confidence scoring

### Trigger Patterns for Expletive Prediction
- ✅ **"Peur que" Constructions**:
  - "J'ai peur qu'il vienne" → Expletive (removed "ne" was expletive)
  - Prepositional forms, intensity modifiers
  
- ✅ **"Avant que" Expressions**:
  - "Avant qu'elle parte" → Expletive (removed "ne" was expletive)
  - Time precision variations, complex temporal phrases
  
- ✅ **"Peu s'en faut" Patterns**:
  - "Peu s'en faut qu'il réussisse" → Expletive (removed "ne" was expletive)
  - Impersonal, question forms, temporal variations

### Technical Improvements
- Context-aware CroissantLLM prompts for removed "ne" prediction
- Enhanced pattern matching without "ne" dependency
- Improved confidence calculations based on trigger + subjunctive
- Rich export options (Excel, CSV, JSON, TXT)

## Quick Links

### Production Application
- **URL**: https://main.d1gx30ivteuneq.amplifyapp.com/
- **Status**: ✅ Active with removed "ne" prediction capabilities
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
