#!/usr/bin/env bash
# Single source of truth for "run the whole test suite" - used by the git
# hooks (scripts/git-hooks/) and by CI (.github/workflows/tests.yml).
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

echo "Running JS tests..."
for test_file in tests/*.test.js; do
  echo "--- $test_file ---"
  node "$test_file"
done

echo "Running Python smoke test..."
python3 tests/smoke_nordsee_tide_test.py

echo "All tests passed."
