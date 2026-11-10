---
name: security-best-practices
description: Security and privacy rules for secrets, input, output, privacy, network isolation, containers, and dependencies. Use when handling secrets, external input, auth, logging, file paths, subprocesses, network access, or user data.
---

# Security best practices

Apply the **boundary-discipline** principle skill first.

| Rule | Summary |
|------|---------|
| No committed secrets | No secrets, `.env` files, keys, tokens, usage ledgers, or customer data in git. A found secret goes to a human; rotating it matters more than deleting the line. |
| Secrets live outside the app | Encrypted in the infrastructure repository or a secrets manager, referenced by name in app repositories. Dev defaults only when production refuses to start with them. |
| Schema at the boundary | Parse external input with a schema and reject unknown shapes. |
| Allow-list | Hosts, file types, formats, and arguments. Never a deny-list. |
| Confined paths | Resolve symlinks and `..`, then confine to the workspace or work directory. |
| Bound what strangers spend | Request and output size, runtime, concurrency, queue length, storage, and per-client rate. |
| No shells | Argument arrays only. |
| No truncated actions | Never run tool calls from a model response that hit `max_tokens` or was refused. |
| Quiet output | Public errors are stable codes, never stack traces or paths. No prompts, file contents, credentials, or personal data in logs at `info` and above. Set CSP. |
| Private by default | No third-party analytics, trackers, or ads. Store the minimum, document retention, enforce it in code, honor `DO_NOT_TRACK`. |
| Isolated networks | No egress for pods handling untrusted input unless needed. Workers sit behind the shared Ingress. |
| Hardened containers | Non-root with a fixed UID, multi-stage, pinned base images. |
| Established auth and crypto | Always from a maintained library, never home-grown. |

Details: `references/guide.md`.
