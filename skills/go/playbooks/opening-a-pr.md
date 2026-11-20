### Opening a PR

Invoked at the end of every other playbook.

Read the repository's `AGENTS.md` and the issue with its comments when one exists. Work from a git worktree off trunk on a branch named `<type>/<issue>-<slug>`, and keep unrelated work out of it. Rebase into small, landable commits. Behavior, config, and docs land together: run the **update-docs** skill, and add a changelog line when the repository keeps one. Run the repository's full check command, then the **deslop** skill over the diff before commit and the **no-comments** skill before review.

Title: `type(scope): subject`, naming a real symbol when one carries the change. Body: a one-minute briefing under 40 lines, written with the **technical-writing** and **unslop** skills. Fill the repository's PR template when it has one. Otherwise use these `##` headings in order, dropping empty ones: `## Why` (ending with `Closes #<n>` when an issue exists), `## What changed`, `## Scope`, `## Tradeoffs` (only rejected alternatives a reviewer would otherwise ask about), `## Blast Radius`, `## How it was tested` (commands you actually ran, and what you didn't verify).

Take every forge command from the table in `../references/forges.md` (`gh` for GitHub, `glab` for GitLab), and read its glab pitfalls before your first `glab` call. Open PRs ready, through the harness's PR tool with `draft: false` where it has one, or the forge's create command without `--draft`. Assign the PR to yourself and label it per the **git-best-practices** skill. On GitLab, `--assignee` takes a username, not `@me`. If the PR still opens as a draft, mark it ready. Read the PR back with `gh pr view` or `glab mr view` before you report its status.

Stack follow-ups by base branch. The root targets trunk, and each child targets its parent's branch. Opening a PR does not start a babysit.
