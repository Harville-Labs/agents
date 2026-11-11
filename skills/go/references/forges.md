# Forges

The forge follows the repository's remote: GitHub uses `gh`, GitLab uses `glab`. GitLab calls a pull request a merge request (MR). This file holds the commands the playbooks share. Each GitLab command was checked against `glab` 1.130. Write every comment body to a file and pass the file. Never put comment text in a shell argument.

## glab pitfalls

- `glab api` endpoints take `:id` for the current project, resolved from the remote. Outside the repository, use `projects/<url-encoded group/project>` and `--hostname <host>`.
- `glab api --paginate` without `--output ndjson` can print several JSON arrays back to back. Pipe paginated output through `--output ndjson` and `jq -s`, never plain `jq`.
- glab has no `--json <fields>` flag. `view` and `list` commands take `--output json` (or `-F json`) and filter with `--jq`. For merge status, pipelines, and threads, run the watcher (`scripts/watch-pr/watch-pr --status-only`) instead of reading fields by hand.
- `-f` sends a string. `-F` converts `true`, `false`, numbers, and JSON. Use `-F` for booleans such as `resolved=true`.
- `glab mr create`, `glab issue create`, and `glab mr merge` prompt for confirmation. Pass `--yes`.
- `glab mr merge` turns auto-merge on by default. It merges once the pipeline passes, and on a project with merge trains it adds the merge request to the train. Keep the default and pass `--yes` so it does not prompt.
- `@me` works in `glab mr list` and `glab issue list` filters. For `--assignee` on create and update, pass a username: `"$(glab api user | jq -r .username)"`. Prefix it with `+` on update to add rather than replace.
- `/merge_requests` without a project defaults to `scope=created_by_me`. Add `scope=all` when you filter by reviewer or assignee.

## Everyday commands

| Action | GitHub | GitLab |
|---|---|---|
| Read an issue | `gh issue view <n> --comments` | `glab issue view <n> --comments` |
| Assign an issue to yourself | `gh issue edit <n> --add-assignee @me` | `glab issue update <n> --assignee "+<username>"` |
| Open a PR or MR | `gh pr create --base <base> --title <title> --body-file <body.md> --assignee @me` | `glab mr create --target-branch <base> --title <title> --description-file <body.md> --assignee <username> --yes` |
| Mark ready | `gh pr ready <pr>` | `glab mr update <mr> --ready` |
| Retarget | `gh pr edit <pr> --base <branch>` | `glab mr update <mr> --target-branch <branch>` |
| Status, CI, threads, mergeability | `scripts/watch-pr/watch-pr --status-only` | the same command. It reads the forge from the remote. |
| Read raw PR or MR fields | `gh pr view <pr> --json state,headRefOid` | `glab mr view <mr> --output json --jq '{state, sha, detailed_merge_status}'` |
| Read a failed job's log | `gh run view <run> --log-failed` | `glab ci trace <job-id>` |
| Review queue | `gh search prs --review-requested=@me --state=open --json url,title,repository,isDraft -- -author:@me` | `glab api --paginate --output ndjson "merge_requests?scope=all&state=opened&wip=no&reviewer_username=<you>&not[author_username]=<you>"` |
| Approve | `gh pr review <pr> --approve` | `glab mr approve <mr>` |
| Merge, squashed | `gh pr merge <pr> --squash --match-head-commit <sha>` | `glab mr merge <mr> --squash --sha <sha> --yes` |

## Review threads

A review comment belongs on the diff line it is about, in a thread the author can resolve. A general comment on the PR or MR is for the summary only.

| Action | GitHub | GitLab |
|---|---|---|
| Open a thread on a line | `gh api --method POST "repos/{owner}/{repo}/pulls/<pr>/reviews" --input <review.json>` | `glab api --method POST "projects/:id/merge_requests/<mr>/discussions" --input <thread.json>` |
| Reply in a thread | `gh api --method POST "repos/{owner}/{repo}/pulls/<pr>/comments/<comment-id>/replies" --input <reply.json>` | `glab api --method POST "projects/:id/merge_requests/<mr>/discussions/<discussion-id>/notes" --input <reply.json>` |
| Resolve a thread | `gh api graphql -f query='mutation($id: ID!) { resolveReviewThread(input: {threadId: $id}) { thread { isResolved } } }' -f id=<thread-id>` | `glab api --method PUT "projects/:id/merge_requests/<mr>/discussions/<discussion-id>" -F resolved=true` |
| List open threads | `scripts/watch-pr/watch-pr --status-only` | the same command, or `glab mr note list <mr> --state unresolved` |

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

Set `new_line` for an added line, `old_line` for a removed line, and both for an unchanged line. The watcher's thread `id` is the discussion id that the reply and resolve endpoints take. A reply body is `{"body": "<reply>"}`. To send several findings as one review, create each with `POST .../merge_requests/<mr>/draft_notes`, whose body names the text `note` instead of `body` and takes the same `position`, then publish them together with `POST .../merge_requests/<mr>/draft_notes/bulk_publish`.

## Your last review

The last head you reviewed is the SHA to diff from and the reason to skip a PR whose head hasn't moved. Outside the repository, replace `{owner}/{repo}` and `:id` as the pitfalls above describe.

On GitHub, every review records the commit it was made on, approvals included:

```sh
gh api --paginate --slurp "repos/{owner}/{repo}/pulls/<pr>/reviews" \
  | jq -r --arg me "$(gh api user --jq .login)" '[.[][] | select(.user.login == $me)] | last | .commit_id // empty'
```

On GitLab, a note doesn't record the head it saw, so take the time of your latest note and find the MR version that was current then. Approving the MR adds a system note in your name, so approvals count:

```sh
at=$(glab api --paginate --output ndjson "projects/:id/merge_requests/<mr>/notes" \
  | jq -rs --arg me "<you>" '[.[] | select(.author.username == $me)] | max_by(.created_at) | .created_at // empty')
glab api --paginate --output ndjson "projects/:id/merge_requests/<mr>/versions" \
  | jq -rs --arg at "$at" '[.[] | select(.created_at <= $at)] | max_by(.created_at) | .head_commit_sha // empty'
```

Empty output means you haven't reviewed it. Compare the SHA with the current head: `gh pr view <pr> --json headRefOid` or the MR's `sha` from `glab api "projects/:id/merge_requests/<mr>"`.

## Labels

The label scheme is in the **git-best-practices** skill. GitHub uses `P1`, `type:bug`, and `area:router`. GitLab uses scoped labels: `priority::1`, `type::bug`, and `area::router`.

| Action | GitHub | GitLab |
|---|---|---|
| Create an issue | `gh issue create --title <title> --body-file <body.md> --label P1,type:bug` | `glab issue create --title <title> --description-file <body.md> --label "priority::1,type::bug" --yes` |
| Label a PR or MR | `gh pr edit <pr> --add-label P1` | `glab mr update <mr> --label "priority::1"` |
| Remove a label | `gh pr edit <pr> --remove-label P1` | `glab mr update <mr> --unlabel "priority::1"` |

A scoped label replaces any other label with the same `priority::` prefix. Scoped labels need GitLab Premium. On the Free tier, both labels stay, so remove the old one with `--unlabel`.
