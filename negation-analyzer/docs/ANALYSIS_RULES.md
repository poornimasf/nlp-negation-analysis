# French Negation Analysis Rules

## Important: Pattern Analysis Limitations

### Key Principle
The presence of common patterns (peur que, avant que, peu s'en faut) alone is NOT sufficient to determine expletive or logical negation. Multiple factors must be considered for accurate analysis.

## Pattern Analysis Examples

### 1. Fear Expressions (peur que)
```
Same pattern, different negation types:

Expletive possible:
"J'ai peur qu'il ne vienne"
(Fear that he will come)

Logical negation:
"J'ai peur qu'il ne vienne pas"
(Fear that he won't come)

Key difference: Presence of logical negation marker (pas)
```

### 2. Temporal Expressions (avant que)
```
Same pattern, different uses:

Expletive possible:
"Avant qu'il ne parte"
(Before he leaves)

Logical negation:
"Avant qu'il ne parte plus"
(Before he no longer leaves)

Key difference: Presence of logical marker (plus)
```

### 3. Impersonal Expressions (peu s'en faut)
```
Pattern variations:

Expletive possible:
"Peu s'en faut qu'il ne réussisse"
(He almost succeeds)

Without expletive:
"Peu s'en faut qu'il réussisse"
(He almost succeeds)

Key difference: Optional nature of expletive ne
```

## Required Analysis Factors

### 1. Pattern Presence (30% confidence)
- Identifies potential expletive context
- Not sufficient alone
- Must be complete pattern, not partial match

### 2. Structural Analysis (30% confidence)
- Complete clause structure
- Proper subordinate clause
- Verb form analysis

### 3. Logical Negation Check (20% confidence)
- Check for markers: pas, point, plus, jamais, etc.
- Analyze marker position and relevance
- Consider impact on meaning

### 4. Context Analysis (20% confidence)
- Semantic meaning
- Complete sentence structure
- Related clauses

## Confidence Adjustments

### Negative Factors
- Presence of logical markers: -50%
- Incomplete clause structure: -30%
- Ambiguous context: -25%

### Positive Factors
- Complete pattern match: +30%
- Valid structure: +30%
- Clear semantic context: +20%

## Implementation Guidelines

### 1. Pattern Detection
```javascript
// INCORRECT
if (hasPattern(text, 'peur que')) {
  return 'EXPLETIVE';
}

// CORRECT
const analysis = {
  hasPattern: hasPattern(text, 'peur que'),
  hasLogicalMarkers: checkLogicalMarkers(text),
  structure: analyzeStructure(text),
  context: analyzeContext(text)
};

return determineType(analysis);
```

### 2. Confidence Calculation
```javascript
const confidence = calculateConfidence({
  hasPattern: 0.3,          // Base for pattern
  hasCompleteStructure: 0.3, // Structure analysis
  noLogicalMarkers: 0.2,    // Negation check
  validContext: 0.2         // Context analysis
});

// Apply adjustments
if (hasLogicalMarkers) confidence *= 0.5;
if (!completeStructure) confidence *= 0.7;
if (ambiguousContext) confidence *= 0.75;
```

## Common Mistakes to Avoid

### 1. Pattern Overreliance
❌ Assuming pattern presence guarantees expletive ne
✓ Use patterns as initial indicators only

### 2. Ignoring Logical Markers
❌ Missing presence of pas, point, plus, etc.
✓ Always check for logical negation markers

### 3. Incomplete Analysis
❌ Analyzing pattern in isolation
✓ Consider all contextual factors

### 4. Overconfidence
❌ High confidence based on pattern alone
✓ Adjust confidence based on all factors

## Testing Guidelines

### 1. Pattern Variations
Test sentences with:
- Same pattern, different negation types
- Different patterns, same negation type
- Ambiguous cases
- Incomplete patterns

### 2. Logical Markers
Test combinations with:
- Various logical negation markers
- Different marker positions
- Multiple markers

### 3. Structure Analysis
Test cases with:
- Complete and incomplete clauses
- Various verb forms
- Different subordinate structures

## Maintenance Notes

### Regular Updates Needed For:
1. Pattern database
2. Confidence calculations
3. Analysis rules
4. Test cases

### Performance Monitoring:
1. Track confidence accuracy
2. Monitor pattern effectiveness
3. Analyze error patterns
4. Update rules based on findings
