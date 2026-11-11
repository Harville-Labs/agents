### Opening a PR

Invoked at the end of every other playbook.

**Start right.** Read the repository's `AGENTS.md` (and any nested one where you'll work). If there's an issue, read it with its comments (`gh issue view <n> --comments` or `glab issue view <n> --comments`). Assign it to yourself unless someone else holds it (`gh issue edit <n> --add-assignee @me` or `glab issue update <n> --assignee "+$(glab api user | jq -r .username)"`). If the request conflicts with an invariant in `AGENTS.md`, stop and say so: that needs an ADR (the **write-adr** skill) or a different approach.

**Worktree and branch.** Work from a git worktree off an up-to-date main, on a branch named `<type>/<issue>-<slug>` (`feat/58-escalation-ladder`). Subagents inherit it. Parallel subagents on the same branch each get their own worktree, or `git fetch && git reset --hard origin/<branch>` between them. Dirty branch with unrelated work: patch out, fresh worktree, apply. Snarled worktree: reset from main, redo minimally.

**Commits.** Commit liberally. Rebase into small, ordered commits before opening PRs. Each commit is a future PR: landable, ordered to tell the story. Amend when the fix belongs in a just-made commit. New commit when separable. Commit bodies don't restate the subject. Stage only what belongs to the change (`git add -p`). Fixes you tripped over get their own commits.

**Before the PR.** Behavior, config, and docs land together: run the **update-docs** skill, and add a `CHANGELOG.md` line under **Unreleased** for a user-visible change when the repository keeps one. Regenerate generated files with their script; never hand-edit them. Run the repository's full check command from its `AGENTS.md` and fix everything it reports, formatting included. Then run the **deslop** skill over the diff before commit, the **no-comments** skill before review, and the **self-review** skill on the result. Write every PR title, description, and commit body with the **technical-writing** skill (every layer except Diátaxis, and apply the STE vocabulary rules: one word per action, keep articles, a plain verb over `-ing` where one works), then the **unslop** skill.

**Titles.** Conventional Commits `type(scope): subject`, no trailing period. Type such as `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, or `perf`. Scope is the package, app, or area, such as `router` or `go`. Subject is short, imperative, and names a real symbol when one carries the change, for example `fix(router): keep escalation rule when budget is unset`.

**Descriptions.** The PR body is a one-minute briefing, not a lab notebook, for a reviewer who has the diff. It says why the change exists, what it leaves out, what it could break, and how you proved it works. Write short, simple sentences with few identifiers, no walls of text. The body becomes the squash commit body, so keep that commit under about 40 lines. When the repository has a PR template, fill in its headings and fold the sections below into them. Otherwise use `##` headings, not bold lead-ins, in this order, and drop a section with nothing to say:

- `## Why`: the user's goal, the problem, and the approach, 1–3 short sentences, ending with `Closes #<n>` when an issue exists. No SHAs, rebase genealogy, or "based on main" preamble.
- `## What changed`: 1–3 short bullets. Name a real symbol or path only when it carries the change. Name both sides of a rename or retarget.
- `## Scope`: always. 1–3 short items on what it covers and what it deliberately leaves out (a follow-up, a known gap). No symbols, paths, or file-by-file essay.
- `## Tradeoffs`: only rejected alternatives a reviewer would otherwise ask about. Skip when there was no real choice.
- `## Blast Radius`: 1–2 sentences on who or what it touches and why that is safe or risky. If main is red, state the cost of leaving it red.
- `## How it was tested`: always. 1–3 bullets, each a command you actually ran or a path you drove by hand, and its outcome. Say what you didn't verify. Perf: one primary number with its unit, `before → after`, and a link to the arena or swarm directory for the rest. No sample-size methodology, swarm recitals, or metric tables.

After the sections, attach videos or screenshots when they prove a claim. Full SHAs, swarm or arena lane recitals, lever-correction essays, file-by-file checklists, and "CLEAN" verdicts go in a linked artifact, not the body.

**Forge.** The forge follows the repository's remote: GitHub uses `gh`, GitLab uses `glab`. Keep that choice for create, edit, view, watch, and merge. Don't require Graphite (`gt`). Create with `gh pr create --base <base> --title <title> --body-file <body.md> --assignee @me` or `glab mr create --target-branch <base> --title <title> --description "$(cat <body.md>)" --assignee "$(glab api user | jq -r .username)"`. The PR is assigned to whoever opened it, so it shows in their assigned list. Label it per the **git-best-practices** skill. `../references/forges.md` has the label and review-thread commands for both forges. When the harness has its own PR tool, use it for what it covers and the forge CLI for the rest. If that tool sets no assignee, add one after with `gh pr edit <pr> --add-assignee @me` or `glab mr update <mr> --assignee "$(glab api user | jq -r .username)"`.

**Size and stacks.** Prefer five narrow PRs to one large PR. A stack is a base-branch chain. The root PR targets trunk. Each child branch rebases onto its parent's exact tip and its PR targets the parent branch. As a parent merges, move its child onto trunk per `playbooks/shipping.md` step 4. Retarget with `gh pr edit <pr> --base <parent-branch>` or `glab mr update <mr> --target-branch <parent-branch>`. Branch from trunk only for independent work. Rebase on trunk before substantial stack work.

**Readiness.** Open every PR ready, never as a draft: omit `--draft` with either CLI, and set `draft: false` on any harness PR tool that defaults to draft. If a PR still opens as a draft, mark it ready (`gh pr ready <number>` or `glab mr update <mr> --ready`). Run `gh pr view <number>` or `glab mr view <mr>` before you refer to PR status.

**Babysit.** Opening a PR does not start a babysit. Post the URL and keep building. Finish the phase or stack first. Run a separate babysit pass only when the user asks for one after the whole stack exists. A babysit for each new PR stalls the build and spends checks on commits later waves restart. Push back when feedback drifts from intent.

A subagent that opens a PR runs the **deslop** and **no-comments** skills, and posts the URL. It returns to the parent without babysitting, unless it is an Autopilot-full or Autopilot-stack owner. That owner's brief assigns the babysit loop and is the ask `playbooks/babysit.md` waits for. The owner starts the loop after its code-ready report, reports merge-ready, and is exempt from the rules here and in `playbooks/babysit.md` that hold babysitting until a whole stack is built.

**Report.** Tell the user what changed (with file links), what you ran and its result, what you didn't verify, and anything you noticed but left alone.
