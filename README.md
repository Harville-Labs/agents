# Harville Labs engineering standards

Engineering standards, skills, and subagents for AI coding agents and the people who work with them. They run the same way in Claude Code, OpenCode, and Codex.

- **[AGENTS.md](AGENTS.md)**: the rules. Short enough to load into every session.
- **[skills/](skills/)**: the **go** router and its playbooks, the engineering principles, the `*-best-practices` standards, and review and writing workflows.
- **[agents/](agents/)**: subagents (`worker`, `reviewer`, `verifier`, `comment-auditor`).
- **[site/](site/)**: an interactive guide to how it all works, plus a field guide to every skill (`site/static/guide/`), a sitemap, and `llms.txt` for models. Built with Vite and published to GitHub Pages.
- **[templates/](templates/)**: starting points for a new repository's `AGENTS.md`, PR template, ADR, Biome config, `.editorconfig`, and file-length check.

The **go** router, its playbooks, the principles, and most of the workflow skills take extreme inspiration from Lauren Tan's (poteto) [pstack and poteto mode](https://github.com/cursor/plugins/tree/main/pstack), with help from Michael Denyer's [Claude Code port](https://github.com/michael-denyer/pstack-claude). These tools are major advancements in the way developers work with agents. See [NOTICE](NOTICE) for the license.

## How it fits together

Each repository keeps its own `AGENTS.md` for what's specific to it: commands, layout, invariants, and recipes. This repository holds what's the same everywhere. A repository's file can add rules and tighten these, and loosens one only with an ADR that says why.

For nontrivial work, start with **go**. It matches the task to a playbook (feature, bug fix, refactor, perf, PR, babysit, and more), copies the playbook's steps into the todo list, and runs the other skills as the steps need them.

## Install

**Plugin** (skills, subagents, and a session reminder to use **go**):

Claude Code:

```
/plugin marketplace add Harville-Labs/agents
/plugin install hl@harville-labs
```

OpenCode:

```sh
opencode plugin add "hl@git+https://github.com/Harville-Labs/agents.git"
```

Codex:

```sh
codex plugin marketplace add Harville-Labs/agents
codex plugin add hl@harville-labs
```

Then run **setup-models** (`/hl:setup-models`, `/setup-models`, or `$setup-models`) to map the model sizes (nano, small, medium, large, and the review panel) to models you have. Skills never name a model; each person picks their own.

**Standards** (optional): to load [AGENTS.md](AGENTS.md) into every session on your machine, clone this repository and run

```sh
scripts/install.sh            # --dry-run to preview, --uninstall to remove
```

It adds an import of `AGENTS.md` to `~/.claude/CLAUDE.md` and a copy to `~/.codex/AGENTS.md`, between marker lines it manages. Claude Code reads the import live, so `git pull` updates it; rerun the script to refresh the Codex copy. For OpenCode, add this file's absolute path to `instructions` in your `opencode.json` and install the plugin above. The instructions file supplies the standards; the plugin supplies **go**, its playbooks, and the subagents.

## Skills

Type a skill as `/hl:<name>` in Claude Code, `/<name>` in OpenCode, or `$<name>` in Codex. `/hl:help` answers questions about any of them.

| Skill | Use it to |
|---|---|
| [go](skills/go/SKILL.md) | Do any nontrivial task with rigor: picks a playbook and runs it |
| [help](skills/help/SKILL.md) | Find the right skill, playbook, or principle, and get set up |
| [setup-models](skills/setup-models/SKILL.md) | Map the model sizes to your models and set a reasoning budget |
| [typescript](skills/typescript-best-practices/SKILL.md), [python](skills/python-best-practices/SKILL.md), [go](skills/go-best-practices/SKILL.md), [rust](skills/rust-best-practices/SKILL.md), [svelte](skills/svelte-best-practices/SKILL.md) `-best-practices` | Apply a language's toolchain and rules |
| [code](skills/code-best-practices/SKILL.md), [testing](skills/testing-best-practices/SKILL.md), [security](skills/security-best-practices/SKILL.md), [git](skills/git-best-practices/SKILL.md), [deploy](skills/deploy-best-practices/SKILL.md) `-best-practices` | Apply the cross-language rules for each topic |
| [how](skills/how/SKILL.md), [why](skills/why/SKILL.md), [teach](skills/teach/SKILL.md) | Learn how code works, why it's shaped that way, or both in plain words |
| [architect](skills/architect/SKILL.md), [arena](skills/arena/SKILL.md), [swarm](skills/swarm/SKILL.md) | Settle a design, merge several attempts, or run parallel checks |
| [interrogate](skills/interrogate/SKILL.md), [blast-radius](skills/blast-radius/SKILL.md), [self-review](skills/self-review/SKILL.md) | Review a diff with other models, find breakage outside it, or check it yourself |
| [deslop](skills/deslop/SKILL.md), [no-comments](skills/no-comments/SKILL.md), [unslop](skills/unslop/SKILL.md) | Clean AI slop out of code, comments, or prose |
| [control-cli](skills/control-cli/SKILL.md), [control-ui](skills/control-ui/SKILL.md) | Drive a CLI, TUI, or browser UI the way a user does, and capture proof |
| [create-verification-skill](skills/create-verification-skill/SKILL.md), [create-formal-verification-skill](skills/create-formal-verification-skill/SKILL.md) | Give agents a scripted or formal way to prove behavior |
| [technical-writing](skills/technical-writing/SKILL.md), [update-docs](skills/update-docs/SKILL.md), [write-adr](skills/write-adr/SKILL.md), [write-agents-md](skills/write-agents-md/SKILL.md) | Write docs, decisions, and agent guides to a standard |
| [add-dependency](skills/add-dependency/SKILL.md), [add-service](skills/add-service/SKILL.md) | Justify a package, or add a container image, deploy manifests, and the infrastructure handoff |
| [reflect](skills/reflect/SKILL.md), [correct](skills/correct/SKILL.md), [automate-me](skills/automate-me/SKILL.md) | Turn lessons and habits into skill edits |

The `principle-*` skills are one rule each. **go** reads and cites them, and you can steer with their names ("apply prove it works"). `/hl:help` covers the rest (recall, catchup, sharpen, statechart, and others).

## Changing this repository

- Change rules and skills by pull request, like code. Say in the PR what prompted the change: a mistake an agent made, a review comment that keeps recurring, a new decision.
- Keep [AGENTS.md](AGENTS.md) short; it loads into every session. Put detail in a skill and link to it.
- A rule belongs here only if it applies to every repository. Keep skills free of any one team's names, hosts, or infrastructure.
- Skills use the `skills/<name>/SKILL.md` format, with `name` (matching the directory) and a `description` that says when to use it. Name harnesses in the order Claude Code, OpenCode, Codex, and give none a feature the others lack without saying why.
- Bump `version` in [.claude-plugin/plugin.json](.claude-plugin/plugin.json) and [.codex-plugin/plugin.json](.codex-plugin/plugin.json) when skills or subagents change, so installed plugins update.
- `scripts/check.sh` (also run in CI) validates skill and subagent frontmatter, the plugin manifests, the OpenCode plugin's types, and every relative link.
