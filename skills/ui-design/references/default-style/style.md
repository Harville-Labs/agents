# Default style

Use this style only when the repository has no design source of its own (see "Find the style" in [SKILL.md](../../SKILL.md#find-the-style)). It is quiet, near-monochrome product UI: careful typography, soft layered shadows instead of heavy borders, one confident accent color, and motion that is fast, physical, and never decorative.

## Philosophy

1. **If it can be removed, remove it.** Every screen, component, and frame. Simple is hard, and simple wins.
2. **Typography does the heavy lifting.** One family and **at most 2 weights**.
3. **White, black, and shadows.** Most of the palette is neutral greys. Color is used for meaning, like state, category, or the one primary action.
4. **Depth comes from soft layered shadows and hairlines, not thick borders.** A button needs about 3 shadows, not a border (see the button recipe in [components.md](components.md#secondary-button)).
5. **Motion is part of the product, not decoration.** Micro-interactions throughout, a subtle loading animation, not overdone.
6. **Craft the last 10% by hand.** The QA round in [qa.md](../method/qa.md) is that last 10%.
7. **Clean beats clever.** Even when there's a lot of data, the screen should feel calm.

## Typography

- **Families:** Inter by default on the web, Geist as an alternative. SF Pro Rounded (or `ui-rounded`, or Google Sans Rounded cross-platform) for iOS-feel mobile. A **monospace** (Geist Mono-like) for big numbers, tickers, and code. Brand and marketing work can use a **serif display** face (editorial transitional serif, light weight).
- **Tracking** (the same for Inter and Geist):
  - 16px → 0%
  - 36px → −3%
  - 100px+ → −5% to −6%
  - Never go negative on body text. At 100px+ the default spacing looks loose.
  - SF Pro Rounded: +1%.
- **Weights:** Regular (400) and Medium (500) carry nearly all product UI. Semibold (600) is for headings and numbers. Bold/Black only for large display headlines.
- **Sizes in product UI:** body and table text 13–14px, secondary/meta 12–13px, section labels 11–12px uppercase or small-caps grey (e.g. "WORKSPACE", "PINNED TOOLS"), page titles 18–24px Medium, KPI numbers 24–32px, hero headlines 48–72px with negative tracking. Buttons are 14px Medium.
- **Color of text:** primary near-black (#171717–#1F1F1F), secondary mid-grey (#6B6B6B–#737373), tertiary/placeholder (#A3A3A3). Tags use **dark tinted text on a light tint** instead of white text on saturated fills, because dark text reads better.

## Color

| Role | Light | Dark |
|---|---|---|
| Canvas / page | `#FFFFFF` | `#0D0D0D`–`#121212` |
| Subtle surface (sidebar, panels, mobile bg) | `#F7F7F7` / `#F4F4F4` / `#FAFAFA` | `#1A1A1A`–`#1E1E1E` |
| Presentation backdrop behind mockups | `#E5E5E5`–`#EDEDED`, mid grey `#8A8A8A` | `#1F1F1F`–`#262626` |
| Hairline border | `#ECECEC` / `#EBEBEB` | `rgba(255,255,255,0.08)` |
| Primary text | `#171717` | `#FAFAFA` |
| Secondary text | `#737373` | `#A1A1A1` |

**Accents** (one per product, never several at once). Pick the one that fits the domain: finance takes blue or black, creative takes violet, data and ops take teal or orange, playful consumer takes coral or lime.
- Violet `#7B3AEC`, or an indigo `#5B5BF0` variant
- Blue `#255CD1` / iOS blue `#2F7BF6`
- Orange `#FF5A1F` / `#F97316`
- Teal `#0F766E`
- Lime `#B4F05A` on near-black
- Coral/red `#F2435A`
- Pure black `#0A0A0A` as the primary button color in neutral apps

**Semantic tints:** green `#16A34A` text on `#ECFDF3`; red `#DC2626` on `#FEF2F2`; amber/orange on `#FFF4E5`; blue on `#EEF4FF`. Avatar initials sit on pastel circles with darker same-hue text ("SW", "AJ", "MP").

**Gradients:** rare. Buttons get a subtle top-to-bottom gradient (`#FFFFFF → #F7F7F7` for secondary; a slightly lighter top for primary). Hero art can use blurred multi-color blobs with Plus-Darker blending plus a **noise/grain overlay**, when it is art-directed.

## Shape, spacing, depth

- **Radii:** small controls and buttons 8–10px; inputs 10–12px; cards 12–16px; modals and command palettes 20–24px; mobile sheets and phone cards 24–32px; pills and chips fully rounded. Mobile buttons are often full pills.
- **Spacing:** a 4px base grid. Common gaps are 4/8/12/16/24/32/48. Lots of air around content; dense tables still get ~40–48px rows.
- **Control heights:** compact desktop buttons 30–32px, standard 36–40px, mobile primary CTA 48–56px.
- **Borders:** 1px hairlines in very light grey. Often the border is **made from a 0-blur 1px spread shadow** instead of `border`.
- **Shadows:** secondary button = `0 1px 2px rgba(40,40,40,.08), 0 0 0 1px #ECECEC`. Floating surfaces (popovers, palettes, tooltips) use a large, very soft ambient shadow plus a hairline. Dark tooltips and toasts sit over light UIs.
- **Mobile:** artboard 430×932, round 40–44px icon buttons in the top bar, grouped "inset" list cards on a grey canvas, floating pill tab bars.

## Layout patterns

- **SaaS app shell:** left sidebar (220–260px) on a subtle grey, grouped nav with small uppercase grey labels, active item = white pill with soft shadow (light) or `#1E1E1E` fill (dark); main content on white with a thin top bar (breadcrumb `Home > Transaction`, search with `/` hint, icon buttons). Sometimes a slim icon rail (48–56px) instead. Full recipe in [sidebar.md](sidebar.md).
- **Filter-chip row** above tables: `Range Last 30 days ▾`, `Scope All tools ▾`. The label is grey and the value is dark.
- **Tables:** no zebra stripes, hairline row dividers, small grey header text, tinted status pills, avatar + name + email stacks, right-aligned numbers, tabular figures.
- **KPI cards:** label, big number (often mono), delta pill (`▲ +14.7% vs last year`).
- **Auth/onboarding:** split card. Form on the left (logo in a soft circle, title, subtitle, Google button, "or" divider, input, primary), product preview on the right in a grey panel with carousel dots.
- **Command palette:** 24px radius, search row with `ESC` keycap, filter pills, grouped results, keyboard legend footer.
- **Mobile onboarding:** segmented progress bar + "1/5", centered bold question, selectable option rows with circle checks, sticky pill CTA.
- **Landing heroes:** floating pill navbar, small "Backed with X" badge, short punchy headline (sometimes all-caps grotesk, sometimes a serif), dark primary + white secondary button, big illustration underneath.

## Iconography and illustration

- Icons: thin-stroke outline icons (Phosphor-like, ~1.5px stroke, 16–18px in UI), grey by default, darker when active.
- Small colored **app-icon tiles** (rounded squares with a gradient and a glyph) for feature cards and categories.
- Illustration styles: (a) **isometric line art** on a dashed grid, monochrome; (b) **vivid gradient ribbons/streams** on a grainy pastel background with an isometric grid and floating confetti; (c) friendly flat-shaded spot illustrations for consumer and mobile apps; (d) skeuomorphic touches (a stitched leather wallet holding a card).
- Hero illustrations are drawn in a design tool, animated in Rive or After Effects (exported to Lottie), then embedded.

## Dark and light

Ship matching light and dark sets from the same tokens. Light is the default for productivity SaaS. Dark suits crypto/trading, code editors, and marketing banners. Dark surfaces step up in ~6–10 lightness increments (`#0D0D0D → #121212 → #1A1A1A → #222`), not pure black everywhere.

## Tokens

Paste this into the global stylesheet. Tailwind users can map these in `@theme` (v4) or `theme.extend` (v3).

```css
:root {
  /* Type */
  --font-sans: "Inter", "Geist", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  --font-mono: ui-monospace, "Geist Mono", "SF Mono", Menlo, monospace;
  --font-rounded: "SF Pro Rounded", ui-rounded, "Google Sans Rounded", var(--font-sans);

  --text-xs: 12px;   --text-sm: 13px;  --text-base: 14px; --text-md: 16px;
  --text-lg: 18px;   --text-xl: 24px;  --text-2xl: 32px;  --text-3xl: 48px;
  --text-4xl: 64px;  --text-5xl: 96px;
  --tracking-body: 0;       /* <= 16px */
  --tracking-tight: -0.01em;/* 18–24px */
  --tracking-title: -0.03em;/* ~36px */
  --tracking-display: -0.055em; /* 100px+ */
  --weight-regular: 400; --weight-medium: 500; --weight-semibold: 600;

  /* Neutrals (light) */
  --bg: #ffffff;
  --bg-subtle: #f7f7f7;
  --bg-muted: #f0f0f0;
  --bg-backdrop: #e8e8e8;
  --border: #ececec;
  --border-strong: #e0e0e0;
  --fg: #171717;
  --fg-secondary: #737373;
  --fg-tertiary: #a3a3a3;
  --fg-inverse: #ffffff;

  /* Accent: pick ONE per product */
  --accent: #7b3aec;             /* violet; alternatives: #255cd1 blue, #ff5a1f orange, #0a0a0a black */
  --accent-hover: color-mix(in oklab, var(--accent), black 8%);
  --accent-soft: color-mix(in oklab, var(--accent), white 90%);
  --accent-fg: #ffffff;
  --ring: color-mix(in oklab, var(--accent), transparent 65%);

  /* Semantic (dark text on soft tint) */
  --success: #16a34a; --success-soft: #ecfdf3;
  --danger:  #dc2626; --danger-soft:  #fef2f2;
  --warning: #d97706; --warning-soft: #fff7e6;
  --info:    #2563eb; --info-soft:    #eef4ff;

  /* Spacing (4px grid) */
  --space-1: 4px; --space-2: 8px; --space-3: 12px; --space-4: 16px;
  --space-5: 20px; --space-6: 24px; --space-8: 32px; --space-10: 40px;
  --space-12: 48px; --space-16: 64px; --space-24: 96px;

  /* Radii */
  --radius-xs: 6px; --radius-sm: 8px; --radius-md: 10px; --radius-lg: 12px;
  --radius-xl: 16px; --radius-2xl: 20px; --radius-3xl: 24px; --radius-full: 9999px;

  /* Heights */
  --h-control-sm: 30px; --h-control: 36px; --h-control-lg: 44px; --h-cta-mobile: 52px;

  /* Shadows (layered, soft; hairline via spread) */
  --hairline: 0 0 0 1px var(--border);
  --shadow-xs: 0 1px 2px rgb(40 40 40 / 0.08);
  --shadow-btn: 0 1px 2px rgb(40 40 40 / 0.08), 0 0 0 1px #ececec;
  --shadow-btn-primary: inset 0 1px 0 rgb(255 255 255 / 0.18), 0 1px 2px rgb(0 0 0 / 0.16), 0 0 0 1px color-mix(in oklab, var(--accent), black 12%);
  --shadow-card: 0 1px 2px rgb(0 0 0 / 0.04), 0 0 0 1px var(--border);
  --shadow-pop: 0 0 0 1px rgb(0 0 0 / 0.06), 0 8px 24px -4px rgb(0 0 0 / 0.10), 0 2px 6px rgb(0 0 0 / 0.04);
  --shadow-modal: 0 0 0 1px rgb(0 0 0 / 0.06), 0 24px 64px -12px rgb(0 0 0 / 0.18);
  --shadow-focus: 0 0 0 3px var(--ring);

  /* Motion: see ../method/motion.md */
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
  --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
  --ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);
  --ease-standard: cubic-bezier(0.2, 0, 0, 1);
  --dur-instant: 100ms; --dur-fast: 150ms; --dur-base: 200ms;
  --dur-moderate: 250ms; --dur-slow: 350ms; --dur-page: 500ms;
}

[data-theme="dark"], .dark {
  --bg: #0d0d0d;
  --bg-subtle: #141414;
  --bg-muted: #1c1c1c;
  --bg-backdrop: #0a0a0a;
  --border: rgb(255 255 255 / 0.08);
  --border-strong: rgb(255 255 255 / 0.14);
  --fg: #fafafa;
  --fg-secondary: #a1a1a1;
  --fg-tertiary: #6b6b6b;
  --shadow-btn: inset 0 1px 0 rgb(255 255 255 / 0.06), 0 0 0 1px rgb(255 255 255 / 0.08);
  --shadow-card: 0 0 0 1px rgb(255 255 255 / 0.07);
  --shadow-pop: 0 0 0 1px rgb(255 255 255 / 0.08), 0 16px 40px -8px rgb(0 0 0 / 0.6);
}

html { -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; }
body { font-family: var(--font-sans); font-size: var(--text-base); color: var(--fg); background: var(--bg);
       font-feature-settings: "cv11", "ss01"; }
.tabular { font-variant-numeric: tabular-nums; }
```

Tracking helper: `h1{font-size:var(--text-4xl);letter-spacing:var(--tracking-display);line-height:1.02}`. Line-height rule of thumb: body 1.5, UI labels 1.3, headings 1.1, display 1.0–1.05.

## Style checks

The verification round in [qa.md](../method/qa.md#verification-round) runs these when the default style applies. Each passes or fails.

- [ ] **Palette:** one accent from the list above, everything else neutral or a semantic tint. No hex outside the tokens.
- [ ] **Depth:** hairlines come from light borders or spread shadows. No harsh borders. Shadows are layered and soft, on elevated layers only.
- [ ] **Radii:** controls 8–10, cards 12–16, overlays 20–24.
- [ ] **Tags:** dark text on a light tint, never white on a saturated fill.
- [ ] **Icons:** stroke 1.5 at 16, 18, or 20px.
- [ ] **Sidebar** (if present): passes the Common mistakes in [sidebar.md](sidebar.md#common-mistakes). It is cleanly **inset** (sidebar on the tinted app background with no fill of its own; content a panel with an even ~8px gap to the top, right and bottom edges, 12–16px radius on all 4 corners, a subtle ring/shadow, and its own scroll) or cleanly **flush** (sidebar on its own surface, one hairline, content edge to edge), never a mix. It has a quiet active pill, a footer pinned to the bottom, and becomes a drawer or tab bar on mobile.
- [ ] **Reference:** the desktop shot sits beside one similar file from [images.md](images.md) without looking foreign.
