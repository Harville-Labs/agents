---
name: giga-ui
description: A complete visual language for product UI (design tokens, component recipes, a motion and micro-interaction system, anti-slop rules, and a screenshot QA round) so the result looks and feels premium. Use when building, redesigning, or polishing any user interface (a component, landing page, dashboard, app screen, mobile UI, onboarding or auth flow), especially from a short or vague prompt.
---

# giga-ui

Turn a one-line UI request into a polished, production-quality interface. The style is quiet, near-monochrome product UI with careful typography, soft layered shadows instead of heavy borders, one confident accent color, and motion that is fast, physical, and never decorative. It is inspired by the public work of product designer `@marcelkargul` (Kargul Studio) and is not affiliated with him.

It works with any stack. Examples use React, Tailwind, and Motion (`motion/react`), each with a plain-CSS equivalent. In a repository with its own stack rules (for example **svelte-best-practices**), translate the recipes into that stack. The repository's rules win where they conflict.

## References

Read [style.md](references/style.md) before any UI work. Read the others when the step below names them.

| File | What's in it |
|---|---|
| [style.md](references/style.md) | Philosophy, the observed style (type, color, shape, layout patterns, icons, dark mode), and the CSS design tokens. |
| [components.md](references/components.md) | Recipes for buttons, inputs, nav pills, segmented controls, cards, tags, popovers, modals, toasts, skeletons, mobile CTAs, focus rings, and field errors. |
| [sidebar.md](references/sidebar.md) | The full sidebar and nav rail recipe: inset vs flush shells, measurements, behavior, common mistakes, and code. Read it before any app shell. |
| [motion.md](references/motion.md) | Motion principles, easing and duration tokens, spring presets, enter and exit patterns, gestures, reduced motion, and the micro-interaction checklist. |
| [anti-slop.md](references/anti-slop.md) | 22 hard don'ts that make UI read as AI-built, each with the do instead. |
| [qa.md](references/qa.md) | The final QA checklist and the screenshot verification round. |
| [images.md](references/images.md) | Annotated reference screenshots in `references/images/`, and the sources. |

Each rule carries a provenance tag: **[seen]** in the designer's posts, **[inferred]** from screenshots, **[expert]** general motion and UX practice, **[X]** repeated in public X sentiment.

## Workflow

1. **Classify the request:** SaaS app screen, mobile app, landing page, auth or onboarding, or a single component. Pick the matching layout pattern from style.md §2.4. For an app shell, read sidebar.md and open 2 or 3 files in `references/images/sidebars/`.
2. **Choose the theme:** light by default for productivity, dark for trading, dev tools, or media. Pick **one accent** from style.md §2.2 that fits the domain (finance: blue or black, creative: violet, data and ops: teal or orange, playful consumer: coral or lime).
3. **Pick the type:** Inter on the web by default (Geist as an alternative), SF Pro Rounded or `ui-rounded` for iOS-feel mobile. Two weights. Apply the tracking rules in style.md §2.1.
4. **Write the content first.** Realistic, specific data, not lorem ipsum: names, amounts, dates, statuses ("Sophia Williams", "$83,820.35", "Oct 10 · Overdue"). Short sentence-case labels.
5. **Block out the layout** on the 4px grid with the tokens in style.md §3 only, no ad-hoc hex or px values. One H1 and one primary action per view.
6. **Build the components** from components.md. Hairline shadows over borders, tinted tags, no zebra tables, tabular or mono numbers.
7. **Remove things.** Delete any divider, icon, label, or color that isn't needed. Merge redundant actions. Check the result against anti-slop.md.
8. **Add motion in this order** (motion.md): press, hover, and focus states everywhere; enter and exit for overlays; layout animations for indicators and reflow; one orchestrated page-load reveal (stagger ≤ 300ms); one hero moment if it's a landing page.
9. **Handle states:** loading skeletons, empty, error, success, disabled, long-text truncation, and responsive widths (360, 768, 1024, 1280). Walk the micro-interaction checklist in motion.md §6.
10. **Dark mode pass** with the token overrides. Check contrast.
11. **Accessibility pass:** semantic elements, labels, keyboard paths, focus order, `prefers-reduced-motion`, contrast ≥ 4.5:1 for body text and 3:1 for large text.
12. **Polish pass** with the qa.md §9 checklist. Fix small details by hand.
13. **Verification round** (qa.md §9.5): screenshot at 1440 and 390 plus the hover, focus, and mid-animation states, check, fix, and re-shoot. At most 2 rounds. List anything that still fails in the hand-off.

Expand a short prompt into a brief before you build, and keep it to yourself:

> Build {thing} for {domain}. Light theme, accent {hex}, Inter with −3% tracking on titles. Layout: {pattern}. Components: {list}. Realistic data: {examples}. Motion: press scale .97, popovers 200ms ease-out from origin, sliding active indicators, staggered first reveal 40ms. States: loading, empty, error. Reduced-motion safe.
