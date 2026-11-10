---
name: go-best-practices
description: Go best practices for small sandboxed services. Use when reading or editing any .go file or go.mod.
paths: ["**/*.go", "**/go.mod"]
disable-model-invocation: true
---

# Go best practices

Apply the **type-system-discipline** principle skill first.

| Rule | Summary |
|------|---------|
| Matched toolchain | The Go version in `go.mod` matches the builder image. `gofmt`, `go vet`, and `go test ./...` run in the Docker build. |
| Static binary | `CGO_ENABLED=0 go build -trimpath -ldflags="-s -w"`. |
| `cmd` wires, `internal` works | `cmd/<binary>/main.go` reads the environment, wires dependencies, and handles signals. Nothing else reads the environment. Everything else lives under `internal/`, split by responsibility. |
| Pure validation | Input validation lives in its own package of pure functions, tested exhaustively. |
| Standard library first | A dependency needs a reason the standard library can't meet. |
| Sentinel errors | `var ErrX = errors.New(...)` for conditions callers branch on. Wrap with `%w` and check with `errors.Is`. |
| Deadlines everywhere | Every external call and subprocess takes a `context.Context` with a deadline. |
| No shell strings | `exec.CommandContext` with an argument slice. Allow-list every argument a user supplied. |
| Hardened servers | Set every `http.Server` timeout and `MaxHeaderBytes`. Shut down gracefully on `SIGTERM`. |
| Stable public errors | Clients get machine codes (`file_too_large`), never command output or stack traces. |
| Table-driven tests | `*_test.go` beside the code. Fake subprocesses and the clock through interfaces. |
| Small images | Build in `golang:*-alpine`, run in `alpine` or distroless as a non-root user with a fixed UID. |

Details: `references/guide.md`.
