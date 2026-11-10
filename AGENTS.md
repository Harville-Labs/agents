# Engineering standards

Rules for AI coding agents (Claude Code, OpenCode, Codex, and others) and the people reviewing their work, in every repository that adopts them. Each repository also has its own `AGENTS.md` with its commands, layout, and invariants. **A repository's file adds to these rules and can tighten them. It can't loosen them** unless an ADR in that repository says which rule it departs from and why. If you find a conflict with no ADR, follow these rules and point out the conflict.

Details for specific stacks and topics live in the `*-best-practices` skills, and reusable workflows in the other skills, all under [skills/](skills/). For any nontrivial task (a feature, a bug fix, a refactor, a PR), start with the [go](skills/go/SKILL.md) skill: it picks the playbook and runs it.

## How to work

1. **Read before you write.** Read the repository's `AGENTS.md`, then the code you're changing and its callers. Match what's there: naming, structure, error handling, comment density, test style. A change that looks like it was written by someone else is a worse change, even if it's correct.
2. **Do what was asked, and fix what you trip over.** Keep the feature to its stated scope: don't rename things, restructure neighbors, or add features nobody requested. But don't leave problems you run into behind, even ones that were there before you: a lint warning, a failing or flaky test, a bug, a broken doc link. Fix each in its own commit (`style: fix existing SwiftLint warnings`, `fix(sync): ...`) so it can be reviewed and reverted apart from your change, and list them in your report. If a fix is too big or risky to make in passing (a redesign, a data migration, a behavior users depend on), don't make it; say what you found and why you left it.
3. **Prove it works.** Run the repository's full check command before saying you're done, and fix what it reports. If you can't run something (no database, no model server, no network), say exactly what you didn't run.
4. **Report honestly.** Say what you changed, what you ran, and what you didn't verify. A failing test is reported as failing, with its output. Never describe a change as tested when it wasn't.
5. **Keep moving; stop only at the irreversible.** Commit, branch, push your own branches, open PRs, and answer review threads without asking: those are reversible and expected. Stop and ask before force-pushing a shared branch, deploying, deleting data, or sending a message to a customer. When a repository's `AGENTS.md` lists more stop points, honor them.

## Toolchains

These are the standard, not a default. A new project uses them. An existing project that doesn't yet is migrated in its own PR, never as a side effect of another change.

- **Web**: TypeScript only (no hand-written `.js`), built with Vite (SvelteKit for apps), formatted and linted with Biome, styled with Tailwind. No ESLint, Prettier, webpack, Create React App, or plain-CSS stylesheets and `<style>` blocks for things Tailwind can do. See the [typescript-best-practices](skills/typescript-best-practices/SKILL.md) skill.
- **Python**: uv for everything: Python versions, virtual environments, dependencies, lockfile, and running commands. Never `pip install`, `requirements.txt`, Poetry, Pipenv, or conda. Ruff formats and lints. See the [python-best-practices](skills/python-best-practices/SKILL.md) skill.
- **Go**: for small sandboxed services. See the [go-best-practices](skills/go-best-practices/SKILL.md) skill.
- **Rust**: native applications and libraries. See the [rust-best-practices](skills/rust-best-practices/SKILL.md) skill.

## Code

- **Files stay under 500 lines**, tests included. When a file would pass that, split it by responsibility before adding more. Generated files and lockfiles don't count. See the [code-best-practices](skills/code-best-practices/SKILL.md) skill.
- **One copy of each piece of logic.** Before writing a helper, search for an existing one. When you'd write the same logic a second time, extract it and make both places call it. Duplicated validation, formatting, and business rules drift apart and become bugs.
- **Comments explain why**: a constraint, an invariant, a tradeoff, a link to the issue or ADR that forced the choice. Don't narrate what the next line does. Doc comments on exported functions say what the caller needs to know, not how it's implemented.
- **Errors are specific and actionable.** Say what was wrong and how to fix it: `DATABASE_URL must be a postgres:// URL. For local development, \`bun run db:up\` starts one.` Never swallow an error without a comment saying why that's safe.
- **Validate at the boundary, trust inside it.** Config files, environment variables, request bodies, protocol messages, tool inputs, and model output get parsed with a schema (Zod in TypeScript, explicit parsing in Go) where they enter. Internal code takes the typed result and doesn't re-check it.
- **Read the environment in one place.** Configuration is loaded and validated at startup (or in one config module) and passed down. Don't scatter `process.env` or `os.Getenv` through the code.
- **Use libraries; don't hand-roll.** Use a well-maintained library over a home-grown version of parsers, protocol SDKs, crypto, auth, date handling, validation, accessible UI widgets (dialogs, menus, comboboxes), or anything with a long tail of edge cases. Every runtime dependency ships to users, so justify new ones in the PR. When you deliberately hand-roll something, write down why in the repository's `AGENTS.md`. See [skills/add-dependency](skills/add-dependency/SKILL.md).
- **Small, pure cores.** Keep decisions (routing, validation, pricing, layout math) as pure functions that take data and return data. Do I/O at the edges. Pure code is what you can test exhaustively.
- **Build UIs from components.** Use the repository's chosen component library before writing your own. A piece of markup used twice is a component. Reuse the repository's components before making new ones. See the [svelte-best-practices](skills/svelte-best-practices/SKILL.md) skill.
- **No dead code, no speculative abstraction.** Don't add options, interfaces, or layers for a caller that doesn't exist yet. Delete code you replace; git remembers it.
- **Generated files are generated.** Never hand-edit lockfiles, migrations, generated schemas, or CI-written deploy pins. Change the source and rerun the generator.

Stack-specific rules: [TypeScript](skills/typescript-best-practices/SKILL.md), [Svelte and SvelteKit](skills/svelte-best-practices/SKILL.md), [Python](skills/python-best-practices/SKILL.md), [Go](skills/go-best-practices/SKILL.md), [Rust](skills/rust-best-practices/SKILL.md).

## Tests

- Every behavior change comes with a test that fails without it. Bug fixes start with a test that reproduces the bug.
- Unit tests never touch the network, real model APIs, or the developer's real config and data. Inject `fetch`, clients, clocks, and filesystems.
- Databases are tested against the real engine (Postgres in Docker), not mocks or SQLite stand-ins.
- Test names state the behavior: `center crop removes equal overflow from both sides`, not `test resize 2`.

More in the [testing-best-practices](skills/testing-best-practices/SKILL.md) skill.

## Security and privacy

Build local-first, private-by-default software. Hold every change to that.

- Never commit secrets, `.env` files, credentials, real usage data, or customer data. Deployment secrets live in a secret store or the infrastructure repository, never in application repositories.
- Don't log prompts, file contents, personal data, or credentials at `info` level or above.
- No third-party trackers, analytics, or ad scripts on anything we publish.
- Collect the minimum data the feature needs, say plainly what is kept and for how long, and delete it on schedule.
- Treat all external input as hostile: confine file paths, bound sizes and runtimes, and allow-list rather than deny-list.

More in the [security-best-practices](skills/security-best-practices/SKILL.md) skill.

## Git and pull requests

- Work from a GitHub issue when one exists. Branch as `<type>/<issue>-<slug>`, for example `fix/31-ollama-timeout`.
- [Conventional Commits](https://www.conventionalcommits.org): `feat(router): add latency budget rule`. The scope is the package, app, or area. Imperative mood, no trailing period.
- One logical change per PR. Link the issue (`Closes #31`) and fill in **How it was tested** with commands you actually ran.
- Docs, changelog, and config reference change in the same PR as the behavior they describe.
- Squash-merge. The squash title becomes the changelog entry, so make it read well.
- `main` is always deployable. In repositories that deploy on every push to `main`, that's literal.

More in the [git-best-practices](skills/git-best-practices/SKILL.md) skill. The [go](skills/go/SKILL.md) skill's Opening a PR and Shipping playbooks walk through the whole loop.

## Decisions

Record decisions a future contributor would otherwise question, and any change to an invariant in a repository's `AGENTS.md`, as an ADR in `docs/adr/`. Accepted ADRs are never edited, only superseded. See [skills/write-adr](skills/write-adr/SKILL.md).

## Writing

Docs, comments, error messages, commit messages, and product copy follow the [technical-writing](skills/technical-writing/SKILL.md) skill's house style: plain words, short sentences, the specific claim instead of the general one, and no hype.

## Deployment

Services ship as container images. Application repositories own their image and their deploy manifests; the infrastructure repository owns shared resources such as namespaces, ingress, secrets, and databases. See the [deploy-best-practices](skills/deploy-best-practices/SKILL.md) skill.
