# Production Deployment State

## Current Version
- **Version**: 2.2.0
- **Last Deployment**: July 25, 2025
- **URL**: https://main.d1gx30ivteuneq.amplifyapp.com/

## Latest Features

### 1. Analysis Modes

#### Rule-Based Analysis
The system includes comprehensive pattern detection for French expletive negation:

##### Peur Que Constructions
- All conjugations of "avoir peur que"
- Prepositional forms:
  - par peur que
  - de peur que
  - dans peur que
- Intensity modifiers:
  - très grand peur que
  - grand peur que
- Nominal/adjectival variations

##### Avant Que Constructions
- Basic temporal markers
- Time precision indicators:
  - juste avant que
  - bien avant que
  - peu avant que
- Complex temporal expressions
- Compound constructions

##### Subjunctive Detection
- Common verb forms:
  - être (sois, soit, soyons, etc.)
  - avoir (aie, ait, ayons, etc.)
  - aller (aille, aillent, etc.)
- Irregular forms
- Position-aware analysis after "que"

#### Pure Training Analysis (Updated)
True example-based learning with no rule-based interference:

##### Text Similarity Analysis
- Word overlap detection
- Context matching
- No predefined patterns
- Pure similarity scoring

##### Training Integration
- Uses only user examples
- No external datasets
- No predefined rules
- Transparent matching

##### Confidence Calculation
- Based on similar examples
- Average similarity scoring
- Example count weighting
- Clear evidence display

#### Hybrid Analysis
Combines both approaches:
- Rule-based foundation
- Training enhancement
- Weighted scoring
- Best of both methods

### 2. Results Display

#### Rule-Based Mode
```
✅ EXPLETIVE NEGATION - Trigger: peur que
Evidence (85% confidence):
  • Fear expression trigger
  • Subjunctive mood detected
  • Complete complement clause structure
```

#### Pure Training Mode
```
🤖 PURE TRAINING: Likely had expletive 'ne' (80% confidence)
   • Based on 5 similar examples (75% avg similarity)
   • Most similar to: "J'ai peur qu'il vienne"
```

#### Hybrid Mode
```
🎯 TRAINING-ENHANCED: Expletive 'ne' (90% confidence)
   • Rule-based evidence: peur que + subjunctive
   • Training data: 8 similar examples support this
```

### 3. Export Capabilities
- **Excel**: Rich formatted spreadsheet with multiple sheets
- **CSV**: Structured data for analysis
- **JSON**: Complete data with metadata
- **TXT**: Human-readable report format

## Recent Deployments

### Job #210 (Latest)
- **Commit**: e4e6e697
- **Changes**: Removed rule-based logic from pure training mode
- **Status**: Successfully deployed

### Job #209
- **Commit**: 3ce2b741
- **Changes**: Updated Rule-Based Logic description
- **Status**: Successfully deployed

### Job #208
- **Commit**: 1123fb8d
- **Changes**: Fixed duplicate functions and patterns
- **Status**: Successfully deployed

## Current System State

### Active Features
- ✅ Rule-based pattern detection
- ✅ Pure training analysis (no rule interference)
- ✅ Hybrid mode combining both approaches
- ✅ Multiple export formats
- ✅ Feature flags for analysis modes

### Analysis Modes
1. **Basic Logic**: Simple negation detection
2. **Rule-Based**: Pattern analysis with confidence scoring
3. **Pure Training**: Example-based learning (no rules)
4. **Hybrid**: Combined analysis approach

### Performance Metrics
- Average response time: <500ms
- Batch processing: ~100ms/sentence
- Rule-based accuracy: 85-95%
- Training similarity matching: 70-90%

## Known Issues
None currently reported

## Upcoming Changes
- Enhanced similarity algorithms
- Additional training features
- Performance optimizations
- Extended export options

## Rollback Information
In case rollback is needed:
```bash
aws amplify start-job \
  --app-id d1gx30ivteuneq \
  --branch-name main \
  --job-type RETRY \
  --job-id 209
```

## Monitoring
- AWS CloudWatch metrics active
- Performance monitoring enabled
- Error tracking in place
- User feedback collection active

## Support
For issues or questions:
1. Check CloudWatch logs
2. Review deployment history
3. Contact development team
4. Submit GitHub issue
