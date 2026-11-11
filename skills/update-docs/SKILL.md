---
name: update-docs
description: Find and update every doc a change affects - README, docs/, config reference, changelog, AGENTS.md, examples - in plain house style. Use whenever a change adds or alters behavior, config, CLI flags, env vars, routes, or APIs, or when asked to write or fix documentation.
---

# Update docs

Docs change in the same PR as the behavior. A new config key without a line in the config reference is an incomplete change.

## Find what's affected

Search for every place the changed thing is mentioned:

```sh
rg -n '<flag|key|route|env var|function name>' --glob '*.md' --glob '*.jsonc' .
```

Then check this list:

| You changed | Update |
|---|---|
| A config key | The config reference (`docs/configuration.md`), the generated schema (`bun run schema`), examples that use it |
| An env var | The table of variables in the relevant doc (`docs/sites.md`), and the deployment doc if production must set it |
| A CLI command or flag | README quick start if it's there, the client doc, `--help` text |
| A protocol method or event | `docs/protocol.md` |
| A routing rule | The rule table in `docs/routing.md` and the summary in README |
| A page or route | Navigation data, `static/sitemap.xml`, and any page that links to it |
| How to build, test, or deploy | README and the repository's `AGENTS.md` commands section |
| An invariant or architecture | `AGENTS.md`, `docs/architecture.md`, and an ADR |
| Anything user-visible | `CHANGELOG.md` under **Unreleased** |

## Write it

Follow the **technical-writing** skill's house style ([house-style.md](../technical-writing/references/house-style.md)):

- Lead with what the reader needs: the command, the key, the default.
- Specific, plain, no hype. State limits as plainly as features.
- Link to the one place that documents a thing instead of repeating it.
- Code blocks for anything someone types; tables for options.

## Check it

- Every link you added resolves (relative paths from the file's own directory).
- Every command you documented actually runs as written. Run it.
- Example config validates against the schema.
