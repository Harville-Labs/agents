---
name: setup-models
description: Map the hl model sizes (nano, small, medium, large, and the review panel) to real models, and set the reasoning budget, for Claude Code, OpenCode, and Codex. Detects the models you can use and writes ~/.config/hl/models.md. Use for /hl:setup-models, $setup-models, "configure hl models", "change my models", or a budget change.
---

# Setup models

Write `~/.config/hl/models.md`, the file every hl skill reads to pick a subagent's model. Skills never name a model. They name a size, and this file maps each size to a model you have. Each person runs this for themselves. The repository ships no model choices.

## Sizes

| Size | What runs on it | Typical pick |
|---|---|---|
| `nano` | Trivial mechanical edits, read-only explorers, investigators, tooling checks | The fastest, cheapest model you have |
| `small` | Swarm workers and routine code | A fast code model |
| `medium` | Code delegates in the feature, bug fix, refactoring, perf, and hillclimb playbooks | A strong code model |
| `large` | The hardest changes, judgment, prose, explainers, and synthesizers | The strongest model you have |
| `panel` | Arena, architect, and interrogate runners, and the arena cross-judge | A list of models, in order of preference |

## Steps

### 1. Detect the models you can use

List the models for the harness you run in. That list is the only dependable source.

| Harness | How to list | Form to write |
|---|---|---|
| Claude Code | The values the `Agent` tool's `model` parameter accepts in this session | Exactly as the schema lists them |
| OpenCode | `opencode models` | `provider/model`, plus `#variant` when the model has variants |
| Codex | `codex debug models` | The model slug it prints |

If you can't list any, ask the user to paste the ones they have. Never write a model you haven't seen in a list. `inherit` is always valid: that size runs on the session's own model.

The file has a section for each harness. Fill the one you run in. Offer once to fill the others if the user can paste their lists; otherwise leave those sections as they are.

### 2. Load the current file

If `~/.config/hl/models.md` exists, read it. Its `budget:` line and size values are the current choices. A line that isn't a size in the shape in step 5 (an older per-role line, for example) is retired. Use it as a hint for the matching size, drop it, and tell the user. With no file, every size starts as `inherit`.

### 3. Ask for a budget

Ask one multiple-choice question, naming the current budget if there is one:

- `unlimited`: the harness's highest reasoning effort
- `large`: one step below the highest
- `medium`: the middle of the ladder
- `small`: the lowest effort that still reasons

Map the label onto the harness's own effort ladder. In OpenCode the effort is part of the model's variant, so pick the variant that matches. Skills raise effort one step for the hardest work and lower it for routine work, starting from this level.

### 4. Propose a model for each size

Propose from the detected list, ordered by the Sizes table, then show every size with its proposal and ask whether to accept or change specific sizes. Two sizes can map to the same model.

`panel` is a comma-separated list. One runner runs per entry, `inherit` entries included, so the length sets the count. Use models from different vendors when the list has them. Agreement across vendors is stronger evidence than agreement within one. The arena cross-judge is the first entry from a vendor other than the session's, so put the best judge first. An `inherit` entry never judges.

Don't favor a vendor. Propose from what the user has.

### 5. Write the file

Overwrite the whole file so a rerun gives the same result. Keep sections for other harnesses that you didn't change. Shape:

```markdown
# hl models

One line per size. A missing line, or `inherit`, runs that size on the session's own model.
Written by the setup-models skill. Rerun it to change these.

budget: large

## claude-code

nano: <model>
small: <model>
medium: <model>
large: <model>
panel: <model>, <model>

## opencode

(same sizes)

## codex

(same sizes)
```

Every real model you write must be in the step 1 list for that harness. If one isn't, ask again.

### 6. Confirm

Tell the user the file was written, which sizes changed, and that skills read it once per session, so the change applies to new sessions.

### 7. Offer a verification skill

Check whether the project has a way to drive the real app for proof (a `verify-*` skill or an existing harness). If not, offer once to generate one with the **create-verification-skill** skill, so agents can drive the app the way a user does. On no, move on.

### 8. Offer a formal verification skill

Check whether the project has a formal verification skill (one that runs a model checker, a proof, or another verifier against the code). If not, offer once to generate one with the **create-formal-verification-skill** skill, so agents can prove a key property holds in every case in scope. On no, move on.
