# Svelte and SvelteKit

## Svelte 5

- Runes only: `$props()`, `$state()`, `$derived()`, `$effect()`. No `export let`, no `$:` statements, no stores for component-local state.
- Type props inline in the `$props()` destructure, with defaults there too.
- Use `{@render children?.()}` and `Snippet` props, not slots.
- `$effect` is for syncing with the outside world (DOM APIs, timers, subscriptions). If you're computing a value, use `$derived`.
- `<script lang="ts">` in every component.

## SvelteKit

- `@sveltejs/adapter-node` for everything we deploy. The container serves `node build` on port 3000.
- Every service exposes `/healthz` for readiness and liveness probes.
- Server-only code lives under `src/lib/server/` so SvelteKit refuses to bundle it into the client.
- Mutations go through form actions or `+server.ts` endpoints. Put authorization checks in shared guards (see Switchback's `src/lib/server/guards.ts`), not repeated per page.
- `ORIGIN` must be set in production, or SvelteKit's cross-site form check breaks.

## Components

- **A piece of markup used twice is a component.** Put shared components in `src/lib/components/`, one component per file, and import them. Don't copy markup between pages.
- **Reuse before you create.** Read `src/lib/components/` before writing UI. Extend an existing component with a prop or snippet before making a near-copy of it.
- **Pages compose; components render.** A `+page.svelte` arranges components and passes them data. Logic that isn't about rendering (formatting, validation, fetching) lives in `.ts` modules under `src/lib/`, so it's shared and testable.
- **Keep components small.** Over about 200 lines usually means it's doing two jobs; split it. Hard limit: 500, as for every file ([code.md](code.md)).
- **Use a component library; don't hand-roll widgets.** Buttons, inputs, dialogs, menus, comboboxes, tooltips, date pickers, tabs, and chat or streaming UI come from a library. They have focus and keyboard rules that are easy to get wrong. See [Component libraries](#component-libraries).

## Accessibility

Every page, every time:

- Real elements: `<button>` for actions, `<a href>` for navigation, `<label>` for every input.
- Visible focus (`:focus-visible`), a skip link, and `aria-current="page"` on the active nav link.
- Status changes (job progress, form errors) announced in an `aria-live` region.
- Works at 320px wide and at 200% zoom. Respect `prefers-reduced-motion`.
- Images have `alt`; decorative ones have `alt=""`.

## Styling

Both Harville Labs web properties share one visual system. See [design.md](design.md).

**Every app uses Tailwind.** No plain-CSS stylesheets, and no component `<style>` blocks for anything a utility can do.

- Utilities go in the markup. Design tokens and base element styles go in `src/app.css`, inside Tailwind's layers, so utilities can still override them.
- Repeated combinations of utilities are a sign you need a component, not an `@apply` class.
- harville.ai still uses plain CSS. Move it to Tailwind in its own PR, not as part of another change.

## Component libraries

1. **[Sivir UI](https://www.sivir.dev) first.** It's our default for every Svelte app: install it with `bunx @sivir-ui/svelte init -y`, and set colors, fonts, radius, and motion in its theme from the tokens in [design.md](design.md). Theme it once; don't override component styles one by one.
2. **When Sivir doesn't have the component**, use a popular, well-maintained Svelte 5 library (shadcn-svelte or Bits UI, for example), themed with the same tokens. Check it with [skills/add-dependency](../skills/add-dependency/SKILL.md).
3. **Write your own component only** when no library has it, or when it's specific to our product. Build it from library primitives where you can.

Use one primary library per app, so components look and behave the same. Wrap a library component in your own only to fix its defaults for the whole app, not to restyle a single page.

## Biome and Svelte

Biome can't see template usage, so Svelte files turn off `noUnusedImports` and `noUnusedVariables` (and, in Tailwind apps, `useConst` and `useImportType`). `svelte-check` covers what Biome can't.
