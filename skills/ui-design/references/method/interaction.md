# Interaction

## Micro-interaction checklist

Every interactive element must have these states. Go through them one by one. Colors, rings, and radii come from the active style.

- [ ] **Hover** (pointer devices only): color/bg shift 100–150ms. Cursor pointer on clickable non-buttons. No layout shift.
- [ ] **Press**: `scale(0.97)` (buttons) or `0.98` (large cards/CTAs) at pointer-down, 150ms ease-out, spring back ([motion.md](motion.md#press)).
- [ ] **Focus-visible**: the style's focus ring. Never remove focus without a replacement. One ring per control, on the outer box of composite fields ([Focus rings](#focus-rings)).
- [ ] **Disabled**: 50% opacity, `cursor: not-allowed`, no hover/press.
- [ ] **Loading**: fixed width, inline spinner or label crossfade. Disable double-submit.
- [ ] **Success/error feedback**: inline (checkmark draw-in via `pathLength 0→1` in 300ms, or red ring plus helper text). A toast for async results, with Undo for destructive actions ("Task completed · Undo", "Couldn't save Company… Retry").
- [ ] **Empty states**: say what will appear here and give the action that makes it appear, optionally with a small illustration.
- [ ] **Toggles/checkboxes**: thumb slides with spring.snappy. Check icon scales .8→1 plus fade.
- [ ] **Tabs/segmented**: sliding indicator ([motion.md](motion.md#sliding-indicator)).
- [ ] **Inputs**: focus ring transition, character counter ("198/200"), inline validation after blur, not on every keystroke ([Field errors](#field-errors)). OTP boxes auto-advance and paste-fill.
- [ ] **Numbers**: tabular figures. Animated count/roll on change, not on every render.
- [ ] **Tooltips/keycaps**: show shortcuts (`/` in search, `ESC`, `C`). Every icon-only button has one. Open after ~500ms of hover; once one is open, neighbours open instantly for ~400ms (skip delay), so scanning a toolbar doesn't make you wait each time. Only the first one animates in (~120ms fade and 2px rise); instant ones just appear. No tooltip when focus returns to a trigger after its menu closes, none on touch, and they close on scroll and pointer-down.
- [ ] **Every control does something**: each button, menu item, chip and link either works or isn't there. Filters filter, search searches, "Share" copies a real link, "Export" downloads a real file, nav items change the view. A toast that claims an action happened when nothing changed is a dead button. Use a real menu primitive (Bits UI, Radix, Base UI, Ariakit) for menus, popovers and tooltips, not hand-rolled `div`s.
- [ ] **Lists**: new rows fade/slide in, removed rows collapse height plus fade, reorder animates with `layout` (`animate:flip` in Svelte).
- [ ] **Hover in tables**: row hover gets a faint background, and row actions (`…`) appear on hover with an opacity fade.
- [ ] **Carousel dots**: active dot stretches into a pill.
- [ ] **Copy buttons**: icon cross-fades copy → check (scale .5→1, blur 2px→0, ~200ms) for ~1.6s. If it has a tooltip, the tooltip stays open and its text changes to "Copied" instead of closing on click. Await the clipboard write: on failure show a cross and "Copy failed", never a false check. Announce the result in a `role="status"` region. A labelled variant reserves the width of its longest label so it doesn't resize.
- [ ] **Undo over confirm**: deletes, archives and bulk edits apply at once and show a toast with Undo for ~5s; reserve confirm dialogs for things undo can't reverse. Errors don't auto-dismiss.
- [ ] **Touch targets**: ≥ 44×44pt on mobile. Hit area may exceed the visual size.
- [ ] **Haptics-feel on web**: tiny overshoot (bounce 0.2) only on toggles/likes and success.

## Focus rings

Agents break focus in two opposite ways: they delete it (`outline: none` with nothing in its place) or they draw it twice. Every focusable control shows exactly **one** ring, and it traces the shape the user sees as the control.

- **Composite fields get one ring, on the outer box.** A search bar, chat composer, input with an icon, or input with a button inside is one control to the user. Draw the ring on the wrapper with `:focus-within` (or `:has(textarea:focus)` when the box also holds buttons that shouldn't light it up) and give the inner `input`/`textarea` `outline: none`. The classic failure is the textarea's ring sitting a few px inside the composer's ring: two concentric, misaligned rounded rectangles.
- **Text fields are not buttons.** A global rule like `.app :focus-visible { outline: 2px solid }` also hits inputs, which match `:focus-visible` on mouse click as well. Scope it: `:focus-visible:not(input, textarea, [contenteditable])`, and let fields style their own wrapper.
- **Match the shape.** `outline` follows `border-radius` in all current browsers; use `outline-offset: 2px` for buttons and `-2px` (inset) for rows inside a scroll container, where an outer ring gets clipped by `overflow: hidden/auto`.
- **Mind the cascade.** Unlayered CSS beats Tailwind's layered utilities and resets, and scoped component CSS doesn't reach child components. Check that the ring you wrote is the one that renders (inspect the computed `outline` and `box-shadow`), especially on third-party primitives.
- **Menus and lists use their highlight, not a ring.** Menu items, options and command rows show focus through the same background as hover (`[data-highlighted]`). A ring there doubles up.
- **Error state replaces the ring color, not the ring.** `aria-invalid` turns the same ring red; it doesn't add a second one.

```css
.composer { border-radius: 16px; box-shadow: 0 0 0 1px var(--border); transition: box-shadow 150ms var(--ease-out); }
.composer:has(textarea:focus) { box-shadow: 0 0 0 1px var(--accent), 0 0 0 4px var(--ring); }
.composer textarea { outline: none; }
.app :focus-visible:not(input, textarea) { outline: 2px solid var(--accent); outline-offset: 2px; }
```
**Check it:** Tab through the screen and screenshot every input, button and row. Each shows one ring, aligned to its own edge, not clipped.

## Field errors

Errors move into place. Nothing jumps.

- Validate on blur or submit, never on every keystroke. Once a field is in error, clear the error **as they type** the moment it becomes valid ("reward early, punish late").
- The message animates its height open: wrap it in a grid that goes `grid-template-rows: 0fr → 1fr` with opacity `0 → 1` and `translateY(-4px) → 0` over ~200ms. Nothing below the field jumps.
- Keep the last message rendered while it animates closed, so the text doesn't vanish before the box collapses.
- The ring turns red with the same transition as focus ([Focus rings](#focus-rings)). One short line in the danger color with a 14px alert icon, directly under the field.
- On a failed sign-in, shake the form once (translateX ±6px, ~320ms) and select the password. Skip the shake under reduced motion. Don't shake for ordinary validation.
- Focus the first invalid field on submit. Announce messages with `aria-live="polite"` and link them with `aria-describedby`.

```css
.field-error { display: grid; grid-template-rows: 0fr; opacity: 0; transform: translateY(-4px);
  transition: grid-template-rows 200ms var(--ease-out), opacity 160ms var(--ease-out), transform 200ms var(--ease-out); }
.field-error[data-visible] { grid-template-rows: 1fr; opacity: 1; transform: none; }
.field-error > div { overflow: hidden; }
```
