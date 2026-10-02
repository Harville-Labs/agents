---
name: ship-change
description: End-to-end loop for making a change in a Harville Labs repository - issue, branch, implement, test, docs, check, commit, PR. Use when asked to implement a feature, make a fix, or "ship", "open a PR for", or "take" an issue.
---

# Ship a change

Follow these steps in order. Skip a step only when it clearly doesn't apply, and say which you skipped.

## 1. Understand

- Read the repository's `AGENTS.md` (and any nested one in the directory you'll touch).
- If there's an issue, read it and its comments: `gh issue view <n> --comments`.
- Read the code you'll change and its callers. Find the closest existing example of what you're about to do (another provider, route, tool, page) and plan to follow it.
- If the request conflicts with an invariant in `AGENTS.md`, stop and say so. That needs an ADR ([write-adr](../write-adr/SKILL.md)) or a different approach.

## 2. Branch

From an up-to-date `main`:

```sh
git switch main && git pull --ff-only
git switch -c <type>/<issue>-<slug>      # e.g. feat/58-escalation-ladder
```

## 3. Test first, where it fits

For a bug, use [fix-bug](../fix-bug/SKILL.md). For new behavior, write the test describing it before or alongside the code. Follow the repository's test conventions (`bun:test`, `node:test`, Go table tests).

## 4. Implement

- Smallest change that does the job, in the style of the surrounding code.
- Validate new external input at the boundary.
- New config keys, protocol fields, routes, or env vars: follow the repository's "how to make common changes" recipe exactly; they usually touch several files.
- Regenerate generated files with their script; never hand-edit them.

## 5. Docs and changelog

Use [update-docs](../update-docs/SKILL.md). Behavior, config, and docs land in the same PR. User-visible changes get a `CHANGELOG.md` line under **Unreleased** if the repository keeps one.

## 6. Check

Run the repository's full check command (in its `AGENTS.md`). Fix everything it reports, including formatting (`format` script). Then do [self-review](../self-review/SKILL.md) on your diff.

## 7. Commit

Only if you were asked to commit. Conventional Commits, scoped to the package or area:

```sh
git add -p      # stage only what belongs to this change
git commit -m "feat(router): escalation ladder through bigger local models"
```

## 8. Pull request

Only if you were asked to push or open a PR. Fill in the repository's PR template:

```sh
git push -u origin HEAD
gh pr create --fill-first --body-file <body.md>
```

The body has **What and why** with `Closes #<n>`, **How it was tested** listing the exact commands you ran and what you checked by hand, and the checklist ticked honestly.

## 9. Report

Tell the user: what changed (with file links), what you ran and its result, what you didn't verify, and anything you noticed but left alone.
