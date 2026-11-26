#!/bin/sh
# Makes the standards in AGENTS.md part of every agent session on this machine.
#
#   Claude Code: adds an import of this repo's AGENTS.md to ~/.claude/CLAUDE.md
#   Codex:       copies AGENTS.md into ~/.codex/AGENTS.md (Codex has no imports)
#   Pi:          copies AGENTS.md into ~/.pi/agent/AGENTS.md (no imports either)
#   Antigravity: copies AGENTS.md into ~/.gemini/AGENTS.md (no imports either)
#
# OpenCode takes the path in opencode.json, and Cursor keeps user rules in its
# settings rather than a file, so neither is touched here.
#
# Every edit lives between marker lines, so rerunning replaces them and nothing
# else in those files is touched. Skills and subagents install as a plugin
# instead (see README).
#
# Usage: scripts/install.sh [--dry-run] [--uninstall]
set -eu

repo=$(cd "$(dirname "$0")/.." && pwd)
begin='<!-- BEGIN harville-labs/agents (managed by scripts/install.sh) -->'
end='<!-- END harville-labs/agents -->'
dry_run=0
uninstall=0
for arg in "$@"; do
  case $arg in
    --dry-run) dry_run=1 ;;
    --uninstall) uninstall=1 ;;
    *) echo "unknown option: $arg (expected --dry-run or --uninstall)" >&2; exit 2 ;;
  esac
done

# Rewrites $1 without the managed block, then appends $2 as the new block
# unless it's empty.
write_block() {
  file=$1
  body=$2
  tmp=$(mktemp)
  if [ -f "$file" ]; then
    awk -v b="$begin" -v e="$end" '$0 == b { skip = 1 } !skip { print } $0 == e { skip = 0 }' "$file" >"$tmp"
  fi
  if [ -n "$body" ]; then
    # Separate from existing content with one blank line.
    if [ -s "$tmp" ] && [ -n "$(tail -c 1 "$tmp")" ]; then echo >>"$tmp"; fi
    if [ -s "$tmp" ]; then echo >>"$tmp"; fi
    printf '%s\n%s\n%s\n' "$begin" "$body" "$end" >>"$tmp"
  fi
  if [ "$dry_run" = 1 ]; then
    echo "--- would write $file:"
    cat "$tmp"
    rm "$tmp"
  else
    mkdir -p "$(dirname "$file")"
    mv "$tmp" "$file"
    echo "updated $file"
  fi
}

if [ "$uninstall" = 1 ]; then
  write_block "$HOME/.claude/CLAUDE.md" ''
  write_block "$HOME/.codex/AGENTS.md" ''
  write_block "$HOME/.pi/agent/AGENTS.md" ''
  write_block "$HOME/.gemini/AGENTS.md" ''
  exit 0
fi

write_block "$HOME/.claude/CLAUDE.md" "# Engineering standards
@$repo/AGENTS.md"

# Codex, Pi, and Antigravity can't import, so they get a copy with links made
# absolute. Rerun after pulling.
copy=$(sed "s#](skills/#]($repo/skills/#g" "$repo/AGENTS.md")
write_block "$HOME/.codex/AGENTS.md" "$copy"
write_block "$HOME/.pi/agent/AGENTS.md" "$copy"
write_block "$HOME/.gemini/AGENTS.md" "$copy"

cat <<EOF

Standards installed. For skills and subagents, install the plugin for your
harness; the README has the commands.
EOF
