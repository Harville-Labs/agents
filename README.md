# Harville Labs agents

Shared engineering standards, skills, and subagents for every Harville Labs repository. One source of truth for how AI coding agents (and the people working with them) write software here.

- **[AGENTS.md](AGENTS.md)**: the org-wide rules. Short enough to load into every session.
- **[standards/](standards/)**: the detail behind them, by topic.
- **[skills/](skills/)**: reusable workflows, in Claude Code skill format.
- **[agents/](agents/)**: subagents, compatible with Claude Code and Switchback (`.claude/agents/*.md` format).
- **[templates/](templates/)**: starting points for a new repository's `AGENTS.md`, PR template, ADR, Biome config, and `.editorconfig`.

## How it fits together

Each repository keeps its own `AGENTS.md` (with a `CLAUDE.md` containing `@AGENTS.md`) for what's specific to it: commands, layout, invariants, and recipes. This repository holds everything that's the same everywhere. When the two disagree, the repository's file wins.

Project files live in their repositories, not here, so they change in the same PR as the code they describe.

| Repository | Agent guide | Stack |
|---|---|---|
| [switchback](https://github.com/Harville-Labs/switchback) | [AGENTS.md](https://github.com/Harville-Labs/switchback/blob/main/AGENTS.md), [apps/site/AGENTS.md](https://github.com/Harville-Labs/switchback/blob/main/apps/site/AGENTS.md) | Bun, TypeScript, Ink, VS Code, SvelteKit + Postgres |
| [website](https://github.com/Harville-Labs/website) | [AGENTS.md](https://github.com/Harville-Labs/website/blob/main/AGENTS.md) | SvelteKit, plain CSS, Go worker, Kubernetes |
| homelab | Owns cluster config for both; not yet covered | Flux, Kustomize, SOPS |

## Install

**Standards** (Claude Code and Codex): clone this repository and run

```sh
scripts/install.sh            # --dry-run to preview, --uninstall to remove
```

It adds an import of this `AGENTS.md` to `~/.claude/CLAUDE.md` and a copy to `~/.codex/AGENTS.md`, between marker lines it manages, so every session on your machine starts with the org standards. Claude Code reads the import live, so `git pull` is enough to update it; rerun the script to refresh the Codex copy.

**Skills and subagents** (Claude Code): install this repository as a plugin.

```
/plugin marketplace add Harville-Labs/agents
/plugin install hl@harville-labs
```

Skills then appear as `hl:ship-change`, `hl:fix-bug`, and so on. To make them available to everyone who works in a repository, add the marketplace and plugin to that repository's `.claude/settings.json` (`extraKnownMarketplaces` and `enabledPlugins`).

**Switchback** reads Claude Code's agent format, so the files in `agents/` work in a project's `.claude/agents/` as-is.

## Skills

| Skill | Use it to |
|---|---|
| [ship-change](skills/ship-change/SKILL.md) | Go from issue to pull request: branch, test, implement, docs, check, commit, PR |
| [fix-bug](skills/fix-bug/SKILL.md) | Reproduce with a failing test, find the root cause, fix, prove it |
| [self-review](skills/self-review/SKILL.md) | Review your own diff against the standards before calling it done |
| [update-docs](skills/update-docs/SKILL.md) | Find and update every doc a change affects |
| [write-adr](skills/write-adr/SKILL.md) | Record a decision or an invariant change in `docs/adr/` |
| [add-dependency](skills/add-dependency/SKILL.md) | Decide whether a package earns its place, and justify it |
| [add-service](skills/add-service/SKILL.md) | Add a container image, `deploy/k8s` manifests, and the homelab handoff |
| [write-agents-md](skills/write-agents-md/SKILL.md) | Create or refresh a repository's `AGENTS.md` |

Subagents: [reviewer](agents/reviewer.md) (finds confirmed bugs and invariant violations in the current diff) and [verifier](agents/verifier.md) (runs the full check and reports what passed).

## Changing this repository

- Standards change by pull request, like code. Explain in the PR what prompted the change: a mistake an agent made, a review comment that keeps recurring, a new decision.
- Keep [AGENTS.md](AGENTS.md) short; it loads into every session. Put detail in `standards/` and link to it.
- A rule belongs here only if it applies to every repository. Anything specific to one goes in that repository's `AGENTS.md`.
- Skills follow the Claude Code format: `skills/<name>/SKILL.md`, with `name` (matching the directory) and a `description` that says when to use it.
- Bump `version` in [.claude-plugin/plugin.json](.claude-plugin/plugin.json) when skills or subagents change, so installed plugins update.
- `scripts/check.sh` (also run in CI) validates skill and subagent frontmatter, the plugin manifests, and every relative link.
