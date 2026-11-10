# go in Codex

Read this once per session before the first tool call that the **go** skill names generically. Subagents need `multi_agent = true` under `[features]` in `~/.codex/config.toml`. Without it, do the subagent's work yourself in order and say so.

## Tools

| go says | Codex |
|---|---|
| Ask the user | Codex has no question tool. Ask in plain text, give the options as a short list, and end the turn. |
| Track todos | `update_plan`. |
| Load a skill | Read the skill's `SKILL.md` (the go skill's folder is `../<name>/` from it) and follow it. The user types `$<name>`, such as `$go`. |
| Spawn a subagent | `spawn_agent`. See Subagents. |
| Scheduler | Codex has none. Use a background subagent that watches the event and returns, then `wait_agent` on it when you have nothing else to do. |
| Open or view a PR | The forge CLI the playbook gives (`gh` or `glab`). |

## Subagents

| go says | Codex |
|---|---|
| The `worker` subagent | `spawn_agent` has no agent type. Start the `message` with "You are the worker subagent. Read `<agents/worker.md path>` and follow it." The file sits at `../../../agents/worker.md` from the go skill's `SKILL.md`. Do the same for `comment-auditor`, `reviewer`, and `verifier`. |
| A general-purpose subagent | `spawn_agent` with the brief in `message`. |
| A read-only subagent | Say "do not edit files" in the brief, and check `git status` afterward. |
| Its own worktree | All agents share one working directory. Give each writer its own `git worktree add` and put its path in the brief. Parallel writers in one directory overwrite each other. |
| In the background | Spawned agents run on their own. `wait_agent` blocks, so call it only when you have nothing else to do. |
| Resume or message a subagent | `send_message` or `followup_task` to its id. `interrupt_agent` stops one. `list_agents` shows them. |
| Context | `fork_turns` copies your recent turns into the subagent. Leave it out for a fresh subagent, which is the default in go. |
| Model | `model`, a model ID as `codex --model` takes it. Write those IDs in the `## codex` section of `~/.config/hl/models.md`, one per size. |
| Reasoning effort | `reasoning_effort`. |

## Paths

- Plugins install under `~/.codex/plugins/cache/`. Never edit a skill there. Change it through a PR to the repository this plugin was installed from.
- Global instructions are `~/.codex/AGENTS.md`.
- Transcripts are JSONL files under `~/.codex/sessions/<year>/<month>/<day>/`. The newest file whose recorded working directory matches this workspace is the current session. Read only this workspace's sessions.
