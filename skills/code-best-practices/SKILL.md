---
name: code-best-practices
description: Language-neutral code rules for file length, duplication, and libraries over hand-rolled code. Use when writing or reviewing code in any language, or when a file nears 500 lines.
---

# Code best practices

Apply the **minimize-reader-load** and **subtract-before-you-add** principle skills first. Then the best-practices skill for the language.

| Rule | Summary |
|------|---------|
| Files under 500 lines | Tests, stylesheets, and components included. Generated files, lockfiles, fixtures, and data don't count. |
| Split by responsibility | `format/tokens.ts` and `format/tables.ts`, not `format-1.ts`. Split first in its own commit, then make the change. |
| Enforce it in CI | Copy `templates/check-file-length.sh` into `scripts/` and run it from the check command. Never add to `.file-length-ignore`. |
| One home per rule | Search before writing a helper. The second copy becomes an extraction both callers use. |
| Usual offenders | Validation, parsing, formatting, permission checks, pricing, and constants. |
| Types from one source | Derive them from the schema, database, or protocol package. |
| Alike isn't duplicate | Code that changes for different reasons can stay separate. Duplicated rules can't. |
| Libraries over hand-rolled | Parsing, validation, HTTP and retries, auth, crypto, protocol SDKs, CLI args, accessible widgets, media. Record any deliberate hand-roll in `AGENTS.md`. |

Details: `references/guide.md`. Choosing a package: the **add-dependency** skill.
