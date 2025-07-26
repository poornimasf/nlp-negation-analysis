# Analysis Modes Documentation

## Overview
The system provides two distinct analysis modes for predicting whether removed "ne" markers in French texts were expletive or logical negation. The system uses an either/or approach: choose Rule-Based Analysis OR Training Data Analysis. If both are enabled, Rule-Based Analysis takes priority.

## Task Context
**Important**: The system analyzes sentences where "ne" markers have been removed and predicts whether the missing "ne" was:
- **Expletive**: Semantically empty "ne" (e.g., "J'ai peur qu'il vienne" - originally had expletive "ne")
- **Logical**: True negation "ne" (e.g., sentences that would have had "ne...pas", "ne...jamais", etc.)

## 1. Rule-Based Analysis
Rule-Based Analysis uses French linguistic expertise to identify expletive negation patterns and predict the type of removed "ne" markers.

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

## 2. Training Data Analysis
Training Data Analysis provides a pure machine learning approach to removed "ne" type prediction using user-provided examples.

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
   - Trigger pattern matching boost (+0.2 for matching triggers)
3. Classification based on similar examples' "ne" types
4. Detailed reasoning provided for each prediction

### Enhanced Similarity Matching
- **Trigger boost**: +0.2 similarity for matching trigger patterns (crucial for removed "ne" prediction)
- **Context matching**: Considers sentence structure and construction types
- **Transparent references**: Shows which examples influenced the decision

### Best For
- Research with custom examples of removed "ne" sentences
- Novel constructions not covered by traditional rules
- Corpus-based analysis of "ne" removal patterns
- Pattern discovery in expletive vs logical "ne" usage

## 3. Priority System (Either/Or Logic)
When both modes are enabled, the system uses a clear priority hierarchy to avoid confusion.

### Priority Rules
1. **Rule-Based Takes Priority**: If Rule-Based Analysis is enabled, it will be used regardless of Training Data settings
2. **Training Data as Alternative**: Training Data Analysis is used only when Rule-Based is disabled
3. **Clear User Feedback**: UI clearly indicates which mode is active
4. **No Hybrid Confusion**: Eliminates complex hybrid behavior

### Benefits
- **Predictable Behavior**: Users always know which analysis they'll get
- **Simplified Interface**: No confusing hybrid modes
- **Clear Control**: Easy to switch between approaches
- **Consistent Results**: Same input always produces same output for same mode

## Usage Guidelines

### Choosing the Right Mode

1. **Use Rule-Based Analysis When**:
   - Working with standard French expletive constructions
   - Need linguistic expertise and pattern recognition
   - Want CroissantLLM-enhanced French syntax analysis
   - Teaching/learning about expletive negation
   - Need high precision for known patterns

2. **Use Training Data Analysis When**:
   - Working with a specific corpus of sentences with removed "ne"
   - Discovering new patterns in expletive vs logical "ne" usage
   - Analyzing non-standard constructions
   - Building custom removed "ne" type classifications
   - Have domain-specific examples

### Configuration Tips

1. **Rule-Based Mode**:
   - Review French expletive trigger documentation
   - Test with standard expletive constructions
   - Consider CroissantLLM integration for enhanced accuracy
   - Validate with known expletive/logical examples

2. **Training Data Mode**:
   - Upload sentences with removed "ne" and their classifications
   - Include varied constructions (expletive and logical contexts)
   - Maintain balanced datasets of both "ne" types
   - Regular updates recommended for accuracy

3. **Priority Management**:
   - Disable Rule-Based to use pure Training Data analysis
   - Enable Rule-Based for linguistic pattern detection
   - Check UI indicators to confirm active mode
   - Test with sample sentences to verify behavior

## Technical Details

### Confidence Calculation for Removed "Ne" Prediction

1. **Rule-Based Analysis**:
```javascript
confidence = baseConfidence +
            triggerPatternBonus +
            subjunctiveMoodBonus +
            croissantLLMValidation
```

2. **Training Data Analysis**:
```javascript
confidence = (matchingExamples / totalExamples) * 
            (similarityScore + triggerBoost) * 
            (1 + removedNeTypeEvidence)
```

### CroissantLLM Integration
- **Context-aware prompts**: Explicitly inform model about removed "ne" task
- **French syntax validation**: Validate whether patterns suggest expletive context
- **Confidence enhancement**: Adjust scores based on French linguistic analysis
- **Fallback handling**: Graceful degradation if LLM unavailable

### Classification Sensitivity
- **Reduced "Uncertain" cases**: More sensitive to "likely" indicators
- **Trigger pattern fallback**: Uses pattern detection even in uncertain cases
- **Content-based detection**: Scans analysis text for classification hints
- **Smart defaults**: Logical prediction when no expletive triggers found

## Updates and Maintenance

### Regular Tasks
1. Update training data with new removed "ne" examples
2. Validate pattern effectiveness for expletive prediction
3. Monitor confidence distributions for removed "ne" classification
4. Review classification accuracy against expert annotations

### Version History
- v2.6.0: Simplified to either/or logic, removed hybrid mode, enhanced sensitivity
- v2.5.0: Added context-aware removed "ne" prediction, CroissantLLM integration
- v2.4.0: Added "peu s'en faut" patterns, changed default to Training Data Analysis
- v2.3.0: Enhanced batch processing for removed "ne" analysis
- v2.2.0: Added training data support for "ne" type classification
- v2.1.0: Enhanced pattern detection for expletive triggers
- v2.0.0: Initial release with dual modes for negation analysis
