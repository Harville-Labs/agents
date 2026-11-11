# Code structure

Applies to every language. Stack-specific rules are in the typescript, svelte, python, go, and rust best-practices skills.

## File length

**No hand-written file over 500 lines.** That includes tests, stylesheets, and Svelte components. Long files mix responsibilities, take longer to review, and cost agents context they need for the actual change.

- Split by responsibility, not by line count: `format.ts` becomes `format/tokens.ts` and `format/tables.ts`, not `format-1.ts` and `format-2.ts`. Tests split along the same lines as the code they test.
- When a change would push a file past 500 lines, split it first, in a commit of its own, then make the change.
- Don't touch an existing long file only to split it as part of an unrelated change. Split it in its own PR, or when you next make a substantial change to it.
- Generated files, lockfiles, fixtures, and data files don't count.

Enforce it in CI with [templates/check-file-length.sh](../../../templates/check-file-length.sh). Copy it to `scripts/`, run it from the check command, and list generated files and grandfathered long files in `.file-length-ignore`. Remove a file from that list when it's split. Never add a new one.

## Duplication

**Each piece of logic has one home.** Two copies of a rule drift until they disagree, and then one of them is a bug.

- Before writing a helper, search for one: `rg -i '<what it does>' .`, and read the repository's shared modules (`lib/`, `utils/`, `internal/`, `packages/*`).
- The second time you'd write the same logic, extract it and make both callers use it. Don't copy and adapt.
- Validation, parsing, formatting, permission checks, pricing, and constants (limits, URLs, error codes) are the usual offenders. Define each once and import it everywhere, across the client and server too when they share a package.
- Types come from one source: derive them from the schema (`z.infer`, Pydantic models), the database schema, or the protocol package. Don't redeclare them by hand.
- Code that looks alike but changes for different reasons isn't duplication. Two endpoints that happen to have the same three lines today can stay separate. Duplicated *rules* can't.

## Libraries over hand-rolled code

Use a well-maintained library for anything with a long tail of edge cases: parsing (dates, URLs, CSV, YAML, Markdown), validation, HTTP clients and retries, auth, crypto, protocol SDKs, CLI argument parsing, accessible UI widgets, and image or media handling. A library that thousands of projects use has already hit the bugs you would hit.

Hand-roll only small, well-understood code where a library would add more than it removes, and record each such choice in the repository's `AGENTS.md` with the reason. [add-dependency](../../add-dependency/SKILL.md) covers how to choose and justify a package.

## Components

On the web, UI is built from components. See the **svelte-best-practices** skill.
