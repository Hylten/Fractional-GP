#!/bin/bash
# Fractional GP Auto-Publish Script

echo "🚀 Starting Auto-Publish for Fractional GP..."

# 1. Build
npm run build

# 2. Add changes
git add .

# 3. Commit
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
git commit -m "Auto-publish: Fractional GP Update [$TIMESTAMP]"

# 4. Push
echo "📦 Pushing to GitHub..."
git push origin main

echo ""
echo "✅ Fractional GP Publish complete!"
