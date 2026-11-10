# go in Claude Code

Read this once per session before the first tool call that the **go** skill names generically. If a field below is missing from a tool's schema, drop it and say so. Never pass a field or value the schema rejects.

## Tools

| go says | Claude Code |
|---|---|
| Ask the user | `AskUserQuestion`. It is absent in `-p` (print) mode, so ask in plain text there and end the turn. |
| Track todos | `TodoWrite`, or the task tools when the session has those. With neither, keep the list in your reply and update it at each phase. |
| Load a skill | The `Skill` tool with `hl:<name>`. If it refuses, `Read` the skill's `SKILL.md` (the go skill's folder is `../<name>/` from it) and follow it. The user types `/hl:<name>`. |
| Spawn a subagent | The `Agent` tool. See Subagents. |
| Scheduler | `ScheduleWakeup`, `CronCreate`, or `Monitor`, when the session lists them. Without one, a background watcher subagent that returns on the event. |
| Open or view a PR | The forge CLI the playbook gives (`gh` or `glab`). |

## Subagents

| go says | `Agent` field |
|---|---|
| The `worker` subagent | `subagent_type: "hl:worker"`. The plugin's other agents are `hl:comment-auditor`, `hl:reviewer`, and `hl:verifier`. |
| A general-purpose subagent | `subagent_type: "general-purpose"`. It keeps the session's MCP tools. |
| A read-only subagent | `subagent_type: "Explore"`. It still has `Bash`, so the brief says "do not edit files", and you check `git status` afterward. |
| Its own worktree | `isolation: "worktree"`. Name the branch or commit it checks out. |
| In the background | Subagents run in the background and notify you when they finish. A subagent that needs your answer mid-task is the exception. |
| Resume or message a subagent | `SendMessage` to its id. Where that's missing, spawn a fresh one with the earlier result in its brief. |
| Model | `model`, which takes only the short names the `Agent` schema lists. Write those names in the `## claude-code` section of `~/.config/hl/models.md`, one per size. |
| Reasoning effort | `effort`, from the values the schema lists. |

## Paths

- Plugins install under `~/.claude/plugins/`. Never edit a skill there. Change it through a PR to the repository this plugin was installed from.
- Personal skills live in `~/.claude/skills/`, project skills in `.claude/skills/`.
- Transcripts are in `~/.claude/projects/<slug>/<session>.jsonl`. The slug is the workspace path with each `/` and `.` changed to `-`, so `/Users/you/proj` is `-Users-you-proj`. The newest `.jsonl` directly in that folder is the current session. Its `<session>/subagents/` folder holds subagent transcripts. Read only this workspace's folder.
