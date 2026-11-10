---
name: self-review
description: Review your own diff against the repository's standards before reporting work as done or opening a PR. Use after finishing an implementation, before committing, or when asked to "review", "double-check", or "look over" changes.
---

# Self-review

Read the whole diff as a reviewer would, not as the person who wrote it.

```sh
git status
git diff main...HEAD      # or `git diff` for uncommitted work
```

Go through each list. Fix what you find, then rerun the full check command.

## Correctness

- [ ] Every new branch, error path, and edge case is exercised by a test, or you can say why not.
- [ ] Errors are handled where they can be handled and propagated with context everywhere else. Nothing is swallowed silently.
- [ ] Inputs from outside the process are validated at the boundary.
- [ ] Async work is cancellable and bounded; nothing can hang or grow without limit.
- [ ] Callers of anything you changed still work. Search for them: `rg '<name>'`.

## Repository invariants

- [ ] Re-read the invariants and "things not to do" in the repository's `AGENTS.md`. The change breaks none of them, or an ADR is included.
- [ ] Code is in the layer that owns it (no agent behavior in a client, no I/O in a pure module, no server code bundled to the browser).

## Scope and style

- [ ] The feature is only what was requested. No drive-by renames or restructuring.
- [ ] Existing problems you ran into (lint warnings, failing tests, bugs) are fixed in their own commits and listed in your report, or named with the reason you left them.
- [ ] Reads like the code around it: naming, structure, comment density.
- [ ] No file you touched is over 500 lines (the **code-best-practices** skill).
- [ ] No duplicated logic: you searched for an existing helper or component before writing one, and nothing you wrote repeats logic that already exists.
- [ ] Nothing hand-rolled that a well-maintained library already does (parsing, validation, dates, auth, accessible widgets).
- [ ] The repository's toolchain is the standard one: TypeScript, Vite, and Biome for web; uv and Ruff for Python. No `pip`, `requirements.txt`, ESLint, Prettier, or `.js` sources slipped in.
- [ ] Comments say why, not what. No leftover debug output, commented-out code, or TODOs without an issue number.
- [ ] No new dependency without a reason in the PR ([add-dependency](../add-dependency/SKILL.md)).
- [ ] Generated files were regenerated, not edited.

## Security and privacy

- [ ] No secrets, `.env` files, personal data, or real usage data in the diff.
- [ ] Nothing new logs prompts, file contents, or credentials at `info` or above.
- [ ] User input never reaches a shell string, an unconfined path, or an unbounded resource.

## Docs

- [ ] Docs, config reference, and changelog updated for anything user-visible ([update-docs](../update-docs/SKILL.md)).
- [ ] Error messages and copy follow the **technical-writing** skill's house style.

## Report

List anything you couldn't verify. If you found and fixed problems, mention the significant ones.
