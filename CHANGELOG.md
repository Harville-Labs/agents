# Changelog

Notable changes to the hl stack. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow the `version` field in the plugin manifests. Versions before this file were not tagged, so each date is the day its version bump landed.

## [Unreleased]

### Added

- Support the Pi harness: a Pi package manifest in `package.json`, a session-reminder extension in `pi/extension.ts`, a `skills/go/references/pi.md` harness reference, Pi model detection in **setup-models**, `~/.pi/agent/AGENTS.md` management in `scripts/install.sh`, and Pi install and skill commands in the docs and site ([#48](https://github.com/Harville-Labs/agents/pull/48)).

### Changed

- Port pstack's changes from late October through November 19 (pstack 0.15.36 to 0.15.46). The go skill, its playbooks, the principle skills, and the writing skills are shorter. The shorter texts keep their rules and drop detail.
- **go**: the trigger list is shorter. Every agent go starts reads the new `skills/go/worker.md` first, which lists the rules every started agent keeps. The Orchestrate playbook is removed, and program-scale work routes to **figure-it-out**. The Babysit, Opening a PR, and Multi-phase plan playbooks are each a few short rules. Babysit and Opening a PR keep their GitLab rules and send every forge command to `references/forges.md`. Babysit drops the `background` mode, and the plan checker script is removed.
- **architect**, **how**, **why**, and **reflect** are each one short file. **why** keeps its git and PR or MR lookup commands. They no longer use reference prompts, parallel explorers, per-source investigators, or reviewer panels. **recall** starts its own investigator for each source.
- **sharpen**: the rewritten prompt asks the agent to prototype a choice an experiment can settle.

### Fixed

- **statechart**: runs on native Windows, reads TLC output with `\r\n` line ends, reports the line and column when SANY cannot parse a spec, and draws an arrow into a parent state to its border instead of through its title.
- The site serves the examples page at `/examples/`, the address that its sitemap, `llms.txt`, and field guide link to. Before, that address returned 404 ([#43](https://github.com/Harville-Labs/agents/pull/43)).

## [0.3.8] - 2026-11-19

### Changed

- **help**: run alone, `/hl:help` rereads the chat and answers for the task in progress. With nothing to go on, it gives a one-screen tour with links to the docs site. Every answer links the docs page that covers it ([#42](https://github.com/Harville-Labs/agents/pull/42)).
- The plugin manifests' `homepage` is the docs site, https://stack.harville.ai, instead of the GitHub repository ([#42](https://github.com/Harville-Labs/agents/pull/42)).

## [0.3.7] - 2026-11-19

### Changed

- **go**: the Reviewing PRs playbook posts each finding in a thread on its diff line, and a finding outside the diff as a regular comment. It no longer posts a summary comment. A PR with no findings gets nothing posted, and the playbook suggests approving it ([#41](https://github.com/Harville-Labs/agents/pull/41)).

## [0.3.6] - 2026-11-17

### Added

- The site has an examples page. It walks through real prompts step by step and shows which skills, subagents, and guardrails go applies to each one ([#34](https://github.com/Harville-Labs/agents/pull/34)).

### Changed

- **go**: "review all MRs I'm requested on" reviews the current repository's queue. It covers other repositories only when you name them or ask for every one ([#35](https://github.com/Harville-Labs/agents/pull/35)).

## [0.3.5] - 2026-11-16

### Changed

- **go**: the forges reference explains how to read the status of GitLab child and multi-project pipelines through the bridges endpoint ([#33](https://github.com/Harville-Labs/agents/pull/33)).
- **go**: the forges reference says to reply to and resolve GitLab threads with the `glab mr note` subcommands, not raw `glab api` calls ([#32](https://github.com/Harville-Labs/agents/pull/32)).

## [0.3.4] - 2026-11-12

### Added

- **ui-design**: a skill for building and polishing UI. Its method (a brief, motion and interaction rules, anti-slop rules, and a screenshot QA round through **control-ui**) runs on the repository's own design, and a default style applies when the repository has none ([#28](https://github.com/Harville-Labs/agents/pull/28)).
- **go**: a Designing UI playbook that finds the repository's style first and sketches variations through Prototype when the look is open ([#28](https://github.com/Harville-Labs/agents/pull/28)).

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
