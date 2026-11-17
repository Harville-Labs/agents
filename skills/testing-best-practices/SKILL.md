---
name: testing-best-practices
description: What every change must test and how tests are written. Use when writing, reviewing, or fixing tests, or deciding what a change needs to prove.
---

# Testing best practices

Apply the **test-behavior-not-implementation** and **prove-it-works** principle skills first.

| Rule | Summary |
|------|---------|
| Bug fix | A focused failing-before test when there is a clear, cheap local path. Otherwise use the closest executable regression check and explain why a new test was impractical. |
| New behavior | The normal path plus each documented edge and error case. |
| Pure decision logic | Exhaustive unit tests, including which rule wins when several apply. |
| Protocol or API change | A round trip through the real server and client. |
| Schema change | A test against real Postgres that uses the new column or table. |
| Generated artifact | A test that fails when the committed copy is stale. |
| Hermetic | No network, real model APIs, home directory, or wall clock in unit tests. Inject `fetch`, clients, clocks, and file roots. |
| Real databases | Postgres in Docker, never a mock or SQLite. Skip with a clear message when `TEST_DATABASE_URL` is unset. |
| Live tests apart | Real models and services run behind an explicit flag, print what they spent, and run nightly, not on every PR. |
| Colocated, named for behavior | `foo.test.ts` beside `foo.ts`. A failing test's name says what broke. |
| Anchored to behavior | Every test meets the standard below. Rewrite or delete one that doesn't. |
| Outcomes, not calls | Assert on results, not how often an internal function ran. |
| No sleeps | Wait on a condition or inject the clock. Fix or delete a flaky test the day it flakes. |
| Full check before done | Run the repository's whole check command and paste it into the PR's **How it was tested**. |

## Every test guards behavior

Keep a test only when it depends on intended behavior. It changes only when that behavior changes, and fails only when that behavior regresses. A test that depends on any of these guards nothing:

- **The past.** It guards code that no longer exists. It asserts a removed feature is gone, or that a moved module is absent from its old path. Removed code never changes, so the test can't catch a regression.
- **Nothing.** No change to the code can make it fail. It tests the browser or framework (a `<button>` renders, a click event fires), mocks the unit under test and asserts what the mock returns, or asserts what the type system already guarantees.
- **The implementation.** It changes whenever the code does, even when behavior didn't. Its expected value comes from the same logic as the code, so a wrong result still passes. Or it asserts private state, internal call order, or which helper was invoked.
- **A copy.** Another test already guards the same behavior.

A suite meets the standard when every test would fail on a regression and only on one, no two tests guard the same behavior, and no production code exists only for tests. When a change removes or moves code, delete the tests that guarded it in the same change. To clean up an existing suite, run the **go** skill's Pruning tests playbook.

Details: `references/guide.md`.
