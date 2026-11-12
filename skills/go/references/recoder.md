# Recoder

[Recoder](https://recoder.dev) reviews a change with several model reviewers, then tries to reproduce each reported bug by running code in a sandbox. The `recoder` command runs it from a shell. This file holds the commands the playbooks use. The **setup-recoder** skill installs and configures it.

Pass `-p` to every command, right after the command's name. With `-p` a command prints JSON whose fields change only with `schemaVersion`. Without it the output is laid out for a person and is not a contract. Never parse standard error. It is progress text.

## Is it ready

```sh
command -v recoder && recoder doctor -p
```

Recoder is ready when `doctor` exits 0. Exit 4 means a required check failed. Each check with `"ok": false` has a `fix` line for the person. A failed check with `"required": false` (usually `sandbox`) limits a review and does not stop it: no code runs, so every bug comes back `unverified`.

## Run a review

A review takes 5 to 40 minutes, longer than most shell tool limits. Start it in the background, then wait in steps below your shell limit.

| Step | Command |
|---|---|
| Start a PR or MR review | `recoder review -p --detach --pull <url>` |
| Start a review of a range in a checkout | `recoder review -p --detach --repo <dir> --base <sha> --head HEAD --title <title> --body-file <body.md>` |
| Wait | `recoder wait -p <run-id> --timeout 5`. Repeat while `state` is `running`. |
| Read the report | `recoder result -p <run-id> --format json` |
| Stop it | `recoder cancel -p <run-id>` |
| Find a lost run | `recoder runs -p --repo <dir>` |

Keep the `runId` from the one JSON line `--detach` prints. Exit 3 from `--detach` means the review did not start. Read `error` in that line. `wait` exits 0 both when the run ends and when the timeout passes, so read `state`. Always pass the whole run id. With none, a command reads the newest run, which may belong to another review.

`--pull` fetches the head into a throwaway checkout and takes the forge's title and body as the change's intent. It needs `gh` or `glab` signed in. Recoder never changes the working tree, index, or branches of the repository it reads.

Leave the model and the budget at their defaults unless the user names them. The default `--budget low` runs one reviewer. Pass `--budget medium` for a large or risky change. Never start two reviews of the same head at once. They cost the same and return the same findings.

## Reuse an earlier run

A run is stored with its report, so a diff Recoder already reviewed never needs a second run. Before you start one, list the finished runs with the commit range each one reviewed:

```sh
recoder runs -p --limit 50 \
  | jq -r '.[] | select(.state == "complete" and .reportFile != null) | "\(.runId) \(.reportFile)"' \
  | while read -r id file; do
      jq -r --arg id "$id" '"\($id) \(.target.headSha) \(.target.mergeBaseSha) \(.target.url)"' "$file"
    done
```

Each line is a run id, the head it reviewed, the commit its diff started at, and the PR URL for a `--pull` run. A run matches a whole-PR review when its head and URL match. It matches an incremental review when its head matches and its start is your last reviewed SHA. Read a match with `recoder result -p <run-id> --format json` and start nothing.

## Read the report

| Field | Use |
|---|---|
| `outcome` | Only `complete` is a result. `failed` and `cancelled` carry an `error`. Never treat them as a clean review. |
| `findings` | Findings Recoder stands behind, most severe first. |
| `coverageGaps` | Parts of the change it did not review. A review with gaps did not read everything. Say so, and never call the change clean. |
| `recommendedChecks` | Commands worth running before merge. |
| `settings.exec` | `false` means no code ran, so every bug is `unverified`. `settings.execReason` says why. |

Each finding has `file`, `severity` (`error`, `warning`, `info`), `message`, and usually `line`, `endLine`, `title`, and `suggestion`. `side` is `new` for an added or changed line and `old` for a removed one, with `new` the default. `verification.status` is `verified` when a command, a trace, a detector, or a repository rule proved the finding, and `unverified` when nothing did. `verification.reason` says which. `claim.trigger` and `claim.consequence` name the input and what goes wrong.

`unconfirmed` holds findings no verifier could settle or one refuted. `result` leaves them out unless you pass `--include-unconfirmed`. Read them only for a high-risk change.
