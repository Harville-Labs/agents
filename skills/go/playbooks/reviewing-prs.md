### Reviewing PRs

**You own the review, not the fix. Every finding you post was confirmed in the code and sits on the diff line it is about.**

1. **List the queue.** The forge follows the repository's remote: GitHub uses `gh`, GitLab uses `glab`. On GitHub, run `gh search prs --review-requested=@me --state=open --json url,title,repository,isDraft`. On GitLab, run `glab mr list --reviewer=@me --not-draft` in one project, or `glab api --paginate --output ndjson "merge_requests?scope=all&state=opened&reviewer_username=<you>"` across all of them (`/merge_requests` defaults to `scope=created_by_me`, so keep `scope=all`). Skip drafts unless the user asks for them. Tell the user the queue before you start.
2. **Review each PR in a fresh subagent.** Spawn one read-only `reviewer` subagent per PR, in parallel, on the `medium` size. Its brief gives the PR URL and these steps: check the head out in its own worktree, read the PR body and the issue it closes, read the repository's `AGENTS.md`, and diff against the PR's base branch, not `main`. When you reviewed the PR before, it reviews only the commits since your last review. It returns each finding with its path, line, side (added or removed), and body, and posts nothing.
3. **Confirm every finding yourself.** Read the code at each finding. Drop a finding you cannot confirm, a style point the formatter handles, and a preference the repository's rules don't back. A finding names what goes wrong and the input that triggers it.
4. **Post one review per PR.** Put each finding in a thread on its diff line and the summary in the review body, with the commands in `../references/forges.md`. Post it as a comment. Approve (`gh pr review <pr> --approve` or `glab mr approve <mr>`) or request changes only when the user said to. Never push to the author's branch.

**Reply:** each PR link in full, how many findings you posted and the most severe one, PRs you skipped and why, and your recommended verdict for each.
