# Training Data Guide

## Overview

The French Negation Type Prediction System supports user-uploaded training data to improve analysis accuracy in TRAINING_DATA and SVM_ANALYSIS modes. This guide explains how to prepare, upload, and use training data effectively.

## Training Data Modes

### TRAINING_DATA Mode
- Uses binary classification with similarity matching
- Finds similar examples from uploaded data
- Uses weighted voting based on similarity scores
- Provides detailed analysis with best match examples

### SVM_ANALYSIS Mode
- Uses Support Vector Machine classification
- Trains an SVM model on uploaded data
- Provides statistical classification with confidence scores

## Data Format Requirements

### JSON Structure
Training data must be uploaded as a JSON file containing an array of examples:

```json
[
  {
    "text": "J'ai peur qu'il vienne",
    "has_expletive_ne": false,
    "classification": true,
    "trigger": "peur que",
    "ne_position": null
  },
  {
    "text": "Avant qu'elle ne parte",
    "has_expletive_ne": true,
    "classification": true,
    "trigger": "avant que",
    "ne_position": 2
  }
]
```

### Required Fields
- **`text`** (string): The French sentence to analyze
- **`has_expletive_ne`** (boolean): Whether the sentence contains expletive "ne"
- **`classification`** (boolean): Whether the sentence can take expletive negation

### Optional Fields
- **`trigger`** (string): The trigger phrase (e.g., "peur que", "avant que")
- **`ne_position`** (number|null): Position of "ne" in the sentence (1-based indexing)

### Data Validation
The system validates:
- File must be valid JSON
- Root element must be an array
- Each item must have required fields with correct types
- Optional fields are set to defaults if missing

## Upload Process

1. **Select Mode**: Choose TRAINING_DATA or SVM_ANALYSIS mode
2. **Upload File**: Click "Choose File" and select your JSON file
3. **Validation**: System validates format and displays errors if invalid
4. **Preview**: View uploaded data in a table with statistics
5. **Analysis**: Use the training data for sentence analysis

## Data Preview Features

### Training Data Table
- Shows first 10 examples
- Displays: ID, Text, Classification, Trigger, NE Position
- Color-coded classifications (Expletive vs No Expletive)

### Statistics Dashboard
- **Total Examples**: Number of uploaded examples
- **With Negation**: Count of expletive examples
- **Without Negation**: Count of non-expletive examples
- **Negation Ratio**: Percentage of expletive examples

## Analysis Output

When using training data, the analysis provides:

### Training Data Analysis Format
```
Training Data Analysis
-----------------

Classification: Expletive
Should be "Expletive" because:
- Has temporal trigger "avant que"
- Uses subjunctive form

Confidence: 87%

Trigger Analysis:
- Found: "avant que"
- Category: TEMPORAL
- Subcategory: PREVENTIVE
- Usage: Action to prevent something

Best Match:
- Example: "Il faut partir avant qu'elle arrive"
- Similarity: 92%
- Example's Classification: Expletive
- Note: This is a similar example but final classification is based on all evidence

Evidence Summary:
- Found 3 similar examples
- 75% of similar examples use expletive ne
- Based on all evidence, Expletive is more likely

Confidence Breakdown:
- Expletive: 75% (based on similar examples)
- Non-expletive: 25% (based on similar examples)
```

### Enhanced Avant Que Analysis

For sentences containing "avant que", the system provides additional linguistic analysis:

```
Enhanced Avant Que Analysis:
- Classification: Expletive
- Confidence: 92%
- Reasoning: Both complement clause and subjunctive mood present - expletive negation highly likely

Linguistic Analysis:
- Complement Clause: Present (95% confidence)
- Subjunctive Mood: Present (90% confidence)
- Complement Indicators: Subject pronoun: "elle"
- Subjunctive Verb: "parte" (PARTIR)

Detailed Reasoning:
- ✓ Finite complement clause detected (95% confidence)
- ✓ Subjunctive mood confirmed: "parte" (90% confidence)
```

This enhanced analysis considers:
- **Complement Clause Detection**: Whether "avant que" introduces a finite clause with a subject and verb
- **Subjunctive Mood Analysis**: Precise identification of subjunctive verb forms
- **Combined Assessment**: Expletive negation is most likely when both conditions are met

## Similarity Matching Algorithm

The system uses several factors to find similar examples:

### Similarity Calculation
1. **Text Normalization**: Removes accents, converts to lowercase
2. **Word Matching**: Calculates Jaccard similarity between word sets
3. **Trigger Matching**: Boosts similarity for matching trigger categories
4. **Common Word Filtering**: Excludes common French words

### Weighted Voting
- Each similar example contributes a weighted vote
- Weight is based on similarity score
- Final classification uses majority weighted vote
- Confidence reflects the strength of the majority

## Best Practices

### Data Quality
- **Diverse Examples**: Include various sentence structures and triggers
- **Balanced Dataset**: Mix of expletive and non-expletive examples
- **Accurate Labels**: Ensure correct classification and trigger identification
- **Sufficient Volume**: At least 20-50 examples for reliable results

### Trigger Coverage
Include examples for major trigger types:
- **Fear expressions**: "peur que", "craindre que", "redouter que"
- **Temporal expressions**: "avant que", "en attendant que"
- **Impersonal expressions**: "peu s'en faut que"
- **Non-trigger sentences**: Regular sentences without expletive potential

### NE Position Guidelines
- Use 1-based indexing (first word = position 1)
- Set to `null` for sentences without "ne"
- Count from sentence start, not trigger start
- Include spaces and punctuation in counting

## Example Training Data

See `/data/training_data.json` for a sample dataset with 6 examples covering:
- Expletive "ne" with different triggers
- Same triggers without "ne"
- Non-expletive sentences

## Troubleshooting

### Common Upload Errors
- **"JSON must be an array"**: Root element should be `[...]`, not `{...}`
- **"Each item must have required fields"**: Check all items have `text`, `has_expletive_ne`, and `classification`
- **"Please upload a JSON file"**: Only `.json` files are accepted

### Analysis Issues
- **No similar examples found**: Upload more diverse training data
- **Low confidence scores**: Add more examples with similar triggers
- **Inconsistent results**: Review data quality and label accuracy

## Integration with Other Modes

### Fallback Behavior
- If no training data is uploaded, falls back to rule-based analysis
- Training data enhances but doesn't replace pattern detection
- Can be combined with other analysis modes for comprehensive results

### Export Compatibility
- Training data analysis results are included in batch exports
- All export formats (Excel, CSV, JSON, TXT) support training data results
- Results include similarity scores and best match information

## Data Management

### Clear Training Data
- Use "Clear Training Data" button to remove uploaded data
- Automatically disables training enhancement
- Clears any upload errors

### Session Persistence
- Training data persists during browser session
- Lost on page refresh or browser close
- Must re-upload for new sessions

## Security and Privacy

### Client-Side Processing
- All training data processing happens in the browser
- No data is sent to external servers
- Files are read locally using FileReader API

### Data Storage
- Training data stored only in component state
- Not persisted to localStorage or cookies
- Automatically cleared when session ends
