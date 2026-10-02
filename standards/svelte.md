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

## Accessibility

Every page, every time:

- Real elements: `<button>` for actions, `<a href>` for navigation, `<label>` for every input.
- Visible focus (`:focus-visible`), a skip link, and `aria-current="page"` on the active nav link.
- Status changes (job progress, form errors) announced in an `aria-live` region.
- Works at 320px wide and at 200% zoom. Respect `prefers-reduced-motion`.
- Images have `alt`; decorative ones have `alt=""`.

## Styling

Both Harville Labs web properties share one visual system. See [design.md](design.md).

- **Plain CSS** (harville.ai): tokens and shared pieces in `src/app.css`; anything used by one component lives in that component's `<style>` block.
- **Tailwind** (Switchback sites): utilities in markup, tokens and element styles in `src/app.css` inside Tailwind's layers so utilities still override them.

Don't mix the two approaches inside one app. Don't add a component library.

## Biome and Svelte

Biome can't see template usage, so Svelte files turn off `noUnusedImports` and `noUnusedVariables` (and, in Tailwind apps, `useConst` and `useImportType`). `svelte-check` covers what Biome can't.
