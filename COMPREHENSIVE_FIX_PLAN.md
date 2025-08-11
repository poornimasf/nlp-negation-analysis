# Comprehensive System Fix Plan

## Issues to Address in Single Deployment

### 1. Data Issues

- [ ] Remove fake training data file (/data/training_data.json)
- [ ] Ensure no other default training data files exist
- [ ] Preserve all training data mode functionality and CSS

### 2. Subjunctive Detection Consolidation

- [ ] Audit all subjunctive detection implementations
- [ ] Consolidate to single, authoritative system
- [ ] Ensure no conflicts between different detectors
- [ ] Preserve linguistic analysis components exactly as they are

### 3. Console Logging Cleanup

- [ ] Reduce 187+ console.log statements to essential only
- [ ] Keep error logging and critical debugging
- [ ] Remove repetitive detection messages

### 4. File Structure Standardization

- [ ] Ensure all files are in correct locations
- [ ] Fix any import/export mismatches
- [ ] Sync between /src and /negation-analyzer directories

### 5. Component Integration

- [ ] Ensure data formats are consistent between components
- [ ] Fix any "t is not a function" type errors
- [ ] Preserve all existing functionality

## Success Criteria

- ✅ No fake training examples appear
- ✅ System doesn't crash with runtime errors
- ✅ Linguistic analysis displays properly
- ✅ Console output is clean and readable
- ✅ Training data mode works exactly as before
- ✅ All CSS and styling preserved
- ✅ Single subjunctive detection system

## Testing Checklist

- [ ] Test with no training data
- [ ] Test with real training data
- [ ] Test "avant que" sentences
- [ ] Check console for errors/spam
- [ ] Verify linguistic analysis shows
- [ ] Confirm no fake examples
- [ ] Test in incognito window
