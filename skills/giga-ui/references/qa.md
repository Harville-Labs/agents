# QA and verification

## 9. Final QA checklist

**Visual**
- [ ] One accent color. Everything else neutral or semantic.
- [ ] One font family (+ optional mono), ≤ 2 weights in body UI. Tracking matches size rules.
- [ ] All spacing on the 4px grid. Consistent radii per tier (control 8–10, card 12–16, overlay 20–24).
- [ ] Hairlines via light borders or spread shadows. No harsh borders. Shadows layered and soft.
- [ ] Tags use dark text on light tint. Numbers tabular. Text contrast passes.
- [ ] Realistic content. Truncation with ellipsis and title tooltips.
- [ ] Icons the same stroke (1.5) and size (16/18/20), optically aligned with text.
- [ ] Light and dark both checked.

**Motion & interaction**
- [ ] Every interactive element has hover, press, focus-visible, disabled, and loading states.
- [ ] UI transitions ≤ 300ms. Exits faster than enters. Ease-out or springs, no ease-in on enter.
- [ ] Popovers scale from ≥ 0.95 at the trigger origin. Modals from center.
- [ ] Active indicators slide (layoutId). Lists animate add/remove/reorder.
- [ ] Interruptible: rapidly toggling never jumps or queues.
- [ ] No animation on keyboard-triggered frequent actions.
- [ ] Only transform/opacity animated. `will-change` only where needed. No CLS.
- [ ] `prefers-reduced-motion` honored (MotionConfig `reducedMotion="user"` + CSS media query).
- [ ] Looped/hero animations pause offscreen.

**UX**
- [ ] One primary action per view. Clear hierarchy in a 3-second squint test.
- [ ] Keyboard: tab order, Enter/Escape, shortcuts shown as keycaps where useful.
- [ ] Focus pass: Tab through every control and screenshot it. One ring each, on the outer box of composite fields, not clipped (`components.md` §4.13).
- [ ] Function pass: click every button, menu item, chip, link and row action. Each one does what its label says (`motion.md` §6).
- [ ] Alignment pass: in sidebars and lists, icons share one column and labels share another; trigger rows match the rows below in width, height and inset.
- [ ] Touch targets ≥ 44px on mobile. Sticky CTA doesn't cover content.
- [ ] Error messages say what happened and how to fix it ("Couldn't save Company. Check your connection. Retry").
- [ ] Review it again the next day with fresh eyes (Emil's advice), or at least do a second full pass.

## 9.5 Verification round (screenshot → check → fix, max 2 rounds)
Don't hand over UI you haven't looked at. After building it, render it, look at it, fix it, and look again.

**1. Render.** Start the app from your working tree and drive it with the [control-ui](../../control-ui/SKILL.md) skill. Save these shots at 2× device scale:

- `shot-desktop.png` at 1440×900 and `shot-mobile.png` at 390×844, full page, after the page settles.
- `shot-hover.png` with the pointer over the first button or link, 200ms after hover.
- `shot-focus.png` after one Tab press.
- `shot-midanim.png` 120ms after a reload, to catch the entrance mid-flight.

At 1440 wide, also run this in the page and keep the output for the no-vision fallback. It lists elements that overflow the viewport or their own box:

```js
[...document.querySelectorAll('body *')].filter((e) => {
  const r = e.getBoundingClientRect(), s = getComputedStyle(e);
  return r.width && (r.right > innerWidth + 1 || (e.scrollWidth > e.clientWidth + 1 && s.overflowX === 'visible'));
}).slice(0, 20).map((e) => `${e.tagName}.${e.className} ${Math.round(e.getBoundingClientRect().right)}`)
```

**2. Look.** Open each PNG with your image or file-view tool. Compare the desktop shot side by side with one similar file from [images.md](images.md) (and one from `images/sidebars/` if the UI has a sidebar).

**3. Check (each item passes or fails, with nothing in between):**
- [ ] **Alignment:** left edges line up on a few shared x-positions. Icons are vertically centered with their text. Numbers are right-aligned in tables.
- [ ] **Spacing rhythm:** every gap is a multiple of 4. Gaps inside a group are smaller than gaps between groups. No cramped edge padding.
- [ ] **Type hierarchy:** one clear title. At most 2 weights. Display tracking is negative. Muted grey is used for secondary text, not for the primary text.
- [ ] **Contrast:** body text ≥ 4.5:1, and nothing important in `#A3A3A3` on white. The focus ring is visible in `shot-focus.png`.
- [ ] **Overflow/clipping:** nothing cut off or scrolling sideways at 390px. No wrapped buttons or labels. Long text truncates with an ellipsis.
- [ ] **Sidebar** (if present): passes `sidebar.md` "Common mistakes" 1–10. It is cleanly **inset** (sidebar on the tinted app background with no fill of its own; content a panel with an even ~8px gap to the top, right and bottom edges, 12–16px radius on all 4 corners, a subtle ring/shadow, and its own scroll) or cleanly **flush** (sidebar on its own surface, one hairline, content edge to edge), never a mix. It has a quiet active pill, a footer pinned to the bottom, and becomes a drawer or tab bar on mobile.
- [ ] **Slop rules:** none of the `anti-slop.md` tells are present (do a quick squint for a purple gradient, emoji, three centered cards, glow orbs, or fake testimonials).
- [ ] **Motion present:** `shot-hover.png` differs from the rest state. `shot-midanim.png` shows elements partly in (opacity or translate between states). The code includes press scale, sliding indicators, and a `prefers-reduced-motion` branch.
- [ ] **Mobile:** touch targets are ≥ 44px, the primary CTA is reachable, and nothing overlaps the sticky bars.

**4. Fix and re-shoot.** Fix every failed item, take the shots again, and check again. Stop after **2 rounds**. If anything still fails, list it in your hand-off and don't call the UI done.

**No vision? Use this fallback.** If you can't view images, rely on the DOM instead. The overflow list from step 1 must be empty. Use `page.evaluate` to dump `getBoundingClientRect()` for headings, buttons, and nav items, then check that `left` values cluster, `height` of nav items is consistent (e.g. all 32), gaps are multiples of 4, and button heights are equal per row. Read `getComputedStyle` to confirm font-family, weights used (count distinct values ≤ 2–3), `letter-spacing` on h1, `transition`/`animation` present on interactive elements, and compute text contrast from `color` vs. background. Diff the hover and rest screenshot bytes (`!=`) to prove a hover state exists.
