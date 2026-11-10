# Forges

The forge follows the repository's remote: GitHub uses `gh`, GitLab uses `glab`. GitLab calls a pull request a merge request (MR). This file holds the commands the playbooks share for review threads and labels. Write every comment body to a file and pass the file. Never put comment text in a shell argument.

## Review threads

A review comment belongs on the diff line it is about, in a thread the author can resolve. A general comment on the PR or MR is for the summary only.

| Action | GitHub | GitLab |
|---|---|---|
| Open a thread on a line | `gh api --method POST "repos/{owner}/{repo}/pulls/<pr>/reviews" --input <review.json>` | `glab api --method POST "projects/:id/merge_requests/<mr>/discussions" --input <thread.json>` |
| Reply in a thread | `gh api --method POST "repos/{owner}/{repo}/pulls/<pr>/comments/<comment-id>/replies" --input <reply.json>` | `glab api --method POST "projects/:id/merge_requests/<mr>/discussions/<discussion-id>/notes" --input <reply.json>` |
| Resolve a thread | `gh api graphql -f query='mutation($id: ID!) { resolveReviewThread(input: {threadId: $id}) { thread { isResolved } } }' -f id=<thread-id>` | `glab api --method PUT "projects/:id/merge_requests/<mr>/discussions/<discussion-id>" -f resolved=true` |
| List open threads | `scripts/watch-pr/watch-pr --status-only` | `glab api --paginate "projects/:id/merge_requests/<mr>/discussions"`, keeping discussions with a note where `resolvable` is true and `resolved` is false |

On GitHub, one review carries every line comment, so the author gets one notification. Take `commit_id` from `gh pr view <pr> --json headRefOid`:

```json
{
  "commit_id": "<head sha>",
  "event": "COMMENT",
  "body": "<summary>",
  "comments": [{ "path": "src/a.ts", "line": 42, "side": "RIGHT", "body": "<finding>" }]
}
```

Use `"side": "LEFT"` for a removed line. The watcher's thread `id` is the GraphQL node id that `resolveReviewThread` takes. A reply needs the REST `id` of the thread's first comment, from `gh api --paginate "repos/{owner}/{repo}/pulls/<pr>/comments"`.

On GitLab, a thread is a discussion with a `position`. Without one it lands on the Overview tab, detached from the code. Never use `glab mr note` or the `/notes` endpoint for a finding, because those make a plain comment that nobody can resolve. Take the SHAs from the first entry of `glab api "projects/:id/merge_requests/<mr>/versions"`:

```json
{
  "body": "<finding>",
  "position": {
    "position_type": "text",
    "base_sha": "<base_commit_sha>",
    "start_sha": "<start_commit_sha>",
    "head_sha": "<head_commit_sha>",
    "old_path": "src/a.ts",
    "new_path": "src/a.ts",
    "new_line": 42
  }
}
```

Set `new_line` for an added line, `old_line` for a removed line, and both for an unchanged line. To send several findings as one review, create each with `POST .../merge_requests/<mr>/draft_notes` (same `note` body and `position`), then publish them together with `POST .../merge_requests/<mr>/draft_notes/bulk_publish`.

## Labels

The label scheme is in the **git-best-practices** skill. GitHub uses `P1`, `type:bug`, and `area:router`. GitLab uses scoped labels: `priority::1`, `type::bug`, and `area::router`.

| Action | GitHub | GitLab |
|---|---|---|
| Create an issue | `gh issue create --title <title> --body-file <body.md> --label P1,type:bug` | `glab issue create --title <title> --description "$(cat <body.md>)" --label "priority::1,type::bug"` |
| Label a PR or MR | `gh pr edit <pr> --add-label P1` | `glab mr update <mr> --label "priority::1"` |
| Remove a label | `gh pr edit <pr> --remove-label P1` | `glab mr update <mr> --unlabel "priority::1"` |

A scoped label replaces any other label with the same `priority::` prefix. Scoped labels need GitLab Premium. On the Free tier, both labels stay, so remove the old one with `--unlabel`.
