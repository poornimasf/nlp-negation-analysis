# French Negation Analysis Rules

## Pattern Analysis Guidelines

### Critical Note on Pattern Detection
The presence of common patterns alone (peur que, avant que, peu s'en faut) is NOT sufficient to determine expletive or logical negation. Proper analysis requires consideration of multiple linguistic factors.

## Analysis Requirements

### 1. Pattern Context Analysis
Each pattern must be analyzed within its complete context:

#### Peur que Constructions
```
Pattern: /\b(?:avoir\s+peur|craindre|redouter)\s+que\b/i

INCORRECT analysis:
- Assuming "peur que" alone indicates expletive negation
- Ignoring presence of logical negation markers

CORRECT analysis:
- Check for logical negation markers (pas, point, jamais)
- Analyze complete clause structure
- Consider semantic context

Examples:
✓ Expletive possible: "J'ai peur qu'il ne vienne"
✓ Logical negation: "J'ai peur qu'il ne vienne pas"
✗ Incorrect assumption: Treating all "peur que" as expletive
```

#### Avant que Expressions
```
Pattern: /\b(?:avant)\s+que\b/i

INCORRECT analysis:
- Assuming temporal expressions always indicate expletive
- Ignoring additional negation elements

CORRECT analysis:
- Check for logical negation markers
- Analyze temporal context completely
- Consider full clause structure

Examples:
✓ Expletive possible: "Avant qu'il ne parte"
✓ Logical negation: "Avant qu'il ne parte plus"
✗ Incorrect assumption: All temporal "avant que" is expletive
```

#### Peu s'en faut Patterns
```
Pattern: /\b(?:il\s+s'en\s+faut)\s+que\b/i

INCORRECT analysis:
- Assuming pattern alone indicates expletive
- Ignoring surrounding context

CORRECT analysis:
- Analyze complete predicate structure
- Consider additional modifiers
- Evaluate full semantic context

Examples:
✓ Expletive possible: "Peu s'en faut qu'il ne réussisse"
✓ Different structure: "Peu s'en faut qu'il réussisse"
✗ Incorrect assumption: Pattern guarantees expletive
```

## Implementation Requirements

### 1. Pattern Detection
```javascript
// INCORRECT approach
if (hasPattern(text, 'peur que')) {
  return 'EXPLETIVE';
}

// CORRECT approach
function analyzePattern(text, pattern) {
  const hasPattern = pattern.test(text);
  const hasLogicalMarkers = hasNegationMarkers(text);
  const clauseStructure = analyzeClauseStructure(text);
  
  return {
    hasPattern,
    hasLogicalMarkers,
    clauseStructure,
    // Additional context factors
  };
}
```

### 2. Confidence Scoring
```javascript
// INCORRECT scoring
const confidence = hasPattern ? 0.9 : 0;

// CORRECT scoring
const confidence = calculateConfidence({
  hasPattern: 0.3,          // Base for pattern presence
  properStructure: 0.3,     // Correct grammatical structure
  noLogicalMarkers: 0.2,    // Absence of logical negation
  semanticContext: 0.2      // Semantic analysis
});
```

### 3. Required Analysis Steps
1. Pattern identification
2. Logical marker detection
3. Clause structure analysis
4. Semantic context evaluation
5. Confidence calculation based on all factors

## Confidence Scoring Guidelines

### Base Confidence Factors
- Pattern presence: 30%
- Grammatical structure: 30%
- Negation marker analysis: 20%
- Semantic context: 20%

### Adjustments
- Presence of logical markers: -50% to confidence
- Incomplete clause structure: -30% to confidence
- Multiple supporting factors: +20% to confidence
- Ambiguous context: -25% to confidence

## Implementation Notes

1. Pattern Detection:
   - Must check for complete patterns
   - Consider surrounding context
   - Analyze full clause structure

2. Logical Markers:
   - Check for: pas, point, plus, jamais, rien
   - Consider marker position
   - Analyze marker relevance

3. Context Analysis:
   - Evaluate complete clauses
   - Consider semantic meaning
   - Analyze temporal aspects

4. Confidence Calculation:
   - Start with base confidence
   - Apply all relevant adjustments
   - Cap final confidence appropriately

## Common Pitfalls to Avoid

1. Pattern Overreliance:
   ❌ Assuming patterns alone determine type
   ✓ Use patterns as one factor among many

2. Context Ignorance:
   ❌ Ignoring surrounding context
   ✓ Analyze complete sentence structure

3. Marker Oversight:
   ❌ Missing logical negation markers
   ✓ Check for all types of negation

4. Confidence Overstatement:
   ❌ High confidence based on pattern alone
   ✓ Consider all factors for confidence
