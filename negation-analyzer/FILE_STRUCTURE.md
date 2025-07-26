# Production File Structure and Update Guide

## Repository Structure

```
main/                                  # Root directory
├── README.md                         # System overview and features
├── PRODUCTION_STATE.md               # Current deployment status
├── ANALYSIS_MODES.md                 # Core functionality documentation
│
└── negation-analyzer/                # Implementation directory
    ├── README.md                     # Implementation details
    ├── FILE_STRUCTURE.md             # This file - implementation guide
    ├── UPDATE_CHECKLIST.md          # Testing and deployment procedures
    ├── src/
    │   ├── components/
    │   │   ├── SimpleNegationAnalyzer.jsx    # Main application component
    │   │   └── NegationAnalyzer.css          # Styling for the application
    │   ├── App.js                            # Root React component
    │   ├── index.js                          # Application entry point
    │   └── index.css                         # Global styles
    ├── public/                               # Static assets
    ├── amplify/                              # AWS Amplify configuration
    │   └── backend/                          # Backend configuration
    ├── amplify.yml                           # Amplify build configuration
    └── package.json                          # Project dependencies
```

## Documentation Organization

### Root Directory Documentation
1. **README.md**
   - System overview
   - Latest features
   - Quick links
   - Documentation structure

2. **PRODUCTION_STATE.md**
   - Current version
   - Deployment status
   - System state
   - Known issues

3. **ANALYSIS_MODES.md**
   - Analysis modes description
   - Classification system
   - Performance considerations
   - Best practices

### Implementation Directory Documentation
1. **README.md**
   - Technical implementation
   - Development setup
   - Code examples
   - Performance optimization

2. **FILE_STRUCTURE.md**
   - File organization
   - Update procedures
   - Code structure
   - Implementation guide

3. **UPDATE_CHECKLIST.md**
   - Testing procedures
   - Deployment steps
   - Verification process
   - Quality checks

## Key Files and Their Purposes

[Rest of the file content remains the same...]
