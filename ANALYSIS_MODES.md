# Analysis Modes

## Overview
The system provides multiple analysis modes for French expletive negation detection, each with its own strengths and use cases.

## 1. Rule-Based Analysis

### Description
Pure pattern-based analysis using predefined linguistic rules and triggers.

### Features
- Primary trigger detection (peur que, avant que)
- Logical marker identification
- Context-aware pattern matching
- Confidence-based classification

### Use Cases
- Quick analysis of standard patterns
- High-confidence classifications
- Real-time analysis needs
- Pattern-based research

## 2. Pattern Recognition

### Description
Comprehensive pattern detection system with context awareness.

### Features
- Expletive trigger detection
- Logical marker analysis
- Contextual pattern matching
- Confidence scoring system

### Components
- Trigger patterns
  - peur que variations
  - avant que constructions
- Logical markers
  - ne pas
  - ne plus
  - ne jamais
- Context analysis
  - Surrounding words
  - Sentence structure
  - Pattern positioning

## 3. Classification System

### Categories
1. **Expletive Negation**
   - Criteria: Expletive triggers + ne without logical markers
   - Confidence: High (80-100%)
   - Examples: "J'ai peur qu'il ne vienne"

2. **Logical Negation**
   - Criteria: Ne + logical markers
   - Confidence: High (80-100%)
   - Examples: "Il ne vient pas"

3. **No Negation**
   - Criteria: Absence of 'ne'
   - Confidence: High (90-100%)
   - Examples: "Il vient"

4. **Uncertain**
   - Criteria: Ambiguous patterns or mixed signals
   - Confidence: Low (40-60%)
   - Examples: "Je crains qu'il vienne"

5. **Needs Review**
   - Criteria: Default fallback for unclear cases
   - Confidence: N/A
   - Examples: Complex or unusual constructions

### Classification Process
1. Check for expletive patterns
2. Identify logical markers
3. Verify 'ne' presence
4. Evaluate ambiguity
5. Assign appropriate category

## 4. Batch Processing (Currently Disabled)

### Status
- Implemented but not active in production (v2.6.0)
- Code available in BatchAnalysis.jsx
- Disabled to simplify production interface
- Can be re-enabled through App.js

### Features (When Enabled)
- Multiple sentence analysis
- Consistent classification
- Performance optimization
- Result aggregation

### Components
1. **Input Processing**
   - Text normalization
   - Sentence splitting
   - Pattern extraction

2. **Analysis Pipeline**
   - Pattern matching
   - Classification
   - Confidence scoring
   - Result compilation

3. **Output Generation**
   - Classification summary
   - Detailed analysis
   - Statistics generation
   - Export formatting

## Performance Considerations

### Response Times
- Single analysis: < 200ms
- Batch processing: < 500ms per item
- Export generation: < 1s for standard batches

### Resource Usage
- Memory: 120-180MB
- CPU: 15-25% average
- Network: Minimal

## Best Practices

### Analysis Selection
1. Use Rule-Based for:
   - Standard patterns
   - Quick analysis
   - High confidence needs

2. Use Pattern Recognition for:
   - Complex cases
   - Detailed analysis
   - Research purposes

3. Use Batch Processing for:
   - Multiple sentences
   - Research datasets
   - Bulk analysis needs

### Configuration Tips
- Enable appropriate feature flags
- Configure confidence thresholds
- Set batch size limits
- Monitor performance metrics

## Error Handling

### Common Issues
1. Pattern conflicts
2. Ambiguous cases
3. Performance bottlenecks
4. Resource limitations

### Resolution Steps
1. Check configuration
2. Verify input format
3. Monitor system resources
4. Review error logs

## Future Enhancements

### Planned Features
1. Enhanced pattern detection
2. Improved confidence scoring
3. Additional classification types
4. Performance optimizations

### Research Areas
1. Pattern expansion
2. Classification refinement
3. Performance improvement
4. Error reduction

## Notes
- System is actively maintained
- Regular updates planned
- Documentation kept current
- Performance monitored
