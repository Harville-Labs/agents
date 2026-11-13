# Component recipes

All snippets assume `import { motion, AnimatePresence, MotionConfig } from "motion/react"` and a `cn()` class joiner. Focus rings and field errors are part of the method, in [interaction.md](../method/interaction.md).

## Secondary button
The recipe: frame 30px tall, 10px radius, text Geist 14 Medium, vertical gradient `#FFFFFF → #F7F7F7`, stroke removed, then 2 effects: drop shadow (0,1) blur 2 `#282828` at 8%, plus drop shadow (0,0) spread 1 blur 0 `#ECECEC` at 100%.

```tsx
export function Button({ variant = "secondary", className, ...props }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", visualDuration: 0.15, bounce: 0 }}
      className={cn(
        "inline-flex h-[30px] items-center gap-1.5 rounded-[10px] px-3 text-[14px] font-medium select-none",
        "transition-[background,box-shadow,color] duration-150 ease-out outline-none",
        "focus-visible:shadow-[var(--shadow-focus),var(--shadow-btn)]",
        variant === "secondary" &&
          "bg-gradient-to-b from-white to-[#F7F7F7] text-[#171717] shadow-[var(--shadow-btn)] hover:to-[#F2F2F2]",
        variant === "primary" &&
          "bg-[var(--accent)] text-white shadow-[var(--shadow-btn-primary)] hover:bg-[var(--accent-hover)]",
        className
      )}
      {...props}
    />
  );
}
```

```css
.btn { height:30px; padding:0 12px; border-radius:10px; font:500 14px/1 var(--font-sans);
  display:inline-flex; align-items:center; gap:6px; border:0; cursor:pointer; user-select:none;
  transition: transform 150ms var(--ease-out), box-shadow 150ms var(--ease-out), background 150ms var(--ease-out); }
.btn:active { transform: scale(0.97); }
.btn:focus-visible { outline:none; box-shadow: var(--shadow-focus), var(--shadow-btn); }
.btn--secondary { background: linear-gradient(#fff, #f7f7f7); color: var(--fg); box-shadow: var(--shadow-btn); }
.btn--primary { background: var(--accent); color: var(--accent-fg); box-shadow: var(--shadow-btn-primary); }
@media (hover:hover) { .btn--primary:hover { background: var(--accent-hover); } }
```

## Input with soft focus ring
```tsx
<input
  className="h-10 w-full rounded-[10px] bg-white px-3 text-[14px] text-[#171717] placeholder:text-[#A3A3A3]
             shadow-[var(--shadow-btn)] outline-none transition-shadow duration-150 ease-out
             focus:shadow-[0_0_0_1px_var(--accent),0_0_0_4px_var(--ring)]"
  placeholder="name@company.com"
/>
```
```css
.input { height:40px; width:100%; border:0; border-radius:10px; padding:0 12px; font-size:14px;
  background:#fff; box-shadow: var(--shadow-btn); transition: box-shadow 150ms var(--ease-out); }
.input:focus { outline:none; box-shadow: 0 0 0 1px var(--accent), 0 0 0 4px var(--ring); }
.input[aria-invalid="true"] { box-shadow: 0 0 0 1px var(--danger), 0 0 0 4px rgb(220 38 38 / .15); }
```
This works for a bare input. Once the input sits inside a visible box (search bar, composer, input with an icon or button), the **box** gets the ring and the input gets none. See [Focus rings](../method/interaction.md#focus-rings).

## Sidebar nav
Use the sliding-indicator recipe in [motion.md](../method/motion.md#sliding-indicator) with a white pill (`bg-white shadow-[var(--shadow-btn)]`) on the grey sidebar. For any real sidebar, use the full recipe in [sidebar.md](sidebar.md).

## Segmented control / tabs (Daily · Weekly · Monthly)
The [sliding indicator](../method/motion.md#sliding-indicator) inside a `bg-[#F4F4F4] p-1 rounded-[10px]` track. The thumb is `bg-white rounded-lg shadow-[var(--shadow-btn)]`. Labels are 13px Medium, inactive `#737373`.

## Card / KPI tile
```tsx
<motion.div
  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
  className="rounded-2xl bg-white p-4 shadow-[var(--shadow-card)]">
  <p className="text-[13px] text-[#737373]">Total balance</p>
  <p className="mt-2 font-mono text-[28px] font-medium tracking-[-0.02em] tabular-nums">$83,820.35</p>
  <span className="mt-2 inline-flex items-center gap-1 rounded-md bg-[#ECFDF3] px-1.5 py-0.5 text-[12px] font-medium text-[#16A34A]">▲ +30.5%</span>
  <span className="ml-1.5 text-[12px] text-[#A3A3A3]">since Jan 1</span>
</motion.div>
```

## Status pill / tag (dark text on soft tint)
```css
.tag { display:inline-flex; align-items:center; height:22px; padding:0 8px; border-radius:6px;
  font:500 12px/1 var(--font-sans); }
.tag--success { color:#15803d; background:#ecfdf3; box-shadow: inset 0 0 0 1px #d1fadf; }
.tag--danger  { color:#b91c1c; background:#fef2f2; box-shadow: inset 0 0 0 1px #fde0e0; }
.tag--info    { color:#1d4ed8; background:#eef4ff; box-shadow: inset 0 0 0 1px #dbe6ff; }
```
Never put white text on a saturated tag fill.

## Popover / dropdown / command palette
```tsx
<AnimatePresence>
  {open && (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.12, ease: "easeIn" } }}
      transition={{ type: "spring", visualDuration: 0.2, bounce: 0 }}
      style={{ transformOrigin: "var(--radix-popover-content-transform-origin, top)" }}
      className="rounded-xl bg-white p-1 shadow-[var(--shadow-pop)]"
    />
  )}
</AnimatePresence>
```
Rules: scale from **0.95–0.97, never from 0**. The origin should be the trigger, except modals, which scale from center. Exits are faster than enters. Command palette: 24px radius, `ESC` keycap (`h-6 px-1.5 rounded-md bg-[#F7F7F7] shadow-[var(--hairline)] text-[12px]`), hovered row `bg-[#F5F5F5] rounded-lg`. **Do not animate a palette opened by keyboard shortcut**, or keep it under 120ms opacity only.

```css
.pop { transform-origin: var(--origin, top); animation: pop-in 200ms var(--ease-out); }
.pop[data-state="closed"] { animation: pop-out 120ms ease-in forwards; }
@keyframes pop-in { from { opacity:0; transform: scale(.96) translateY(-4px); } }
@keyframes pop-out { to { opacity:0; transform: scale(.98); } }
```

## Modal / bottom sheet
- Desktop modal: overlay `rgb(0 0 0 / .4)` fades in 200ms. Panel goes from `opacity 0, scale .96, y 8` to rest, spring `visualDuration .3, bounce .1`. Radius 20–24px.
- Mobile sheet: `y: "100%" → 0` using `cubic-bezier(0.32,0.72,0,1)` at 400–500ms, or spring `{ stiffness: 400, damping: 40 }`. Draggable down to dismiss (see [Gestures](../method/motion.md#gestures)). Radius 24–32px top, with a grab handle 36×5px `#D4D4D4`.

## Toast (with undo)
Dark pill on light UI: `bg-[#171717] text-white rounded-[10px] h-9 px-3 text-[13px] shadow-[var(--shadow-pop)]`, with an `Undo` keycap button `bg-white/10`. Enter from `y: 16, opacity: 0, scale: .96` with spring `visualDuration .35, bounce .15`. Exit `opacity 0, y 8` in 150ms. Stacked toasts scale down by 0.05 per level and peek 8px (Sonner pattern).

## Skeleton & loading
```css
.skeleton { border-radius: 8px; background: linear-gradient(90deg, #f2f2f2 0%, #e9e9e9 50%, #f2f2f2 100%);
  background-size: 200% 100%; animation: shimmer 1.4s linear infinite; }
@keyframes shimmer { to { background-position: -200% 0; } }
@media (prefers-reduced-motion: reduce) { .skeleton { animation: none; } }
```
Skeletons copy the **final layout exactly** (same heights, radii, gaps). When the real content arrives, crossfade it in over 200ms. Don't pop it in. Only show a spinner after ~300ms of waiting so fast loads never flash. In-button loading: keep the button width fixed, swap the label for a 14px spinner with `AnimatePresence mode="popLayout"` (blur 2px→0, y 6→0).

## Mobile primary CTA (pill)
`h-[52px] w-full rounded-full bg-[var(--accent)] text-white text-[16px] font-medium` with a subtle top gradient highlight and `active:scale-[0.98]`. Fix it to the bottom with 16px side insets and a fade-to-bg gradient behind it. "Hold to quit" style: fill a progress overlay with `scaleX 0→1` over 1.2s linear while held, reverse on release with 200ms ease-out.
