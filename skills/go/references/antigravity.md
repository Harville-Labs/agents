# go in Antigravity

Read this once per session before the first tool call that the **go** skill names generically. This applies to the Antigravity app, IDE, and `agy` CLI. If a field below is missing from a tool's schema, drop it and say so. Never pass a field or value the schema rejects.

## Tools

| go says | Antigravity |
|---|---|
| Ask the user | `ask_question`, with each entry in `questions` holding `question`, `options`, and `is_multi_select`. |
| Track todos | Antigravity has no todo tool. Keep the list in your reply and update it at each phase. |
| Load a skill | Read the skill's `SKILL.md` with `view_file` (the go skill's folder is `../<name>/` from it) and follow it. The user types `/<name>`, such as `/go`. The plugin's skills are also named `hl:<name>`. |
| Spawn a subagent | `invoke_subagent`. See Subagents. |
| Scheduler | `schedule`, when the session lists it. Without it, a background subagent that watches the event and returns. |
| Open or view a PR | The forge CLI the playbook gives (`gh` or `glab`), through `run_command`. |

## Subagents

| go says | `invoke_subagent` entry in `Subagents` |
|---|---|
| The `worker` subagent | `TypeName: "worker"`, with the brief in `Prompt` and a short `Role`. The plugin's other agents are `comment-auditor`, `reviewer`, and `verifier`. |
| A general-purpose subagent | `TypeName: "self"`. |
| A read-only subagent | `TypeName: "research"`. Say "do not edit files" in the brief, and check `git status` afterward. |
| Its own worktree | `Workspace: "branch"`. Name the branch or commit it starts from. `Workspace: "share"` works in your files, so two writers with it overwrite each other. |
| In the background | Subagents run alongside you. `manage_subagents` lists and stops them. |
| Resume or message a subagent | `send_message` to its id. |
| Model | The agent file's `model` field, which takes `inherit`, `flash_lite`, `flash`, or `pro`; `agy models` lists what the CLI can run. Write those values in the `## antigravity` section of `~/.config/hl/models.md`, one per size. If `invoke_subagent` has no model field, a size can't change a spawn's model: run it on the agent's own model and say so. |
| Reasoning effort | Antigravity has no effort setting. Drop it. |

## Paths

- The plugin installs under `~/.gemini/config/plugins/hl/`, which is read-only. Never edit a skill there. Change it through a PR to the repository this plugin was installed from.
- Personal skills live in `~/.gemini/config/skills/`, project skills in `.agents/skills/`.
- Global instructions are `~/.gemini/AGENTS.md`. Antigravity also reads the workspace's `AGENTS.md`.
- Transcripts are `<app>/brain/<conversationId>/.system_generated/logs/transcript.jsonl`, where `<app>` is `~/.gemini/antigravity` for the app, `~/.gemini/antigravity-ide` for the IDE, and `~/.gemini/antigravity-cli` for the CLI. The newest folder is the current conversation. Read only conversations from this workspace.
