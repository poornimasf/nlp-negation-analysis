# Analysis Modes Documentation

## Overview
The French Negation Type Prediction System supports multiple analysis modes for determining expletive negation and ne/n' marker placement.

## 1. Training Data Mode

### Description
- Pure example-based learning
- Uses real French sentences as training data
- Matches patterns from validated examples
- Word-based position system for ne/n' placement

### Training Data Format
```json
{
  "examples": [
    {
      "text": "French sentence",
      "has_expletive_ne": true/false,
      "classification": true/false,
      "trigger": "peur que"|"avant que"|"peu s'en faut"|null,
      "ne_position": number|null  // Word index (0-based)
    }
  ]
}
```

### Position System
- Uses word-based indices (0-based)
- Words are split by whitespace
- Position indicates where ne/n' should be inserted
- Form (ne vs n') determined by following word

Example:
```
Sentence: "Je crains qu'il vienne"
Word indices:  0   1      2     3
Position for ne before "vienne" = 3
Result: "Je crains qu'il ne vienne"
```

### Classification Process
1. Identify trigger in input text
2. Find similar examples in training data
3. Analyze position patterns after trigger
4. Determine ne/n' form based on context
5. Generate recommendation with confidence score

### Confidence Scoring
- Based on example similarity
- Considers trigger position
- Validates word position
- Checks grammatical context

## 2. Rule-Based Mode

### Description
- Pattern and context analysis
- Fixed set of grammatical rules
- Confidence scoring system
- Always proposes ne/n' placement

### Core Rules
1. Must have valid trigger
2. Must have subjunctive mood
3. Optional ne increases confidence
4. Position based on clause structure

### Trigger Types
1. Fear/Doubt Expressions:
   - "peur que"
   - Position: Before main verb in subordinate clause

2. Temporal Expressions:
   - "avant que"
   - Position: Before main verb after "que"

3. Impersonal Expressions:
   - "peu s'en faut"
   - Position: After trigger before main verb

### Position Determination
1. Primary: After trigger + que
2. Secondary: Before main verb
3. Fallback: Beginning of clause

### Confidence Scoring
- Expletive with ne: 0.95
- Expletive without ne: 0.85
- Non-expletive (no trigger): 0.95
- Non-expletive (trigger, no subjunctive): 0.90

## 3. Hybrid Mode (CroissantLLM)

### Description
- Combines rule-based and ML approaches
- Uses CroissantLLM for analysis
- Provides detailed linguistic explanation
- Includes confidence metrics

### Process Flow
1. Rule-based initial analysis
2. LLM pattern recognition
3. Context validation
4. Position determination
5. Confidence calculation

### Position Handling
- Uses word-based indices like Training Data mode
- Considers linguistic context
- Validates against grammar rules
- Provides explanation for placement

## Implementation Details

### Word Position System
```javascript
// How positions are calculated
const getWordPosition = (text, index) => {
  return text.slice(0, index).trim().split(/\s+/).length - 1;
};

// How positions are validated
const isValidPosition = (text, position) => {
  const wordCount = text.trim().split(/\s+/).length;
  return position >= 0 && position < wordCount;
};
```

### Common Patterns
1. After Trigger + que:
```
"avant qu'il parte"
Words: ["avant", "qu'il", "parte"]
Position: 2 (before "parte")
```

2. Before Main Verb:
```
"J'ai peur qu'il vienne"
Words: ["J'ai", "peur", "qu'il", "vienne"]
Position: 3 (before "vienne")
```

## Best Practices

### Training Data Mode
1. Validate all positions:
   - Must be valid word index
   - Must come after trigger
   - Must be before a verb

2. Handle edge cases:
   - Empty text
   - Single word
   - Multiple triggers
   - Complex clauses

3. Consider context:
   - Following word for ne/n' form
   - Verb forms
   - Clause structure

### Rule-Based Mode
1. Check trigger presence
2. Validate subjunctive
3. Consider clause structure
4. Handle compound sentences

### Hybrid Mode
1. Compare multiple approaches
2. Use highest confidence result
3. Provide clear explanation
4. Handle ambiguous cases

## Error Handling

### Position Validation
```javascript
try {
  const wordCount = text.trim().split(/\s+/).length;
  if (position < 0 || position >= wordCount) {
    throw new Error(`Invalid word position: ${position}`);
  }
} catch (error) {
  console.error('Position validation failed:', error);
  return null;
}
```

### Recovery Strategies
1. Invalid position:
   - Try alternative position
   - Use rule-based fallback
   - Return null with explanation

2. Missing trigger:
   - Check alternative patterns
   - Consider context
   - Default to non-expletive

3. Ambiguous cases:
   - Use highest confidence
   - Show multiple options
   - Provide explanation

## Future Improvements

### Planned Enhancements
1. More sophisticated position detection
2. Better handling of complex clauses
3. Improved confidence scoring
4. Extended pattern recognition

### Development Guidelines
1. Maintain word-based position system
2. Add comprehensive validation
3. Improve error handling
4. Expand documentation
