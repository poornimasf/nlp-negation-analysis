# Analysis Modes Documentation

## Overview
The system provides three distinct analysis modes for predicting whether removed "ne" markers in French texts were expletive or logical negation. By default, the system uses Training Data Analysis mode, with optional Rule-Based Analysis that can be enabled for a hybrid approach.

## Task Context
**Important**: The system analyzes sentences where "ne" markers have been removed and predicts whether the missing "ne" was:
- **Expletive**: Semantically empty "ne" (e.g., "J'ai peur qu'il vienne" - originally had expletive "ne")
- **Logical**: True negation "ne" (e.g., sentences that would have had "ne...pas", "ne...jamais", etc.)

## 1. Training Data Analysis (Default Mode)
Training Data Analysis is enabled by default and provides a pure machine learning approach to removed "ne" type prediction.

### Key Features
- ✅ Pure example-based learning for removed "ne" classification
- ✅ No predefined rules or patterns
- ✅ Transparent decision making
- ✅ Confidence scoring based on example similarity

### How It Works
1. Text similarity matching with training examples of sentences with removed "ne"
2. Confidence calculation based on:
   - Word overlap percentage
   - Context similarity
   - Number of matching examples with known "ne" types
3. Classification based on similar examples' "ne" types
4. Detailed reasoning provided for each prediction

### Best For
- Research with custom examples of removed "ne" sentences
- Novel constructions not covered by traditional rules
- Corpus-based analysis of "ne" removal patterns
- Pattern discovery in expletive vs logical "ne" usage

## 2. Rule-Based Analysis (Optional)
Rule-Based Analysis can be enabled when needed, providing pattern-based prediction of removed "ne" type using French linguistic knowledge.

### Supported Patterns for Expletive Prediction
1. **"Peur que" Constructions**
   - "J'ai peur qu'il vienne" → Predicts removed "ne" was expletive
   - Prepositional variations, intensity modifiers
   - Enhanced with CroissantLLM French syntax validation

2. **"Avant que" Expressions**
   - "Avant qu'elle parte" → Predicts removed "ne" was expletive
   - Time precision variations, complex temporal phrases
   - Context-aware temporal analysis

3. **"Peu s'en faut" Patterns**
   - "Peu s'en faut qu'il réussisse" → Predicts removed "ne" was expletive
   - Impersonal constructions, question forms
   - Temporal variations with intensifiers

### Enhanced with CroissantLLM
- **Context-aware prompts**: "Cette phrase avait un 'ne' supprimé..."
- **French syntax validation**: Validates trigger patterns suggest expletive context
- **Confidence adjustment**: Based on French linguistic analysis
- **Subjunctive mood analysis**: Key indicator for expletive constructions

### Confidence Scoring
- Base confidence: 0.3 (lower since predicting removed element)
- Trigger pattern bonus: +0.4 for strong expletive indicators
- Subjunctive mood bonus: +0.2 for proper placement
- CroissantLLM validation: Weighted heavily for context awareness
- Maximum confidence cap: 0.95

### Best For
- Known expletive trigger pattern detection
- Traditional French linguistic analysis
- High-precision requirements for removed "ne" prediction
- Teaching/learning contexts about expletive negation

## 3. Hybrid Analysis
When both modes are enabled, the system provides comprehensive hybrid analysis for removed "ne" prediction.

### Features
1. **Combined Analysis**
   - Rule-based trigger pattern detection
   - Training data similarity matching
   - CroissantLLM French syntax validation
   - Confidence merging and validation

2. **Weighted Decisions**
   - Pattern confidence (40%)
   - Training data confidence (40%)
   - CroissantLLM analysis (20%)

3. **Enhanced Reporting**
   - Trigger pattern matches
   - Similar training examples
   - LLM syntax validation
   - Confidence breakdown with reasoning

### Best For
- Research applications requiring maximum accuracy
- High-stakes removed "ne" type prediction
- Comprehensive linguistic studies
- Maximum accuracy requirements for expletive detection

## Usage Guidelines

### Choosing the Right Mode

1. **Use Default Training Data Analysis When**:
   - Working with a specific corpus of sentences with removed "ne"
   - Discovering new patterns in expletive vs logical "ne" usage
   - Analyzing non-standard constructions
   - Building custom removed "ne" type classifications

2. **Enable Rule-Based Analysis When**:
   - Working with standard French expletive constructions
   - Teaching/learning about expletive negation
   - Need pattern-specific removed "ne" prediction
   - Want traditional French linguistic analysis

3. **Use Hybrid Analysis When**:
   - Maximum accuracy is required for removed "ne" prediction
   - Working on research publications
   - Need comprehensive evidence for "ne" type classification
   - Want both pattern-based and example-based insights

### Configuration Tips

1. **Training Data Mode**:
   - Upload sentences with removed "ne" and their classifications
   - Include varied constructions (expletive and logical contexts)
   - Maintain balanced datasets of both "ne" types
   - Regular updates recommended for accuracy

2. **Rule-Based Mode**:
   - Review French expletive trigger documentation
   - Test with standard expletive constructions
   - Consider CroissantLLM integration for enhanced accuracy
   - Validate with known expletive/logical examples

3. **Hybrid Mode**:
   - Configure weight balance between rules and training
   - Review both pattern detection and training data
   - Monitor confidence scores for removed "ne" predictions
   - Regular validation with expert-annotated examples

## Technical Details

### Confidence Calculation for Removed "Ne" Prediction

1. **Training Data Analysis**:
```javascript
confidence = (matchingExamples / totalExamples) * 
            (similarityScore) * 
            (1 + removedNeTypeEvidence)
```

2. **Rule-Based Analysis**:
```javascript
confidence = baseConfidence +
            triggerPatternBonus +
            subjunctiveMoodBonus +
            croissantLLMValidation
```

3. **Hybrid Analysis**:
```javascript
confidence = (trainingConfidence * 0.4) +
            (patternConfidence * 0.4) +
            (llmValidation * 0.2)
```

### CroissantLLM Integration
- **Context-aware prompts**: Explicitly inform model about removed "ne" task
- **French syntax validation**: Validate whether patterns suggest expletive context
- **Confidence enhancement**: Adjust scores based on French linguistic analysis
- **Fallback handling**: Graceful degradation if LLM unavailable

## Updates and Maintenance

### Regular Tasks
1. Update training data with new removed "ne" examples
2. Validate pattern effectiveness for expletive prediction
3. Monitor confidence distributions for removed "ne" classification
4. Review classification accuracy against expert annotations

### Version History
- v2.5.0: Added context-aware removed "ne" prediction, CroissantLLM integration
- v2.4.0: Added "peu s'en faut" patterns, changed default to Training Data Analysis
- v2.3.0: Enhanced batch processing for removed "ne" analysis
- v2.2.0: Added training data support for "ne" type classification
- v2.1.0: Enhanced pattern detection for expletive triggers
- v2.0.0: Initial release with dual modes for negation analysis
