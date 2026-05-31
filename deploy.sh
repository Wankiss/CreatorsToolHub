#!/usr/bin/env bash
# ── CreatorsToolHub deploy script ────────────────────────────────────────────
# Usage (from server):  bash deploy.sh
#        skip frontend: bash deploy.sh --skip-frontend
# ─────────────────────────────────────────────────────────────────────────────
set -e

REPO_DIR="$HOME/domains/creatorstoolhub.com/nodejs"
RESTART_FILE="$HOME/domains/creatorstoolhub.com/nodejs/tmp/restart.txt"

cd "$REPO_DIR"

# ── 1. Pull latest code ───────────────────────────────────────────────────────
echo "→ Pulling latest code..."
git fetch origin
git reset --hard origin/master

# ── 2. Fix permissions (always needed after git reset on Hostinger) ───────────
echo "→ Fixing permissions..."
export PATH="/opt/alt/alt-nodejs22/root/usr/bin:$PATH"
export PATH="$HOME/.npm/_npx/e6e0ed1aca658cae/node_modules/.bin:$PATH"

chmod +x node_modules/.bin/tsx        2>/dev/null || true
chmod +x node_modules/.bin/vite       2>/dev/null || true
chmod +x node_modules/.bin/tsc        2>/dev/null || true

# Fix esbuild binary
ESBUILD_BIN=$(find node_modules/.pnpm -name "esbuild" -path "*/linux-x64/bin/esbuild" 2>/dev/null | head -1)
if [ -n "$ESBUILD_BIN" ]; then
  chmod +x "$ESBUILD_BIN"
  echo "   esbuild: $ESBUILD_BIN ✓"
fi

# ── 3. Build API server ───────────────────────────────────────────────────────
echo "→ Building API server..."
cd artifacts/api-server
./node_modules/.bin/tsx ./build.ts
cd ../..

# ── 4. Build frontend (optional) ─────────────────────────────────────────────
if [ "$1" != "--skip-frontend" ]; then
  echo "→ Building frontend..."
  cd artifacts/creator-toolbox
  RAYON_NUM_THREADS=1 npm run build
  cd ../..
else
  echo "→ Skipping frontend build."
fi

# ── 5. Restart Node app ───────────────────────────────────────────────────────
echo "→ Restarting app..."
mkdir -p "$(dirname "$RESTART_FILE")"
touch "$RESTART_FILE"

echo ""
echo "✅ Deploy complete!"
