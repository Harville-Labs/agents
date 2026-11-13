# Changelog

Notable changes to the hl stack. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow the `version` field in the plugin manifests. Versions before this file were not tagged, so each date is the day its version bump landed.

## [Unreleased]

## [0.3.3] - 2026-11-12

### Added

- **go**: support GitLab labels and diff-anchored review threads ([#5](https://github.com/Harville-Labs/agents/pull/5)).
- **go**: a playbook that reviews the PRs waiting on you ([#12](https://github.com/Harville-Labs/agents/pull/12)).
- **go**: watch GitLab merge requests ([#14](https://github.com/Harville-Labs/agents/pull/14)).
- The README and **help** list every skill, including **self-review**, **tdd**, **statechart**, and the verification-skill maintainers ([#30](https://github.com/Harville-Labs/agents/pull/30)).
- This changelog, built from commit history ([#30](https://github.com/Harville-Labs/agents/pull/30)).

### Changed

- The docs, site, and plugin descriptions call the project the hl stack. Repository, marketplace, and plugin IDs are unchanged ([#30](https://github.com/Harville-Labs/agents/pull/30)).
- The comment auditor subagent drops its old nickname, and the **no-comments**, **unslop**, and comment-auditor descriptions say when to use them ([#30](https://github.com/Harville-Labs/agents/pull/30)).
- **go**: review writes are given as `gh` and `glab` recipes ([#22](https://github.com/Harville-Labs/agents/pull/22)), with a warning that `glab` takes `--output json`, not `--json` ([#18](https://github.com/Harville-Labs/agents/pull/18)).
- The site renders the field guide as a Svelte page in the site's style.
- Comments the **no-comments** rules don't keep are deleted from the site and the house style.

### Fixed

- **go**: run `check-plan` from the skill directory.
- **go**: assign the issue and the PR to whoever opens it ([#11](https://github.com/Harville-Labs/agents/pull/11)).
- **go**: the review queue skips PRs you authored or already reviewed ([#16](https://github.com/Harville-Labs/agents/pull/16)).
- **go**: fix `glab` recipes ([#14](https://github.com/Harville-Labs/agents/pull/14)), and run the watcher when `cli.ts` is executed directly ([#20](https://github.com/Harville-Labs/agents/pull/20)).
- Every `rg` example in the skills gives an explicit path ([#24](https://github.com/Harville-Labs/agents/pull/24)).
- Long principle names wrap in the site's quiz options.

### Removed

- **why**: the product analytics warehouse source, which had no setup behind it ([#30](https://github.com/Harville-Labs/agents/pull/30)).

## [0.3.2] - 2026-11-10

### Changed

- The OpenCode install docs explain how to set permissions for each subagent ([#2](https://github.com/Harville-Labs/agents/pull/2)).

### Fixed

- The site's OpenCode guide matches the agent rules ([#1](https://github.com/Harville-Labs/agents/pull/1)).

## [0.3.1] - 2026-11-10

### Added

- An interactive guide to the stack, published to GitHub Pages, built on SvelteKit and sivir-ui.
- The site's field guide to every skill and principle, linked to their files on GitHub, plus a sitemap and `llms.txt`.

### Changed

- Skills are invoked in OpenCode as `@<name>` mentions instead of commands.
- Agent instructions follow pstack's guidance more closely.
- **ketchup** is renamed **catchup**.
- The README credits pstack's author.

### Removed

- The **bro** skill.

### Fixed

- Node type declarations let CI typecheck the site's build-time routes.

## [0.3.0] - 2026-11-10

### Added

- The **go** router and its playbooks, the `principle-*` skills, the workflow skills, and the `*-best-practices` skills that replace the old `standards/` files.
- Rust standards.
- A rule to fix an existing problem you run into, in its own commit, when it blocks verification or your change caused it.

### Changed

- Commit guidance in AGENTS.md and the git standards.

### Removed

- Model pins on the reviewer and verifier subagents. Each person maps models with **setup-models**.
- The design standard.
- The **fix-bug** and **ship-change** skills, replaced by the **go** Bug fix and Shipping playbooks.

## [0.2.0] - 2026-10-07

### Added

- Standards for toolchains, a 500-line file limit, duplicated logic, and UI components, plus a file-length check template.

## [0.1.0] - 2026-10-01

### Added

- AGENTS.md engineering standards, the first skills and subagents, and templates for a repository's AGENTS.md, PR template, ADR, Biome config, and `.editorconfig`.
