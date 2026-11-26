# go in Cursor

Read this once per session before the first tool call that the **go** skill names generically. If a field below is missing from a tool's schema, drop it and say so. Never pass a field or value the schema rejects.

## Tools

| go says | Cursor |
|---|---|
| Ask the user | `AskQuestion`. Where the session lacks it, ask in plain text, give the options as a short list, and end the turn. |
| Track todos | Cursor's todo tool (`TodoWrite`). Without it, keep the list in your reply and update it at each phase. |
| Load a skill | Read the skill's `SKILL.md` (the go skill's folder is `../<name>/` from it) and follow it. The user types `/<name>`, such as `/go`, and picks it from the `/` menu so Cursor attaches the skill to the message. |
| Spawn a subagent | `Task`. See Subagents. |
| Scheduler | Cursor has none in a local chat. Use a background subagent that watches the event and returns. |
| Open or view a PR | The forge CLI the playbook gives (`gh` or `glab`). |

## Subagents

| go says | `Task` field |
|---|---|
| The `worker` subagent | `subagent_type: "worker"`. The plugin's other agents are `comment-auditor`, `reviewer`, and `verifier`. |
| A general-purpose subagent | `subagent_type: "generalPurpose"`. |
| A read-only subagent | `subagent_type: "explore"`, or `readonly: true`. Read-only mode strips MCP tools, so a subagent that needs MCP runs in agent mode with "do not edit files" in its brief, and you check `git status` afterward. |
| Its own worktree | Give each writer its own `git worktree add` and put its path in the brief. Parallel writers in one directory overwrite each other. |
| In the background | `run_in_background: true`. You are notified when it finishes, so don't poll. |
| Resume or message a subagent | `resume` with its id, where `Task` offers it. Otherwise spawn a fresh one with the earlier result in its brief. |
| Model | `model`, a Cursor model slug as the `Task` schema lists it, such as `claude-opus-5-5-high`. List the slugs the `model` parameter accepts in this session; if it lists none, ask the user to copy them from the model picker. Write those slugs in the `## cursor` section of `~/.config/hl/models.md`, one per size. |
| Reasoning effort | Part of the slug (`-low`, `-medium`, `-high`, `-xhigh`). Pick the slug of the same model whose suffix matches the effort. |

## Paths

- Plugins install under `~/.cursor/plugins/`, or `~/.cursor/plugins/local/hl/` for a clone installed by hand. Never edit a skill there. Change it through a PR to the repository this plugin was installed from.
- Personal skills live in `~/.cursor/skills/`. Cursor reads the workspace's `AGENTS.md`. User rules live in Cursor's settings, not a file.
- Transcripts are in `~/.cursor/projects/<slug>/agent-transcripts/<uuid>/<uuid>.jsonl`. The slug is the workspace path with the leading `/` dropped and each other `/` changed to `-`, so `/Users/you/proj` is `Users-you-proj`. The system prompt often names the folder. The newest file there is the current chat. Read only this workspace's folder.
