# go in Pi

Read this once per session before the first tool call that the **go** skill names generically.

## Tools

| go says | Pi |
|---|---|
| Ask the user | Pi has no built-in question tool. Ask in plain text, give the options as a short list, and end the turn. |
| Track todos | Keep the list in your reply and update it at each phase. |
| Load a skill | Read the skill's `SKILL.md` (the go skill's folder is `../<name>/` from it) and follow it. The user types `/skill:<name>`. |
| Spawn a subagent | Pi has no built-in subagent tool. Unless a subagent extension is installed, do the delegate's work yourself in order with the same review separation and say so. |
| Scheduler | Pi has none. Check the event at each phase boundary instead, and say so. |
| Open or view a PR | The forge CLI the playbook gives (`gh` or `glab`). |

## Subagents

Without a subagent extension, own the diff directly with the same review separation that `playbooks/feature.md` asks of a subagent that can't spawn. With a subagent extension or a `pi -p` subprocess:

| go says | Pi |
|---|---|
| The `worker` subagent | Start the brief with "You are the worker subagent. Read `<agents/worker.md path>` and follow it." The file sits at `../../../agents/worker.md` from the go skill's `SKILL.md`. Do the same for `comment-auditor`, `reviewer`, and `verifier`. |
| A general-purpose subagent | Pass the brief as the task prompt. |
| A read-only subagent | Say "do not edit files" in the brief, or pass `--tools read,grep,find,ls`, and check `git status` afterward. |
| Its own worktree | Give each writer its own `git worktree add` and put its path in the brief. |
| In the background | Run in the background where the extension supports it. |
| Model | A model ID as `pi --model` takes it (`provider/model`). `pi --list-models` lists them; write the first two columns joined by `/`. Write those IDs in the `## pi` section of `~/.config/hl/models.md`, one per size. |
| Reasoning effort | `--thinking`, or a `:<thinking>` suffix on the model ID (`off`, `minimal`, `low`, `medium`, `high`, `xhigh`, `max`). |

## Paths

- Packages and extensions install under `~/.pi/agent/` or project `.pi/`. Never edit a skill there. Change it through a PR to the repository this plugin was installed from.
- Personal skills live in `~/.agents/skills/` or `~/.pi/agent/skills/`, project skills in `.agents/skills/` or `.pi/skills/`.
- Global instructions are `~/.pi/agent/AGENTS.md`.
- Transcripts are JSONL files under `~/.pi/agent/sessions/`, in one folder per working directory. The newest file in this workspace's folder is the current session. Read only this workspace's folder.
