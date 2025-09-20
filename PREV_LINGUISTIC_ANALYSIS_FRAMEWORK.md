# Previous Linguistic Analysis Framework

## Historical Context

Documentation of previous French expletive "ne" classification approaches and their limitations, providing context for the September 2025 enhanced framework.

## Previous Approaches

### Original Rule-Based System
- **Pattern matching**: Basic trigger detection (avant que, peur que, etc.)
- **Binary classification**: Simple expletive/non-expletive decisions
- **Limited context**: Sentence-level analysis only
- **Accuracy limitations**: ~65-70% on complex cases

### Early Training Data Attempts
- **Skewed datasets**: Expletive-heavy training examples
- **Bias issues**: Overcorrection toward expletive classification
- **Limited triggers**: Focus on 2-3 main trigger types
- **Context gaps**: Insufficient discourse-level analysis

## Identified Limitations

### Data Quality Issues
- **Imbalanced training**: 70/30 or 80/20 expletive/non-expletive ratios
- **Trigger bias**: Assumption that triggers always require expletives
- **Register blindness**: No formal/informal context consideration
- **Limited scope**: Insufficient trigger type coverage

### Analysis Gaps
- **Syntactic only**: Missing semantic and discourse factors
- **Context isolation**: Sentence-level analysis insufficient
- **Register ignorance**: No formal/informal distinction
- **Pattern rigidity**: Inflexible rule application

### Performance Problems
- **Overcorrection**: False positives in formal contexts
- **Context insensitivity**: Missing pragmatic factors
- **Limited accuracy**: Plateau at 70-75% accuracy
- **Bias propagation**: Training data issues affecting results

## Lessons Learned

### Critical Insights
1. **Balance is essential**: 50/50 datasets prevent systematic bias
2. **Register matters**: Formal/informal context crucial for accuracy
3. **Multiple modes needed**: Sentence + paragraph analysis required
4. **Discourse factors**: Beyond syntax, semantic context essential

### System Requirements
- **Balanced training data**: Equal expletive/non-expletive examples
- **Register classification**: Automatic formal/informal detection
- **Multi-level analysis**: Syntactic, semantic, and discourse factors
- **Context awareness**: Paragraph-level pattern recognition

## Evolution to Enhanced Framework

### Key Improvements
- **Balanced datasets**: 500/500 true/false per trigger type
- **Register integration**: Formal/informal classification system
- **Multi-mode training**: Sentence and paragraph approaches
- **Discourse analysis**: Beyond syntactic pattern matching

### Accuracy Progression
- **Original system**: 65-70% accuracy
- **Early training**: 70-75% with bias issues
- **Enhanced framework**: Projected 92% with balanced approach

## Foundation for September 2025

This analysis of previous limitations provides the foundation for the September 2025 enhanced framework:

- **Balanced training data**: Addresses bias issues
- **Register awareness**: Incorporates formal/informal context
- **Multi-level analysis**: Syntactic, semantic, and discourse integration
- **Comprehensive coverage**: All major trigger types included

The enhanced framework builds on these lessons to create a robust, unbiased, and highly accurate French expletive classification system.
