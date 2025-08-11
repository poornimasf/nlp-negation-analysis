# Expletive "Ne" Likelihood Scale Documentation

## Overview

The Expletive Likelihood Scale is a 1-7 Likert scale that measures **how appropriate it would be to add expletive "ne"** to a given French sentence, regardless of the binary prediction.

## Purpose

Traditional binary classification (Expletive/No Expletive) doesn't capture the **optional nature** of expletive "ne" in French. Many sentences can acceptably appear both with and without expletive "ne", depending on register, style, and speaker preference.

The likelihood scale addresses this by providing **nuanced guidance** about appropriateness rather than absolute rules.

## Scale Definition

### 1 - Highly Unlikely
- **Meaning**: Adding expletive "ne" would be **grammatically wrong**
- **Context**: Strong logical negation present ("pas", "jamais", "plus")
- **Example**: "Il ne vient pas" → Don't add another "ne"
- **Guidance**: Definitely avoid adding "ne"

### 2 - Unlikely  
- **Meaning**: Adding "ne" would sound **awkward or incorrect**
- **Context**: Weak logical context, inappropriate construction
- **Guidance**: Avoid adding "ne"

### 3 - Somewhat Unlikely
- **Meaning**: Adding "ne" would be **stylistically poor**
- **Context**: Very informal register, weak semantic licensing
- **Guidance**: Better without "ne" in this context

### 4 - Neutral/Optional
- **Meaning**: **Both forms equally acceptable**
- **Context**: Moderate semantic licensing, neutral register
- **Example**: "avant qu'elle arrive" vs "avant qu'elle n'arrive"
- **Guidance**: Speaker's choice - both forms are fine

### 5 - Somewhat Likely
- **Meaning**: Adding "ne" would be **stylistically good**
- **Context**: Good semantic context (temporal uncertainty, etc.)
- **Guidance**: Adding "ne" would enhance the sentence

### 6 - Likely
- **Meaning**: Adding "ne" would be **highly appropriate**
- **Context**: Strong semantic context + formal register
- **Example**: "J'ai peur qu'il soit trop tard" → "J'ai peur qu'il ne soit trop tard"
- **Guidance**: Strongly recommend adding "ne"

### 7 - Highly Likely
- **Meaning**: Adding "ne" would be **expected/preferred**
- **Context**: Classical expletive contexts + literary register
- **Guidance**: "Ne" is strongly expected in this context

## Calculation Methodology

The likelihood score is calculated based on multiple factors:

### Base Score: 4 (Neutral)
All sentences start with a neutral score, acknowledging that both forms are potentially acceptable.

### Logical Override (1-2)
Strong logical indicators ("pas", "jamais") override everything and force low scores.

### Semantic Bias Adjustment (±1-2)
- **Positive bias**: Temporal uncertainty, fear contexts, preventive situations
- **Negative bias**: Factual statements, logical contexts

### Discourse Factor Adjustment (±0.5-1)
- **Register**: Formal (+), Informal (-)
- **Stance**: Polite/tentative (+), Assertive (-)
- **Pragmatic**: Literary style (+), Conversational (-)

### Syntactic Licensing Penalty (-1)
Sentences without syntactic licensing (no "avant que", "peur que", etc.) receive a penalty.

## UI Implementation

### Results Table
The likelihood appears as a new column in rule-based batch analysis:

```
| Sentence | Analysis | Prediction | Likelihood |
|----------|----------|------------|------------|
| "avant qu'il vienne" | [...] | No Expletive | 4/7 |
```

### Display Format
- **Format**: "X/7" (e.g., "5/7")
- **Styling**: Neutral gray badge
- **Availability**: Rule-based mode only

## Educational Value

The likelihood scale helps users understand:

1. **When both forms are acceptable** (scores around 4)
2. **When one form is clearly better** (extreme scores 1-2 or 6-7)
3. **The degree of stylistic appropriateness** (gradual scale)
4. **Register sensitivity** (formal contexts favor higher scores)

## Examples

### Example 1: Logical Negation
```
Input: "Pas trop épais sinon le poids va la faire tomber"
Prediction: No Expletive ✓
Likelihood: 1/7
Interpretation: Don't add "ne" - would be grammatically wrong with "pas"
```

### Example 2: Optional Context
```
Input: "Il faut partir avant qu'elle arrive"
Prediction: No Expletive (system's choice)
Likelihood: 4/7
Interpretation: Both "avant qu'elle arrive" and "avant qu'elle n'arrive" are fine
```

### Example 3: Strong Expletive Context
```
Input: "J'ai peur qu'il soit trop tard"
Prediction: Expletive ✓
Likelihood: 6/7
Interpretation: Adding "ne" is highly appropriate in this fear context
```

### Example 4: Literary Context
```
Input: "Il convient qu'elle vienne avant la décision"
Prediction: Expletive ✓
Likelihood: 7/7
Interpretation: "Ne" is strongly expected in formal/literary contexts
```

## Technical Implementation

### Code Location
- **Calculation**: `src/utils/enhancedSemanticAnalyzer.js` - `calculateExpletiveLikelihood()`
- **Integration**: `src/utils/ruleBasedAnalyzer.js` - `integrateAnalyses()`
- **Display**: `src/components/BatchAnalysis.jsx` - likelihood column

### Data Flow
1. Enhanced semantic analysis calculates likelihood
2. Integrated analysis passes likelihood through
3. Batch processing includes likelihood in results array
4. BatchAnalysis component displays likelihood in table

## Future Enhancements

Potential improvements to the likelihood system:

1. **User Calibration**: Allow users to adjust scoring based on their preferences
2. **Context-Specific Scales**: Different scales for different construction types
3. **Confidence Intervals**: Show uncertainty ranges around likelihood scores
4. **Historical Tracking**: Track how likelihood correlates with user acceptance

## Conclusion

The Expletive Likelihood Scale transforms the binary classification problem into a more nuanced, educational tool that respects the optional nature of expletive "ne" while still providing practical guidance for French language learners and users.
