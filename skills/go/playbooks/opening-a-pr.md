### Opening a PR

Invoked at the end of every other playbook.

Read the repository's `AGENTS.md` and the issue with its comments when one exists. Work from a git worktree off trunk on a branch named `<type>/<issue>-<slug>`, and keep unrelated work out of it. Rebase into small, landable commits. Behavior, config, and docs land together: run the **update-docs** skill, and add a changelog line when the repository keeps one. Run the repository's full check command, then the **deslop** skill over the diff before commit and the **no-comments** skill before review.

Title: `type(scope): subject`, naming a real symbol when one carries the change. Body: a one-minute briefing under 40 lines, written with the **technical-writing** and **unslop** skills. Fill the repository's PR template when it has one. Otherwise use these `##` headings in order, dropping empty ones: `## Why` (ending with `Closes #<n>` when an issue exists), `## What changed`, `## Scope`, `## Tradeoffs` (only rejected alternatives a reviewer would otherwise ask about), `## Blast Radius`, `## How it was tested` (commands you actually ran, and what you didn't verify).

Stack follow-ups by base branch. Open PRs ready, through the harness's PR tool with `draft: false` where it has one. Without one, use `gh pr create --base <base> --body-file <body.md>` or `glab mr create --target-branch <base> --description-file <body.md> --yes`, never with `--draft`. `../references/forges.md` has the label and review-thread commands for both forges. Opening a PR does not start a babysit.
