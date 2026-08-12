#!/usr/bin/env bash
# One-time setup: point git at the versioned hooks in scripts/git-hooks/,
# so tests run automatically before every commit and push.
set -euo pipefail

repo_root="$(git rev-parse --show-toplevel)"
chmod +x "$repo_root"/scripts/git-hooks/* "$repo_root"/scripts/run-tests.sh
git config core.hooksPath "$repo_root/scripts/git-hooks"

echo "Git hooks installed (core.hooksPath -> scripts/git-hooks)."
echo "The test suite now runs automatically before every commit and push."
