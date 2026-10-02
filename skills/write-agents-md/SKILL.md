---
name: write-agents-md
description: Create or refresh a repository's AGENTS.md (and CLAUDE.md pointer) so AI agents can work in it safely. Use when a Harville Labs repository has no AGENTS.md, when its commands, layout, or invariants have changed, or when asked to "document this repo for agents".
---

# Write a repository's AGENTS.md

The org standards in the `agents` repository cover how we write software everywhere. A repository's `AGENTS.md` covers only what's **specific to that repository**: its commands, its layout, the rules that hold it together, and recipes for its common changes. Don't repeat the org standards; link to them where it helps.

## Research

Don't write from memory. Read:

- `README.md`, `CONTRIBUTING.md`, `docs/` (especially architecture and ADRs).
- `package.json` scripts / `Makefile` / `go.mod`, the lint and type config, `Dockerfile`s, CI workflows. The check command must be what CI actually runs.
- The directory layout, two levels deep, and a representative file from each area.
- `git log --oneline -30` for commit conventions and recent direction.
- Comments that state constraints (`rg -n 'never|must|don.t|invariant' --type ts --type go`).

## Write

Start from [templates/AGENTS.md](../../templates/AGENTS.md). Sections, in order, dropping any that would be empty:

1. **What this repo is**: two or three sentences, and where the design docs are.
2. **Commands**: install, the full check, single test, dev server, format. Each with a short comment. Every command must work as written; run them.
3. **Layout**: a table of path → what it owns → what it must not do.
4. **Invariants**: numbered rules that hold the system together, each with the reason. Changing one requires an ADR.
5. **How to make common changes**: step-by-step recipes for the changes people actually make here, naming exact files.
6. **Conventions**: only where this repository differs from or adds to the org standards.
7. **Things not to do**: specific traps in this codebase.

Keep it under about 250 lines. Precise beats complete.

## Wire it up

- `CLAUDE.md` at the root containing exactly `@AGENTS.md`, so Claude Code loads the same file.
- If a subdirectory has substantially different rules (a different language, a proprietary app inside an open-source repo), give it its own `AGENTS.md` and `CLAUDE.md` pair, and link it from the root file's layout table.
- Add or update the repository's row in the `agents` repository's README project index.

## Check

- Every path, script, and file you mention exists: spot-check with `ls` and `rg`.
- The check command matches CI.
- Nothing contradicts the code. Where the code and the docs disagree, ask rather than picking one.
