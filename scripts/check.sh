#!/bin/sh
# Checks skill and subagent frontmatter, JSON manifests, the TypeScript, and
# that every relative Markdown link points at a file that exists.
set -eu

cd "$(dirname "$0")/.."
failed=0
fail() {
  echo "error: $*" >&2
  failed=1
}

# Prints the value of a frontmatter key in $1, or nothing.
frontmatter() {
  awk -v key="$2" 'NR == 1 && $0 != "---" { exit } NR > 1 && $0 == "---" { exit }
    NR > 1 && index($0, key ": ") == 1 { print substr($0, length(key) + 3); exit }' "$1"
}

for dir in skills/*/; do
  name=$(basename "$dir")
  file="${dir}SKILL.md"
  [ -f "$file" ] || { fail "$dir has no SKILL.md"; continue; }
  [ "$(frontmatter "$file" name)" = "$name" ] || fail "$file: frontmatter name must be \"$name\""
  [ -n "$(frontmatter "$file" description)" ] || fail "$file: frontmatter needs a description"
done

for file in agents/*.md; do
  name=$(basename "$file" .md)
  [ "$(frontmatter "$file" name)" = "$name" ] || fail "$file: frontmatter name must be \"$name\""
  [ -n "$(frontmatter "$file" description)" ] || fail "$file: frontmatter needs a description"
done

for file in .claude-plugin/*.json .codex-plugin/*.json hooks/*.json package.json; do
  python3 -m json.tool "$file" >/dev/null 2>&1 || fail "$file is not valid JSON"
done

# Relative links only; URLs and in-page anchors are skipped.
for file in $(git ls-files --cached --others --exclude-standard '*.md'); do
  base=$(dirname "$file")
  for target in $(grep -o '](\([^)#]*\)' "$file" | sed 's/^](//' | grep -v '^[a-z]*:' || true); do
    [ -e "$base/$target" ] || fail "$file: broken link to $target"
  done
done

# With no path, rg reads stdin when stdin is not a TTY, and agent shells often
# leave stdin open as a pipe, so a pathless example hangs the agent.
for file in $(git ls-files --cached --others --exclude-standard '*.md'); do
  grep -n -o -E '(^|`)rg [^`]*' "$file" | awk -v file="$file" '
    { line = $0; sub(/:.*/, "", line); text = substr($0, length(line) + 2); sub(/^`/, "", text)
      gsub(/'"'"'[^'"'"']*'"'"'|"[^"]*"/, "\x27Q", text)
      n = split(text, t, /[ \t]+/); last = t[n]; prev = t[n - 1]
      if (last ~ /^['"'"'"-]/ || prev ~ /^-([egtTmACB]|-glob|-type|-type-not|-max-count|-context|-after-context|-before-context|-regexp)$/)
        { print "error: " file ":" line ": rg example needs an explicit path, such as ." > "/dev/stderr"; bad = 1 } }
    END { exit bad }' || failed=1
done

# The OpenCode plugin and the go skill's scripts are TypeScript run by Bun.
bun install --frozen-lockfile >/dev/null || fail "bun install failed at the repo root"
bun run --silent typecheck || fail "opencode/plugin.ts does not typecheck"
(cd skills/go/scripts && bun install --frozen-lockfile >/dev/null && bun run --silent typecheck && bun run --silent test) ||
  fail "skills/go/scripts: typecheck or tests failed"

[ "$failed" = 0 ] && echo "ok"
exit "$failed"
