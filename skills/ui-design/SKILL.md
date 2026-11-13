---
name: ui-design
description: A method for designing UI that looks and feels finished (a design brief, a motion and interaction system, anti-slop rules, and a screenshot QA round), applied on top of the repository's own design, with a default visual style for repositories that have none. Use when building, redesigning, or polishing any user interface (a component, landing page, dashboard, app screen, mobile UI, onboarding or auth flow), especially from a short or vague prompt.
---

# ui-design

Turn a one-line UI request into a polished, production-quality interface. The skill has two layers.

- **Method** always applies. It is how to work: the brief, the motion and interaction system, the anti-slop rules, and the screenshot QA round. None of it depends on a particular look.
- **Style** is what the result looks like: tokens, component recipes, and reference images. The repository's own design is the style when it has one. The default style in `references/default-style/` applies only when it has none.

## Find the style

Do this before anything else. Look for the repository's own design source:

- a tokens file (`tokens.css`, `tokens.json`, CSS custom properties for color, type, and radius in `app.css` or a global stylesheet)
- a Tailwind theme (`@theme` in the main stylesheet, or `theme.extend` in `tailwind.config.*`)
- a component library named in `AGENTS.md` or `package.json` (shadcn-svelte, Bits UI, shadcn/ui, Radix Themes, MUI, and so on), with its theme
- a design doc (`docs/design.md`, or a style named in `AGENTS.md`)
- existing screens in the app that already share a look

If you find one, it **replaces the default style**. Use its tokens, components, type, and accent. Don't read `references/default-style/` and don't restyle anything toward it. Run the method on top. When a method rule conflicts with the repository's design (its library ships a stock look, or its brand uses a gradient), the repository wins. Note the conflict in your hand-off.

If you find none, use the default style.

A repository or a team plugin can ship its own style as a folder shaped like `references/default-style/`: a tokens file, component recipes, and reference images. Point to it from `AGENTS.md` or `docs/design.md` and it takes the default style's place.

## References

| Layer | File | What's in it |
|---|---|---|
| Method | [motion.md](references/method/motion.md) | Motion principles, easing and duration tokens, springs, enter and exit patterns, gestures, reduced motion, and press and sliding-indicator recipes in React and Svelte. |
| Method | [interaction.md](references/method/interaction.md) | The micro-interaction checklist, focus rings, and field errors. |
| Method | [anti-slop.md](references/method/anti-slop.md) | Hard don'ts that make UI read as AI-built, each with the do instead. |
| Method | [qa.md](references/method/qa.md) | The final QA checklist and the screenshot verification round. |
| Default style | [style.md](references/default-style/style.md) | Philosophy, the visual style (type, color, shape, layout patterns, icons, dark mode), the CSS tokens, and the style checks for the QA round. |
| Default style | [components.md](references/default-style/components.md) | Recipes for buttons, inputs, nav, segmented controls, cards, tags, popovers, modals, toasts, skeletons, and mobile CTAs. |
| Default style | [sidebar.md](references/default-style/sidebar.md) | The sidebar and nav rail recipe: inset and flush shells, measurements, behavior, common mistakes, and code. |
| Default style | [images.md](references/default-style/images.md) | Annotated reference screenshots in `references/default-style/images/`, and the sources. |

Examples use React, Tailwind, and Motion (`motion/react`), each with a plain-CSS equivalent. [motion.md](references/method/motion.md) has Svelte 5 versions of the press and sliding-indicator recipes. In a repository with its own stack rules (for example **svelte-best-practices**), translate the recipes into that stack. The repository's rules win where they conflict.

## Workflow

1. **Find the style** (above). Read its tokens and components, or [style.md](references/default-style/style.md) for the default.
2. **Classify the request:** SaaS app screen, mobile app, landing page, auth or onboarding, or a single component. Pick the matching layout pattern from the style, or from the repository's existing screens. For an app shell in the default style, read [sidebar.md](references/default-style/sidebar.md) and open 2 or 3 files in `references/default-style/images/sidebars/`.
3. **Settle theme, accent, and type** from the style. A repository's design fixes these. In the default style, follow its Color and Typography sections.
4. **Write the content first.** Realistic, specific data, not lorem ipsum: names, amounts, dates, statuses ("Sophia Williams", "$83,820.35", "Oct 10 · Overdue"). Short sentence-case labels.
5. **Block out the layout** on the style's spacing scale (a 4px grid when it has none), with its tokens only, no ad-hoc hex or px values. One H1 and one primary action per view.
6. **Build the components** from the repository's library first, then the style's recipes. Number columns use tabular figures.
7. **Remove things.** Delete any divider, icon, label, or color that isn't needed. Merge redundant actions. Check the result against [anti-slop.md](references/method/anti-slop.md).
8. **Add motion in this order** ([motion.md](references/method/motion.md)): press, hover, and focus states everywhere; enter and exit for overlays; layout animations for indicators and reflow; one orchestrated page-load reveal (stagger ≤ 300ms); one hero moment if it's a landing page.
9. **Handle states:** loading skeletons, empty, error, success, disabled, long-text truncation, and responsive widths (360, 768, 1024, 1280). Walk the checklist in [interaction.md](references/method/interaction.md).
10. **Dark mode pass** with the style's dark tokens, when it has them. Check contrast.
11. **Accessibility pass:** semantic elements, labels, keyboard paths, focus order, `prefers-reduced-motion`, contrast ≥ 4.5:1 for body text and 3:1 for large text.
12. **Polish pass** with the [qa.md](references/method/qa.md) checklist. Fix small details by hand.
13. **Verification round** ([qa.md](references/method/qa.md#verification-round)): screenshot at 1440 and 390 plus the hover, focus, and mid-animation states, check, fix, and re-shoot. At most 2 rounds. List anything that still fails in the hand-off.

Expand a short prompt into a brief before you build, and keep it to yourself:

> Build {thing} for {domain}. Style: {the repository's design source, or the default}. Theme {light or dark}, accent {token or hex}, type {family and title tracking}. Layout: {pattern}. Components: {list, from the repository's library where it has them}. Realistic data: {examples}. Motion: press scale .97, popovers 200ms ease-out from origin, sliding active indicators, staggered first reveal 40ms. States: loading, empty, error. Reduced-motion safe.
