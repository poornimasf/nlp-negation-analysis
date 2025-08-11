# Analysis Modes

## Rule-Based Mode

The default mode that uses pattern matching and grammatical rules.

### Output Format

```
Rule-Based Analysis
-----------------
Classification: [Expletive/No Expletive]
Confidence: XX%

Trigger Analysis:
- Found: [trigger]
- Category: [category]
- Subcategory: [subcategory]
- Usage: [usage description]

Details:
- [Analysis points...]
```

## Training Data Mode

Uses example-based learning with similarity matching.

### Output Format

```
Training Data Analysis
-----------------

Classification: [Expletive/No Expletive]
Should be "[Classification]" because:
- Has [category] trigger "[trigger]"
- Uses subjunctive form (if present)
- [Subcategory-specific reason]
- [Register-specific indicators]

Confidence: XX%

Trigger Analysis:
- Found: [trigger]
- Category: [category]
- Subcategory: [subcategory]
- Usage: [usage description]

Best Match:
- Example: "[matched example]"
- Similarity: XX%
- Classification: [Expletive/No Expletive]

Evidence Summary:
- Found [X] similar examples
- [Evidence details...]
Trigger: [trigger] ([category])

Confidence Factors:
- Well-formed subjunctive structure (indicates proper grammatical form)
- Clear temporal marker (indicates potential for expletive ne)
- Historical/literary register (common context for expletive ne)
- [Other relevant factors...]

Confidence Breakdown:
- Expletive: XX% (based on similar examples)
- Non-expletive: XX% (based on similar examples)
```

### Subcategory Explanations

For temporal triggers (avant que):

- SEQUENCE: "Describes pure temporal sequence (common for expletive ne)"
- PREVENTIVE: "Indicates preventive action (strong case for expletive ne)"
- ANTICIPATORY: "Shows preparation for future event (often uses expletive ne)"
- DEFAULT: "Shows temporal relationship"

### Register Analysis

Considers various registers that influence ne usage:

- Historical/literary
- Formal/academic
- Technical/scientific
- Colloquial/informal

## SVM Analysis Mode

Uses Support Vector Machine learning for classification.

### Output Format

```
SVM Analysis
-----------
Classification: [Expletive/No Expletive]
Confidence: XX%

Features:
- [Feature list...]

Model Decision:
- [Decision details...]
```

## Hybrid Mode

Combines rule-based analysis with LLM-based classification.

### Output Format

```
Hybrid Analysis
--------------
Classification: [EXPLETIVE/LOGICAL]
Confidence: XX%

Pattern Analysis:
- [Pattern details...]

Linguistic Analysis:
- [Analysis points...]

NE Position:
- [Position details...]

Suggestion:
[Proposed sentence]
```
