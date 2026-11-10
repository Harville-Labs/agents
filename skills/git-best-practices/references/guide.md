# Git, pull requests, and releases

## Issues

Non-trivial work starts from a GitHub issue. Issues carry an `area:` label, a priority (`P0` blocks release, `P1` important, `P2` nice to have), and a `type:` label (`feature`, `bug`, `chore`). Use the repository's issue templates when it has them.

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

Use the repository's template. Every PR has:

- **What and why**, with `Closes #<issue>`.
- **How it was tested**: the commands you ran and what you checked by hand. Not "tests pass". Say which tests, and what you looked at.
- A checklist covering the full check command, docs, changelog, and ADRs. [templates/pull_request_template.md](../../../templates/pull_request_template.md) is the default.

Keep PRs to one logical change. A refactor that a feature needs goes in its own PR first.

CI must be green before review. Squash-merge; the squash title becomes the changelog line, so edit it to read well.

## Changelog

Projects with releases keep `CHANGELOG.md` in [Keep a Changelog](https://keepachangelog.com) form. Every user-visible change adds a line under **Unreleased** in the same PR.

## Releases

SemVer. Before 1.0, minor versions may break config or protocol, and the changelog says so. Releases are cut by a script that bumps every version and moves the Unreleased notes, then a pushed `v<version>` tag runs the release workflow. A release tag publishes to users, so create or push one only when asked.

## Ownership

Every repository has `.github/CODEOWNERS` (or GitLab's `CODEOWNERS`) naming who reviews each path.
