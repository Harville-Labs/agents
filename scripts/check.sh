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

# Every harness reads agents/, and a field one harness defines (a tools list,
# a model) means something else or nothing in another, so keep to the shared two.
for file in agents/*.md; do
  name=$(basename "$file" .md)
  [ "$(frontmatter "$file" name)" = "$name" ] || fail "$file: frontmatter name must be \"$name\""
  [ -n "$(frontmatter "$file" description)" ] || fail "$file: frontmatter needs a description"
  extra=$(awk 'NR > 1 && $0 == "---" { exit } NR > 1 && /^[A-Za-z_-]+:/ { sub(/:.*/, ""); if ($0 != "name" && $0 != "description") print }' "$file")
  [ -z "$extra" ] || fail "$file: frontmatter may only hold name and description, not: $extra"
done

manifests=".claude-plugin/plugin.json .codex-plugin/plugin.json .cursor-plugin/plugin.json .antigravity-plugin/plugin.json"
for file in $manifests .claude-plugin/marketplace.json hooks/*.json package.json; do
  python3 -m json.tool "$file" >/dev/null 2>&1 || fail "$file is not valid JSON"
done
versions=$(for file in $manifests; do python3 -c 'import json, sys; print(json.load(open(sys.argv[1]))["version"])' "$file" 2>/dev/null; done | sort -u)
[ "$(printf '%s\n' "$versions" | wc -l | tr -d ' ')" = 1 ] ||
  fail "plugin manifests disagree on version ($(echo $versions)). Set the same version in: $manifests"
sh hooks/cursor-session-start.sh | python3 -m json.tool >/dev/null 2>&1 ||
  fail "hooks/cursor-session-start.sh must print valid JSON"

# Each harness needs its reference and a place in every list that names them.
# Fields: reference file slug, name in prose, label on the site.
for entry in "claude-code|Claude Code|claude code" "opencode|OpenCode|opencode" "codex|Codex|codex" "pi|Pi|pi" \
  "cursor|Cursor|cursor" "antigravity|Antigravity|antigravity"; do
  slug=${entry%%|*}
  rest=${entry#*|}
  title=${rest%%|*}
  label=${rest#*|}
  [ -f "skills/go/references/$slug.md" ] || fail "skills/go/references/$slug.md is missing for $title"
  grep -q "](references/$slug.md)" skills/go/SKILL.md || fail "skills/go/SKILL.md must link references/$slug.md"
  grep -q "^| $title |" skills/help/SKILL.md || fail "skills/help/SKILL.md needs a row for $title"
  grep -q "^## $slug$" skills/setup-models/SKILL.md || fail "skills/setup-models/SKILL.md needs a ## $slug section"
  grep -q " in $title" agents/worker.md || fail "agents/worker.md must name $title's plugin folder"
  grep -q "label: '$label'" site/src/lib/harness.svelte.ts || fail "site/src/lib/harness.svelte.ts needs $title"
  grep -q "^| $title |" README.md || fail "README.md's Harnesses table needs $title"
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

# The OpenCode plugin, the Pi extension, and the go skill's scripts are TypeScript.
bun install --frozen-lockfile >/dev/null || fail "bun install failed at the repo root"
bun run --silent typecheck || fail "TypeScript typecheck failed"
(cd skills/go/scripts && bun install --frozen-lockfile >/dev/null && bun run --silent typecheck && bun run --silent test) ||
  fail "skills/go/scripts: typecheck or tests failed"

[ "$failed" = 0 ] && echo "ok"
exit "$failed"
