# Motion

Motion explains a change, confirms an action, or guides attention. It is never decoration. The numbers below come from the Motion docs, Emil Kowalski's animation guidance, and Apple's Human Interface Guidelines, and they suit any calm product style. If the repository's design source sets its own easing or durations, use those.

## Principles

1. **Purpose first:** animate to show where something came from, confirm an action, or connect states. Frequency matters: things seen 100×/day get little or no motion.
2. **Fast:** most UI motion takes 150–300ms.
3. **Ease-out for entering and reacting.** Ease-in-out for things moving on screen. Never ease-in on enter, because it feels laggy.
4. **Springs for anything gesture-driven or interruptible.** They carry velocity and retarget smoothly.
5. **Interruptible:** prefer CSS transitions (which retarget) or Motion over CSS keyframes for state changes.
6. **Only `transform` and `opacity`** (plus `filter: blur` sparingly). They stay on the compositor.
7. **Respect reduced motion** (see [Reduced motion](#reduced-motion)).

## Easing tokens

| Token | Value | Use |
|---|---|---|
| `--ease-out` | `cubic-bezier(0.23, 1, 0.32, 1)` | default for enter, hover, press, popovers |
| `--ease-in-out` | `cubic-bezier(0.77, 0, 0.175, 1)` | elements moving or morphing on screen |
| `--ease-drawer` | `cubic-bezier(0.32, 0.72, 0, 1)` | sheets, drawers (iOS-like) |
| `--ease-standard` | `cubic-bezier(0.2, 0, 0, 1)` | general purpose, Material-style |
| `ease` (CSS) | `cubic-bezier(0.25, 0.1, 0.25, 1)` | slower, elegant toasts (Sonner uses `ease`) |
| exit | `ease-in` or `cubic-bezier(0.4, 0, 1, 1)` | short exits only |

Motion equivalents: pass arrays, e.g. `ease: [0.23, 1, 0.32, 1]`. Named Motion easings: `"easeOut"`, `"easeInOut"`, `"circOut"`, `"backOut"`, `"anticipate"`.

## Duration scale

| Token | ms | Examples |
|---|---|---|
| instant | 100 | color/background hover, checkbox tick |
| fast | 150 | button press, tooltip, focus ring, exits |
| base | 200 | popover/dropdown enter, tab switch, toggle |
| moderate | 250–300 | modal enter, accordion, layout shifts |
| slow | 350–500 | sheets/drawers, page transitions, hero reveals |
| showcase | 600–1200 | marketing hero choreography, illustration loops (Rive/Lottie) |

Motion's tween default is `duration: 0.3` (0.8 with multiple keyframes). Exit ≈ 60–75% of enter. Larger distance gets slightly longer, but cap it.

## Spring presets

Motion supports **duration-based springs** (`visualDuration` + `bounce`, easy to reason about and coordinate with tweens) and **physics springs** (`stiffness`/`damping`/`mass`, which use gesture velocity). Motion's default `bounce` is `0.25`, and `0` means critically damped, no overshoot. If stiffness, damping, or mass are set, they override bounce/duration.

```ts
export const spring = {
  snappy:  { type: "spring", visualDuration: 0.2,  bounce: 0 },     // press, toggles, popovers
  smooth:  { type: "spring", visualDuration: 0.3,  bounce: 0.1 },   // modals, layout, tabs
  gentle:  { type: "spring", visualDuration: 0.45, bounce: 0.15 },  // toasts, cards entering
  bouncy:  { type: "spring", visualDuration: 0.4,  bounce: 0.3 },   // playful success, likes (sparingly)
  sheet:   { type: "spring", stiffness: 400, damping: 40, mass: 1 },// drag-release sheets
  layout:  { type: "spring", stiffness: 500, damping: 40 },         // layoutId pills/indicators
} as const;
```
Keep bounce ≤ 0.15 for productivity UI. Save visible overshoot for celebratory moments. Apple's guidance matches this: SwiftUI's `.smooth` spring has no bounce, `.snappy` has a small bounce, and `.bouncy` has more, all with a default duration of around 0.5s. Use bounce to signal playfulness, not as a default.

**CSS springs without JS:** Motion can generate a duration-based spring as a CSS `linear()` easing (`import { spring } from "motion"`, then `transition: transform ${spring(0.3, 0.1)}`), or use a pre-baked `linear(...)` string. Svelte has `svelte/motion` (`Spring`, `Tween`) for values and `svelte/transition` for enter and exit.

## Enter and exit patterns

| Element | Enter | Exit |
|---|---|---|
| Page section | `opacity 0→1, y 12→0, (blur 4px→0)` 400ms ease-out | n/a |
| List item | `opacity 0, y 6` → rest, spring.smooth | `opacity 0, scale .98`, 150ms |
| Popover / menu | `opacity 0, scale .96, y -4` → rest, 200ms from trigger origin | `opacity 0, scale .98` 120ms |
| Modal | overlay fade 200ms. Panel `scale .96, y 8` → rest, spring.smooth | 150ms ease-in |
| Toast | `y 16, scale .96` → rest, spring.gentle | `opacity 0, y 8` 150ms |
| Tooltip | delay 400–600ms first time, then instant for neighbors. `opacity, scale .97` 120ms | 80ms |
| Sheet | `y 100%→0` 450ms `--ease-drawer` | 300ms same curve |
| Number change | per-digit roll: `y ±100%` with mask, 250ms | n/a |

Scale popovers from **0.95–0.97, never from 0**, at the trigger's origin. Modals scale from center. Don't animate anything opened by a keyboard shortcut, such as a command palette, or keep it under 120ms opacity only.

Text swaps (labels, button states): `AnimatePresence mode="popLayout"` with `initial {opacity:0, y:6, filter:"blur(2px)"}` → `{opacity:1, y:0, filter:"blur(0)"}` → exit `{opacity:0, y:-6, filter:"blur(2px)"}`, about 200ms.

## Layout animations

- `layout` prop on elements whose size or position changes (accordion containers, reflowing grids, expanding cards). `layoutId` for shared elements (active pills, tab underlines, card → detail morphs).
- Wrap related siblings in `<LayoutGroup>`. Use `layout="position"` for text to avoid squash. Put `layout` on child text too so it scale-corrects.
- Height auto: animate `height: 0 → "auto"` with Motion, or use CSS `interpolate-size: allow-keywords` / `grid-template-rows: 0fr → 1fr` trick.
- If the main thread will be busy (route change), consider a CSS transition instead of JS layout animation. Emil notes Vercel's tab indicator dropped frames with shared layout animation during navigation.

## Gestures

- `whileHover` (guarded: only on `(hover: hover)` devices), `whileTap={{ scale: 0.97 }}`, `whileFocus`.
- Drag: `drag="y"`, `dragConstraints`, `dragElastic={0.2}`. On release, dismiss if `offset.y > 120 || velocity.y > 500`, otherwise spring back with spring.sheet.
- Swipe actions on list rows: reveal under the row, snap points via `dragTransition.modifyTarget`.
- Momentum: Motion inertia defaults `power: 0.8, timeConstant: 700`. Lower timeConstant (~200–300) feels tighter.
- Press feedback must start on pointer-down, not click.

## Scroll effects

- Reveal on view: `whileInView={{ opacity: 1, y: 0 }}` from `{opacity: 0, y: 16}`, `viewport={{ once: true, amount: 0.3 }}`, 500ms ease-out, stagger children 0.06s. Use it once, not every time the element scrolls past.
- Parallax: subtle only (`useScroll` + `useTransform`, max ±40px). Never parallax body text.
- Sticky header: background goes from transparent to `bg/80 + backdrop-blur(12px)` and a hairline shadow after 8px of scroll.
- Native CSS: `animation-timeline: view()` / `scroll()` for progress bars and reveals where supported, with a static fallback.
- Hero illustration loops (Rive/Lottie) should pause offscreen (IntersectionObserver) and when `prefers-reduced-motion`.

## Stagger

`delayChildren: stagger(0.04–0.06)` for lists of 3–10 items. Cap total stagger at ~300ms (only stagger the first ~8, then show the rest together). Grids: `stagger(0.05, { grid: [cols, rows], from: "center" })`. Don't stagger on data refresh, only on first reveal.

## Reduced motion

```tsx
<MotionConfig reducedMotion="user">{children}</MotionConfig>
```
With `reducedMotion="user"`, Motion turns off transform and layout animations while keeping opacity and color. For custom logic use `useReducedMotion()` and swap `x: "-100%"` for `x: 0` (fade only). In Svelte and Tailwind, put transforms behind the `motion-safe:` variant.

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important;
    transition-duration: .01ms !important; scroll-behavior: auto !important; }
  .fade-ok { transition: opacity 150ms linear !important; } /* keep gentle fades */
}
```
Let people turn motion off. Avoid large-scale zoom, spin, and parallax for them, and never use motion as the only way to convey information.

## Performance

- Animate `transform` and `opacity` only. Avoid width/height/top/left/margin/box-shadow in loops (fade a pseudo-element's opacity to animate a shadow).
- Add `will-change: transform` **only** while animating or on elements that animate constantly. Remove it afterwards, because too many layers waste memory.
- Prefer CSS/WAAPI for simple, always-on animations, since they stay hardware-accelerated when the main thread is busy. Motion uses WAAPI for opacity/transform where it can.
- `backdrop-filter` and large `filter: blur` are expensive. Use them on small areas and few at once.
- Test at 4× CPU throttle. Aim for 60fps (120 on ProMotion), no layout shift (CLS 0) from animations.

## Recipes

The look in these recipes (white pill, grey labels) is a placeholder. Take colors, radius, and shadow from the active style.

### Press

Buttons scale to 0.97 at pointer-down and spring back. Large cards and CTAs use 0.98.

React with Motion:

```tsx
<motion.button whileTap={{ scale: 0.97 }} transition={{ type: "spring", visualDuration: 0.15, bounce: 0 }} />
```

Svelte 5 with Tailwind. `:active` starts on pointer-down, and the transition springs it back:

```svelte
<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements';

  let { children, class: className, ...rest }: HTMLButtonAttributes = $props();
</script>

<button
  class={[
    'inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium select-none',
    'motion-safe:transition-transform motion-safe:duration-150 motion-safe:ease-(--ease-out) motion-safe:active:scale-[.97]',
    className,
  ]}
  {...rest}
>
  {@render children?.()}
</button>
```

### Sliding indicator

One shared pill slides between nav items, tabs, or segments. Never fade one pill out while another fades in.

React with Motion. The shared `layoutId` moves the pill:

```tsx
function Nav({ items, active, onSelect }) {
  return (
    <nav className="flex flex-col gap-0.5">
      {items.map((it) => (
        <button key={it.id} onClick={() => onSelect(it.id)} aria-current={active === it.id ? "page" : undefined}
          className="relative flex h-8 items-center gap-2 rounded-lg px-2.5 text-[14px] text-[#737373] hover:text-[#171717]">
          {active === it.id && (
            <motion.span layoutId="nav-pill"
              className="absolute inset-0 rounded-lg bg-white shadow-[var(--shadow-btn)]"
              transition={{ type: "spring", visualDuration: 0.25, bounce: 0.15 }} />
          )}
          <it.icon className="relative size-4" strokeWidth={1.5} />
          <span className={cn("relative", active === it.id && "text-[#171717]")}>{it.label}</span>
        </button>
      ))}
    </nav>
  );
}
```

Svelte 5 with Tailwind. Measure the active item and move one absolutely positioned pill with `transform`. The first measurement skips the transition so the pill doesn't fly in from the top:

```svelte
<script lang="ts">
  type NavItem = { id: string; label: string };

  let { items, active = $bindable() }: { items: NavItem[]; active: string } = $props();

  const buttons: Record<string, HTMLButtonElement> = $state({});
  let pill = $state({ y: 0, height: 0 });
  let placed = $state(false);

  $effect(() => {
    const button = buttons[active];
    pill = { y: button.offsetTop, height: button.offsetHeight };
    requestAnimationFrame(() => (placed = true));
  });
</script>

<nav class="relative flex flex-col gap-0.5">
  <span
    aria-hidden="true"
    class={[
      'absolute inset-x-0 top-0 rounded-lg bg-white shadow-(--shadow-btn)',
      placed && 'motion-safe:transition-transform motion-safe:duration-250 motion-safe:ease-(--ease-out)',
    ]}
    style:transform="translateY({pill.y}px)"
    style:height="{pill.height}px"
  ></span>
  {#each items as item (item.id)}
    <button
      bind:this={buttons[item.id]}
      aria-current={active === item.id ? 'page' : undefined}
      onclick={() => (active = item.id)}
      class="relative flex h-8 items-center gap-2 rounded-lg px-2.5 text-sm text-neutral-500 hover:text-neutral-900 aria-[current=page]:text-neutral-900"
    >
      {item.label}
    </button>
  {/each}
</nav>
```

The same pattern makes a segmented control: lay the items out in a row and move the pill with `translateX` and `width` from `offsetLeft` and `offsetWidth`.
