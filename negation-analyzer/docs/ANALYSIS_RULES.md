# French Negation Analysis Rules

## Classification Overview

The system classifies French sentences into two categories:
1. Expletive
2. Non-expletive

## Expletive Classification Requirements

### Required Components
1. **Official Trigger**
   - Must have one of:
     * "peur que"
     * "avant que"
     * "peu s'en faut"
   - Variations are supported (e.g., "avoir peur que")

2. **Subjunctive Mood**
   - Must have subjunctive verb form
   - Common forms are detected:
     * être: sois, soit, soyons, soyez, soient
     * avoir: aie, aies, ait, ayons, ayez, aient
     * faire: fasse, fasses, fassions, fassiez, fassent
     * etc.

### Optional Component
- **Ne Marker**
  * Presence increases confidence
  * Not required for classification
  * Must not be part of "ne...pas" construction

## Non-Expletive Classification

### Clear Non-Expletive Cases
1. No official triggers present
2. Has trigger but missing subjunctive
3. Any case not meeting expletive requirements

## Confidence Scoring

### High Confidence (0.95)
- Expletive with all components:
  * Official trigger
  * Subjunctive mood
  * Ne marker present
- Non-expletive with no triggers

### Strong Confidence (0.90)
- Non-expletive with:
  * Has trigger
  * Missing subjunctive

### Good Confidence (0.85)
- Expletive with:
  * Official trigger
  * Subjunctive mood
  * No ne marker

## Examples

### Expletive Examples
```
"J'ai peur qu'il ne vienne"
- Trigger: "peur que"
- Subjunctive: "vienne"
- Ne present
- Confidence: 0.95

"Avant qu'il parte"
- Trigger: "avant que"
- Subjunctive: "parte"
- No ne
- Confidence: 0.85
```

### Non-Expletive Examples
```
"J'ai peur qu'il part"
- Has trigger: "peur que"
- No subjunctive
- Confidence: 0.90

"Je vais au cinéma"
- No triggers
- Confidence: 0.95
```

## Implementation Details

### Trigger Detection
- Uses regex patterns
- Handles common variations
- Case insensitive
- Whitespace tolerant

### Subjunctive Detection
- Pattern matching for common forms
- Comprehensive verb list
- Handles irregular verbs
- Accent-aware matching

### Ne Detection
- Identifies standalone "ne"
- Handles elided forms (n')
- Excludes "ne...pas" constructions

## Error Cases

### Invalid Classifications
- Logical negation (ne...pas) - Not analyzed
- Ambiguous cases - Default to non-expletive
- Unknown patterns - Default to non-expletive

### Edge Cases
- Multiple triggers - Use first match
- Complex sentences - Analyze main clause
- Unknown verb forms - Conservative classification
