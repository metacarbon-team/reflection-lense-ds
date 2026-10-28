#!/bin/bash
# SessionStart hook: installs dependencies in Claude Code cloud sessions only.
# Locally CLAUDE_CODE_REMOTE is never "true", so this exits without touching anything.

if [ "$CLAUDE_CODE_REMOTE" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR" || exit 1

# pnpm-lock.yaml is lockfile v9, which needs pnpm 9 or later.
pnpm_major=$(pnpm --version 2>/dev/null | cut -d. -f1)
if [ -z "$pnpm_major" ] || [ "$pnpm_major" -lt 9 ]; then
  npm install -g pnpm@10 || exit 1
fi

# Skip the install while the lockfile, package.json and this script are unchanged.
hashes=node_modules/.install_pkgs.sha256
if ! sha256sum --check --status "$hashes" 2>/dev/null; then
  # Delete the old hashes first, so a failed install runs again next time
  rm -f "$hashes"
  # CI=true keeps pnpm from waiting on a TTY prompt, which a hook can't answer
  if CI=true pnpm install --frozen-lockfile; then
    sha256sum scripts/install_pkgs.sh package.json pnpm-workspace.yaml pnpm-lock.yaml packages/*/package.json apps/*/package.json > "$hashes" || rm -f "$hashes"
  fi
fi

exit 0
