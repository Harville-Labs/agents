---
name: testing-best-practices
description: What every change must test and how tests are written. Use when writing, reviewing, or fixing tests, or deciding what a change needs to prove.
---

# Testing best practices

Apply the **test-behavior-not-implementation** and **prove-it-works** principle skills first.

| Rule | Summary |
|------|---------|
| Bug fix | A test that reproduces the bug and fails before the fix. |
| New behavior | The normal path plus each documented edge and error case. |
| Pure decision logic | Exhaustive unit tests, including which rule wins when several apply. |
| Protocol or API change | A round trip through the real server and client. |
| Schema change | A test against real Postgres that uses the new column or table. |
| Generated artifact | A test that fails when the committed copy is stale. |
| Hermetic | No network, real model APIs, home directory, or wall clock in unit tests. Inject `fetch`, clients, clocks, and file roots. |
| Real databases | Postgres in Docker, never a mock or SQLite. Skip with a clear message when `TEST_DATABASE_URL` is unset. |
| Live tests apart | Real models and services run behind an explicit flag, print what they spent, and run nightly, not on every PR. |
| Colocated, named for behavior | `foo.test.ts` beside `foo.ts`. A failing test's name says what broke. |
| Outcomes, not calls | Assert on results, not how often an internal function ran. |
| No sleeps | Wait on a condition or inject the clock. Fix or delete a flaky test the day it flakes. |
| Full check before done | Run the repository's whole check command and paste it into the PR's **How it was tested**. |

Details: `references/guide.md`.
