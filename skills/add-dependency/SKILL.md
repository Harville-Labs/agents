---
name: add-dependency
description: Decide whether to add a third-party package and how to justify it. Use before running bun add, npm install, or go get for a runtime dependency, or when choosing between a library and hand-written code.
---

# Add a dependency

Every runtime dependency ships to users and is attack surface we maintain. Equally, hand-rolled parsers, protocol clients, and auth code collect edge-case bugs a mature library fixed years ago. The rule is: **use a well-maintained library for anything with a long tail of edge cases; hand-roll only small, well-understood code where a library would add more than it removes.**

## Check first

1. Is it already solved in the repository, the standard library, or an existing dependency? Search: `rg '<capability>'`, and read `package.json` / `go.mod`.
2. Is there an official SDK? Vendor APIs always use the vendor's official SDK.
3. Is it in the repository's list of deliberately hand-rolled code (see its `AGENTS.md`)? Then don't replace it without discussion.

## Evaluate the candidate

- **Maintenance**: releases in the last year, issues answered, more than one maintainer for anything security-relevant.
- **Size**: install size and transitive dependencies (`bunx npm-why`, `go mod graph`). A small package with 200 transitive dependencies is not small.
- **License**: MIT, Apache-2.0, BSD, ISC are fine. Anything copyleft (GPL, AGPL, LGPL) or unusual needs a human decision. If the repository keeps third-party notices, regenerate them.
- **Fit**: does it do the thing we need without forcing its model on us (framing, global state, its own logger)?
- **Security**: known advisories (`bun audit` / `npm audit`, `govulncheck`).

## Add it

- Runtime vs dev dependency: get it right. In SvelteKit apps that bundle everything, dev is usual.
- Install with the repository's package manager so the lockfile updates; commit the lockfile.
- Pin to a caret range in `package.json` unless the repository pins exactly (pin exactly when a generator or schema must match the library version).

## Justify it

In the PR description, a short paragraph: what it does for us, what you compared it to (including hand-rolling), its size and license. If you chose to hand-roll instead, add the reason to the repository's `AGENTS.md` list of deliberately hand-rolled code.
