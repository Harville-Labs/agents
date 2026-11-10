# Rust

Applies to Rust workspaces and applications. The repository's `AGENTS.md` owns project-specific architecture, commands, and invariants; this guide covers practices shared across Rust repositories.

## Toolchain

- Pin the toolchain in `rust-toolchain.toml`, including `rustfmt` and `clippy`. Set `rust-version` in the workspace manifest to the minimum supported compiler. Keep CI on the pinned toolchain.
- Use Cargo for builds, tests, formatting, linting, and dependency management. Commit `Cargo.lock` for applications and workspace products; never edit it by hand.
- The check command runs `cargo fmt --all --check`, `cargo clippy --workspace --all-targets --locked -- -D warnings`, and `cargo test --workspace --locked`. Add project-specific checks to that command and CI.
- Put shared package metadata, dependency versions, and lints in `[workspace.*]` and inherit them in member crates. Keep crate dependencies explicit and one-way; avoid cycles.
- Prefer stable Rust. Use nightly features only when the repository records the reason and pins the required toolchain.

## Structure and ownership

- Split crates by responsibility and dependency boundary, not just by type. Keep domain rules in libraries; binaries should parse inputs, assemble dependencies, and report results.
- Keep files under the org-wide 500-line limit. Split large modules by responsibility; don't fragment a cohesive module just to reduce its line count.
- Give each rule one implementation. Before adding a helper or another validation path, search for the existing owner. When a second caller needs the same behavior, move it to a shared module and have both callers use it. Similar-looking code is not duplication when it represents different rules.
- Keep decision logic in small functions over typed inputs and return values. Put filesystem, network, process, clock, and environment access at clear boundaries so core behavior can be tested without those effects.
- Follow Rust module conventions and keep visibility narrow: private by default, `pub(crate)` within a crate, and public APIs only where another crate or downstream user needs them. Avoid prelude modules that obscure where an API comes from.

## Types, ownership, and errors

- Model valid states with types: enums for closed sets of alternatives, newtypes for identifiers or values with distinct rules, and `Option`/`Result` for absence and failure. Avoid parallel booleans or stringly typed state when a type can make invalid combinations unrepresentable.
- Borrow by default when the caller retains ownership. Take ownership when the function stores or transforms the value; use `&mut` only when mutation is part of the contract. Don't clone to silence the borrow checker until ownership requirements are understood.
- Prefer iterators and standard collection methods for straightforward transformations. Use explicit loops when they make control flow or error handling clearer. Choose ordered collections when iteration order affects output, persistence, diagnostics, or behavior.
- Return `Result` for expected failures and define specific error types with actionable context. Add context at boundaries where it helps the caller locate or fix the problem; preserve causes when wrapping errors.
- Reserve `panic!`, `expect`, and `unwrap` for tests, impossible states backed by a documented invariant, or startup failures that cannot be recovered from. Never use them to handle input or I/O errors.
- Use `?` to propagate errors. Don't discard errors or convert them to generic strings when callers need to distinguish conditions.
- Avoid `unsafe`. If a repository has an ADR permitting a specific use, keep the unsafe block minimal, document its safety invariants, and test the safe interface around it.

## Traits, generics, and dependencies

- Use traits when they express a real shared capability, enable a useful test seam, or define a public extension point. Don't introduce a trait for a single implementation just to make code look abstract.
- Prefer static dispatch and concrete types inside a crate. Use `dyn Trait` at boundaries that benefit from runtime substitution. Keep generic bounds as narrow as possible.
- Use standard library types first. Before adding a dependency, search for an existing workspace dependency and follow the org [dependency review](../../add-dependency/SKILL.md). Check maintenance, license, transitive cost, and whether the dependency is needed at runtime.
- Use established crates for parsing, serialization, CLI argument handling, and other edge-case-heavy tasks. Don't write a custom parser or protocol implementation without a documented reason.

## Async and I/O

- Add async only when the application has concurrent I/O to perform. Keep synchronous domain logic synchronous; don't make every function async by default.
- Use the runtime already selected by the repository. Don't mix runtimes or add a runtime to a library crate without a concrete need.
- Bound external work with timeouts, size limits, and cancellation where supported. Pass clients and other I/O dependencies into the code that uses them rather than constructing hidden globals.
- Read and validate environment configuration once at startup, then pass typed configuration inward. Don't read environment variables throughout the application.

## Serialization and determinism

- Treat persisted structs and enums as external formats. Validate at deserialization boundaries, reject unknown or invalid data when the format requires strictness, and provide explicit versioning and migrations for incompatible changes.
- Avoid using derived serialization as an accidental public contract. Pin field names, enum representations, defaults, and compatibility behavior deliberately.
- Don't let `HashMap` or `HashSet` iteration determine user-visible output, diagnostics, saved bytes, or simulation results. Sort keys or use ordered collections where order is observable.
- Keep runtime-only or presentation-only fields out of persisted models unless the format explicitly includes them.

## Tests and checks

- Put unit tests beside the code in `#[cfg(test)]` modules; use integration tests under `tests/` for public crate behavior and cross-crate flows. Follow the repository's existing layout.
- Test externally observable behavior and error cases, not private call counts. Name tests for the behavior they protect.
- Keep unit tests hermetic: inject clocks, filesystems, clients, and randomness. Don't call the network or use developer data in ordinary tests.
- For deterministic code, test stable ordering and repeatability. For serialization, test round trips and compatibility with representative older files where versioning applies.
- Run the full repository check command before reporting completion. Don't claim formatting, lint, or tests passed unless they ran.
