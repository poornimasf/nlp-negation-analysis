#!/bin/bash

# Function to check if we're in a detached HEAD state
check_head_state() {
    if git symbolic-ref -q HEAD >/dev/null; then
        return 0
    else
        echo "WARNING: In detached HEAD state"
        return 1
    fi
}

# Function to ensure we're on the main branch
ensure_main_branch() {
    current_branch=$(git branch --show-current)
    if [ "$current_branch" != "main" ]; then
        echo "Not on main branch. Current branch: $current_branch"
        echo "Switching to main branch..."
        git checkout main
    fi
}

# Function to sync with remote
sync_with_remote() {
    echo "Fetching latest changes..."
    git fetch origin
    
    local_head=$(git rev-parse HEAD)
    remote_head=$(git rev-parse origin/main)
    
    if [ "$local_head" != "$remote_head" ]; then
        echo "Local main is not in sync with remote"
        echo "Pulling latest changes..."
        git pull origin main
    fi
}

# Main workflow function
git_workflow() {
    # Check if we're in a git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        echo "Error: Not in a git repository"
        return 1
    }

    # Check HEAD state
    if ! check_head_state; then
        echo "Creating new branch from current HEAD..."
        git checkout -b temp-branch
        git checkout main
        git merge temp-branch
        git branch -d temp-branch
    fi

    # Ensure we're on main branch
    ensure_main_branch

    # Sync with remote
    sync_with_remote
}

# Run the workflow
git_workflow
