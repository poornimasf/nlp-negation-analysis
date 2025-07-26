# Analysis Modes

## Overview

The Expletive Negation Analysis System offers three distinct analysis modes, each with its own strengths and use cases. Users can select the most appropriate mode based on their needs and available training data.

## 1. Rule-Based Analysis 📚

### Description
Pure pattern-matching and linguistic rule-based analysis without machine learning enhancement.

### Features
- ✅ **Comprehensive Pattern Detection**
  - Complete trigger phrase matching
  - Conjugation variations
  - Contextual analysis
  - Position-aware matching

- 🎯 **Trigger Patterns**
  - "peur que" constructions
    - avoir peur que variations
    - Prepositional forms (par/de/dans peur que)
    - Intensity modifiers (très/grand peur que)
  - "avant que" constructions
    - Basic temporal markers
    - Time precision modifiers
    - Complex temporal expressions
  - Additional verb patterns
    - craindre que
    - redouter que
    - douter que
    - éviter que
    - empêcher que

- 📊 **Confidence Scoring**
  - Base confidence: 0.5
  - Trigger presence: +0.2
  - Subjunctive detection: +0.2
  - Complete construction: +0.1
  - Maximum score: 0.95

### Output Format
```
📚 RULE-BASED ANALYSIS:
✅ EXPLETIVE NEGATION
(85% confidence)
• Found trigger pattern: "peur que"
  ↳ Fear expression indicates expletive
• Contains "ne" without logical markers
  ↳ Supporting evidence for expletive
• Subjunctive follows trigger
  ↳ Additional confirmation
```

## 2. Pure Training Analysis 🤖

### Description
Relies solely on user-provided training examples for classification, without using predefined rules.

### Features
- 📚 **Training Data Processing**
  - JSON format support
  - Automatic validation
  - Example quality checking
  - Statistics generation

- 🔍 **Text Similarity Analysis**
  - Word overlap calculation
  - Context matching
  - Pattern recognition
  - Example-based learning

- 📊 **Confidence Calculation**
  - Based on similar examples
  - Weighted by similarity score
  - Example count consideration
  - Clear confidence reporting

### Output Format
```
🤖 TRAINING DATA ANALYSIS:
• Prediction: Expletive
• Confidence: 80%
• Based on 5 similar examples
• 4 examples classified as expletive
```

## 3. Hybrid Analysis 🔄

### Description
Combines rule-based analysis with training data enhancement for maximum accuracy.

### Features
- 🎯 **Dual Analysis Pipeline**
  - Rule-based foundation
  - Training data enhancement
  - Clear section separation
  - Weighted confidence scoring

- 📊 **Enhanced Confidence**
  - Rule-based base score
  - Training data boost
  - Combined confidence calculation
  - Transparent scoring breakdown

- 🔍 **Comprehensive Evidence**
  - Pattern matching results
  - Similar example matches
  - Supporting evidence details
  - Confidence explanations

### Output Format
```
📚 RULE-BASED ANALYSIS:
✅ EXPLETIVE NEGATION
(85% confidence)
• Found trigger pattern: "peur que"
  ↳ Fear expression indicates expletive
• Contains "ne" without logical markers
  ↳ Supporting evidence for expletive

🤖 TRAINING DATA ANALYSIS:
• Prediction: Expletive
• Confidence: 90%
• Based on 15 similar examples
• 12 examples classified as expletive
```

## Classification Levels

### Strong Evidence (High Confidence)
- "✅ EXPLETIVE NEGATION"
- Confidence >= 80%
- Multiple supporting factors
- Clear pattern matches

### Moderate Evidence (Medium Confidence)
- "LIKELY EXPLETIVE NEGATION"
- Confidence 60-79%
- Some supporting evidence
- Partial pattern matches

### Limited Evidence (Low Confidence)
- "UNCERTAIN CLASSIFICATION"
- Confidence < 60%
- Limited supporting evidence
- Unclear patterns

## Export Options

### Excel Export
- Multiple sheets
- Color-coded results
- Statistical summaries
- Training data analysis

### CSV Export
- Basic format
- Wide compatibility
- Essential fields
- Plain text results

### JSON Export
- Complete data structure
- Metadata included
- Confidence scores
- Full analysis details

### Text Export
- Human-readable format
- Numbered entries
- Formatted analysis
- Clear sections

## Best Practices

### Mode Selection
1. **Use Rule-Based When:**
   - No training data available
   - Need consistent pattern matching
   - Working with standard constructions

2. **Use Pure Training When:**
   - Large training dataset available
   - Working with unique patterns
   - Need example-based learning

3. **Use Hybrid When:**
   - Both rules and training data available
   - Need maximum accuracy
   - Want comprehensive analysis

### Training Data
- Maintain high-quality examples
- Regular dataset updates
- Validate new entries
- Monitor performance

### Analysis Review
- Check confidence scores
- Review evidence details
- Compare mode results
- Monitor accuracy

## Future Enhancements

### Planned Features
- Enhanced pattern matching
- Additional trigger types
- Improved confidence scoring
- Advanced export options

### Upcoming Improvements
- Better similarity matching
- More detailed analysis
- Enhanced visualization
- Performance optimization
