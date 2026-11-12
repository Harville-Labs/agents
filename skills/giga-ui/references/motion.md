# Motion and micro-interactions

## 5. Motion system [expert unless marked]

His captions show motion matters a lot ("idea → design → animation", "bento animations… 5hrs", "every website needs this level of animation", "micro-interactions throughout"), but they don't publish curve values. Everything numeric below comes from Motion docs, Emil Kowalski, and Apple HIG, tuned to fit his calm, precise style.

### 5.1 Principles
1. **Purpose first:** animate to show where something came from, confirm an action, or connect states. Frequency matters: things seen 100×/day get little or no motion.
2. **Fast:** most UI motion takes 150–300ms. Emil: "Your animations should also usually be shorter than 300ms."
3. **Ease-out for entering and reacting.** Ease-in-out for things moving on screen. Never ease-in on enter, because it feels laggy.
4. **Springs for anything gesture-driven or interruptible.** They carry velocity and retarget smoothly.
5. **Interruptible:** prefer CSS transitions (which retarget) or Motion over CSS keyframes for state changes.
6. **Only `transform` and `opacity`** (plus `filter: blur` sparingly). They stay on the compositor.
7. **Respect reduced motion** (see 5.10).

### 5.2 Easing tokens
| Token | Value | Use |
|---|---|---|
| `--ease-out` | `cubic-bezier(0.23, 1, 0.32, 1)` | default for enter, hover, press, popovers |
| `--ease-in-out` | `cubic-bezier(0.77, 0, 0.175, 1)` | elements moving or morphing on screen |
| `--ease-drawer` | `cubic-bezier(0.32, 0.72, 0, 1)` | sheets, drawers (iOS-like) |
| `--ease-standard` | `cubic-bezier(0.2, 0, 0, 1)` | general purpose, Material-style |
| `ease` (CSS) | `cubic-bezier(0.25, 0.1, 0.25, 1)` | slower, elegant toasts (Sonner uses `ease`) |
| exit | `ease-in` or `cubic-bezier(0.4, 0, 1, 1)` | short exits only |

Motion equivalents: pass arrays, e.g. `ease: [0.23, 1, 0.32, 1]`. Named Motion easings: `"easeOut"`, `"easeInOut"`, `"circOut"`, `"backOut"`, `"anticipate"`.

### 5.3 Duration scale
| Token | ms | Examples |
|---|---|---|
| instant | 100 | color/background hover, checkbox tick |
| fast | 150 | button press, tooltip, focus ring, exits |
| base | 200 | popover/dropdown enter, tab switch, toggle |
| moderate | 250–300 | modal enter, accordion, layout shifts |
| slow | 350–500 | sheets/drawers, page transitions, hero reveals |
| showcase | 600–1200 | marketing hero choreography, illustration loops (Rive/Lottie) |

Motion's tween default is `duration: 0.3` (0.8 with multiple keyframes) [Motion docs]. Exit ≈ 60–75% of enter. Larger distance gets slightly longer, but cap it.

### 5.4 Spring presets (Motion `transition`)
Motion supports **duration-based springs** (`visualDuration` + `bounce`, easy to reason about and coordinate with tweens) and **physics springs** (`stiffness`/`damping`/`mass`, which use gesture velocity). Motion's default `bounce` is `0.25`, and `0` means critically damped, no overshoot [Motion docs]. If stiffness, damping, or mass are set, they override bounce/duration.

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

**CSS springs without JS:** Motion can generate a duration-based spring as a CSS `linear()` easing (`import { spring } from "motion"`, then `transition: transform ${spring(0.3, 0.1)}`), or use a pre-baked `linear(...)` string.

### 5.5 Enter / exit patterns
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

Text swaps (labels, button states): `AnimatePresence mode="popLayout"` with `initial {opacity:0, y:6, filter:"blur(2px)"}` → `{opacity:1, y:0, filter:"blur(0)"}` → exit `{opacity:0, y:-6, filter:"blur(2px)"}`, about 200ms.

### 5.6 Layout animations
- `layout` prop on elements whose size or position changes (accordion containers, reflowing grids, expanding cards). `layoutId` for shared elements (active pills, tab underlines, card → detail morphs).
- Wrap related siblings in `<LayoutGroup>`. Use `layout="position"` for text to avoid squash. Put `layout` on child text too so it scale-corrects.
- Height auto: animate `height: 0 → "auto"` with Motion, or use CSS `interpolate-size: allow-keywords` / `grid-template-rows: 0fr → 1fr` trick.
- If the main thread will be busy (route change), consider a CSS transition instead of JS layout animation. Emil notes Vercel's tab indicator dropped frames with shared layout animation during navigation.

### 5.7 Gestures
- `whileHover` (guarded: only on `(hover: hover)` devices), `whileTap={{ scale: 0.97 }}`, `whileFocus`.
- Drag: `drag="y"`, `dragConstraints`, `dragElastic={0.2}`. On release, dismiss if `offset.y > 120 || velocity.y > 500`, otherwise spring back with spring.sheet.
- Swipe actions on list rows: reveal under the row, snap points via `dragTransition.modifyTarget`.
- Momentum: Motion inertia defaults `power: 0.8, timeConstant: 700` [Motion docs]. Lower timeConstant (~200–300) feels tighter.
- Press feedback must start on pointer-down, not click.

### 5.8 Scroll effects
- Reveal on view: `whileInView={{ opacity: 1, y: 0 }}` from `{opacity: 0, y: 16}`, `viewport={{ once: true, amount: 0.3 }}`, 500ms ease-out, stagger children 0.06s. Use it once, not every time the element scrolls past.
- Parallax: subtle only (`useScroll` + `useTransform`, max ±40px). Never parallax body text.
- Sticky header: background goes from transparent to `bg/80 + backdrop-blur(12px)` and a hairline shadow after 8px of scroll.
- Native CSS: `animation-timeline: view()` / `scroll()` for progress bars and reveals where supported, with a static fallback.
- Hero illustration loops (Rive/Lottie) should pause offscreen (IntersectionObserver) and when `prefers-reduced-motion`.

### 5.9 Stagger
`delayChildren: stagger(0.04–0.06)` for lists of 3–10 items. Cap total stagger at ~300ms (only stagger the first ~8, then show the rest together). Grids: `stagger(0.05, { grid: [cols, rows], from: "center" })` [Motion docs]. Don't stagger on data refresh, only on first reveal.

### 5.10 Reduced motion & accessibility
```tsx
<MotionConfig reducedMotion="user">{children}</MotionConfig>
```
With `reducedMotion="user"`, Motion turns off transform and layout animations while keeping opacity and color. For custom logic use `useReducedMotion()` and swap `x: "-100%"` for `x: 0` (fade only), as Emil shows.

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important;
    transition-duration: .01ms !important; scroll-behavior: auto !important; }
  .fade-ok { transition: opacity 150ms linear !important; } /* keep gentle fades */
}
```
Apple HIG: let people turn motion off. Avoid large-scale zoom, spin, and parallax for them, and never use motion as the only way to convey information.

### 5.11 Performance
- Animate `transform` and `opacity` only. Avoid width/height/top/left/margin/box-shadow in loops (fade a pseudo-element's opacity to animate a shadow).
- Add `will-change: transform` **only** while animating or on elements that animate constantly. Remove it afterwards, because too many layers waste memory.
- Prefer CSS/WAAPI for simple, always-on animations, since they stay hardware-accelerated when the main thread is busy [Emil]. Motion uses WAAPI for opacity/transform where it can.
- `backdrop-filter` and large `filter: blur` are expensive. Use them on small areas and few at once.
- Test at 4× CPU throttle. Aim for 60fps (120 on ProMotion), no layout shift (CLS 0) from animations.

---

## 6. Micro-interaction checklist

Every interactive element must have these states. Go through them one by one.

- [ ] **Hover** (pointer devices only): color/bg shift 100–150ms. Cursor pointer on clickable non-buttons. No layout shift.
- [ ] **Press**: `scale(0.97)` (buttons) or `0.98` (large cards/CTAs) at pointer-down, 150ms ease-out, spring back.
- [ ] **Focus-visible**: 3px soft accent ring (`--shadow-focus`) plus the hairline. Never remove focus without a replacement. One ring per control, on the outer box of composite fields (`components.md` §4.13).
- [ ] **Disabled**: 50% opacity, `cursor: not-allowed`, no hover/press.
- [ ] **Loading**: fixed width, inline spinner or label crossfade. Disable double-submit.
- [ ] **Success/error feedback**: inline (checkmark draw-in via `pathLength 0→1` in 300ms, or red ring plus helper text). A toast for async results, with Undo for destructive actions [seen: "Task completed · Undo", "Couldn't save Company… Retry"].
- [ ] **Empty states**: friendly line plus primary action, optionally a small illustration.
- [ ] **Toggles/checkboxes**: thumb slides with spring.snappy. Check icon scales .8→1 plus fade.
- [ ] **Tabs/segmented**: sliding indicator via `layoutId`.
- [ ] **Inputs**: focus ring transition, character counter ("198/200"), inline validation after blur, not on every keystroke. OTP boxes auto-advance and paste-fill [seen: 6-digit verify screen].
- [ ] **Numbers**: tabular figures. Animated count/roll on change, not on every render.
- [ ] **Tooltips/keycaps**: show shortcuts (`/` in search, `ESC`, `C`) [seen]. Every icon-only button has one. Open after ~500ms of hover; once one is open, neighbours open instantly for ~400ms (skip delay), so scanning a toolbar doesn't make you wait each time. Only the first one animates in (~120ms fade and 2px rise); instant ones just appear. No tooltip when focus returns to a trigger after its menu closes, none on touch, and they close on scroll and pointer-down [expert].
- [ ] **Every control does something**: each button, menu item, chip and link either works or isn't there. Filters filter, search searches, "Share" copies a real link, "Export" downloads a real file, nav items change the view. A toast that claims an action happened when nothing changed is a dead button [X: "looks finished, doesn't work"]. Use a real menu primitive (Radix, bits-ui, Base UI, Ariakit) for menus, popovers and tooltips, not hand-rolled `div`s.
- [ ] **Lists**: new rows fade/slide in, removed rows collapse height plus fade, reorder animates with `layout`.
- [ ] **Hover cards in tables**: row hover `bg-[#FAFAFA]`, row actions (`…`) appear on hover with an opacity fade.
- [ ] **Carousel dots**: active dot stretches into a pill (`width` via `layout`) [seen on signup preview].
- [ ] **Copy buttons**: icon cross-fades copy → check (scale .5→1, blur 2px→0, ~200ms) for ~1.6s. If it has a tooltip, the tooltip stays open and its text changes to "Copied" instead of closing on click. Await the clipboard write: on failure show a cross and "Copy failed", never a false check. Announce the result in a `role="status"` region. A labelled variant reserves the width of its longest label so it doesn't resize [expert].
- [ ] **Undo over confirm**: deletes, archives and bulk edits apply at once and show a toast with Undo for ~5s; reserve confirm dialogs for things undo can't reverse. Errors don't auto-dismiss [X: toast grouping, errors must not collapse].
- [ ] **Touch targets**: ≥ 44×44pt on mobile (Apple HIG). Hit area may exceed the visual size.
- [ ] **Haptics-feel on web**: tiny overshoot (bounce 0.2) only on toggles/likes and success.

