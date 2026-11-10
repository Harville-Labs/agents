# Git, pull requests, and releases

## Issues

Non-trivial work starts from an issue. Every issue carries an area, a priority, and a type label:

| | GitHub | GitLab |
|---|---|---|
| Area | `area:router` | `area::router` |
| Priority | `P0` blocks release, `P1` important, `P2` nice to have | `priority::0`, `priority::1`, `priority::2`, with the same meanings |
| Type | `type:feature`, `type:bug`, `type:chore` | `type::feature`, `type::bug`, `type::chore` |

GitLab's `::` makes a scoped label, so an issue holds one priority at a time. Use these in place of GitHub's names on GitLab, not alongside them. Use the repository's issue templates when it has them: `.github/ISSUE_TEMPLATE/` on GitHub, `.gitlab/issue_templates/` on GitLab. The **go** skill's `references/forges.md` has the commands.

## Branches

`<type>/<issue>-<slug>` from `main`: `feat/58-escalation-ladder`, `fix/31-ollama-timeout`, `docs/12-routing-table`. Without an issue, drop the number: `fix/openrouter-reasoning`.

During a task, work on the branch that is already checked out, or in a worktree on a new branch for parallel work. If the current branch isn't the intended one, say so in your report and carry on from the right branch; don't stop to ask.

## Commits

Commit coherent feature or fix increments as they are ready, rather than waiting until all work is finished. Keep each commit focused. Push your own branch and open or update its PR without asking. Ask first only before a force-push to a branch others share, or a push that deploys (a push to `main` where every push to `main` deploys).

[Conventional Commits](https://www.conventionalcommits.org):

```
<type>(<scope>): <summary in imperative mood, no period>
```

- Types: `feat`, `fix`, `docs`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `style`, `revert`.
- Scope is the package, app, or area (`router`, `providers`, `site`, `vscode`, `utils`, `deploy`). Omit it only when the change spans the repository.
- The summary says what changed for a user or maintainer: `feat(cli): add a self-update command`, not `update stuff` or `cleanup`.
- A body explains why, when the summary can't.
- Breaking changes use `!` (`feat(protocol)!: ...`) and a `BREAKING CHANGE:` footer.
- Bot commits that pin deploy images use `chore(deploy): <image> sha-<sha>` or the repository's existing form. Don't hand-write them.

## Pull requests

A GitLab merge request (MR) follows every rule here. `Closes #<n>` closes the issue on both forges. Use the repository's template: `.github/pull_request_template.md` on GitHub, `.gitlab/merge_request_templates/Default.md` on GitLab. Every PR has:

- **What and why**, with `Closes #<issue>`.
- **How it was tested**: the commands you ran and what you checked by hand. Not "tests pass". Say which tests, and what you looked at.
- A checklist covering the full check command, docs, changelog, and ADRs. [templates/pull_request_template.md](../../../templates/pull_request_template.md) is the default.

Keep PRs to one logical change. A refactor that a feature needs goes in its own PR first.

Review findings go in a thread on the diff line, so the author can answer and resolve each one: a review on GitHub, a discussion with a `position` on GitLab. A top-level comment is for the summary only.

CI must be green before review. Squash-merge; the squash title becomes the changelog line, so edit it to read well.

## Changelog

Projects with releases keep `CHANGELOG.md` in [Keep a Changelog](https://keepachangelog.com) form. Every user-visible change adds a line under **Unreleased** in the same PR.

## Releases

SemVer. Before 1.0, minor versions may break config or protocol, and the changelog says so. Releases are cut by a script that bumps every version and moves the Unreleased notes, then a pushed `v<version>` tag runs the release workflow. A release tag publishes to users, so create or push one only when asked.

## Ownership

Every repository has a `CODEOWNERS` file naming who reviews each path: `.github/CODEOWNERS` on GitHub, `.gitlab/CODEOWNERS` on GitLab.
