# Analysis Modes Documentation

## Overview
The system provides three distinct analysis modes for French negation analysis, each with its own approach to NE placement prediction:
1. Rule-Based Analysis
2. CroissantLLM Analysis
3. Training Data Analysis

## 1. Rule-Based Analysis

### Description
Pattern-based analysis using predefined linguistic rules and triggers, with comprehensive context analysis.

### Key Features
- French linguistic pattern detection
- Complete clause structure analysis
- Logical marker detection
- Context-aware confidence scoring

### Pattern Analysis
Important: Pattern presence alone does not determine negation type. Analysis includes:
1. Pattern Detection
   - Fear expressions (peur que)
   - Temporal expressions (avant que)
   - Impersonal expressions (peu s'en faut)

2. Context Analysis
   - Logical marker detection (pas, point, jamais, etc.)
   - Clause structure completeness
   - Semantic context evaluation

3. Confidence Scoring
   - Pattern presence: 30%
   - Structure analysis: 30%
   - Logical negation check: 20%
   - Context analysis: 20%

### NE Placement Strategy
Always proposes NE placement with varying confidence:
1. Pattern-based placement (0.3-0.9 confidence)
2. Verb-based placement (0.3 confidence)
3. Fallback to beginning (0.1 confidence)

## 2. CroissantLLM Analysis

### Description
AI-powered analysis using CroissantLLM for French linguistic understanding and NE placement prediction.

### Key Features
- Deep linguistic analysis
- Context-aware classification
- Explicit NE placement suggestions
- High confidence scoring

### Analysis Process
1. Linguistic Analysis
   - Full sentence structure analysis
   - Context understanding
   - Semantic relationship detection
   - Verb mood and tense analysis

2. Classification
   - Direct classification output
   - Confidence scoring
   - Detailed reasoning
   - Context justification

### NE Placement Strategy
Hierarchical placement decision:
1. Explicit LLM Instructions (0.9 confidence)
   - Direct position specification
   - Verb-based placement guidance
2. Classification-Based (0.7-0.8 confidence)
   - Expletive: After 'que' when present
   - Logical: Before main verb
3. Rule-Based Fallback (0.3-0.6 confidence)
   - Pattern matching
   - Verb position
   - Structure analysis

## 3. Training Data Analysis

### Description
Pure example-based learning using provided training data.

### Key Features
- Exact pattern matching from examples
- No rule-based fallback
- Confidence based on match quality
- Independent verification capability

### Training Data Format
```json
[
  {
    "text": "J'ai peur qu'il vienne",
    "pattern": "avoir peur que",
    "nePosition": 3,
    "classification": "Expletive",
    "confidence": 0.85
  }
]
```

### NE Placement Strategy
Always proposes NE placement:
1. Training example match (0.8 confidence)
2. Fallback to beginning (0.1 confidence)

## Results Display

### Columns
1. Sentence: Original input
2. Analysis: Detailed analysis results
3. Prediction: Classification result
4. Highlighted: Visual pattern highlighting
5. Proposed Sentence: NE placement suggestion
   - Shows "NE" in highlighted format
   - Always provides a proposal
   - Confidence indicated in analysis

### Styling
- NE Display: Capitalized "NE" with highlight
- Regular text: Standard black color
- Confidence levels: Shown in analysis details
- CroissantLLM: 🤖 prefix for LLM analysis

## Mode Selection

### Rule-Based Mode Best For
- Standard French constructions
- Pattern-based analysis
- High-precision requirements
- Performance-critical scenarios

### CroissantLLM Mode Best For
- Complex linguistic structures
- Context-dependent analysis
- High accuracy requirements
- Novel sentence patterns

### Training Data Mode Best For
- Corpus-specific analysis
- Example-based learning
- Pattern discovery
- Independent verification

## Implementation Notes

### Rule-Based Implementation
- Comprehensive pattern analysis
- Multiple validation steps
- Confidence-based scoring
- Always returns proposal

### CroissantLLM Implementation
- Direct LLM integration
- Explicit placement guidance
- Classification-based strategies
- Rule-based fallback

### Training Data Implementation
- Pure example matching
- No rule-based fallback
- Independent operation
- Always returns proposal

## Best Practices

### Mode Selection
- Use appropriate mode for use case
- Consider data availability
- Monitor confidence scores
- Validate results

### Data Management
- Maintain quality training data
- Regular pattern updates
- Monitor confidence trends
- Track analysis accuracy

### CroissantLLM Usage
- Monitor response quality
- Track confidence scores
- Validate placements
- Review classifications
