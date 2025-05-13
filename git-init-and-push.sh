#!/bin/bash

# Git Initialization and Push Script

# Initialize a new Git repository
echo "Initializing Git repository..."
git init

# Add all files to the staging area
echo "Adding files to staging area..."
git add .

# Make the initial commit
echo "Creating initial commit..."
git commit -m "Initial commit"

# Prompt for remote repository URL
echo "Enter your remote repository URL (e.g., https://github.com/username/repository.git):"
read remote_url

# Add the remote repository
echo "Adding remote repository..."
git remote add origin $remote_url

# Determine the default branch name (main or master)
default_branch=$(git config --get init.defaultBranch)
if [ -z "$default_branch" ]; then
    # If not configured, check Git version to guess default branch
    git_version=$(git --version | awk '{print $3}')
    if [ "$(printf '%s\n' "2.28" "$git_version" | sort -V | head -n1)" = "2.28" ]; then
        default_branch="main"
    else
        default_branch="master"
    fi
fi

# Push to the remote repository
echo "Pushing to remote repository ($default_branch branch)..."
git push -u origin $default_branch

echo "Git repository initialized and pushed successfully!" 