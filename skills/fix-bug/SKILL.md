---
name: fix-bug
description: Reproduce-first bug fixing - write a failing test, find the root cause, fix it, and prove the fix. Use when asked to fix a bug, a crash, a regression, a failing test, or "why does X happen".
---

# Fix a bug

## 1. Reproduce

- Get the exact symptom: error text, input, config, version, platform. If the report is vague, check the issue, logs, and recent commits (`git log -p --since=<when it started> -- <path>`) before asking.
- Reproduce it locally with the smallest input you can. In Switchback, use `SWITCHBACK_HOME=$(mktemp -d)` and `--mock` or `ScriptedProvider` so you never touch real config or models.
- If you can't reproduce it, say so and say what you tried. Don't fix a guess.

## 2. Pin it with a test

Write a test that fails for the reason in the report, named for the correct behavior (`keeps reasoning_details when the stream ends early`). Run it and confirm it fails *for that reason*, not because of a typo in the test.

## 3. Find the root cause

- Trace from the symptom back to the first place the state was wrong. The line that throws is rarely the line that's wrong.
- `git blame` and `git log -S` the suspicious code: the commit that introduced it often explains the intent you need to preserve.
- Check whether the same mistake exists elsewhere (other providers, other routes, the other client). Fix every instance, or list the ones you left.

## 4. Fix

- Fix the cause, not the symptom. A `try/catch`, a null check, or a retry that hides the bad state is not a fix unless the bad state is genuinely expected, and then a comment says why.
- Keep the fix's diff small. Other problems you run into get fixed in their own commits, not mixed into this one.
- If the fix changes behavior someone could depend on, note it in the changelog.

## 5. Prove it

- The new test passes; it failed before.
- The full check command passes.
- If the bug was user-visible, reproduce the original steps once more by hand and confirm.

## 6. Report

Root cause in one or two sentences, the fix, the test that guards it, and any related spots you found. Commit as `fix(<scope>): <what now works>`.
