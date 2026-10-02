---
name: add-service
description: Add a new deployable service (web app or worker) to a Harville Labs repository - Dockerfile, health endpoint, image workflow, deploy/k8s manifests, and the homelab handoff. Use when creating a new container image, a new Kubernetes Deployment, or wiring an app into GitOps.
---

# Add a deployable service

Read [standards/deploy.md](../../standards/deploy.md) first. The application repository owns the image and `deploy/k8s`; the homelab repository owns namespace, Ingress, Secrets, and databases.

## 1. The service

- Listens on `PORT` (web, default `3000`) or `LISTEN_ADDRESS` (worker, default `:8080`).
- Reads configuration in one place at startup, validates it, and refuses to start in production without required values.
- Serves `GET /healthz` returning 200 when it can serve traffic.
- Shuts down gracefully on `SIGTERM`.
- Logs to stdout/stderr, never prompts, files, or credentials at `info`+.

## 2. Dockerfile

- Multi-stage. The build stage installs with a frozen lockfile and **runs the tests, type check, and lint** before building, so a broken commit can't produce an image.
- Runtime stage: pinned minimal base (`node:22-alpine`, `alpine:<ver>`), non-root user with a fixed UID, only the build output copied in, `EXPOSE` the port.
- Name it `Dockerfile` for the repository's main service, `Dockerfile.<name>` or `apps/<name>/Dockerfile` for others. Update `.dockerignore`.

## 3. Image workflow

`.github/workflows/<name>-image.yml`, following the existing one in the repository:

- Trigger on push to `main` (with `paths` filters in a monorepo) and `workflow_dispatch`; `paths-ignore` the kustomization file the bot writes.
- `permissions: { contents: write, packages: write }` and a `concurrency` group without cancel-in-progress.
- Push `ghcr.io/harville-labs/<name>:main` and `:sha-${{ github.sha }}`.
- Rewrite `newTag` in the kustomization to `sha-<sha>`, commit as `github-actions[bot]`, `git pull --rebase`, push.

## 4. Manifests

In `deploy/k8s/` (or `deploy/k8s/<name>/` in a monorepo):

- `deployment.yaml`: resources, readiness and liveness on `/healthz`, `securityContext` (non-root, no privilege escalation, read-only root filesystem where possible), size-limited `emptyDir` for scratch.
- `service.yaml`: ClusterIP only.
- A NetworkPolicy if the pod handles untrusted input. Default to `egress: []`; ingress only from Traefik.
- `kustomization.yaml` listing the resources and an `images:` entry with `newTag`. A comment at the top says which homelab path applies it. No `namespace:`.
- Verify: `kubectl kustomize deploy/k8s`.

## 5. Homelab handoff

You can't finish this part from the application repository. In the PR, list what the homelab repository needs:

- Flux Kustomization pointing at `https://github.com/Harville-Labs/<repo>.git`, path `deploy/k8s[/<name>]`.
- Namespace, Ingress host and TLS, Traefik middleware (rate limits, real client IP).
- Secrets (SOPS-encrypted), by name and key, matching what the Deployment references.
- Database (CloudNativePG) and backups, if any.

## 6. Docs

README (or `docs/<name>.md`): what the service does, its env vars in a table, how to run it locally, and the deployment facts (Git source, path, namespace, host, image).
