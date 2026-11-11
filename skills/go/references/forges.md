# Forges

The forge follows the repository's remote: GitHub uses `gh`, GitLab uses `glab`. GitLab calls a pull request a merge request (MR). This file holds the commands the playbooks share. Each GitLab command was checked against `glab` 1.130. Write every comment body to a file and pass the file. Never put comment text in a shell argument.

## glab pitfalls

- `glab api` endpoints take `:id` for the current project, resolved from the remote. Outside the repository, use the URL-encoded path and `--hostname <host>`: `projects/group%2Fsub%2Fproject`. An unencoded path returns 404.
- `glab api --paginate` without `--output ndjson` can print several JSON arrays back to back. Pipe paginated output through `--output ndjson` and `jq -s`, never plain `jq`.
- glab has no `--json <fields>` flag. `view` and `list` commands take `--output json` (or `-F json`) and filter with `--jq`. For merge status, pipelines, and threads, run the watcher (`scripts/watch-pr/watch-pr --status-only`) instead of reading fields by hand.
- The pipeline that gates an MR is the MR's `head_pipeline` (`glab mr view <mr> -F json --jq .head_pipeline`). A merged-results pipeline runs on `refs/merge-requests/<iid>/merge`, so a branch pipeline list does not show it. List an MR's pipelines with `glab api "projects/:id/merge_requests/<mr>/pipelines"`.
- The `glab mr note` subcommands, drafts included, are experimental. The recipes here were checked against glab 1.130. `glab mr notes` is not a command. If your glab has no `mr note list`, read `glab api --paginate --output ndjson "projects/:id/merge_requests/<mr>/discussions"`. A review thread is a discussion whose first non-system note has `resolvable: true`. Notes with `system: true` record events such as review requests and approvals.
- `glab api` has no `--jq` flag. Pipe its output to `jq`: `glab api user | jq -r .username`.
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

A review comment belongs on the diff line it is about, in a thread. A general comment on the PR or MR is for the summary only. Write each body to a file. Pass it as `--input <file>` to `gh api` or on stdin to `glab`, never as a shell argument.

### Post a review

On GitHub one call posts the summary and every line thread, as a comment, with one notification. Write `review.json`, with `commit_id` from `gh pr view <pr> --json headRefOid --jq .headRefOid`:

```json
{
  "commit_id": "<head sha>",
  "event": "COMMENT",
  "body": "<summary>",
  "comments": [
    { "path": "src/a.ts", "line": 42, "side": "RIGHT", "body": "<finding>" },
    { "path": "src/b.ts", "line": 7, "side": "LEFT", "body": "<finding on a removed line>" }
  ]
}
```

```sh
gh api --method POST repos/<owner>/<repo>/pulls/<pr>/reviews --input review.json
```

`RIGHT` takes the line number in the new file. `LEFT` takes a removed line by its number in the old file. GitHub rejects the whole review if any line is outside the diff. Move that finding into the summary and post again.

On GitLab, save each finding as a draft note, publish them together, then post the summary:

| Step | Command |
|---|---|
| Check you have no drafts. Publishing posts all of them. | `glab mr note draft list <mr> -F json --jq length` prints `0`. Otherwise submit or discard them in the GitLab UI first. |
| Draft a finding on a new or changed line | `glab mr note draft create <mr> --file <path> --line <n> < finding.md` |
| Draft a finding on a removed line | `glab mr note draft create <mr> --file <path> --old-line <n> < finding.md` |
| Publish the drafts | `glab mr note draft publish <mr> --yes` |
| Post the summary | `glab mr note create <mr> --resolvable=false < summary.md` |

`draft create` refuses a line outside the diff (`line <n> not found in diff`). Move that finding into the summary. Post the summary with `--resolvable=false`. A resolvable summary opens a thread that blocks a project requiring all threads resolved.

### Reply and resolve

The thread `<id>` is the `id` the watcher (`scripts/watch-pr/watch-pr --status-only`) prints: a GraphQL node id on GitHub, a discussion id on GitLab.

| Action | GitHub | GitLab |
|---|---|---|
| Reply in a thread | Get the first comment's id with `gh api graphql -f query='query($id:ID!){node(id:$id){... on PullRequestReviewThread{comments(first:1){nodes{databaseId}}}}}' -F id=<id> --jq '.data.node.comments.nodes[0].databaseId'`. Write `{"body": "<reply>"}` to `reply.json`, then `gh api --method POST repos/<owner>/<repo>/pulls/<pr>/comments/<comment-id>/replies --input reply.json` | `glab mr note create <mr> --reply <id> < reply.md` |
| Resolve a review bot's thread | `gh api graphql -f query='mutation($id:ID!){resolveReviewThread(input:{threadId:$id}){thread{isResolved}}}' -F id=<id>` | `glab mr note resolve <mr> <id>` |

Resolve only a review bot's thread, once you have replied with the fix or the dismissal, as `review-bot-triage.md` says. A human reviewer resolves their own threads. `glab mr note resolve` takes the MR first. Its usage line shows the reverse, which fails.

## Your last review

The last head you reviewed is the SHA to diff from and the reason to skip a PR whose head hasn't moved. Compare it with the watcher's `headRefOid`. Empty output or `null` means you haven't reviewed.

On GitHub it is the commit your latest review was made on, approvals included:

```sh
gh pr view <pr> --json reviews --jq '[.reviews[] | select(.author.login == "<you>")] | last | .commit.oid'
```

On GitLab a note doesn't record the head it saw, so take the head of the MR version that was current at your latest note. Approving adds a note in your name, so approvals count.

```sh
me=$(glab api user | jq -r .username)
at=$(glab api --paginate --output ndjson "projects/:id/merge_requests/<mr>/notes" \
  | jq -rs --arg me "$me" '[.[] | select(.author.username == $me) | .created_at] | max')
glab api --paginate --output ndjson "projects/:id/merge_requests/<mr>/versions" \
  | jq -rs --arg at "$at" '[.[] | select(.created_at <= $at)] | max_by(.created_at) | .head_commit_sha'
```

## Labels

The label scheme is in the **git-best-practices** skill. GitHub uses `P1`, `type:bug`, and `area:router`. GitLab uses scoped labels: `priority::1`, `type::bug`, and `area::router`.

| Action | GitHub | GitLab |
|---|---|---|
| Create an issue | `gh issue create --title <title> --body-file <body.md> --label P1,type:bug` | `glab issue create --title <title> --description-file <body.md> --label "priority::1,type::bug" --yes` |
| Label a PR or MR | `gh pr edit <pr> --add-label P1` | `glab mr update <mr> --label "priority::1"` |
| Remove a label | `gh pr edit <pr> --remove-label P1` | `glab mr update <mr> --unlabel "priority::1"` |

A scoped label replaces any other label with the same `priority::` prefix. Scoped labels need GitLab Premium. On the Free tier, both labels stay, so remove the old one with `--unlabel`.
