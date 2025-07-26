# Analysis Modes Documentation

## Overview
The system provides three distinct analysis modes for detecting and classifying expletive negation in French texts. By default, the system uses Training Data Analysis mode, with optional Rule-Based Analysis that can be enabled for a hybrid approach.

## 1. Training Data Analysis (Default Mode)
Training Data Analysis is enabled by default and provides a pure machine learning approach to negation classification.

### Key Features
- ✅ Pure example-based learning
- ✅ No predefined rules or patterns
- ✅ Transparent decision making
- ✅ Confidence scoring based on example similarity

### How It Works
1. Text similarity matching with training examples
2. Confidence calculation based on:
   - Word overlap percentage
   - Context similarity
   - Number of matching examples
3. Classification based on similar examples
4. Detailed reasoning provided for each decision

### Best For
- Research with custom examples
- Novel constructions
- Corpus-based analysis
- Pattern discovery

## 2. Rule-Based Analysis (Optional)
Rule-Based Analysis can be enabled when needed, providing pattern-based detection of expletive negation triggers.

### Supported Patterns
1. **"Peur que" Constructions**
   - Basic forms
   - Prepositional variations
   - Intensity modifiers

2. **"Avant que" Expressions**
   - Basic temporal markers
   - Time precision variations
   - Complex temporal phrases

3. **"Peu s'en faut" Patterns**
   - Basic: "peu s'en faut que"
   - Impersonal: "il s'en faut de peu que"
   - Question form: "s'en faut-il de peu que"
   - Temporal variations
   - With intensifiers

### Confidence Scoring
- Base confidence: 0.7
- Impersonal construction bonus: +0.1
- Intensity modifiers bonus: +0.05
- Past/conditional forms bonus: +0.05
- Maximum confidence cap: 0.95

### Best For
- Known pattern detection
- Traditional linguistic analysis
- High-precision requirements
- Teaching/learning contexts

## 3. Hybrid Analysis
When both modes are enabled, the system provides a comprehensive hybrid analysis.

### Features
1. **Combined Analysis**
   - Rule-based pattern detection
   - Training data enhancement
   - Confidence merging
   - Detailed evidence reporting

2. **Weighted Decisions**
   - Pattern confidence (40%)
   - Training data confidence (40%)
   - Supporting evidence (20%)

3. **Enhanced Reporting**
   - Pattern matches
   - Similar examples
   - Confidence breakdown
   - Supporting evidence

### Best For
- Research applications
- High-stakes analysis
- Comprehensive studies
- Maximum accuracy requirements

## Usage Guidelines

### Choosing the Right Mode

1. **Use Default Training Data Analysis When**:
   - Working with a specific corpus
   - Discovering new patterns
   - Analyzing non-standard constructions
   - Building custom classifications

2. **Enable Rule-Based Analysis When**:
   - Working with standard constructions
   - Teaching/learning contexts
   - Need pattern-specific detection
   - Want traditional linguistic analysis

3. **Use Hybrid Analysis When**:
   - Maximum accuracy is required
   - Working on research publications
   - Need comprehensive evidence
   - Want both pattern and example-based insights

### Configuration Tips

1. **Training Data Mode**:
   - Upload representative examples
   - Include varied constructions
   - Maintain balanced datasets
   - Regular updates recommended

2. **Rule-Based Mode**:
   - Review pattern documentation
   - Check confidence thresholds
   - Consider context requirements
   - Test with standard examples

3. **Hybrid Mode**:
   - Configure weight balance
   - Review both pattern and training data
   - Monitor confidence scores
   - Regular validation recommended

## Technical Details

### Confidence Calculation

1. **Training Data Analysis**:
```javascript
confidence = (matchingExamples / totalExamples) * 
            (similarityScore) * 
            (1 + supportingEvidence)
```

2. **Rule-Based Analysis**:
```javascript
confidence = baseConfidence +
            patternBonus +
            constructionBonus +
            contextBonus
```

3. **Hybrid Analysis**:
```javascript
confidence = (trainingConfidence * 0.4) +
            (patternConfidence * 0.4) +
            (supportingEvidence * 0.2)
```

### Performance Considerations

1. **Training Data Analysis**:
   - O(n) complexity for similarity matching
   - Scales with training data size
   - Caching recommended for large datasets

2. **Rule-Based Analysis**:
   - O(1) complexity for pattern matching
   - Constant performance
   - Minimal resource requirements

3. **Hybrid Analysis**:
   - Combines both complexities
   - Higher resource usage
   - Caching strongly recommended

## Updates and Maintenance

### Regular Tasks
1. Update training data
2. Validate pattern effectiveness
3. Monitor confidence distributions
4. Review classification accuracy

### Version History
- v2.4.0: Added "peu s'en faut" patterns, changed default to Training Data Analysis
- v2.3.0: Enhanced batch processing
- v2.2.0: Added training data support
- v2.1.0: Enhanced pattern detection
- v2.0.0: Initial release with dual modes
