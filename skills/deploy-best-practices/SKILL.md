---
name: deploy-best-practices
description: Shipping services as container images to Kubernetes through GitOps. Use when reading or editing a Dockerfile, deploy/k8s manifests, or a CI workflow that builds or deploys.
paths: ["**/Dockerfile", "**/deploy/**", "**/.github/workflows/**", "**/.gitlab-ci.yml"]
---

# Deploy best practices

| Rule | Summary |
|------|---------|
| Split ownership | The application repository owns its source, Dockerfile, image workflow, and `deploy/k8s`. The infrastructure repository owns namespaces, Ingress, TLS, secrets, and databases. |
| Say when infrastructure changes | A new Secret, public route, database, or namespace needs an infrastructure change. Describe it in the PR; don't invent its manifests. |
| `main` deploys | A push to `main` builds `:sha-<commit>`, the bot pins it, and the GitOps controller rolls it out. Run the full check first. |
| Never hand-edit `newTag` | The bot owns it. |
| The Dockerfile checks | Build stages run tests, type checks, and lint, so a broken change can't produce an image. |
| Small images | Multi-stage, minimal runtime, non-root. Web apps on 3000, workers on 8080, `/healthz` on both. |
| Validated config | Environment variables documented in the repository, with production values validated at startup. |
| Plain Kustomize | Check with `kubectl kustomize deploy/k8s`. No `namespace` in app manifests. Requests, limits, a read-only root filesystem, and size-limited `emptyDir`. |
| NetworkPolicy for untrusted input | Default to no egress. |
| Tight CI | Actions pinned to a major version, least permissions, and `concurrency` so two deploys can't race. |

Details: `references/guide.md`. Adding a whole new service: the **add-service** skill.
