---
name: why
description: "Use for 'why does X work this way', 'why we picked Y', design rationale, regressions, postmortems, or data-backed thresholds. Returns a cited read on decisions and tradeoffs. Use how for runtime behavior."
disable-model-invocation: true
---

# Why

Answer from the record, not the code: read the commits and PR discussions that introduced the target and each later change, and other sources if the trail is thin. Cite what the authors wrote, mark your own inferences as inferences, and say what the record does not answer.

Start from `git blame -L <start>,<end> <file>`, `git log --follow -p -- <file>`, and `git log -1 --format=%B <commit>`. A GitHub merge commit names its PR as `(#1234)` in the subject. Read it with `gh pr view <n> --comments`. A GitLab merge commit names its MR as `!1234` in the body. Read it with `glab mr view <n> --comments`. When the history is long, read it in a subagent and keep only the cited findings in your context.
