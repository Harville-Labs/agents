# go in Pi

Read this once per session before the first tool call that the **go** skill names generically.

## Tools

| go says | Pi |
|---|---|
| Ask the user | `ctx.ui.confirm()`, `ctx.ui.select()`, `ctx.ui.input()`, or plain text questions. |
| Track todos | Keep the list in your reply and update it at each phase. |
| Load a skill | Discovered automatically from `skills/`, `.agents/skills/`, `~/.agents/skills/`, `~/.pi/agent/skills/`, `.pi/skills/`, or via `/skill:name`. |
| Spawn a subagent | Use subagent extensions or execute via tools. |
| Scheduler | Pi has no scheduler. Use background tasks or notify when finished. |
| Open or view a PR | The forge CLI the playbook gives (`gh` or `glab`). |

## Subagents

| go says | Pi |
|---|---|
| The `worker` subagent | Spawn via subagent capabilities or extensions, referencing `agents/worker.md`. |
| A general-purpose subagent | General purpose agent capability. |
| A read-only subagent | Read-only mode instructions in brief. |
| Its own worktree | Use `git worktree add`. |
| In the background | Run in background where supported. |
| Model | `model`, a model ID as Pi takes it. Write those IDs in the `## pi` section of `~/.config/hl/models.md`, one per size. |
| Reasoning effort | Effort settings supported by Pi providers. |

## Paths

- Packages and extensions install under `~/.pi/agent/` or project `.pi/`. Never edit a skill there. Change it through a PR to the repository this plugin was installed from.
- Personal skills live in `~/.agents/skills/` or `~/.pi/agent/skills/`, project skills in `.agents/skills/` or `.pi/skills/`.
- Global instructions are `~/.pi/agent/AGENTS.md`.
- Transcripts are stored in `~/.pi/agent/sessions/`. Read only this workspace's sessions.
