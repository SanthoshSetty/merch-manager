#!/bin/bash

# Script to update the merch-manager repository
# This script will add, commit, and push changes to GitHub

echo "🔄 Updating merch-manager repository..."

# Check if there are any changes
if git diff-index --quiet HEAD --; then
    echo "✅ No changes to commit"
    exit 0
fi

# Show current status
echo "📋 Current git status:"
git status --short

# Add all changes
echo "➕ Adding all changes..."
git add -A

# Prompt for commit message or use default
read -p "📝 Enter commit message (or press Enter for default): " commit_msg

if [ -z "$commit_msg" ]; then
    commit_msg="Update merch-manager - $(date '+%Y-%m-%d %H:%M:%S')"
fi

# Commit changes
echo "💾 Committing changes..."
git commit -m "$commit_msg"

# Push to GitHub
echo "🚀 Pushing to GitHub..."
git push origin main

echo "✅ Repository updated successfully!"
echo "🌐 Backend URL: https://merch-manager-backend-361151780407.us-central1.run.app"
echo "🌐 Frontend URL: https://merch-manager-frontend-361151780407.us-central1.run.app"
