# hl stack

The Harville Labs agent stack: engineering standards, skills, and subagents for AI coding agents and the people who work with them. They run the same way in Claude Code, OpenCode, Codex, Pi, Cursor, and Antigravity.

- **[AGENTS.md](AGENTS.md)**: the rules. Short enough to load into every session.
- **[skills/](skills/)**: the **go** router and its playbooks, the engineering principles, the `*-best-practices` standards, and review and writing workflows.
- **[agents/](agents/)**: subagents (`worker`, `reviewer`, `verifier`, `comment-auditor`).
- **[site/](site/)**: an interactive guide to how it all works, plus a field guide to every skill (`site/src/routes/guide/`), a sitemap, and `llms.txt` for models. Built with Vite and published to GitHub Pages.
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

OpenCode keeps agent permissions in `opencode.jsonc`. Configure the plugin's `worker`, `reviewer`, `verifier`, or `comment-auditor` by ID under `agents`. For example, to ask before the worker pushes:

```jsonc
{
  "agents": {
    "worker": {
      "permissions": [
        { "action": "shell", "resource": "git push *", "effect": "ask" }
      ]
    }
  }
}
```

Put this in the project config for one repository or `~/.config/opencode/opencode.jsonc` for all projects. The plugin does not replace these permission rules. See [OpenCode's permission rules](https://opencode.ai/docs/permissions).

Codex:

```sh
codex plugin marketplace add Harville-Labs/agents
codex plugin add hl@harville-labs
```

Pi:

```sh
pi install git:github.com/Harville-Labs/agents
```

Cursor installs plugins from a marketplace, and hl isn't in Cursor's yet. On a Teams or Enterprise plan, an admin adds this repository under **Dashboard → Plugins & MCPs → Team Marketplaces → Import from Repo**. Otherwise, clone it into Cursor's local plugins folder, then run **Developer: Reload Window**. `git pull` there updates it.

```sh
git clone https://github.com/Harville-Labs/agents.git ~/.cursor/plugins/local/hl
```

Antigravity:

```sh
agy plugin install https://github.com/Harville-Labs/agents
```

Then run **setup-models** (`/hl:setup-models` in Claude Code, `@setup-models` in OpenCode, `$setup-models` in Codex, `/skill:setup-models` in Pi, or `/setup-models` in Cursor and Antigravity) to map the model sizes (nano, small, medium, large, and the review panel) to models you have. Skills never name a model; each person picks their own.

**Standards** (optional): to load [AGENTS.md](AGENTS.md) into every session on your machine, clone this repository and run

```sh
scripts/install.sh            # --dry-run to preview, --uninstall to remove
```

It adds an import of `AGENTS.md` to `~/.claude/CLAUDE.md` and copies to `~/.codex/AGENTS.md`, `~/.pi/agent/AGENTS.md`, and `~/.gemini/AGENTS.md` (Antigravity), between marker lines it manages. Claude Code reads the import live, so `git pull` updates it; rerun the script to refresh the copies. For OpenCode, add this file's absolute path to `instructions` in your `opencode.json` and install the plugin above. Cursor keeps user rules in its settings, not a file, so paste `AGENTS.md` into **Cursor Settings → Rules**, or rely on each repository's own `AGENTS.md`, which Cursor reads. The instructions file supplies the standards; the plugin supplies **go**, its playbooks, and the subagents.

## Skills

Type a skill as `/hl:<name>` in Claude Code, `@<name>` in OpenCode, `$<name>` in Codex, `/skill:<name>` in Pi, or `/<name>` in Cursor and Antigravity. The **help** skill answers questions about any of them.

| Skill | Use it to |
|---|---|
| [go](skills/go/SKILL.md) | Do any nontrivial task with rigor: picks a playbook and runs it |
| [help](skills/help/SKILL.md) | Find the right skill, playbook, or principle, get set up, or ask what the docs cover. Run alone, it reads the chat or gives a short tour |
| [setup-models](skills/setup-models/SKILL.md) | Map the model sizes to your models and set a reasoning budget |
| [typescript](skills/typescript-best-practices/SKILL.md), [python](skills/python-best-practices/SKILL.md), [go](skills/go-best-practices/SKILL.md), [rust](skills/rust-best-practices/SKILL.md), [svelte](skills/svelte-best-practices/SKILL.md) `-best-practices` | Apply a language's toolchain and rules |
| [code](skills/code-best-practices/SKILL.md), [testing](skills/testing-best-practices/SKILL.md), [security](skills/security-best-practices/SKILL.md), [git](skills/git-best-practices/SKILL.md), [deploy](skills/deploy-best-practices/SKILL.md) `-best-practices` | Apply the cross-language rules for each topic |
| [in-your-own-words](skills/in-your-own-words/SKILL.md), [sharpen](skills/sharpen/SKILL.md), [reframe](skills/reframe/SKILL.md) | Check the agent understood the goal, rewrite a prompt before sending it, or learn the expert words for what you're building |
| [how](skills/how/SKILL.md), [why](skills/why/SKILL.md), [teach](skills/teach/SKILL.md) | Learn how code works, why it's shaped that way, or both in plain words |
| [recall](skills/recall/SKILL.md), [catchup](skills/catchup/SKILL.md), [catchup-video](skills/catchup-video/SKILL.md) | Rebuild context from recent work, or catch up on this chat in text or a short video |
| [architect](skills/architect/SKILL.md), [arena](skills/arena/SKILL.md), [swarm](skills/swarm/SKILL.md) | Settle a design, merge several attempts, or run parallel checks |
| [figure-it-out](skills/figure-it-out/SKILL.md), [show-me-your-work](skills/show-me-your-work/SKILL.md) | Design a rigorous run for a large or unattended task, and keep a decision log a reviewer can check |
| [tdd](skills/tdd/SKILL.md), [benchmark-checklist](skills/benchmark-checklist/SKILL.md) | Fix a bug test-first, or vet a performance number before acting on it |
| [interrogate](skills/interrogate/SKILL.md), [blast-radius](skills/blast-radius/SKILL.md), [self-review](skills/self-review/SKILL.md) | Review a diff with other models, find breakage outside it, or check it yourself |
| [deslop](skills/deslop/SKILL.md), [no-comments](skills/no-comments/SKILL.md), [unslop](skills/unslop/SKILL.md) | Clean AI slop out of code, comments, or prose |
| [ui-design](skills/ui-design/SKILL.md) | Design or polish a UI in the repository's own style (or a default one): a brief, motion, anti-slop rules, and a screenshot QA round |
| [control-cli](skills/control-cli/SKILL.md), [control-ui](skills/control-ui/SKILL.md) | Drive a CLI, TUI, or browser UI the way a user does, and capture proof |
| [create-verification-skill](skills/create-verification-skill/SKILL.md), [maintain-verification-skill](skills/maintain-verification-skill/SKILL.md), [create-formal-verification-skill](skills/create-formal-verification-skill/SKILL.md), [maintain-formal-verification-skill](skills/maintain-formal-verification-skill/SKILL.md) | Give agents a scripted or formal way to prove behavior, and keep it in line with the code |
| [statechart](skills/statechart/SKILL.md) | Show a PM or designer a chart of what the user sees, checked by a TLA+ model |
| [technical-writing](skills/technical-writing/SKILL.md), [update-docs](skills/update-docs/SKILL.md), [write-adr](skills/write-adr/SKILL.md), [write-agents-md](skills/write-agents-md/SKILL.md) | Write docs, decisions, and agent guides to a standard |
| [add-dependency](skills/add-dependency/SKILL.md), [add-service](skills/add-service/SKILL.md) | Justify a package, or add a container image, deploy manifests, and the infrastructure handoff |
| [reflect](skills/reflect/SKILL.md), [correct](skills/correct/SKILL.md), [automate-me](skills/automate-me/SKILL.md) | Turn lessons and habits into skill edits |

The `principle-*` skills are one rule each. **go** reads and cites them, and you can steer with their names ("apply prove it works"). `/hl:help` explains when to use each skill.

## Changing this repository

- Change rules and skills by pull request, like code. Say in the PR what prompted the change: a mistake an agent made, a review comment that keeps recurring, a new decision.
- Keep [AGENTS.md](AGENTS.md) short; it loads into every session. Put detail in a skill and link to it.
- A rule belongs here only if it applies to every repository. Keep skills free of any one team's names, hosts, or infrastructure.
- Skills use the `skills/<name>/SKILL.md` format, with `name` (matching the directory) and a `description` that says when to use it. Name harnesses in the order Claude Code, OpenCode, Codex, Pi, Cursor, Antigravity, and give none a feature the others lack without saying why. See [Harnesses](#harnesses) for what adding one takes.
- Bump `version` in every plugin manifest (`.claude-plugin/`, `.codex-plugin/`, `.cursor-plugin/`, `.antigravity-plugin/`) when skills or subagents change, so installed plugins update. `scripts/check.sh` fails when they differ.
- `scripts/check.sh` (also run in CI) validates skill and subagent frontmatter, the plugin manifests and their versions, that every harness is wired up, the OpenCode plugin's and Pi extension's types, and every relative link.

## Harnesses

Every harness reads the same `skills/` and `agents/`. Skills name actions generically ("ask the user", "spawn a subagent"), and each harness's reference in [skills/go/references/](skills/go/references/) maps them to its tools, subagent fields, models, and paths. Other skills point at those references instead of restating a harness's paths.

| Harness | Entry point | Session reminder |
|---|---|---|
| Claude Code | [.claude-plugin/plugin.json](.claude-plugin/plugin.json) | [hooks/hooks.json](hooks/hooks.json) |
| OpenCode | [opencode/plugin.ts](opencode/plugin.ts) | The plugin's `context` hook |
| Codex | [.codex-plugin/plugin.json](.codex-plugin/plugin.json) | None |
| Pi | The `pi` key in [package.json](package.json), loading [pi/extension.ts](pi/extension.ts) | The extension's `before_agent_start` handler |
| Cursor | [.cursor-plugin/plugin.json](.cursor-plugin/plugin.json) | [hooks/cursor.json](hooks/cursor.json) |
| Antigravity | [.antigravity-plugin/plugin.json](.antigravity-plugin/plugin.json) | The always-on rule [rules/AGENTS.md](rules/AGENTS.md) |

The reminder text lives only in [rules/AGENTS.md](rules/AGENTS.md); every hook prints that file. Subagent frontmatter stays to `name` and `description`, because a harness-specific field such as a `tools` list means something different, or nothing, elsewhere.

To add a harness: write its reference in `skills/go/references/`, add its manifest and reminder, add it to the plugin-folder list in [agents/worker.md](agents/worker.md), the help skill's table, the setup-models file shape, [scripts/install.sh](scripts/install.sh) where it has a global instructions file, and the site's [harness list](site/src/lib/harness.svelte.ts). `scripts/check.sh` checks most of that list.
