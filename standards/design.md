# Visual design

harville.ai and the Switchback site console share one look: **night-shift drafting**. A charcoal sheet, off-white linework, and pale blue hatching taken from the slash in the logo. Drawing details (rules, labels, dimension marks) are accents, not decoration everywhere.

## Tokens

These names and values are the same in both apps. Change them in both, in the same week, or not at all.

| Token | Value | Use |
|---|---|---|
| `--paper` | `#16181b` | Page background |
| `--paper-light` | `#1e2125` | Raised surfaces |
| `--paper-dark` | `#292d32` | Pressed and inset surfaces |
| `--field` | `#121417` | Form fields |
| `--ink` | `#eceae3` | Text and linework |
| `--muted` | `#9a9c9f` | Secondary text and labels |
| `--hair` | `#34383d` | Hairline borders and rules |
| `--accent` | `#9cc3ff` | Links on hover, focus rings, selection, primary actions |
| `--on-accent` | `#101318` | Text on accent |
| `--bad` / `--good` | `#ff9c8f` / `#8fd6a4` | Errors and success (console) |

`color-scheme: dark`. There's no light theme.

## Type

- `--display`: **Archivo** (variable width and weight), falling back to Arial Narrow and Arial.
- `--mono`: **B612 Mono** for labels, data, commands, and anything that reads like an annotation on a drawing.

harville.ai loads fonts from Google Fonts. The site console bundles them through `@fontsource` so its CSP can stay `self`-only. New apps with a strict CSP bundle them.

## Components

Library components ([Sivir UI](https://www.sivir.dev) first; see [svelte.md](svelte.md#component-libraries)) are themed with these tokens. Reuse before you create. Both apps have `Monogram` and `CopyCommand`; harville.ai also has `PageHead`, `SectionHead`, `Facts`, `FeatureCards`, `Flow`, `TerminalScreen`, and others in `src/lib/components`. A new component should be something two pages need.

## Rules

- Focus is always visible: `2px solid var(--accent)` with a 3px offset.
- Underline links in body text; accent color on hover.
- Hairline (`1px var(--hair)`) rules separate sections. No drop shadows, gradients, or rounded "card" pills.
- Brand assets live in `static/media/` (`harville-labs-icon.png`, `-monogram`, `-wordmark`, `-social`). Don't redraw the logo.
