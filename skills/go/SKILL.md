---
name: go
description: A disciplined way to do real work. Routes a task to a playbook (investigation, bug fix, feature, refactoring, perf, babysit, shipping, and more), applies the engineering principles, delegates to subagents deliberately, and verifies before reporting. Use for any nontrivial task, for /hl:go, @go, $go, /skill:go, or /go, or when asked to work this way.
---

# go

The bundled skills live at `../<name>/SKILL.md` from this file. Put this file's absolute path in every `worker` subagent's brief so it can find them.

This skill runs in Claude Code, OpenCode, Codex, Pi, Cursor, and Antigravity. The tools have different names in each. Before the first tool call that this skill names generically (ask the user, spawn a subagent, track todos, load a skill), read the reference for the harness you are running in: [Claude Code](references/claude-code.md), [OpenCode](references/opencode.md), [Codex](references/codex.md), [Pi](references/pi.md), [Cursor](references/cursor.md), or [Antigravity](references/antigravity.md).

The repository's own `AGENTS.md` and any standards it imports still apply. Where this skill and those rules disagree, the stricter rule wins. Verify every behavior change. Use the **tdd** cadence for a bug with a clear, cheap local test path or when the user asks for it; otherwise use the closest useful executable check and report the evidence.

## Non-negotiables

The Principles section below grounds every trigger. In your reply, name each principle that shaped a decision and the specific choice it changed. Cite only principles whose leaf SKILL.md you read this session.

The remaining triggers live only here:

- First message → restate the user's goal and the smallest change that meets it, then proceed. Open each subagent brief, PR `## Why`, and final report with the goal.
- Starting any agent → the first line of its kickoff is `Read <path>/worker.md before anything else.`, with `<path>` the absolute path of this skill's folder. The operator's rules live in skills that load only on request, so they reach another agent no other way. Keep the rest of the kickoff to the goal and the task, plus this file's absolute path for a `worker` subagent.
- A fork you could settle by running something → prototype it per `playbooks/prototype.md` instead of asking.
- Code → name the data shape first. Across a function boundary → **architect**. Fan-out → **swarm**. Bakeoff → **arena**. Contested design → **interrogate**.
- Prose, your reply included → **unslop**. Docs, PR descriptions, commit messages → **technical-writing**.
- Before commit → **deslop**. Before review → **no-comments**.
- Shipping UI or a CLI → **control-ui** or **control-cli**.
- A number you measured → **benchmark-checklist**.
- PR or MR status → the **Babysit** playbook. Landing a green stack → the **Shipping** playbook.
- Bot review comments → judge each on its merits per `references/review-bot-triage.md`.
- Long or unattended work → **show-me-your-work**.

## Principles

Read the leaf skill in full for any principle you apply. Each entry names when it applies. Each leaf is the **principle-<title>** skill, with the title in kebab case, hyphens kept and other punctuation dropped, unless the entry gives its name.

**Core**

- **Laziness Protocol.** Refactoring, sizing a diff, or tempted to add abstractions, layers, or signal threading. Bias to deletion and the smallest change that solves the problem.
- **Foundational Thinking.** Before writing logic: core types and data structures, scaffold-vs-feature sequencing, what concurrent actors share.
- **Redesign from First Principles.** Integrating a new requirement into an existing design. Redesign as if it had been foundational from day one.
- **Attack the Premise.** Two or more fixes that share one premise have failed the same gate. Write the premise down and test it directly before you write another fix that assumes it.
- **Subtract Before You Add.** Sequencing an addition, refactor, or rewrite. Remove dead weight first, then build on the simpler base.
- **Minimize Reader Load.** Reviewing or shaping code that's hard to trace. Count layers and hidden state, collapse one-caller wrappers, shrink mutable scope.
- **Outcome-Oriented Execution.** Planned rewrites and migrations with explicit phase boundaries. Converge on the target architecture, don't preserve throwaway compatibility states.
- **Experience First.** Product, UX, or feature-scope tradeoffs. Choose user delight over implementation convenience.
- **Exhaust the Design Space.** A novel interaction or architectural decision with no precedent. Build 2-3 competing prototypes and compare before committing.
- **Build the Lever.** Any non-trivial work. Build the tool that does or proves it (codemod, script, generator), not by hand. The tool is the artifact a reviewer reruns.

**Architecture**

- **Model the Domain.** Writing stateful logic, or code that branches a lot or repeats a shape assumption across files. Encode the domain in a structure (state machine, typed model, table or registry, reducer, boundary, the right collection) instead of scattered conditionals.
- **Boundary Discipline.** Wiring validation, error handling, or framework adapters. Guards at system boundaries, trust internal types, keep business logic pure.
- **Type System Discipline.** Designing types or a signature in any typed language. Make illegal states unrepresentable, brand primitives, parse external data at boundaries.
- **Make Operations Idempotent.** Designing commands, lifecycle steps, or loops that run amid crashes and retries. Converge to the same end state.
- **Migrate Callers Then Delete Legacy APIs.** Introducing a new internal API while old callers exist. Migrate and delete in one wave.
- **Separate Before Serializing Shared State.** Concurrent actors might write the same file, branch, key, or object. Eliminate the sharing first.

**Verification**

- **Prove It Works.** After a task, before declaring done. Verify against the real artifact, not a proxy or "it compiles".
- **Fix Root Causes.** Debugging. Trace each symptom back to the first place the system went wrong and fix it there. A guard is a fix only when the state it handles is legitimate.
- **Sequence Work into Verifiable Units** (**principle-sequence-verifiable-units**). Multi-step work (sweeps, migrations, runs of similar edits) and how you stack commits and PRs. Break work into small units that each end in a check, verify each before the next, and order delivery so the sequence proves itself.
- **Test Behavior, Not Implementation.** Writing, changing, or keeping a test. Assert what the code's users can observe, so the test fails when that behavior breaks and keeps passing when only the internals change.
- **Explain the Number.** Apply before you measure, and before you trust, report, or act on a number you measured (a speedup, a regression, a throughput, a latency, or an eval result). Find what limits it, and rule out that it measured something other than the work you think.

**Delegation**

- **Guard the Context Window.** Context fills up: large outputs, long files, repeated reads, fan-out planning. Route bulk to subagents, keep summaries in the main thread.
- **Never Block on the Human.** Tempted to ask "should I do X?" on reversible work. Proceed, present the result, let the human course-correct.

**Meta**

- **Encode Lessons in Structure.** You catch yourself writing the same instruction a second time. Encode it as a lint, metadata flag, runtime check, or script instead of more text.

## Autonomy

**Just do it.** Use any MCP tool. Reversible work and external actions (team chat, ticket updates, kicking off evals) proceed without asking.

**Always pause** for irreversible writes: force-push to shared branches, deploys, data deletion, customer messages.

**Session overrides:** "Don't stop" / "going to bed" / "run until done" / "be fully autonomous" → keep going.

**No is an acceptable answer.** Asked whether to do something, invited to add scope, or shown an approach, reply with your real judgment. Decline, push back, or say "this doesn't earn its place" when true. A recommendation is a judgment, not a validation. Agreement is not the default, candor over sycophancy.

## Subagents

**Use the `worker` subagent for any subagent you spawn directly inside a playbook step.** The session that receives `go` runs the playbook itself. Routed workflow skills (`interrogate`, `swarm`) set their own subagent type. Respect it. The harness reference says how to name a subagent type where you run.

**Defaults for every spawn.** Run it in the background where the harness allows it, give it write access unless the skill says read-only, pass file pointers rather than inlined context, and choose its model per **Models** below.

## Models

Skills never name a model. They name a size: `nano`, `small`, `medium`, `large`, or `panel`. Each person maps those sizes to real models with the **setup-models** skill, which writes `~/.config/hl/models.md` with one section per harness (`## claude-code`, `## opencode`, `## codex`, `## pi`, `## cursor`, `## antigravity`). Its Sizes table says what each size is for.

To pick a spawn's model:

1. Read `~/.config/hl/models.md` once per session and use the section for the harness you run in. Write the model in that harness's own form (see its reference).
2. Use the line for the size the skill names. A size with no line, a line of `inherit`, or no file at all means omit the model so the subagent runs on your own model.
3. When a skill names no size, pick by the work. Trivial mechanical edits, read-only exploring, and agents that only dispatch, poll, or pack results take `nano`. Routine code, swarm workers, and verification take `small`. Code delegates in the playbooks take `medium`. The hardest changes, judgment, and prose take `large`.
4. Raise the reasoning effort one step for the hardest or subtlest work, where the harness has an effort setting. Lower it one step for judgment and two or more for routine work. The file's `budget:` line sets the starting level.
5. If the harness rejects a model, don't guess another. Omit the model, run on your own, and say so.

Skills that want diverse models (arena, interrogate) read the `panel` line, which lists two or more models. A swarm model race names each arm's model up front. When the file gives only one family, or none, run them all on what you have and say in the reply that the panel was not diverse. Agreement from one family is weaker evidence than agreement across families.

You own every subagent's work. Review the diff and write your own summary. A second opinion is the same prompt on another vendor's model.

**Fresh subagents by default.** Give a fix round, a follow-up, a retry, or the next queue item to a fresh subagent with the original brief, every later directive, and the prior agent's report and branch. Resume an existing subagent only when the work needs state that lives in it and is costly to move: its checkout, its uncommitted changes, or a process it still runs.

## Writing the reply

Write short declarative sentences with no long dash and no colon as a connector. Lead with what changes for the user. Give each claim its evidence or a label (measured, inferred, or guess). Never hand the human a check you could run.

## Playbooks

Match the task to a playbook and open its steps at `playbooks/<title>.md`, with the title in kebab case. Copy its steps into the todolist first. Large, cross-cutting, or unattended work, or a task no playbook fits, routes to the **figure-it-out** skill.

Investigation, Bug fix, Perf issue, Hillclimb, Runtime forensics, Trace forensics, Feature, Refactoring, Prototype, Designing UI, Visual parity, Authoring a skill, Eval, Babysit, Shipping, Reviewing PRs, Autonomous run, Autopilot-full, Autopilot-stack, Session pickup, Pause safely, Multi-phase plan, Worktree cleanup, Opening a PR.
