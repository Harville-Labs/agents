---
name: write-adr
description: Write an architecture decision record in docs/adr/. Use when a change breaks or alters an invariant in a repository's AGENTS.md, when choosing between real alternatives that a future contributor would question, or when asked to "write an ADR" or "record this decision".
---

# Write an ADR

## When

- A change alters an invariant in the repository's `AGENTS.md`. The ADR comes first, in the same PR as the change.
- You chose between real alternatives (a library, a storage model, a protocol shape) and someone would otherwise ask "why didn't they just...?"
- Not for routine choices the standards already settle.

## Steps

1. List existing records: `ls docs/adr/`. Read `docs/adr/README.md` and the one or two closest to your topic. If the repository has no `docs/adr/`, create it with a `README.md` index like Switchback's.
2. Take the next number, zero-padded to four digits. Name the file `NNNN-short-kebab-title.md`.
3. Copy the format of the most recent record in that repository. If there is none, use [templates/adr.md](../../templates/adr.md).
4. Write it:
   - **Context**: the forces at play, in a few short paragraphs. Facts, constraints, and what goes wrong without a decision.
   - **Decision**: one paragraph in active voice. "The router is a pure function of a snapshot."
   - **Alternatives considered**: each with the specific reason it lost.
   - **Consequences**: what gets easier, what gets harder, and what rules follow (these often become `AGENTS.md` invariants).
5. Add a row to the index table in `docs/adr/README.md`.
6. If it changes an invariant, update `AGENTS.md` to match and link the ADR from the invariant.

## Rules

- Never edit the decision of an accepted ADR. Write a new one that supersedes it, and change the old one's status to `Superseded by NNNN` (the status line and index are the only edits allowed).
- An ADR that amends part of another says so in both index rows: `Accepted (storage amended by 0011)`.
- Keep it under a page. If it needs more, the design doc belongs in `docs/` and the ADR links to it.
