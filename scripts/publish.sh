#!/bin/bash
# Alpha Architect Auto-Publish Script

echo "🚀 Starting Auto-Publish for Alpha Architect..."

# 1. Build
npm run build

# 2. Add changes
git add .

# 3. Commit
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
git commit -m "Auto-publish: Alpha Architect Update [$TIMESTAMP]"

# 4. Push
echo "📦 Pushing to GitHub..."
git push origin main

echo ""
echo "✅ Alpha Architect Publish complete!"
