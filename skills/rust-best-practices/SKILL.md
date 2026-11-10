---
name: rust-best-practices
description: Rust best practices. Use when reading or editing any .rs file or Cargo.toml.
paths: ["**/*.rs", "**/Cargo.toml"]
disable-model-invocation: true
---

# Rust best practices

Apply the **type-system-discipline** principle skill first.

| Rule | Summary |
|------|---------|
| Pinned toolchain | `rust-toolchain.toml` pins the compiler, `rustfmt`, and `clippy`. The workspace sets `rust-version`. Nightly only with a recorded reason. |
| One check command | `cargo fmt --all --check`, `cargo clippy --workspace --all-targets --locked -- -D warnings`, `cargo test --workspace --locked`. |
| Workspace inheritance | Shared metadata, dependency versions, and lints live in `[workspace.*]`. Crate dependencies are explicit and one-way. |
| Thin binaries | Domain rules live in libraries. Binaries parse input, assemble dependencies, and report results. I/O stays at clear boundaries. |
| Narrow visibility | Private by default, `pub(crate)` inside a crate, `pub` only for real consumers. No prelude modules. |
| Types model states | Enums for closed sets, newtypes for distinct values, `Option` and `Result` for absence and failure. No parallel booleans or stringly typed state. |
| Borrow by default | Take ownership only to store or transform. Don't clone to quiet the borrow checker. |
| Specific errors | Return `Result` with specific error types and actionable context. Propagate with `?`. Preserve causes. |
| No panics on input | `unwrap`, `expect`, and `panic!` only in tests, documented impossible states, or unrecoverable startup. |
| No `unsafe` | Only with an ADR. Keep the block minimal, document its invariants, and test the safe interface. |
| Earned abstraction | A trait needs a real shared capability, a test seam, or an extension point. Prefer static dispatch inside a crate. |
| Async only for I/O | Use the repository's runtime. Bound external work with timeouts and size limits. |
| Deterministic output | Persisted types are external formats with deliberate versioning. Never let `HashMap` order reach output or saved bytes. |
| Hermetic tests | Unit tests in `#[cfg(test)]` beside the code, integration tests in `tests/`. Inject clocks, filesystems, clients, and randomness. |

Details: `references/guide.md`.
