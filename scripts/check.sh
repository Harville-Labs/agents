#!/bin/sh
# Checks the repo's structure: skill and subagent frontmatter, JSON manifests,
# and that every relative Markdown link points at a file that exists.
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

for file in .claude-plugin/*.json; do
  python3 -m json.tool "$file" >/dev/null 2>&1 || fail "$file is not valid JSON"
done

# Relative links only; URLs and in-page anchors are skipped.
for file in $(git ls-files --cached --others --exclude-standard '*.md'); do
  base=$(dirname "$file")
  for target in $(grep -o '](\([^)#]*\)' "$file" | sed 's/^](//' | grep -v '^[a-z]*:' || true); do
    [ -e "$base/$target" ] || fail "$file: broken link to $target"
  done
done

[ "$failed" = 0 ] && echo "ok"
exit "$failed"
