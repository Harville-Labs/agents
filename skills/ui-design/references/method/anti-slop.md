# Anti-slop rules

These are the tells that make UI read as AI-built. Each is a hard **don't** with a **do** instead. Where the repository's design source deliberately does one of them (a brand gradient, a stock component theme it chose), the repository wins. Note it in the hand-off.

1. **No default purple/indigo/violet gradients** (hero, buttons, text, or backgrounds). *Do:* use a neutral UI plus one flat accent with a job. A violet accent is fine if it's flat and intentional.
2. **No gradient text and no "one colored word" in the headline.** *Do:* use the solid primary text color and get emphasis from size, weight, or tracking.
3. **No untuned type.** Don't ship default tracking at every size, random weights, or a flat hierarchy where everything looks the same. *Do:* tune the style's typeface. Use −2% to −4% tracking on display sizes, at most 2 weights on screen, and a clear size step between title, body and meta.
4. **No emoji as icons, and no emoji status pills ("🟢 LIVE").** *Do:* use the repository's icon set, or one stroke icon set at 16/20px with stroke 1.5. Without one, don't reach for Lucide by reflex: Phosphor, Iconoir, or a custom set reads less "default".
5. **No untouched library look** (stock zinc grays, stock radius, untouched components) in a product with no design of its own. *Do:* theme the library from the style's tokens and set your own radius tiers.
6. **No "centered hero → three icon feature cards → testimonials → CTA" template.** *Do:* build an asymmetric layout with a real product screenshot or UI preview as the hero visual, and use content-specific sections.
7. **No fake social proof** ("Sarah K., Founder" testimonials, made-up logos, "Trusted by 10,000+ teams") and no lorem ipsum. *Do:* use realistic, domain-specific data. Label sample data as sample.
8. **No random radial glow orbs, gradient blobs, dot-grid or neon backgrounds, or glow cards.** *Do:* use a quiet canvas. Use grain or texture only when it carries the brand and is art-directed.
9. **No drop shadows on everything and no hairline border on every box.** *Do:* use soft layered shadows on elevated layers only, with tonal separation instead of borders.
10. **No card inside a card inside a card.** *Do:* give content one container level and use whitespace and hairlines inside it.
11. **No eyebrow label above every heading and no spaced-out uppercase everywhere.** *Do:* use an eyebrow at most once per page. Small uppercase belongs on sidebar section labels only.
12. **No "everything hover-scales" and no fade-up on every scroll section.** *Do:* use purposeful motion: press scale .97 on buttons, sliding indicators, and origin-aware popovers ([motion.md](motion.md)). Reveal on scroll only once and only for hero-level content.
13. **No rainbow or neon palettes and no several competing accents.** *Do:* use one accent, and semantic green/red only for deltas.
14. **No uneven, eyeballed spacing.** *Do:* use the style's spacing scale (a strict 4px grid by default) and keep larger gaps between groups than within groups.
15. **No generic beige/cream "AI warm" background or pure-white flatness by default.** *Do:* use the style's canvas, or a cool neutral canvas with white panels.
16. **No buzzword copy** ("Build faster with AI", "Supercharge your workflow") and no em-dash-heavy marketing voice. *Do:* write concrete, plain, product-specific copy.
17. **No bento grid unless the content is truly heterogeneous.** *Do:* let the content decide the layout.
18. **No glassmorphism by default.** *Do:* use solid surfaces, and blur only for overlays over imagery.
19. **No twin CTAs and no filler cards** ("Get started" + "Learn more" side by side, a fourth stat card to fill the row, an icon in a rounded square on every card). *Do:* one primary action per view; as many cards as there are real numbers.
20. **No "Welcome back, Alex! 👋" and no exclamation-mark copy.** *Do:* lead with the user's work ("3 deals close this week").
21. **No `"No data"` empty states.** *Do:* say what will appear here and give the action that makes it appear; test with zero items, one item and very long names.
22. **No dead UI.** *Do:* see "Every control does something" in [interaction.md](interaction.md#micro-interaction-checklist). Click through every control before you hand it over.
23. **No white text on saturated pills, no 600ms+ UI transitions, no scale-from-0 popovers, no bouncy springs everywhere, and no 1px mid-grey border on every box.**
