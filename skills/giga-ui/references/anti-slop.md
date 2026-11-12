# Anti-slop rules

Marcel has a post titled "unslopping an ai dashboard" (xpages p004). In October and November 2026, X users repeatedly named the same "AI-built" tells. The most common was the combination of purple gradient, untuned default type, and three cards. Rules below are tagged **[X]** when post sentiment supports them, and **[seen]**/**[expert]** as elsewhere in this skill. Every rule is a hard **don't** with a **do** instead.

1. **No default purple/indigo/violet gradients** (hero, buttons, text, or backgrounds) [X: the most cited tell]. *Do:* use a neutral UI plus one flat accent with a job. A violet accent is fine if it's flat and intentional (his `#7B3AEC` CTA) [seen].
2. **No gradient text and no "one colored word" in the headline** [X]. *Do:* use solid `#171717` and get emphasis from size, weight, or tracking.
3. **No untuned type.** Don't ship default tracking at every size, random weights, or a flat hierarchy where everything looks the same [X: "untuned Inter", "inter at every size", "6 font weights on one screen"; the complaint is about defaults, not the typeface]. *Do:* use Inter (the default here) and tune it. Use −2% to −4% tracking on display sizes, 500–600 for headings, at most 2 weights on screen, and a clear size step between title, body and meta (`style.md` §2.1).
4. **No emoji as icons, and no emoji status pills ("🟢 LIVE")** [X]. *Do:* use one stroke icon set at 16/20px with stroke 1.5. Don't use Lucide by reflex: Phosphor, Iconoir, or a custom set reads less "default" [X: "lucide everywhere" was named as a tell].
5. **No default shadcn look** (stock zinc grays, stock radius, untouched components) [X]. *Do:* use the `style.md` §3 tokens, his button recipe (`components.md` §4.1), and your own radius tiers.
6. **No "centered hero → three icon feature cards → testimonials → CTA" template** [X]. *Do:* build an asymmetric layout with a real product screenshot or UI preview as the hero visual, and use content-specific sections.
7. **No fake social proof** ("Sarah K., Founder" testimonials, made-up logos, "Trusted by 10,000+ teams") and no lorem ipsum [X]. *Do:* use realistic, domain-specific data. Label sample data as sample.
8. **No random radial glow orbs, gradient blobs, dot-grid or neon backgrounds, or glow cards** [X]. *Do:* use a quiet canvas. Use grain or texture only when it carries the brand (his ribbon hero is deliberate and art-directed) [seen].
9. **No drop shadows on everything and no hairline border on every box** [X][seen]. *Do:* use soft layered shadows on elevated layers only, with tonal separation instead of borders.
10. **No card inside a card inside a card** [X: "a card in a card"]. *Do:* give content one container level and use whitespace and hairlines inside it.
11. **No eyebrow label above every heading and no spaced-out uppercase everywhere** [X]. *Do:* use an eyebrow at most once per page. Small uppercase belongs on sidebar section labels only.
12. **No "everything hover-scales" and no fade-up on every scroll section** [X]. *Do:* use purposeful motion: press scale .97 on buttons, sliding indicators, and origin-aware popovers (`motion.md` §5). Reveal on scroll only once and only for hero-level content.
13. **No rainbow or neon palettes and no several competing accents** [X][seen]. *Do:* use one accent, and semantic green/red only for deltas.
14. **No uneven, eyeballed spacing** [X: "uneven spacing… out"]. *Do:* use a strict 4px grid and keep larger gaps between groups than within groups.
15. **No generic beige/cream "AI warm" background or pure-white flatness by default** [X]. *Do:* use a cool neutral canvas `#F7F7F7`/`#FAFAFA` with white panels, or a deliberate brand tone.
16. **No buzzword copy** ("Build faster with AI", "Supercharge your workflow") and no em-dash-heavy marketing voice [X]. *Do:* write concrete, plain, product-specific copy.
17. **No bento grid unless the content is truly heterogeneous** [X]. *Do:* let the content decide the layout.
18. **No glassmorphism by default** [seen in the old list; sentiment groups it with "glow"]. *Do:* use solid surfaces, and blur only for overlays over imagery.
19. **No twin CTAs and no filler cards** ("Get started" + "Learn more" side by side, a fourth stat card to fill the row, an icon in a rounded square on every card) [X]. *Do:* one primary action per view; as many cards as there are real numbers.
20. **No "Welcome back, Alex! 👋" and no exclamation-mark copy** [X]. *Do:* lead with the user's work ("3 deals close this week").
21. **No `"No data"` empty states** [X]. *Do:* say what will appear here and give the action that makes it appear; test with zero items, one item and very long names.
22. **No dead UI** [X]. *Do:* see `motion.md` §6, "Every control does something". Click through every control before you hand it over.

The old list still applies: white text on saturated pills, 600ms+ transitions, scale-from-0 popovers, bouncy springs everywhere, and 1px `#D1D5DB` borders on every box.

**Sentiment sources (X, Oct–Nov 2026):**
- https://x.com/shipper_now/status/2110637576935891122 (≈2.1k likes: no emojis, no "🟢 LIVE" badges, 0 blue/purple gradients)
- https://x.com/tomilola_ng/status/2114078495487729986 (≈190 likes: avoid default Lucide icons and default shadcn colours)
- https://x.com/future_coded/status/2111403845779931591 (same default purple gradient homepage)
- https://x.com/denizdoingstuff/status/2114407641963237633 (lucide everywhere, shadcn grays, one font size/tracking everywhere, same gradient hero)
- https://x.com/tanujbuilds/status/2115834588551594431 (emoji-icon feature cards, "Sarah K., Founder" testimonial)
- https://x.com/AnylancerInc/status/2114401436071043088 (label above every heading, spaced caps, one coloured word, card in a card)
- https://x.com/erramix01/status/2113937292863602955 (radial orbs, dot grids, bento, neon, drop shadows on everything)
- https://x.com/lokidotdev/status/2117188486034063507 (everything hover-scales, 6 font weights)
- https://x.com/_def/status/2115188253863071921 (untuned type, emoji status pills; tabular nums, 4px grid, one accent)
- https://x.com/Zephyr_hg/status/2117371426600784071 (a checkable banned list beats "make it clean"; twin CTAs, fake "10K+" proof)
- https://x.com/preetsuthar17/status/2117540786791493802 (twin CTAs, second primary button, "no data" empty states)
- https://x.com/sinanyorulmazz/status/2116531845839851723 (design checker flags a removed focus ring as an error, "Welcome back 👋" copy)
- https://x.com/equalworld_ai/status/2117349679700623510 (a stray `outline: none` is one of the most common quiet regressions)
- https://x.com/Mr_Buzzoni/status/2106320604634702070 (dead buttons, errors next to the field, keyboard-only pass, real loading/empty/error screens)
- https://x.com/keviduk/status/2109645687176495258 (group background-job toasts; errors must not collapse)

Not found in X posts (Aug–Nov 2026) and tagged [expert] here instead: tooltip delays, double focus rings on composite fields, sidebar collapse/resize.
