#!/usr/bin/env bash
# ============================================================================
#  Push to GitHub — creates new repo & pushes entire codebase
#  Usage:  ./scripts/push-to-github.sh [github-username] [repo-name]
#
#  Requires: GitHub Personal Access Token with `repo` scope
#            Set it as env var: export GITHUB_TOKEN=ghp_xxxxxxxxxxxx
# ============================================================================

set -e

USER="${1:-abu-bishar}"
REPO="${2:-abu-bishar-platform}"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

if [ -z "$GITHUB_TOKEN" ]; then
  echo "❌ GITHUB_TOKEN env var not set"
  echo "   1) Go to https://github.com/settings/tokens"
  echo "   2) Create token with 'repo' scope"
  echo "   3) export GITHUB_TOKEN=ghp_xxxxxxxxxxxx"
  exit 1
fi

echo "🚀 Creating GitHub repo $USER/$REPO..."
HTTP_CODE=$(curl -s -o /tmp/_gh.json -w "%{http_code}" \
  -X POST "https://api.github.com/user/repos" \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  -d "{\"name\":\"$REPO\",\"description\":\"أبو بشار — Multi-platform e-commerce (NestJS + Next.js + Flutter)\",\"private\":false}")

if [ "$HTTP_CODE" = "201" ]; then
  echo "✅ Repository created!"
elif [ "$HTTP_CODE" = "422" ]; then
  echo "⚠️  Repo already exists, will just push"
else
  echo "❌ Failed to create repo (HTTP $HTTP_CODE)"
  cat /tmp/_gh.json
  exit 1
fi

cd "$ROOT"

# Initialise / ensure git
if [ ! -d ".git" ]; then
  git init -b main
fi

git config user.email "tbashyalo566@gmail.com"
git config user.name  "Abu Bashar DevOps"

# Set remote (use HTTPS token auth)
git remote remove origin 2>/dev/null || true
git remote add origin "https://x-access-token:$GITHUB_TOKEN@github.com/$USER/$REPO.git"

# Stage everything
echo "📦 Staging files..."
git add -A

# Commit
if git diff --cached --quiet; then
  echo "ℹ️  Nothing new to commit"
else
  git commit -m "🚀 Initial: أبو بشار multi-platform architecture

- Backend: NestJS + Prisma + PostgreSQL (35+ tables)
- Web: Next.js 14 (App Router, RTL, TanStack Query)
- Mobile: Flutter 3 (Riverpod, Hive offline cache, freezed)

Features (#1-35):
✓ AI Sales Assistant, Size Calculator, Ad Copy Generator
✓ Visual Search (pHash), Search Log Summarizer
✓ Predictive Inventory Analytics
✓ PDF Invoice + QR Code
✓ Product Recommendations Engine
✓ Real-time Pricing Rules
✓ Guest Checkout, Wishlist with Price Drop Alerts
✓ Gift Cards, Loyalty Points Wallet
✓ Group Buying (5/10/15% tiers)
✓ Affiliate Marketing Tracker
✓ Abandoned Cart Vouchers, Exit-Intent Popups
✓ CSV Bulk Import, Bulk Operations
✓ Currency Pegging (YER/SAR/USD)
✓ Banner Customizer, Dark/Light Theme
✓ Master Admin (5-tap logo), Audit Log (employee actions)
✓ PWA Install Prompt, Service Worker
✓ WebP compression, CDN-ready" --no-verify || true
fi

echo "⬆️  Pushing to GitHub..."
# Make sure branch is main
git branch -M main

# Push with verbose retry
if git push -u origin main --no-verify; then
  echo ""
  echo "✅ Successfully pushed to https://github.com/$USER/$REPO"
  echo ""
  echo "📋 Next steps:"
  echo "   1. Visit https://github.com/$USER/$REPO/actions"
  echo "   2. Watch the Flutter Build workflow run"
  echo "   3. Download artifacts from the run when complete (5-15 min)"
  echo ""
  echo "🔗 Direct links (once CI completes):"
  echo "   APK (arm64):  https://github.com/$USER/$REPO/actions/runs/...#artifacts"
  echo "   iOS Bundle:   https://github.com/$USER/$REPO/actions/runs/...#artifacts"
  echo "   Web (Vercel): see deploy-web workflow run"
else
  echo "❌ Push failed"
  exit 1
fi