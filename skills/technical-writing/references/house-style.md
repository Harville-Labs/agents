# Writing

Applies to docs, READMEs, comments, error messages, commit messages, PR descriptions, and product copy.

## Voice

- **Plain and direct.** Short sentences. Common words. Say "use", not "leverage"; "about", not "approximately".
- **Specific over general.** "Files are deleted after download or after ten minutes" beats "we take your privacy seriously."
- **No hype.** No "blazing fast", "seamless", "revolutionary", "powerful", or exclamation marks. Let the facts carry it.
- **Active voice, present tense.** "The router escalates", not "the request will be escalated by the router."
- **Second person for instructions.** "Run `bun run check`." Not "the user should run" or "we recommend running."
- **Contractions are fine.** "Don't", "it's", "won't" read naturally.
- **Honest limits.** State what something doesn't do as plainly as what it does.

## Structure

- Lead with what the reader came for: the command, the answer, the rule. Background goes after.
- Use headings a reader can scan, tables for options and comparisons, and code blocks for anything they'll type.
- Link to the source of truth instead of repeating it. One place documents each config key.
- Keep READMEs to: what it is, install, quick start, layout, development, license. Everything else goes in `docs/`.

## Code comments

Explain why: the constraint, the invariant, the bug it prevents, the ADR or issue behind it. A comment that restates the code gets deleted.

```ts
// Appending changes the cache prefix, so never reorder existing tools.
```

## Error messages

What went wrong, with the offending value, and how to fix it:

> `models.local references unknown provider "olama"`

> `DATABASE_URL must be a postgres:// URL. For local development, \`bun run db:up\` starts one.`

Errors shown to the public use friendly, stable messages mapped from error codes, and never leak internal output.

## Product copy

Copy describes what the thing does for the reader, in their words. Name products and companies exactly as they name themselves, and use the legal entity name only in legal text.
