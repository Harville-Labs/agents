# Go

Go is for small, sandboxed services where a single static binary and a tiny image matter, like harville.ai's utility worker.

## Toolchain

- The Go version in `go.mod` matches the builder image (`golang:<version>-alpine`).
- `gofmt` and `go vet` are not optional. `go test ./...` runs in the Docker build, so a failing test fails the image.
- Build with `CGO_ENABLED=0 go build -trimpath -ldflags="-s -w"`.

## Structure

- `cmd/<binary>/main.go` reads configuration from the environment (with defaults), wires dependencies, and handles signals. Nothing else reads the environment.
- Everything else lives under `internal/`, split by responsibility (`app` for HTTP, `executor` for subprocesses, `safety` for input validation).
- Keep input validation in its own package of pure functions so it can be tested exhaustively.

## Style

- Standard library first. A dependency needs a reason the stdlib can't meet.
- Sentinel errors (`var ErrInvalidInput = errors.New(...)`) for conditions callers branch on; wrap with `fmt.Errorf("...: %w", err)` and check with `errors.Is`.
- Every external call and subprocess takes a `context.Context` with a deadline.
- Never build a shell command string. Call `exec.CommandContext` with an argument slice, and allow-list every argument that came from a user.
- Set every `http.Server` timeout (`ReadHeaderTimeout`, `ReadTimeout`, `WriteTimeout`, `IdleTimeout`) and `MaxHeaderBytes`. Shut down gracefully on `SIGTERM`.
- Public error responses are stable machine codes (`file_too_large`, `rate_limited`). Never return internal command output or stack traces to clients.

## Tests

Table-driven tests in `*_test.go` next to the code. Fake subprocesses and the clock through interfaces; don't shell out to real `ffmpeg` in unit tests.

## Images

Multi-stage: build in `golang:*-alpine`, run in `alpine` (or `distroless`) as a non-root user with a fixed UID, owning only its working directory.
