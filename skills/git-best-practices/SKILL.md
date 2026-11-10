---
name: git-best-practices
description: Issues, branches, Conventional Commits, pull requests, changelog, and releases. Use when branching, committing, pushing, opening or updating a PR, or cutting a release.
---

# Git best practices

The **go** skill's Opening a PR and Shipping playbooks run the full loop. These are the rules they follow.

| Rule | Summary |
|------|---------|
| Issue first | Nontrivial work starts from an issue labeled with area, priority, and type: `area:`, `P0`–`P2`, and `type:` on GitHub, scoped `area::`, `priority::0`–`priority::2`, and `type::` on GitLab. |
| Branch names | `<type>/<issue>-<slug>` from `main`, or `<type>/<slug>` without an issue. |
| Commit as you go | Commit coherent increments. Push your own branch and open or update its PR without asking. |
| Ask only at the edge | Before a force-push to a shared branch, a push that deploys, or a release tag. |
| Conventional Commits | `type(scope): summary`, imperative, no period. The scope is the package or area. A body says why. `!` and `BREAKING CHANGE:` for breaks. |
| Bot pins stay bot-written | Never hand-write `chore(deploy)` image pins. |
| One change per PR | A refactor the feature needs lands first, in its own PR. |
| Honest PR bodies | A GitLab MR follows every PR rule. Why with `Closes #<n>`, and **How it was tested** naming the commands you ran. Use the repository's template. |
| Squash-merge | CI green first. The squash title becomes the changelog line. |
| Changelog in the same PR | Keep a Changelog form, a line under **Unreleased** for each user-visible change. |
| SemVer releases | A script bumps versions and moves notes, and a `v<version>` tag publishes. |
| Review in threads | Findings go in a thread on the diff line, not a top-level comment: a review on GitHub, a positioned discussion on GitLab. |
| CODEOWNERS | Every repository has `.github/CODEOWNERS` on GitHub or `.gitlab/CODEOWNERS` on GitLab. |

Details: `references/guide.md`.
