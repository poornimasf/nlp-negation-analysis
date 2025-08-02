# Training Data Documentation

## Overview
This training data is specifically designed for French expletive negation analysis. It contains only two types of examples:
1. Expletive negation cases
2. Non-negation cases

Important: This dataset deliberately excludes logical negation examples as they are handled by pattern-based analysis.

## Data Format

### JSON Format (training_data.json)
```json
{
  "text": "Example sentence",
  "pattern": "trigger pattern",
  "nePosition": number | null,
  "classification": "Expletive" | "No_Negation",
  "confidence": number,
  "trigger": "trigger phrase" | null
}
```

### CSV Format (sample_training_data.csv)
```csv
text,has_expletive_ne,trigger,classification
"Example sentence",true/false,"trigger phrase",expletive/no_negation
```

## Supported Triggers
1. peur que
2. avant que
3. craindre que
4. redouter que
5. en attendant que
6. peu s'en faut que

## Classification Types
1. Expletive: Sentences that can take an optional 'ne' particle
2. No_Negation: Regular sentences with no negation

## NE Position Guidelines
- Position is counted from start of sentence (1-based)
- null for non-negation cases
- Typically after trigger words in expletive cases

## Example Usage
```json
{
  "text": "J'ai peur qu'il vienne",
  "pattern": "avoir peur que",
  "nePosition": 3,
  "classification": "Expletive",
  "confidence": 0.85,
  "trigger": "peur que"
}
```

## Important Notes
1. No logical negation examples included
2. All expletive cases use subjunctive mood
3. Non-negation examples are simple declarative sentences
4. Confidence scores are higher for clear patterns
