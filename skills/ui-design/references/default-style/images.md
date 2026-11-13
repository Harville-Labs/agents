# Reference images

The default style's reference screenshots. Compare your desktop shot with one of these in the verification round. The images come from public posts by @marcelkargul (Kargul Studio) and are included for style reference only. This skill is not affiliated with him.

## Screens

| File | Why it matters |
|---|---|
| [2026-11-03_2117435880021561852_1](images/2026-11-03_2117435880021561852_1.jpg) | "Perfect signup page": split auth card, violet `#7B3AEC` CTA, soft hairline inputs, product preview with carousel dots. |
| [2026-10-30_2116131638916854067_1](images/2026-10-30_2116131638916854067_1.jpg) | Step-by-step secondary button: 30px, 10px radius, Geist 14 Medium, `#FFF→#F7F7F7`, two shadows (exact values). |
| [2026-10-11_2109273659038650501_1](images/2026-10-11_2109273659038650501_1.jpg) | Geist tracking demo at 100px: −6% vs −3% vs 0. Basis of the tracking rules. |
| [2026-10-13_2110066751866089488_1](images/2026-10-13_2110066751866089488_1.jpg) | SF Pro Rounded at +1% letter spacing, the mobile typeface. |
| [2026-10-06_2107619825719910460_2](images/2026-10-06_2107619825719910460_2.jpg) | Command palette: 24px radius, filter pills, grouped results, keycap legend footer. |
| [2026-10-26_2114761395946311853_1](images/2026-10-26_2114761395946311853_1.jpg) | Statsnap dashboard: sidebar shell, mono KPI numbers, delta pills, dark chart tooltip, clean table. |
| [2026-10-03_2106500278157795628_1](images/2026-10-03_2106500278157795628_1.jpg) | Mobile calendar: grey canvas, inset white cards, round icon buttons, pastel event blocks, blue pill CTA. |
| [2026-10-03_2106500391672393990_1](images/2026-10-03_2106500391672393990_1.jpg) | Dark crypto app: `#0D0D0D` base, `#1A1A1A` cards, mono prices, floating pill tab bar. |
| [2026-10-29_2115949035009814905_1](images/2026-10-29_2115949035009814905_1.jpg) | Do/Don't: tinted tags with dark text beat white text on saturated fills. |
| [2026-10-31_2116628486571938143_1](images/2026-10-31_2116628486571938143_1.jpg) | Sleep tracker: black pill CTAs, coral accent, segmented settings lists, theme/color pickers. |
| [2026-11-01_2116933228481433739_1](images/2026-11-01_2116933228481433739_1.jpg) | Landing hero: floating pill nav, grainy gradient ribbons on isometric grid, dark plus white CTAs. |
| [2026-10-25_2114315909817065784_1](images/2026-10-25_2114315909817065784_1.jpg) | Mobile onboarding: segmented progress, selectable rows with check circles, violet pill CTA. |

## Sidebars

`images/sidebars/` contains 36 sidebar and nav-rail examples. Look at 2–3 of them before you build any app shell. Recommended starting points:

| File | Why it matters |
|---|---|
| [2026-10-03_2106499785813360687_1](images/sidebars/2026-10-03_2106499785813360687_1.jpg) | Snaplytics: switcher, search with `/` keycap, sentence-case groups, color-swatch projects, grey active pill. |
| [2026-10-03_2106500336081063986_1](images/sidebars/2026-10-03_2106500336081063986_1.jpg) | Timelines: "+ New timeline" button, nested Reports children, grey sidebar against white content. |
| [2026-10-14_2110467790343737666_3](images/sidebars/2026-10-14_2110467790343737666_3.jpg) | Uniops: uppercase group labels, active item with `›`, pinned tools with drag handles. |
| [2026-10-22_2113384174924988778_1](images/sidebars/2026-10-22_2113384174924988778_1.jpg) | Minto: dashed dividers, rounded active pill, content panel floating on the right. |
| [2026-10-24_2113997498008117362_1](images/sidebars/2026-10-24_2113997498008117362_1.jpg) | macOS-window app: footer links pinned bottom, translucent sidebar, white content panel. |
| [2026-10-07_2107869459142914419_1](images/sidebars/2026-10-07_2107869459142914419_1.jpg) | Icon rail (≈8 icons, 2 groups) + list column + detail: the collapsed-rail pattern. |
| [2026-10-06_2107505914345603127_1](images/sidebars/2026-10-06_2107505914345603127_1.jpg) | Dark actions panel: uppercase labels, colored icons, drag-lifted item, `›` footer row. |
| [2026-10-04_2106852842342375894_1](images/sidebars/2026-10-04_2106852842342375894_1.jpg) | Close-up: black active pill with white label and count badge. |

## Sources
- Anti-slop rules: public X posts on AI-built UI tells, October and November 2026.
- @marcelkargul (Kargul Studio) posts and captions on X: the default style, its typography rules, the button recipe, and the reference images. The default style is **inspired by** his work.
- Motion docs, Transitions: https://motion.dev/docs/react-transitions (tween default 0.3s; spring `bounce` default 0.25; `visualDuration`; inertia `power 0.8`, `timeConstant 700`; `stagger` with `grid`/`from`).
- Emil Kowalski, "Great Animations": https://emilkowal.ski/ui/great-animations (ease-out, < 300ms, transform/opacity, interruptibility, reduced motion, no animation on keyboard actions). Also his easing curves `cubic-bezier(0.23,1,0.32,1)` and `(0.77,0,0.175,1)` and the Vaul drawer curve `(0.32,0.72,0,1)`.
- Apple Human Interface Guidelines, Motion and Accessibility (purposeful motion, honor Reduce Motion, 44pt targets) and SwiftUI spring presets (`smooth`/`snappy`/`bouncy`).
