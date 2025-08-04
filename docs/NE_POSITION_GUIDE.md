# NE Position Guide

## Overview
This document describes how ne/n' marker positions are handled in the French Negation Type Prediction System.

## Word-Based Position System

### Basic Concept
- Positions are based on word indices (0-based)
- Words are separated by whitespace
- Punctuation attached to words is considered part of the word

### Example
For the sentence: "Je crains qu'il vienne"
```
Word indices:
0   1      2    3
Je  crains qu'il vienne
```

If we want to add 'ne' before "vienne", the ne_position would be 3.

### Rules for ne/n' Placement
1. The position indicates where the ne/n' marker should be inserted
2. The marker goes BEFORE the word at the specified position
3. The form (ne vs n') is determined by the following word

Example with ne_position = 3:
```
Original: "Je crains qu'il vienne"
Result:   "Je crains qu'il ne vienne"
```

## Training Data Format

### Example JSON
```json
{
  "examples": [
    {
      "text": "Je crains qu'il vienne",
      "has_expletive_ne": true,
      "classification": true,
      "trigger": "crains que",
      "ne_position": 3
    }
  ]
}
```

### Position Validation
- ne_position must be >= 0
- ne_position must be < total word count
- ne_position must come after the trigger
- Position is required when has_expletive_ne is true
- Position must be null when has_expletive_ne is false

## Implementation Details

### Word Splitting
```javascript
// How words are counted
const words = text.trim().split(/\s+/);
const wordCount = words.length;
```

### Position Validation
```javascript
// Valid position check
const isValidPosition = (text, position) => {
  const wordCount = text.trim().split(/\s+/).length;
  return position >= 0 && position < wordCount;
};
```

### Trigger Position Check
```javascript
// Check if ne comes after trigger
const isNeAfterTrigger = (text, trigger, neWordIndex) => {
  const words = text.toLowerCase().split(/\s+/);
  const triggerWords = trigger.toLowerCase().split(/\s+/);
  
  // Find trigger's last word position
  for (let i = 0; i <= words.length - triggerWords.length; i++) {
    if (triggerWords.every((word, j) => words[i + j].includes(word))) {
      const triggerLastWordIndex = i + triggerWords.length - 1;
      return neWordIndex > triggerLastWordIndex;
    }
  }
  return false;
};
```

## Common Patterns

### After Trigger + que
```
Trigger: "avant que"
Text: "avant qu'il parte"
Words: ["avant", "qu'il", "parte"]
ne_position: 2  // Before "parte"
```

### Before Main Verb
```
Trigger: "peur que"
Text: "J'ai peur qu'il vienne"
Words: ["J'ai", "peur", "qu'il", "vienne"]
ne_position: 3  // Before "vienne"
```

## Best Practices

1. Always validate positions:
   - Check against word count
   - Verify position comes after trigger
   - Ensure position is before a verb

2. Handle edge cases:
   - Empty text
   - Single word text
   - Text with only trigger
   - Multiple possible positions

3. Consider context:
   - Following word for ne/n' form
   - Verb forms
   - Clause structure
