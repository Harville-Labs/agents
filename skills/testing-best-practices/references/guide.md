# Testing

## What every change needs

| Change | Test |
|---|---|
| Bug fix | A test that reproduces the bug and fails before the fix |
| New behavior | Tests for the normal path and each documented edge or error case |
| Pure decision logic (routing, validation, math) | Exhaustive unit tests, including which rule wins when several apply |
| Protocol or API change | A round-trip test through the real server and client |
| Database schema change | A test against real Postgres that exercises the new column or table |
| Generated artifact (JSON Schema, auth schema) | A test that fails when the committed copy is stale |

## Rules

- **Hermetic by default.** Unit tests don't use the network, real model APIs, the user's home directory, or wall-clock time. Inject `fetch`, SDK clients, clocks, and file roots. Point the app's home or config directory at a temporary one.
- **Real databases.** Test against Postgres in Docker (`compose.yaml` with a separate test database), never a mock or SQLite. Tests that need it skip with a clear message when `TEST_DATABASE_URL` is unset, and wipe the database before each test, so never point them at real data.
- **Real protocols where cheap.** Auth flows run against a real OIDC server (`oauth2-mock-server`), not stubs of our own code.
- **Live tests are separate.** Anything that calls a real model or third-party service lives in its own directory, runs behind an explicit flag or env var (`LIVE_TESTS=1`), prints what it spent, and runs nightly in CI, not on every PR.
- **Colocated.** `foo.test.ts` next to `foo.ts`; `foo_test.go` next to `foo.go`.
- **Names describe behavior.** A failing test's name should tell you what broke.
- **Assert on outcomes**, not on how many times an internal function was called.
- **No sleeps.** Wait on a condition or inject the clock. Flaky tests get fixed or deleted the day they flake, not retried.

## Before you say you're done

Run the repository's full check command (`bun run check`, or the list in its `AGENTS.md`), not just the test file you touched. Paste the commands you ran into the PR's **How it was tested** section.
