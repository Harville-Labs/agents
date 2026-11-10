---
name: help
description: Guides users through hl agent setup, the go skill, and picking the skill, playbook, or principle for a task. Type /hl:help with a question.
disable-model-invocation: true
---

# Help

Answer the user's question about the hl skills, hand them a prompt they can send, and link the file the answer came from. For a help question, don't start the work. The user asked how, and a **go** run spends real tokens, so let them send the prompt.

A message that asks for work, such as "use go to fix this bug", is not a help question. Read [`go`](../go/SKILL.md) and do the work under it.

This file maps questions to the skills that hold the answers. Those files own the details. Read the file you route to before you quote it, and trust it when it disagrees with this map. The links here point into the installed plugin, which the user may not be able to open, so give the user the file's public copy: the `repository` URL in the plugin's manifest (`.claude-plugin/plugin.json`), followed by `/blob/main/` and its path from the repository root.

## Name things the way the user's harness does

How the user types a skill depends on where they run:

| Harness | Type a skill as | Example |
|---|---|---|
| Claude Code | `/hl:<name>` | `/hl:go fix the flaky login test` |
| OpenCode | `@<name>`, or ask for it by name | `@go fix the flaky login test` |
| Codex | `$<name>` | `$go fix the flaky login test` |

The recipes below use the Claude Code form. Translate them for the user's harness.

## Find out what they need

Infer the need from the message and the conversation. A named situation, such as "which skill reviews a PR?", goes straight to its section. If the need is still unclear, ask one multiple-choice question with these options, then answer only the section they pick:

- Get set up
- Start a task with go
- Pick a skill for a situation
- Fix a run that went wrong
- Make the skills my own

Check the state that changes the answer, and mention it only when it does:

- No `~/.config/hl/models.md` means **setup-models** hasn't run for this user, so every subagent runs on the session's own model and review panels aren't diverse.
- No `verify-*` skill or other app harness in the project means agents have no scripted way to drive the app. Mention **create-verification-skill** when the question is about proving a change works.
- No formal verification skill in the project means no property is checked past what tests reach. Mention **create-formal-verification-skill** when the question is about a race, an invariant, or another case tests rarely hit. When one exists and the code it covers changed after the commit it records as last in sync, mention **maintain-formal-verification-skill** if the question touches that code.

When the models file is missing and it matters, ask once per chat whether they want to run **setup-models** now. It matters when the user is new, the question is about setup or cost, or the answer depends on which models run.

## Get set up

1. Install the plugin for their harness. The [README](../../README.md) has the command for Claude Code, OpenCode, and Codex.
2. Run [**setup-models**](../setup-models/SKILL.md). It lists the models they can use, asks for a reasoning budget, maps a model to each size (nano, small, medium, large, and the review panel), and writes `~/.config/hl/models.md`. Then it offers once each to generate a verification skill and a formal verification skill for the project.
3. Start a real task with **go**, a goal, and a check that can pass or fail.

The plugin adds a short reminder to each session to use **go** for nontrivial work. Other skills load when the user types them or when **go** runs them. Offer to word their first prompt with them, per [`references/prompting.md`](references/prompting.md).

If cost is the worry, say where the tokens go and how to spend fewer. The skills spend extra tokens on subagents and review panels. Rerun **setup-models** and pick a smaller budget or cheaper models for each size. A size set to `inherit` runs on the session's model. A shorter panel list runs fewer subagents, one for each entry. Save **go** for work that needs rigor.

## Start a task with go

**go** matches the task to a playbook, copies the playbook's steps into the todo list, and runs the other skills as the steps need them. A step it skips stays in the list as `skip: <reason>`. A good prompt states the goal and how to tell it's done. It doesn't list skills, because a hand-written sequence tends to drop or reorder steps the playbook would keep. Read [`references/prompting.md`](references/prompting.md) before you help word one.

Each new task starts with **go** again. Mid-chat, "new task" makes it match a fresh playbook. **go** uses the `worker` subagent for the subagents its playbook steps spawn. To get the same style from a subagent of your own, spawn `worker` (the go skill's harness reference says how where you run).

## Pick a skill

The default answer is **go**, which runs most of the others when its steps need them. Name a skill directly when the user wants more or less of something than the playbook gives. Read the skill before you recommend it, and give one example prompt.

| The user wants to | Skill |
|---|---|
| Do any nontrivial task with rigor | [`go`](../go/SKILL.md) |
| Check that the agent understood their goal and the problem before it starts | [`in-your-own-words`](../in-your-own-words/SKILL.md) |
| Get a prompt rewritten deeper, not bigger, before sending it. It returns the prompt and doesn't do the task | [`sharpen`](../sharpen/SKILL.md) |
| Know how code works now, or where new code should live | [`how`](../how/SKILL.md) |
| Know why code is shaped this way, or where a number came from | [`why`](../why/SKILL.md) |
| Understand a change or subsystem, explained plainly | [`teach`](../teach/SKILL.md) |
| Catch up on their own recent work on a topic | [`recall`](../recall/SKILL.md) |
| Catch up on what changed in this chat since their last message, with every item waiting on them listed | [`catchup`](../catchup/SKILL.md) |
| Catch up like `catchup`, in a short subtitled video of slides | [`catchup-video`](../catchup-video/SKILL.md) |
| Know what a small diff could break outside itself | [`blast-radius`](../blast-radius/SKILL.md) |
| Settle types and module shape before code that crosses a function boundary | [`architect`](../architect/SKILL.md) |
| Get several attempts at one brief, merged into the best one | [`arena`](../arena/SKILL.md) |
| Run parallel checks over slices, or race workers | [`swarm`](../swarm/SKILL.md) |
| Have different models review a diff and try to break it | [`interrogate`](../interrogate/SKILL.md) |
| Fix a bug test-first when a cheap local test exists | [`tdd`](../tdd/SKILL.md) |
| Apply a language's rules to their code | [`typescript-best-practices`](../typescript-best-practices/SKILL.md), [`python-best-practices`](../python-best-practices/SKILL.md), [`go-best-practices`](../go-best-practices/SKILL.md), [`rust-best-practices`](../rust-best-practices/SKILL.md), [`svelte-best-practices`](../svelte-best-practices/SKILL.md) |
| Apply the cross-language rules for code, tests, security, git, or deployment | [`code-best-practices`](../code-best-practices/SKILL.md), [`testing-best-practices`](../testing-best-practices/SKILL.md), [`security-best-practices`](../security-best-practices/SKILL.md), [`git-best-practices`](../git-best-practices/SKILL.md), [`deploy-best-practices`](../deploy-best-practices/SKILL.md) |
| Remove AI slop from a diff before commit | [`deslop`](../deslop/SKILL.md) |
| Strip comments before review, using a reviewer that didn't write them | [`no-comments`](../no-comments/SKILL.md) |
| Drive a CLI or TUI the way a user does, and capture proof | [`control-cli`](../control-cli/SKILL.md) |
| Drive a browser, Electron, or web UI the way a user does, and capture proof | [`control-ui`](../control-ui/SKILL.md) |
| Clean AI tells out of prose | [`unslop`](../unslop/SKILL.md) |
| Write docs, an RFC, a README, a PR description, or a commit message to a standard | [`technical-writing`](../technical-writing/SKILL.md) |
| Give agents a scripted way to drive the app and prove behavior | [`create-verification-skill`](../create-verification-skill/SKILL.md) |
| Bring a verification skill and its feature map back in line with the app | [`maintain-verification-skill`](../maintain-verification-skill/SKILL.md) |
| Formally verify a race, invariant, or other property that tests rarely reach | [`create-formal-verification-skill`](../create-formal-verification-skill/SKILL.md) |
| Bring a formal verification back in line after the code it covers changed | [`maintain-formal-verification-skill`](../maintain-formal-verification-skill/SKILL.md) |
| Show a PM or designer a chart of what the user sees, checked by a TLA+ model | [`statechart`](../statechart/SKILL.md) |
| Vet a performance number before reporting or acting on it | [`benchmark-checklist`](../benchmark-checklist/SKILL.md) |
| Run a large or cross-cutting change, or one to review after stepping away | [`figure-it-out`](../figure-it-out/SKILL.md) |
| Keep a decision log during a run, and review it afterward | [`show-me-your-work`](../show-me-your-work/SKILL.md) |
| Pick a model for each size and a reasoning budget | [`setup-models`](../setup-models/SKILL.md) |
| Turn their own working habits into a personal mode skill | [`automate-me`](../automate-me/SKILL.md) |
| Turn what a finished task taught into skill edits | [`reflect`](../reflect/SKILL.md) |
| Stop agents from repeating the same mistakes in this repo | [`correct`](../correct/SKILL.md) |
| Add a dependency, a service, an ADR, docs, or an `AGENTS.md` | [`add-dependency`](../add-dependency/SKILL.md), [`add-service`](../add-service/SKILL.md), [`write-adr`](../write-adr/SKILL.md), [`update-docs`](../update-docs/SKILL.md), [`write-agents-md`](../write-agents-md/SKILL.md) |
| Find their way around | `help` |

If a skill directory next to this one is missing from the table, read its frontmatter and route by its description. The `principle-*` directories are covered under principles below.

Close calls:

- `how` explains what the code does. `why` explains the reasons. `teach` runs one or both and explains the result plainly.
- `arena` gives every worker the same brief and merges the best parts. `swarm` splits work into slices or a race and returns one report.
- `architect` implements right after it settles the design. Add "with checkpoint" to review the design before it writes code.
- `interrogate` reviews the diff. `blast-radius` looks for breakage outside the diff and proves the one fact that makes the change safe.
- `deslop` cleans code. `unslop` cleans prose.
- `recall` rebuilds context across recent chats. `catchup` covers only this chat since the user's last message. Resuming one specific chat or branch is the Session pickup playbook.
- `figure-it-out` designs one rigorous run. The Orchestrate playbook runs a program that spans days and many PRs. The Autonomous run playbook drives one task to a finish condition.

## Playbooks and principles

Playbooks are step lists inside **go**, not skills, so they have no command. Inside **go**, describing the task picks one, and these phrases name one directly:

- "babysit this pr" or "check on pr 123" runs Babysit. It drives the PR to merge-ready and stops there. It doesn't merge unless the user asks to merge, land, or ship.
- "land the stack" runs Shipping.
- "take over this branch" runs Session pickup.
- "pause safely" runs Pause safely.
- "full autopilot on this queue" runs Autopilot-full. "autopilot, don't merge" runs Autopilot-stack.
- "run the eval playbook" runs Eval.

The Playbooks section of [`go`](../go/SKILL.md) lists every playbook and when it applies. For work that spans phases or stacked PRs, asking **go** for a plan runs the [Multi-phase plan playbook](../go/playbooks/multi-phase-plan.md), which writes the plan and doesn't implement it. For a design question, the Prototype playbook or `architect` settles it in code first.

Principles are one-rule skills that **go** reads and cites in its replies. The user rarely invokes one. They steer with the names instead, as in "apply prove it works. show me the real output." Loading `principle-<name>` by name still works.

## Fix a run that went wrong

| Symptom | Fix |
|---|---|
| A question got treated as the next step of the last task | Say "new task", or say the turn doesn't need **go**. |
| A new model choice had no effect | Skills read `~/.config/hl/models.md` once per session. Start a new one. |
| A review panel ran on one model | The models file has one vendor, or none, on its `panel` line. Rerun **setup-models**. |
| Runs cost more than expected | See the cost paragraph under Get set up. |
| A skill didn't load on its own | Most skills load when the user names them or when **go** runs them, and it doesn't run every skill. |
| Parallel agents overwrote each other | Give each writer its own git worktree. |
| An overnight run moved but finished nothing | The loop needs a check that can pass or fail, not a duration. |
| The reply claims success from a green build | Ask for the real command, flow, stored value, or profile. That's the prove-it-works principle. |

For a run that drifts, [`references/prompting.md`](references/prompting.md) has one-line steers.

## Make the skills my own

- [`automate-me`](../automate-me/SKILL.md) drafts a personal mode skill from the user's own history, to use alongside **go**.
- [`reflect`](../reflect/SKILL.md) after a session turns its lessons into skill edits the user approves.
- "go write a skill for <workflow>" runs the authoring playbook. The eval playbook tests a skill change blind.
- Fix a misbehaving skill in its own PR to the repository this plugin was installed from, not inside the feature work where it went wrong.

## Reply

Lead with the answer. Give at most one example prompt in a code block, adapted from [`references/recipes.md`](references/recipes.md) when one fits, then the link to that file. Keep it short unless the user asked for the whole map.
