# Git Workflow Guide

## Current Repository State
- **Version**: 2.6.2
- **Last Updated**: August 2, 2025
- **Status**: ✅ Active and Stable
- **Main Branch**: Protected, requires direct commits

## Recent Changes
- Simplified to binary classification
- Removed logical negation analysis
- Updated confidence scoring
- Improved documentation

## Working with the Repository

### Production Code Location
All production code must be in:
```
/main/src/utils/
```

Development and testing code in:
```
/main/negation-analyzer/src/utils/
```

### Training Data Format
The repository uses a simplified JSON format:
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

### Git Workflow

1. **Always work on main branch:**
   ```bash
   git checkout main
   git pull origin main
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
   git commit -m "type: description

   - Bullet points for changes
   - Follow conventional commits
   - Include context if needed"
   git push origin main
   ```

### Commit Types
- **fix**: Bug fixes
- **feat**: New features
- **docs**: Documentation changes
- **chore**: Maintenance tasks
- **test**: Adding or updating tests
- **refactor**: Code improvements

## Automated Safeguards

### Pre-commit Hook
- Prevents commits in detached HEAD state
- Ensures you're on main branch
- Runs in .git/hooks

### Workflow Script
- Checks HEAD state
- Ensures main branch
- Syncs with remote
- Fixes detached HEAD

## File Organization

### Production Files
- NegationAnalyzer.js
- textProcessing.js
- Other core utilities

### Development Files
- Test files
- Experimental features
- Documentation

## Deployment Process

1. **Pre-deployment Checks:**
   - Run workflow script
   - Verify on main branch
   - Check file changes

2. **Commit Process:**
   ```bash
   git add .
   git commit -m "type: description"
   git push origin main
   ```

3. **Deployment:**
   - Automatic via AWS Amplify
   - Triggered by push to main
   - Build status in Console

## Best Practices

### Before Starting Work
- Run workflow script
- Pull latest changes
- Verify branch status

### Making Changes
- Work directly on main
- Commit frequently
- Use clear messages
- Push regularly

### Code Quality
- Test changes locally
- Update documentation
- Follow standards
- Use provided scripts

## Troubleshooting

### Detached HEAD State
If you see "detached HEAD" message:

1. **Save changes:**
   ```bash
   git branch temp-branch
   ```

2. **Switch to main:**
   ```bash
   git checkout main
   ```

3. **Apply changes:**
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

### Documentation
- GIT_WORKFLOW.md (this file)
- PRODUCTION_STATE.md
- Component READMEs

### Scripts
- git-workflow.sh
- sync-analyzer.sh
- validation tools

### Monitoring
- AWS Amplify Console
- GitHub repository
- Build logs
