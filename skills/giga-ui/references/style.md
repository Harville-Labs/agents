# Style and tokens

> Provenance legend used below:
> **[seen]** directly observed in his posts/images or stated in his captions.
> **[inferred]** a reasonable extrapolation from what was seen (measured from screenshots, or implied).
> **[expert]** general motion/UX best practice from Motion docs, Emil Kowalski, Apple HIG. Not from his posts.

## 1. Design philosophy

1. **If it can be removed, remove it.** [seen, caption: "every screen. every component. every frame. if it doesn't need to be there, it shouldn't be. simple is always hard, but simple always wins."]
2. **Typography does the heavy lifting.** [seen: "just master typography and you can make anything look good."] Use one family (Inter by default on the web, Geist as an optional alternative; SF Pro Rounded for iOS-flavored mobile) and **at most 2 weights** [seen: "sf pro rounded, maximum 2 font weights, keep it simple"].
3. **White, black, and shadows.** [seen: "No animations, no gradients, no fancy effects. Just FFFFFF, 000000, and some shadows. This is design at its peak."] Most of the palette is neutral greys. Color is used for meaning, like state, category, or the one primary action.
4. **Depth comes from soft layered shadows and hairlines, not thick borders.** [seen: "this button only requires 3 shadows!" and the secondary-button recipe in `components.md` §4.1]
5. **Motion is part of the product, not decoration.** [seen: "micro-interactions throughout", "subtle loading animation. not overdone, just perfect", "every website needs this level of animation", "idea → design → animation"]. Animate only to explain a change, confirm an action, or guide attention [expert].
6. **Craft the last 10% by hand.** [seen: his process is "design in figma, build with the help of claude, spend hours fixing small details manually and improving code quality"]. The QA checklist in `qa.md` is that last 10%.
7. **Clean beats clever.** His captions keep returning to the words "clean", "calm", and "simple" (for example, "Every task in one calm list"). Even when there's a lot of data, the screen should feel calm.

---

## 2. The observed style (what his work actually looks like)

### 2.1 Typography
- **Families:** Inter (the default in this skill) and Geist (optional alternative). [seen: "After using 100s of different fonts, I realized nothing beats Inter and Geist."; joke post: junior and senior designers both use "Inter, Geist"]. SF Pro Rounded for mobile apps [seen, several posts]. He also recommends Google Sans Rounded as a cross-platform alternative to SF Pro Rounded [seen, reply]. A **monospace** (Geist Mono-like) shows up for big numbers, tickers, and code [seen: crypto app balances, Statsnap KPI cards, sidebar nav variant]. Brand and marketing work sometimes uses a **serif display** face (editorial transitional serif, light weight) [seen: fintech landing "Every payment protected…", VC landing page].
- **Tracking (his exact numbers, demoed with Geist; apply the same to Inter, which he also demoed at −6%)** [seen]:
  - 16px → 0%
  - 36px → −3%
  - 100px+ → −5% to −6%
  - "The never-go-negative rule is for body text. At 100px+ the default spacing looks loose."
  - SF Pro Rounded: +1% letter spacing [seen, type specimen].
- **Weights:** Regular (400) and Medium (500) carry nearly all product UI. Semibold (600) is for headings and numbers. Bold/Black only for large display headlines [inferred from screenshots].
- **Sizes in product UI** [inferred, measured from screenshots at 1×]: body and table text 13–14px, secondary/meta 12–13px, section labels 11–12px uppercase or small-caps grey (e.g. "WORKSPACE", "PINNED TOOLS"), page titles 18–24px Medium, KPI numbers 24–32px, hero headlines 48–72px with negative tracking. Buttons are 14px Medium [seen: "Geist/14/Medium"].
- **Color of text:** primary near-black (#171717–#1F1F1F), secondary mid-grey (#6B6B6B–#737373), tertiary/placeholder (#A3A3A3). Tags use **dark tinted text on a light tint** instead of white text on saturated fills [seen: "Do / Don't" post: "Dark text improves overall readability greatly."].

### 2.2 Color
Sampled from screenshots (approximate) [seen/inferred]:

| Role | Light | Dark |
|---|---|---|
| Canvas / page | `#FFFFFF` | `#0D0D0D`–`#121212` |
| Subtle surface (sidebar, panels, mobile bg) | `#F7F7F7` / `#F4F4F4` / `#FAFAFA` | `#1A1A1A`–`#1E1E1E` |
| Presentation backdrop behind mockups | `#E5E5E5`–`#EDEDED`, mid grey `#8A8A8A` | `#1F1F1F`–`#262626` |
| Hairline border | `#ECECEC` / `#EBEBEB` | `rgba(255,255,255,0.08)` |
| Primary text | `#171717` | `#FAFAFA` |
| Secondary text | `#737373` | `#A1A1A1` |

**Accents** (one per product, never several at once) [seen]:
- Violet `#7B3AEC` (Underlay signup, onboarding), also an indigo `#5B5BF0` variant
- Blue `#255CD1` / iOS blue `#2F7BF6` (calculator, calendar, Statsnap)
- Orange `#FF5A1F` / `#F97316` (Plunio, Nexora)
- Teal `#0F766E`-ish (AI pipeline, AIData)
- Lime `#B4F05A` on near-black (code editor "Start" button, Soma brand)
- Coral/red `#F2435A` (sleep app)
- Pure black `#0A0A0A` as the primary button color in neutral apps (sleep app, calculator "=", "Deploy v13", "New event") [seen]

**Semantic tints** [seen]: green `#16A34A` text on `#ECFDF3`; red `#DC2626` on `#FEF2F2`; amber/orange on `#FFF4E5`; blue on `#EEF4FF`. Avatar initials sit on pastel circles with darker same-hue text ("SW", "AJ", "MP").

**Gradients:** used rarely but well [seen: "the art of using gradients"]. Buttons get a subtle top-to-bottom gradient (`#FFFFFF → #F7F7F7` for secondary; a slightly lighter top for primary). Hero art uses blurred multi-color blobs with Plus-Darker blending plus a **noise/grain overlay** [seen: hero illustration thread].

### 2.3 Shape, spacing, depth
- **Radii** [seen and inferred]: small controls and buttons 8–10px [seen: "30px height, 10px radius"]; inputs 10–12px; cards 12–16px; modals and command palettes 20–24px; mobile sheets and phone cards 24–32px; pills and chips fully rounded. Mobile buttons are often full pills [seen].
- **Spacing:** a 4px base grid. Common gaps are 4/8/12/16/24/32/48 [inferred]. Lots of air around content; dense tables still get ~40–48px rows [inferred].
- **Control heights** [seen/inferred]: compact desktop buttons 30–32px, standard 36–40px, mobile primary CTA 48–56px.
- **Borders:** 1px hairlines in very light grey. Often the border is **made from a 0-blur 1px spread shadow** instead of `border` [seen: secondary button recipe].
- **Shadows** [seen]: secondary button = `0 1px 2px rgba(40,40,40,.08), 0 0 0 1px #ECECEC`. Floating surfaces (popovers, palettes, tooltips) use a large, very soft ambient shadow plus a hairline. Dark tooltips sit over light UIs [seen: Statsnap chart tooltip, "Task completed · Undo" toast].
- **Mobile:** artboard 430×932 [seen], round 40–44px icon buttons in the top bar, grouped "inset" list cards on a grey canvas, floating pill tab bars [seen].

### 2.4 Layout patterns [seen]
- **SaaS app shell:** left sidebar (220–260px) on a subtle grey, grouped nav with small uppercase grey labels, active item = white pill with soft shadow (light) or `#1E1E1E` fill (dark); main content on white with a thin top bar (breadcrumb `Home > Transaction`, search with `/` hint, icon buttons). Sometimes there's a slim icon rail (48–56px) instead.
- **Filter-chip row** above tables: `Range Last 30 days ▾`, `Scope All tools ▾`. The label is grey and the value is dark.
- **Tables:** no zebra stripes, hairline row dividers, small grey header text, tinted status pills, avatar + name + email stacks, right-aligned numbers, tabular figures.
- **KPI cards:** label, big number (often mono), delta pill (`▲ +14.7% vs last year`).
- **Auth/onboarding:** split card. Form on the left (logo in a soft circle, title, subtitle, Google button, "or" divider, input, primary), product preview on the right in a grey panel with carousel dots [seen: "just designed the perfect signup page"].
- **Command palette:** 24px radius, search row with `ESC` keycap, filter pills, grouped results, keyboard legend footer [seen].
- **Mobile onboarding:** segmented progress bar + "1/5", centered bold question, selectable option rows with circle checks, sticky pill CTA [seen].
- **Landing heroes:** floating pill navbar, small "Backed with X" badge, short punchy headline (sometimes all-caps grotesk, sometimes a serif), dark primary + white secondary button, big illustration underneath [seen].

### 2.5 Iconography and illustration [seen]
- Icons: thin-stroke outline icons (Lucide/Phosphor-like, ~1.5px stroke, 16–18px in UI), grey by default, darker when active.
- Small colored **app-icon tiles** (rounded squares with a gradient and a glyph) for feature cards and categories.
- Illustration styles: (a) **isometric line art** on a dashed grid, monochrome; (b) **vivid gradient ribbons/streams** on a grainy pastel background with an isometric grid and floating confetti; (c) friendly flat-shaded spot illustrations and 3D-ish emoji icons for consumer and mobile apps; (d) skeuomorphic touches (a stitched leather wallet holding a card).
- His animation pipeline: "Draw the illustrations in Figma → Animate in AE/Rive → Export to lottie if using AE → Implement onto the website". On one project he used "Figma… Rive for animation, Next.js + Sanity". Hero sections often take "design + illustration + animation" [seen].

### 2.6 Dark vs light [seen]
He uses both and ships matching sets ("light/dark mode", "figma tokens are so useful!"). Light is the default for productivity SaaS. Dark is used for crypto/trading, code editors, sidebars, and marketing banners. Dark surfaces step up in ~6–10 lightness increments (`#0D0D0D → #121212 → #1A1A1A → #222`), not pure black everywhere.

---

## 3. Design tokens (CSS variables)

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
  --tracking-title: -0.03em;/* ~36px  (his rule) */
  --tracking-display: -0.055em; /* 100px+ (his rule: -5% to -6%) */
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
  --shadow-btn: 0 1px 2px rgb(40 40 40 / 0.08), 0 0 0 1px #ececec;     /* his secondary button */
  --shadow-btn-primary: inset 0 1px 0 rgb(255 255 255 / 0.18), 0 1px 2px rgb(0 0 0 / 0.16), 0 0 0 1px color-mix(in oklab, var(--accent), black 12%);
  --shadow-card: 0 1px 2px rgb(0 0 0 / 0.04), 0 0 0 1px var(--border);
  --shadow-pop: 0 0 0 1px rgb(0 0 0 / 0.06), 0 8px 24px -4px rgb(0 0 0 / 0.10), 0 2px 6px rgb(0 0 0 / 0.04);
  --shadow-modal: 0 0 0 1px rgb(0 0 0 / 0.06), 0 24px 64px -12px rgb(0 0 0 / 0.18);
  --shadow-focus: 0 0 0 3px var(--ring);

  /* Motion: see motion.md */
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);       /* strong ease-out (Emil Kowalski) */
  --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);   /* for on-screen movement */
  --ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);    /* iOS-like sheet (Vaul) */
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

Tracking helper: `h1{font-size:var(--text-4xl);letter-spacing:var(--tracking-display);line-height:1.02}`. Line-height rule of thumb: body 1.5, UI labels 1.3, headings 1.1, display 1.0–1.05 [expert].
