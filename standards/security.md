# Security and privacy

## Secrets

- Never commit secrets, `.env` files, private keys, tokens, real usage ledgers, or customer data. `.gitignore` and `.dockerignore` both exclude `.env`.
- Production secrets live in the homelab repository, SOPS-encrypted, and reach pods as Kubernetes Secrets. Application repositories reference them by name only.
- Development defaults (a dev `BETTER_AUTH_SECRET`, the `switchback:switchback` Postgres user) are allowed only when the app refuses to start with them in production.
- If you find a committed secret, stop and tell a human. Rotating it matters more than deleting the line.

## Input

- Parse external input with a schema at the boundary. Reject unknown shapes rather than guessing.
- Allow-list: hosts, file types, output formats, command arguments. A deny-list is a list of bugs you haven't found yet.
- Confine file paths to the workspace or work directory after resolving symlinks and `..`.
- Bound everything a stranger can make you spend: request size, output size, runtime, concurrency, queue length, storage, and requests per client.
- Never pass user input through a shell. Use argument arrays.
- Don't run tool calls or actions from a model response that was truncated (`max_tokens`) or refused.

## Output

- Public error responses are stable codes and friendly messages, never stack traces, command output, or internal paths.
- Logs at `info` and above never contain prompts, file contents, credentials, or personal data. Redact credentials in anything sent to a remote model.
- Set CSP. Bundle fonts and assets where the CSP is `self`-only.

## Privacy

- No third-party analytics, trackers, or ads on anything Harville Labs publishes.
- Store only what the feature needs. Write down what's stored and for how long, in user-facing docs, and enforce the retention in code.
- Memory-only state is preferred for anything ephemeral (jobs, rate limits).
- Telemetry is anonymous, documented, and honors `DO_NOT_TRACK`.

## Network isolation

- Services that process untrusted input get a NetworkPolicy with no egress unless they need it.
- Traffic that must not come from the homelab's address (third-party downloads) goes through a VPN sidecar with a firewall that blocks fallback, and the pod isn't ready until the tunnel is.
- Workers sit behind the shared Ingress with its rate limits; never expose a worker Service directly.

## Containers

Run as a non-root user with a fixed UID. Multi-stage builds; the runtime image carries only the build output and what it executes. Pin base image versions.

## Dependencies

Each runtime dependency is attack surface that ships to users. Prefer small, maintained, widely used packages; check the license is compatible; pin versions in the lockfile. Auth, crypto, and session handling always come from an established library (Better Auth), never home-grown.
