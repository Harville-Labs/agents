# go in OpenCode

This applies to OpenCode v2. Read it once per session before the first tool call that the **go** skill names generically. The `hl` plugin registers every skill and the `worker`, `comment-auditor`, `reviewer`, and `verifier` subagents.

## Tools

| go says | OpenCode |
|---|---|
| Ask the user | The `question` tool. Subagents don't have it by default, so a subagent puts its question in its report. |
| Track todos | `todowrite` when the session has it. Without it, keep the list in your reply and update it at each phase. |
| Load a skill | The `skill` tool with the skill's id, such as `go`. |
| Spawn a subagent | The `subagent` tool. See Subagents. |
| Scheduler | OpenCode has none. Use a background subagent that watches the event and notifies you when it finishes. |
| Open or view a PR | The forge CLI the playbook gives (`gh` or `glab`). |

## Subagents

| go says | `subagent` field |
|---|---|
| The `worker` subagent | `agent: "worker"`. The others are `comment-auditor`, `reviewer`, and `verifier`. |
| A general-purpose subagent | `agent: "general"`. It can't spawn subagents of its own. |
| A read-only subagent | `agent: "explore"`. |
| Its own worktree | Give each writer its own `git worktree add` and put its path in the brief. |
| In the background | `background: true`. You are notified when it finishes, so don't poll. |
| Resume or message a subagent | `sessionID` from its earlier result. |
| Model | `model`, as `providerID/modelID`. Write those IDs in the `## opencode` section of `~/.config/hl/models.md`, one per size. Leave `model` out when the size has no line. |
| Reasoning effort | A variant on the model, `providerID/modelID#variant`, where the model has variants. |

## Paths

- The plugin installs under `~/.cache/opencode/`. Never edit a skill there. Change it through a PR to the repository this plugin was installed from.
- Sessions are stored in a database, not files. List them with `opencode session list`, and print one as JSON with `opencode export <sessionID>`. Read only this workspace's sessions.
