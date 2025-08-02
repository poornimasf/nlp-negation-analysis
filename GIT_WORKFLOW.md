# Git Workflow Guide

## Preventing Detached HEAD State

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

## If You End Up in Detached HEAD State

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

## Best Practices

1. Always run `./scripts/git-workflow.sh` before starting work
2. Commit frequently to main branch
3. Push changes regularly
4. If you see warnings, follow the suggested commands
5. Keep local main in sync with remote main

## Deployment Process

1. Changes to main branch trigger automatic deployment
2. Deployment status can be checked in AWS Amplify Console
3. Wait for deployment to complete before making more changes

## Troubleshooting

If you encounter issues:

1. **Check your HEAD state:**
   ```bash
   git status
   ```

2. **View current branch:**
   ```bash
   git branch
   ```

3. **Run the workflow script:**
   ```bash
   ./scripts/git-workflow.sh
   ```

4. **If needed, force sync with remote:**
   ```bash
   git fetch origin
   git reset --hard origin/main
   ```
