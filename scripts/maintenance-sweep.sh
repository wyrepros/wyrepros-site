#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
V1_DIR="/Users/clanker/.openclaw/workspace/wyrepros-v1"

cd "$ROOT_DIR"

echo "🧹 Wyre Pros maintenance sweep starting..."

echo "1) Install consistency check (npm ci if lockfile present)"
if [[ -f package-lock.json ]]; then
  npm ci --silent
else
  npm install --silent
fi

echo "2) Lint"
npm run lint

echo "3) Production build"
npm run build

echo "4) Sync latest build -> localhost target"
rsync -a --delete --exclude '.github' "$ROOT_DIR/dist/" "$V1_DIR/"

echo "5) Optional stale process snapshot"
echo "--- Running node/python preview processes ---"
ps aux | grep -E "vite|http.server|python3 -m http.server" | grep -v grep || true

echo "✅ Maintenance sweep complete."
echo "Preview: http://localhost:8000"
