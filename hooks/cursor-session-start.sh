#!/bin/sh
# Cursor's sessionStart hook reads JSON from stdout, so wrap the reminder that
# every harness shares in {"additional_context": "..."}.
set -eu
awk 'BEGIN { printf "{\"additional_context\": \"" }
  { gsub(/\\/, "\\\\"); gsub(/"/, "\\\""); printf "%s%s", (NR > 1 ? "\\n" : ""), $0 }
  END { print "\"}" }' "$(dirname "$0")/../rules/AGENTS.md"
