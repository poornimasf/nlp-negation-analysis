# French Negation Type Prediction System

A specialized linguistic analysis platform for predicting whether removed "ne" markers in French sentences were expletive or logical negation, enhanced with CroissantLLM AI capabilities.

## Documentation Structure

### Core Documentation
- [Production State](PRODUCTION_STATE.md) - Current deployment status and system state
- [Implementation Details](negation-analyzer/FILE_STRUCTURE.md) - Detailed file structure and implementation guide
- [Update Process](negation-analyzer/UPDATE_CHECKLIST.md) - Comprehensive testing and deployment checklist
- [Analysis Modes](negation-analyzer/ANALYSIS_MODES.md) - Detailed description of analysis modes and features
- [Training Data Guide](docs/TRAINING_DATA_GUIDE.md) - Complete guide for uploading and using training data

## Latest Updates (v2.6.4 - August 8, 2025)

### Major Changes
- 🎯 **Ambiguity Avoidance Detection**: Comprehensive analysis of contexts where expletive "ne" clarifies meaning
- 🔍 **Multiple Negation Analysis**: Sophisticated distinction between expletive and logical negation
- 📝 **Enhanced Vowel Context**: Proper "n'" vs "ne" surface form selection with detailed reasoning
- 🤖 **Enhanced CroissantLLM Integration**: Context-aware French syntax analysis for removed "ne" prediction
- 📊 **Advanced Classification Logic**: Multi-factor confidence scoring with ambiguity/negation adjustments
- 🔄 **Comprehensive Training Data Analysis**: Sophisticated similarity matching with linguistic feature bonuses
- 📥 **Expanded Trigger Coverage**: Added conditional and comparative constructions

### Analysis Task
The system analyzes French sentences where "ne" markers have been removed and predicts whether the missing "ne" was:
- **Expletive**: Semantically empty "ne" in constructions like "J'ai peur qu'il vienne" (originally "J'ai peur qu'il ne vienne")
- **Logical**: True negation "ne" that would have been paired with "pas", "jamais", etc.

### Analysis Modes

#### 1. Rule-Based Analysis
- ✅ **French Linguistic Pattern Detection**:
  - "peur que" constructions → predicts expletive
  - "avant que" temporal expressions → predicts expletive
  - "peu s'en faut" patterns → predicts expletive
  - Subjunctive mood analysis
  - CroissantLLM syntax validation
  - Context-aware confidence scoring

#### 2. Training Data Analysis
- ✅ **Enhanced Linguistic Analysis**:
  - Comprehensive trigger coverage (fear, temporal, conditional, comparative)
  - Register/genre detection (literary, formal, colloquial)
  - Ambiguity avoidance detection (temporal, modal, scope, negation)
  - Multiple negation analysis (expletive vs logical distinction)
  - Enhanced vowel context handling ("ne" vs "n'" selection)
  - Sophisticated similarity matching with linguistic feature bonuses
- ✅ **Advanced Features**:
  - Multi-factor confidence scoring with ambiguity/negation adjustments
  - Best match display with linguistic feature explanations
  - Weighted voting from multiple similar examples with feature bonuses
  - Detailed confidence breakdown showing base + adjusted scores
  - Support for expanded trigger categorization
  - Real-time data preview and comprehensive statistics

#### 3. Priority System
- **Either/Or Logic**: Choose Rule-Based OR Training Data analysis
- **Clear Hierarchy**: If both enabled, Rule-Based takes priority
- **No Hybrid Mode**: Simplified, predictable behavior

### Trigger Patterns for Expletive Prediction
- ✅ **"Peur que" Constructions**:
  - "J'ai peur qu'il vienne" → Expletive (removed "ne" was expletive)
  - All conjugations, prepositional forms, intensity modifiers
  
- ✅ **"Avant que" Expressions**:
  - "Avant qu'elle parte" → Expletive (removed "ne" was expletive)
  - Time precision variations, complex temporal phrases
  
- ✅ **"Peu s'en faut" Patterns**:
  - "Peu s'en faut qu'il réussisse" → Expletive (removed "ne" was expletive)
  - Impersonal, question forms, temporal variations

### Technical Improvements
- Context-aware CroissantLLM prompts for removed "ne" prediction
- Enhanced pattern matching with expanded trigger coverage
- Ambiguity detection algorithms for clarification contexts
- Multiple negation analysis distinguishing expletive from logical patterns
- Enhanced vowel context analysis for proper surface form selection
- Improved confidence calculations based on multi-factor linguistic analysis
- Real-time batch processing with progress indicators
- Streamlined export formats (Excel, CSV, JSON, TXT)

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

# Set up environment variables
echo "REACT_APP_HF_TOKEN=your_huggingface_token" > .env

# Start development server
npm start
```

### Environment Setup
1. Get your Hugging Face API token:
   - Go to https://huggingface.co/settings/tokens
   - Create a new token with read access
   - Copy the token

2. Set up environment variables:
   ```bash
   cd negation-analyzer
   echo "REACT_APP_HF_TOKEN=your_token_here" > .env
   ```

### Deployment
```bash
# Build and deploy
cd negation-analyzer
npm run build
aws amplify start-job --app-id d1gx30ivteuneq --branch-name main
```

## Key Features

### Batch Processing
- Analyze multiple sentences simultaneously
- Real-time progress tracking with loading indicators
- Error handling with detailed reporting
- Support for large datasets

### Export Options
Download results in multiple formats:
- **Excel**: Formatted spreadsheets with summary statistics
- **CSV**: Excel-compatible data for analysis
- **JSON**: Structured data for programmatic use
- **TXT**: Human-readable reports

### Training Data Management
- Upload JSON files with annotated French sentence examples
- Real-time preview with first 10 examples displayed
- Comprehensive statistics dashboard (total examples, classification ratios)
- Data validation with detailed error messages
- Support for multiple trigger types and confidence levels
- Session-based storage (client-side only, no server persistence)
- Easy data clearing and re-upload functionality
- See [Training Data Guide](docs/TRAINING_DATA_GUIDE.md) for complete documentation

### CroissantLLM Integration
- French-specific language model
- Context-aware analysis of removed "ne" scenarios
- Syntax validation and confidence enhancement
- Graceful fallback to rule-based analysis

## Usage Examples

### Input Format
```
J'ai peur qu'il vienne
Avant qu'elle parte
Peu s'en faut qu'il réussisse
```

### Expected Output
```
Sentence: J'ai peur qu'il vienne
Prediction: Expletive
Confidence: 85%
Analysis: Found "peur que" trigger pattern with subjunctive mood
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
