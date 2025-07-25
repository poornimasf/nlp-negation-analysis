# Update Testing Checklist

## Pre-Update Checks
- [ ] Backup current version of SimpleNegationAnalyzer.jsx
- [ ] Document intended changes
- [ ] Review feature flag dependencies
- [ ] Check for pattern conflicts with existing rules

## Core Analysis Testing

### 1. Basic Mode Testing
```javascript
// Set flags
setUseExpletiveLogic(false);
setEnableTrainingData(false);
```
- [ ] Test simple negation detection
  - [ ] "Il ne vient pas"
  - [ ] "Il ne vient"
- [ ] Test logical markers
  - [ ] "ne pas"
  - [ ] "ne plus"
  - [ ] "ne jamais"
- [ ] Verify no expletive analysis is performed
- [ ] Check highlighting works correctly

### 2. Rule-Based Mode Testing
```javascript
// Set flags
setUseExpletiveLogic(true);
setEnableTrainingData(false);
```
- [ ] Test all expletive triggers
  - [ ] "peur que" patterns
  - [ ] "avant que" patterns
  - [ ] "craindre" patterns
  - [ ] Any new patterns added
- [ ] Test confidence scoring
- [ ] Verify pattern highlighting
- [ ] Check trigger detection accuracy

### 3. Training Mode Testing
```javascript
// Set flags
setUseExpletiveLogic(false);
setEnableTrainingData(true);
```
- [ ] Upload test training data
- [ ] Verify similar pattern matching
- [ ] Test confidence calculations
- [ ] Check unknown pattern handling
- [ ] Verify training stats display

### 4. Hybrid Mode Testing
```javascript
// Set flags
setUseExpletiveLogic(true);
setEnableTrainingData(true);
```
- [ ] Test rule + training combinations
- [ ] Verify confidence boosting
- [ ] Check fallback behavior
- [ ] Test pattern conflicts resolution

## Batch Processing Testing

### 1. Input Processing
- [ ] Test multiple line input
- [ ] Verify empty line handling
- [ ] Check large batch performance
- [ ] Test special character handling

### 2. Export Testing
- [ ] Excel Export
  - [ ] All columns present
  - [ ] Formatting correct
  - [ ] Multiple sheets working
  - [ ] Statistics accurate
- [ ] CSV Export
  - [ ] Proper delimiting
  - [ ] Character encoding
  - [ ] Headers correct
- [ ] JSON Export
  - [ ] Valid JSON structure
  - [ ] All data included
  - [ ] Metadata correct
- [ ] TXT Export
  - [ ] Readable format
  - [ ] All information included

## Edge Case Testing

### 1. Pattern Edge Cases
- [ ] Empty input
- [ ] Single character
- [ ] Very long sentences
- [ ] Multiple triggers in one sentence
- [ ] Nested patterns
- [ ] Special characters
- [ ] Accented characters

### 2. Training Data Edge Cases
- [ ] Empty training set
- [ ] Very large training set
- [ ] Conflicting examples
- [ ] Invalid data format
- [ ] Missing fields

### 3. UI Edge Cases
- [ ] Rapid mode switching
- [ ] Multiple exports
- [ ] Large batch with all modes
- [ ] Browser refresh handling
- [ ] Error message display

## Performance Testing

### 1. Single Analysis
- [ ] Response time < 500ms
- [ ] Memory usage stable
- [ ] UI remains responsive

### 2. Batch Analysis
- [ ] Large batch processing time
- [ ] Memory usage during batch
- [ ] Export generation time
- [ ] UI responsiveness during processing

### 3. Training Data
- [ ] Load time for large sets
- [ ] Pattern matching performance
- [ ] Memory usage with large sets

## Cross-Browser Testing
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

## Mobile Testing
- [ ] Responsive layout
- [ ] Touch interactions
- [ ] Export functionality
- [ ] Performance on mobile

## Production Deployment Testing

### 1. Pre-Deployment
- [ ] Run full test suite
- [ ] Check bundle size
- [ ] Verify all assets included
- [ ] Test build locally

### 2. Post-Deployment
- [ ] Verify live URL
- [ ] Check all modes
- [ ] Test exports
- [ ] Verify training integration
- [ ] Monitor error logs

## Documentation Updates
- [ ] Update code comments
- [ ] Update README if needed
- [ ] Update ANALYSIS_MODES.md if needed
- [ ] Update FILE_STRUCTURE.md if needed

## Rollback Plan
- [ ] Keep backup of previous version
- [ ] Document rollback steps
- [ ] Test rollback procedure
- [ ] Verify backup functionality

## Final Verification
- [ ] All tests passed
- [ ] Performance acceptable
- [ ] Documentation updated
- [ ] No console errors
- [ ] All modes working
- [ ] Exports functioning
- [ ] Training integration verified

## Notes
- Document any issues found
- Note performance metrics
- Record any workarounds implemented
- List any pending improvements

This checklist should be completed for all significant updates to ensure system stability and functionality.
