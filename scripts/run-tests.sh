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
# Resolve a working interpreter: python3 -> py -> python. On Windows the
# Microsoft Store stub may shadow python3, so each candidate is test-run.
python_cmd=""
for candidate in python3 py python; do
  if command -v "$candidate" >/dev/null 2>&1 \
    && "$candidate" -c pass >/dev/null 2>&1; then
    python_cmd="$candidate"
    break
  fi
done
if [ -z "$python_cmd" ]; then
  echo "No working Python interpreter found (tried: python3, py, python)." >&2
  exit 1
fi
"$python_cmd" tests/smoke_nordsee_tide_test.py

echo "All tests passed."
