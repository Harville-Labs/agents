### Designing UI

**You own how it looks and feels, not only that it works.** The screenshots are the proof. The code alone is not.

1. Load the **ui-design** skill and run its "Find the style" step. Name the design source you found (tokens file, Tailwind theme, component library, design doc, existing screens) or say there is none and the default style applies.
2. Decide whether the look is open. It is open when the request creates a new screen or layout and neither the user nor the style fixes its direction ("design a dashboard", "make a landing page"). It is set when you're polishing an existing screen, matching a mockup or a named reference, or extending a screen whose siblings already fix the layout. When it is open, run the **Prototype** playbook first: 2 or 3 variations in the active style, behind one switcher, screenshotted, then pick one per the **exhaust-the-design-space** principle skill. Skip with `skip: direction set by <what>`.
3. Write the brief from ui-design's prompt-expansion template: style source, layout pattern, theme, one accent, type, realistic data, motion, states. Name the reference you're matching: an existing screen, the chosen prototype variant, or a default-style reference image.
4. Copy ui-design Workflow steps 2 to 12 into the todo list and build to the brief. Use the repository's component library and stack rules first, and translate ui-design's recipes into them.
5. Run ui-design's verification round (`references/method/qa.md`, "Verification round") through the **control-ui** skill. Pass or fail each check item. At most 2 fix rounds.
6. Run **Opening a PR** with the desktop and mobile screenshots in the PR body.

**Reply:** the style source, the variants and the pick (or why the direction was set), the brief, the reference matched, the screenshots, and every check item that still fails.
