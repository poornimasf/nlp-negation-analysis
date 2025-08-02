# Git Workflow Guide

## Current Repository State
- **Version**: 2.6.1
- **Last Updated**: August 2, 2025
- **Status**: ✅ Active and Stable
- **Main Branch**: Protected, requires direct commits

## Recent Changes
- Updated training data format
- Added git workflow safeguards
- Improved UI components
- Enhanced error handling

## Working with the Repository

### Training Data Format
The repository now uses a simplified JSON format:
```json
{
  "examples": [
    {
      "text": "French sentence",
      "has_expletive_ne": true/false,
      "classification": true/false,
      "trigger": "peur que"|"avant que"|"peu s'en faut"|null,
      "ne_position": number|null
    }
  ]
}
```

### Preventing Detached HEAD State

To avoid detached HEAD states and ensure proper git workflow:

1. **Always work on the main branch:**
   ```bash
   git checkout main
   ```

2. **Before making changes:**
   ```bash
   # Run the workflow script
   ./scripts/git-workflow.sh
   ```

3. **When making changes:**
   ```bash
   # Make your changes
   git add .
   git commit -m "your message"
   git push origin main
   ```

## Automated Safeguards

The repository includes several safeguards:

1. **Pre-commit Hook:**
   - Prevents commits in detached HEAD state
   - Ensures you're on the main branch
   - Automatically installed in .git/hooks

2. **Workflow Script:**
   - Checks HEAD state
   - Ensures main branch
   - Syncs with remote
   - Fixes detached HEAD if detected

## Component Updates

### Training Data Section
- New collapsible format guide
- Improved error handling
- Automatic format conversion
- Better validation

### UI Components
- Updated JSON format display
- Enhanced error messages
- Improved styling
- Better user feedback

## Deployment Process

1. **Pre-deployment Checks:**
   - Run workflow script
   - Verify on main branch
   - Check file changes

2. **Commit Process:**
   ```bash
   git add .
   git commit -m "descriptive message"
   git push origin main
   ```

3. **Deployment:**
   - Automatic via AWS Amplify
   - Triggered by push to main
   - Build status in Amplify Console

## Best Practices

1. **Before Starting Work:**
   - Run workflow script
   - Pull latest changes
   - Verify branch status

2. **Making Changes:**
   - Work directly on main
   - Commit frequently
   - Use clear commit messages
   - Push regularly

3. **Code Quality:**
   - Test changes locally
   - Update documentation
   - Follow format guidelines
   - Use provided scripts

## Troubleshooting

### Detached HEAD State
If you see "detached HEAD" message:

1. **Save your changes:**
   ```bash
   git branch temp-branch
   ```

2. **Switch to main:**
   ```bash
   git checkout main
   ```

3. **Merge your changes:**
   ```bash
   git merge temp-branch
   ```

4. **Clean up:**
   ```bash
   git branch -d temp-branch
   ```

### Common Issues

1. **Push Rejected:**
   ```bash
   git pull origin main
   git push origin main
   ```

2. **Merge Conflicts:**
   - Resolve conflicts
   - Commit changes
   - Push to main

3. **Build Failures:**
   - Check Amplify Console
   - Review error logs
   - Fix and redeploy

## Support and Resources

1. **Documentation:**
   - GIT_WORKFLOW.md (this file)
   - PRODUCTION_STATE.md
   - Component READMEs

2. **Scripts:**
   - git-workflow.sh
   - deployment scripts
   - validation tools

3. **Monitoring:**
   - AWS Amplify Console
   - GitHub repository
   - Build logs
