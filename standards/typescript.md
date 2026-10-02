# TypeScript

Applies to every TypeScript codebase: Bun monorepos, SvelteKit apps, scripts.

## Toolchain

- **Runtime.** New projects use Bun (1.4+) with workspaces for monorepos, as Switchback does ([ADR 0002](https://github.com/Harville-Labs/switchback/blob/main/docs/adr/0002-bun-typescript-monorepo.md)). Existing Node projects stay on Node until someone records a reason to move. Don't switch a repository's package manager or runtime as a side effect of another change.
- **Lockfiles.** Commit the lockfile. Install with the frozen flag in CI and Docker (`bun install --frozen-lockfile`, `npm ci`).
- **Biome** formats and lints. Start from [templates/biome.json](../templates/biome.json): single quotes, 2-space indent, 100 columns, recommended rules, organize imports. Run the repository's `format` script instead of formatting by hand, and don't fight the formatter with ignore comments.
- **Type checking** is part of the check command (`tsc -p .`, or `svelte-check` for SvelteKit). A green build with type errors is not green.

## Compiler settings

`strict: true` always. Monorepos also enable `noUncheckedIndexedAccess`, `noImplicitOverride`, `noFallthroughCasesInSwitch`, `isolatedModules`, and `verbatimModuleSyntax`. Don't loosen a setting to make an error go away; fix the code.

## Style

- ESM only (`"type": "module"`). With `allowImportingTsExtensions`, import local files with explicit `.ts` extensions.
- `import type` for type-only imports (enforced by `verbatimModuleSyntax`).
- No `any`. Use `unknown` and narrow it, usually by parsing with a Zod schema. A cast (`as T`) needs a comment saying why it's safe.
- Prefer `type` aliases and discriminated unions for data; use `interface` for things that are implemented (`Provider`, `Database`).
- Model states as unions (`'queued' | 'running' | 'complete' | 'failed'`), not booleans that can contradict each other. Exhaust them in `switch` statements.
- Named exports. Default exports only where a framework requires them.
- Async functions take an `AbortSignal` when the work can be long or cancelled, and pass it down.
- Throw `Error` subclasses with specific messages (`ProviderError`, `SiteError`) when callers branch on the kind of failure. Attach `cause` when wrapping.

## Validation

Zod at every boundary: config files, environment, HTTP and JSON-RPC params, tool inputs, model output, anything read from disk. Derive the TypeScript type from the schema (`z.infer`) so they can't drift. If a JSON Schema is published for editors, generate it from the Zod schema and add a test that fails when the shipped copy is stale.

## Tests

`bun:test` in Bun projects, `node:test` with `--experimental-strip-types` in Node projects. Colocate tests as `*.test.ts` next to the code. See [testing.md](testing.md).
