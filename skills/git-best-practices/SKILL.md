---
name: git-best-practices
description: Issues, branches, Conventional Commits, pull requests, changelog, and releases. Use when branching, committing, pushing, opening or updating a PR, or cutting a release.
---

# Git best practices

The **go** skill's Opening a PR and Shipping playbooks run the full loop. These are the rules they follow.

| Rule | Summary |
|------|---------|
| Issue first | Nontrivial work starts from an issue with `area:`, priority (`P0`–`P2`), and `type:` labels. |
| Branch names | `<type>/<issue>-<slug>` from `main`, or `<type>/<slug>` without an issue. |
| Commit as you go | Commit coherent increments. Push your own branch and open or update its PR without asking. |
| Ask only at the edge | Before a force-push to a shared branch, a push that deploys, or a release tag. |
| Conventional Commits | `type(scope): summary`, imperative, no period. The scope is the package or area. A body says why. `!` and `BREAKING CHANGE:` for breaks. |
| Bot pins stay bot-written | Never hand-write `chore(deploy)` image pins. |
| One change per PR | A refactor the feature needs lands first, in its own PR. |
| Honest PR bodies | Why with `Closes #<n>`, and **How it was tested** naming the commands you ran. Use the repository's template. |
| Squash-merge | CI green first. The squash title becomes the changelog line. |
| Changelog in the same PR | Keep a Changelog form, a line under **Unreleased** for each user-visible change. |
| SemVer releases | A script bumps versions and moves notes, and a `v<version>` tag publishes. |
| CODEOWNERS | Every repository has `.github/CODEOWNERS`. |

Details: `references/guide.md`.
