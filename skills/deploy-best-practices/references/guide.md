# Deployment

Harville Labs services run on the homelab Kubernetes cluster and are deployed with GitOps (Flux).

## Who owns what

| Repository | Owns |
|---|---|
| Application repo (`website`, `switchback`) | Source, `Dockerfile`, the image build workflow, and a Kustomize root at `deploy/k8s/` (Deployments, Services, NetworkPolicies, image pins) |
| `homelab` | Flux sources and Kustomizations that apply each app's `deploy/k8s`, namespaces, Ingress and TLS, Traefik middleware and rate limits, SOPS-encrypted Secrets, databases (CloudNativePG) and backups |

An application change never needs a homelab change unless it adds a Secret, a public route, a database, or a namespace. When it does, say so in the PR and describe the homelab change; don't invent manifests for things the homelab owns.

## The pipeline

1. A push to `main` runs the image workflow, which builds and pushes `ghcr.io/harville-labs/<image>:main` and `:sha-<commit>`.
2. The workflow rewrites `newTag` in `deploy/k8s/kustomization.yaml` (or `deploy/k8s/<app>/kustomization.yaml`) to `sha-<commit>` and commits it as the bot.
3. Flux sees the manifest change and rolls it out.

So:

- **Never edit `newTag` by hand.** The bot owns it. The workflow ignores pushes that change only that file, so a hand edit won't trigger a build either.
- **`main` deploys.** Anything merged ships within minutes. Run the full check first.
- **The Dockerfile runs the checks.** Build stages run tests, type checks, and lint before building, so a broken change can't produce an image.

## Images

- Multi-stage, minimal runtime (`node:22-alpine`, `alpine`), non-root user, `EXPOSE` the real port.
- Web apps serve on `3000`; workers on `8080`.
- Every service has a `/healthz` endpoint used for readiness and liveness.
- Configuration comes from environment variables documented in the repo's docs, with production-required values validated at startup.

## Manifests

- Plain Kustomize. Inspect with `kubectl kustomize deploy/k8s` before you push.
- Don't set `namespace` in app manifests; the homelab Kustomization sets it.
- Set resource requests and limits, a read-only root filesystem where possible, and size-limited `emptyDir` for scratch space.
- Any pod handling untrusted input gets a NetworkPolicy. Default to no egress.

## CI

GitHub Actions. Pin actions to a major version (`actions/checkout@v5`). Grant the workflow only the permissions it needs (`contents: write` and `packages: write` for image-and-pin workflows). Use `concurrency` so two deploys to `main` can't race.
