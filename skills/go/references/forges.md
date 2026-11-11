# Forges

The forge follows the repository's remote: GitHub uses `gh`, GitLab uses `glab`. GitLab calls a pull request a merge request (MR). This file holds the commands the playbooks share. Each GitLab command was checked against `glab` 1.130. Write every comment body to a file and pass the file. Never put comment text in a shell argument.

## glab pitfalls

- `glab api` endpoints take `:id` for the current project, resolved from the remote. Outside the repository, use the URL-encoded path and `--hostname <host>`: `projects/group%2Fsub%2Fproject`. An unencoded path returns 404.
- `glab api --paginate` without `--output ndjson` can print several JSON arrays back to back. Pipe paginated output through `--output ndjson` and `jq -s`, never plain `jq`.
- glab has no `--json <fields>` flag. `view` and `list` commands take `--output json` (or `-F json`) and filter with `--jq`. For merge status, pipelines, and threads, run the watcher (`scripts/watch-pr/watch-pr --status-only`) instead of reading fields by hand.
- The pipeline that gates an MR is the MR's `head_pipeline` (`glab mr view <mr> -F json --jq .head_pipeline`). A merged-results pipeline runs on `refs/merge-requests/<iid>/merge`, so a branch pipeline list does not show it. List an MR's pipelines with `glab api "projects/:id/merge_requests/<mr>/pipelines"`.
- The `glab mr note` subcommands are experimental, and `glab mr notes` is not a command. If your glab has no `mr note list`, read `glab api --paginate --output ndjson "projects/:id/merge_requests/<mr>/discussions"`. A review thread is a discussion whose first non-system note has `resolvable: true`. Notes with `system: true` record events such as review requests and approvals.
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

Write to a PR or MR with `scripts/forge/forge`. It works the same on both forges and reads the forge, host, and repository from the origin remote, like the watcher. Both scripts live in this skill's directory, not in the repository you are working on, and are not on `PATH`. Run them by absolute path from inside the checkout. Pass `--forge gitlab --hostname <host>` when origin points elsewhere, and `--owner` and `--repo` to act on another repository. Each command prints one JSON line, or exits 1 with the reason on stderr.

| Action | Command (both forges) |
|---|---|
| Post one review: summary plus line threads | `scripts/forge/forge --pr <n> review --summary-file <summary.md> --comments <comments.json>` |
| Post a summary with no line threads | `scripts/forge/forge --pr <n> review --summary-file <summary.md>` |
| Reply in a thread | `scripts/forge/forge --pr <n> reply --thread <id> --body-file <reply.md>` |
| Resolve a thread | `scripts/forge/forge --pr <n> resolve --thread <id>` |
| List open threads | `scripts/watch-pr/watch-pr --status-only` |

The thread `<id>` is the `id` the watcher prints: a GraphQL node id on GitHub, a discussion id on GitLab. `comments.json` lists one object per finding:

```json
[
  { "path": "src/a.ts", "line": 42, "body": "<finding>" },
  { "path": "src/b.ts", "line": 7, "side": "old", "body": "<finding on a removed line>" }
]
```

`line` is the line number in the new file. Set `"side": "old"` to comment on a removed line by its number in the old file. The review is posted as a comment, never an approval, and the author gets one notification.

On GitLab the command saves each finding as a draft note on the latest MR version, then publishes them all at once. It refuses in two cases and posts nothing:

- The line is not in the MR diff. GitLab can't hold a thread there. Move that finding into the summary.
- You already have unpublished drafts on the MR. Publishing would post them too. Submit or discard them in the GitLab UI, then run the command again.

## Your last review

The last head you reviewed is the SHA to diff from and the reason to skip a PR whose head hasn't moved:

```sh
scripts/forge/forge --pr <n> last-review
```

It prints `{"forge", "pr", "commit"}`, with `commit` set to `null` when you haven't reviewed. On GitHub it is the commit your latest review was made on, approvals included. On GitLab a note doesn't record the head it saw, so it is the head of the MR version that was current at your latest note. Approving adds a note in your name, so approvals count. Compare it with the watcher's `headRefOid`.

## Labels

The label scheme is in the **git-best-practices** skill. GitHub uses `P1`, `type:bug`, and `area:router`. GitLab uses scoped labels: `priority::1`, `type::bug`, and `area::router`.

| Action | GitHub | GitLab |
|---|---|---|
| Create an issue | `gh issue create --title <title> --body-file <body.md> --label P1,type:bug` | `glab issue create --title <title> --description-file <body.md> --label "priority::1,type::bug" --yes` |
| Label a PR or MR | `gh pr edit <pr> --add-label P1` | `glab mr update <mr> --label "priority::1"` |
| Remove a label | `gh pr edit <pr> --remove-label P1` | `glab mr update <mr> --unlabel "priority::1"` |

A scoped label replaces any other label with the same `priority::` prefix. Scoped labels need GitLab Premium. On the Free tier, both labels stay, so remove the old one with `--unlabel`.
