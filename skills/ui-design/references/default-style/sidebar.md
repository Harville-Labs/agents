# Sidebar and nav rail

Models tend to get sidebars wrong. Read this whole recipe before you write a sidebar in the default style, then compare your result with 2 or 3 files in `images/sidebars/`. Pixel values measured from screenshots are ratios, not exact values.

**Two good shells. Pick one per product; neither is the default.**
- **Inset:** the app background is tinted (`#F7F7F7`–`#F4F4F5` light, or the app base in dark). The sidebar has **no background of its own** and shares that tint. The content sits in a separate panel: white (or `#0f0f0f`–`#111` in dark), about 8px from the viewport top, right and bottom, radius 12–16px, a hairline plus a soft shadow (`0 0 0 1px rgb(0 0 0/.06), 0 1px 2px rgb(0 0 0/.04)`), with its own scroll. Suits calm products where the content should float: CRMs, inboxes, docs, AI chat.
- **Flush:** the sidebar is a full-height surface of its own, edge to edge, separated from the content by one hairline; the content is not inset. Suits dense tools that want every pixel: analytics, admin, IDE-like screens, embedded views. A flush sidebar is just as finished as an inset one when the rows, spacing and active pill are right.

Whichever you pick, everything below (rows, columns, pill, collapse) is the same.

## Anatomy

What the reference sidebars share (see `images/sidebars/` files for 2106499785813360687, 2106500336081063986, 2110467790343737666_3, 2113384174924988778, 2113997498008117362):
- **The sidebar is quieter than the content.** It sits on the canvas tone (`#F7F7F7`–`#FAFAFA` light, or the app's base in dark). The main content area is a white panel with a large radius and a hairline or soft shadow, so the *content* floats and the sidebar doesn't.
- **Top block:** a workspace or brand switcher. It has a 20–28px rounded-square logo, the name in Medium, sometimes a muted handle on a second line (`Uniops / @uniops`), and a small `⌄`/`⇅` chevron or a collapse icon (`⊟`/sidebar icon) at the right edge.
- **Search or primary action under the switcher.** Either a search input with a `/` keycap on the right (Snaplytics, Timelines), or a full-width white secondary button ("+ New timeline") that uses the [secondary button](components.md#secondary-button) recipe.
- **Section labels** are small and muted ("Navigation", "Reports & Management", "Other Tools", "Projects"). Some designs use sentence case. Others use small uppercase with tracking ("WORKSPACE", "UTILITY", "PINNED TOOLS", and "MESSAGES / DATA / DELAYS" in the dark Actions panel). Pick one style per product.
- **Items:** a 16px outline icon plus a 14px label in grey (`#525252`–`#737373`). There is no border, no background at rest, and the icons are monochrome. Color appears only for project dots or swatches (small rounded squares) and for brand logos of pinned tools.
- **Active item:** a soft grey fill pill (`#EDEDED`-ish on a `#F7F7F7` sidebar) or a white raised pill with a soft shadow, plus a darker label. High-contrast variants also work: a black pill with white text and a count badge (2106852842342375894), and a white rounded pill in a grey sidebar (Minto). There is **never** a left accent bar with a colored background.
- **Trailing meta** is right-aligned: counts in a small rounded badge or tabular grey numbers, a `›` chevron on the active item that opens a sub-view (Uniops "Team ›"), and `⠿` drag handles on pinned items.
- **Nesting:** child items are indented by roughly one icon width plus gap so that child icons line up under the parent's label. Children keep icons, and there are no tree lines (Timelines "Reports → All Reports, Performance Trends…").
- **Groups are separated by whitespace or a hairline divider.** In Minto the divider is a dashed hairline. Group gaps are clearly bigger than gaps between items.
- **Footer** is pinned to the bottom. It holds secondary links (Guide editor / Open docs / Back to home) or settings plus a round avatar.
- **Icon rail variant** (inbox app 2107869459142914419): a narrow rail with the logo tile at the top, a round "+" button, about 8 icon-only buttons in 2 groups split by a short hairline, an active icon in a soft tinted square, and settings plus an avatar at the bottom. A second "list" column (Inbox with filter pills) sits next to the rail.
- **Dark variant** (2107505914345603127): a `#1A1A1C` panel with 16–20px radius, uppercase muted section labels, and colored 16px icons. A dragged item lifts as a raised card with a grip `⠿`, and the footer row ends in `›`.

## Measurements
| Token | Value |
|---|---|
| Expanded width | 240–264px (≈ 16–18% of a 1440 canvas) |
| Collapsed rail width | 56–64px (Icon centred, 32–36px hit square) |
| Item height | 32px desktop (28 dense, 36 roomy) |
| Item radius | 8px (pill-like, matches control tier) |
| Item padding-x | 8–10px; icon→label gap 8px |
| Icon | 16px, stroke 1.5, same grey as label |
| Item gap | 2px between items; 16–24px between groups |
| Section label | 11–12px, Medium, `#A3A3A3`, 8px below previous group gap, 4px above first item |
| Sidebar padding | 12px horizontal, 12–16px top |
| App background | Tinted `#F7F7F7`/`#F4F4F5`; the sidebar has no fill of its own and shares this tint |
| Inset main panel | margin 8px top/right/bottom (8px gap from sidebar optional), radius 12–16, white, 1px `rgb(0 0 0/.06)` ring + `0 1px 2px rgb(0 0 0/.04)` shadow, `overflow:auto` inside |
| Mobile panel | Inset removed below 768px (margin 0, radius 0); sidebar becomes a drawer |

## Behavior and motion
- **Hover:** the background goes to `rgb(0 0 0 / .04)` and the label goes to `#171717` within 120ms. There is no movement and no scale on nav items.
- **Active change:** one shared pill slides between items using the [sliding indicator](../method/motion.md#sliding-indicator) recipe (`layoutId` spring `visualDuration .25, bounce .15` in Motion, a measured pill in Svelte or plain CSS). Do not fade one pill out while another fades in. Measure against the scroll container, and skip the transition on first paint so the pill doesn't fly in from the top. Items need `position: relative` to paint above it.
- **Rows share two columns.** Every row (switcher, nav items, settings, account) puts its icon, logo tile or avatar in one **icon column** and its text in one **text column**. With 10px sidebar padding and a 60px rail: 16px icons sit 12px into the row (centre 30px from the edge), 24px tiles and avatars 8px into the row (also centre 30px), and all text starts at 48px. Measure it (`getBoundingClientRect().left` on each icon and label) rather than eyeballing. Because the columns never move, collapsing to the rail is just hiding text.
- **Triggers are rows.** A workspace or account trigger is a full-width row button the same height and inset as the rows around it, with `text-align: start`. A narrower, shorter button whose label sits a few px off the nav labels below is the most common sidebar misalignment.
- **Collapse:** animate `width` (240→60) with 220ms `var(--ease-out)`. This is the one place where a width animation is acceptable. If you animate a CSS grid column, use `grid-template-columns`. Labels fade or clip with `opacity` over 120ms, and they must *not* wrap while shrinking (`white-space: nowrap; overflow: hidden`). Icons must not move horizontally, so keep a fixed icon column. In collapsed mode, show a tooltip on hover (right side, same delay as every other tooltip, see [interaction.md](../method/interaction.md#micro-interaction-checklist)) and show none on touch or when expanded. Save the collapsed state in localStorage. The toggle sits at the right of the switcher row while expanded and moves to the start of the topbar while collapsed; `⌘B` / `Ctrl+B` toggles from anywhere except rich-text fields, where it means bold.
- **Resize:** a resizable sidebar has an 8px invisible handle on its right edge (`cursor: col-resize`) that shows a 2px line only after ~150ms of hover, so passing the edge doesn't flash it. Drag with pointer capture and clamp between a min and max (e.g. 200–320px). Dragging well past the minimum (~56px) snaps it to the rail or closed, dragging back out reopens it. Double-click resets the width. Turn the width transition off while dragging so it tracks the pointer 1:1. Make the handle a focusable `role="separator"` with `aria-valuenow`, ←/→ to resize, and Enter to toggle.
- **Nesting:** expanding a group animates the height of the children (Motion `height: "auto"`) and rotates the chevron 90° in 150ms. Children stagger by 20ms at most.
- **Workspace switcher:** opens a [popover](components.md#popover--dropdown--command-palette) anchored to the switcher and scaling from 0.96 at its top-left origin. It lists workspaces with logo tiles and a check on the current one, followed by "Create workspace" and "Log out".
- **Keyboard:** the whole sidebar is a `<nav aria-label>`. Items are `<a>` with `aria-current="page"`, and a group toggle is a `<button aria-expanded>`. Focus-visible gets a 2px ring inside the pill.
- **Mobile (<768px):** hide the sidebar. Open it as a left drawer (85% width, max 320) over a dimmed `rgb(0 0 0 / .3)` scrim, slide it in with `translateX` 280ms `cubic-bezier(.32,.72,0,1)`, and close it by tapping the scrim, pressing Esc, or swiping. Items grow to 44px height. In consumer mobile apps use a **floating pill tab bar** with 4–5 items instead.

## Common mistakes

These show up in AI output. Fix all of them.
1. A shell that is neither inset nor flush: an inset panel with no radius or margin, an inset sidebar that also has its own fill and border, a heavy shadow on the panel, or the whole page scrolling instead of the panel. Flush done badly is the same white on both sides of a 1px border with no tonal difference; give the sidebar its own surface (`#FAFAFA`, or one step up in dark).
2. A colored active state (`bg-indigo-600 text-white`) or a 3px left accent bar.
3. Mixed icon sizes and styles, or emoji used as icons. Icons that are not vertically centered with the text.
4. Labels that wrap to two lines. Missing truncation (`text-overflow: ellipsis`).
5. The same spacing between every item, so groups don't read as groups. Or the opposite: huge 48px items.
6. Section labels in heavy bold, or at the same size and color as the items.
7. The footer floats mid-height because the sidebar isn't `height: 100dvh; display:flex; flex-direction:column` with a `margin-top:auto` footer.
8. Collapse animation where labels squish or wrap, icons jump sideways, or the content reflows in steps.
9. No hover, focus, or active differentiation. A missing `aria-current`.
10. Fifteen top-level items with no groups. Instead, group them into 3–4 sections of 3–6 items each and put rarely used links in the footer.

## Code

React, Motion, and Tailwind, with tokens from [style.md](style.md#tokens).
```tsx
const groups = [
  { label: "Workspace", items: [
    { id:"dash", label:"Dashboard", icon: LayoutGrid },
    { id:"inbox", label:"Inbox", icon: Inbox, count: 3 },
    { id:"team", label:"Team", icon: Users, children: [
      { id:"members", label:"Members", icon: User }, { id:"roles", label:"Roles", icon: Shield } ] } ] },
  { label: "Projects", items: [
    { id:"q4", label:"Q4 Growth Plan", swatch:"#7B3AEC" }, { id:"brand", label:"Brand Awareness", swatch:"#F5A524" } ] },
];

export function Sidebar({ active, onSelect }) {
  const [collapsed, setCollapsed] = useLocalStorage("sb-collapsed", false);
  const [open, setOpen] = useState<Record<string, boolean>>({ team: true });
  return (
    <motion.aside animate={{ width: collapsed ? 60 : 248 }} transition={{ duration: .22, ease: [.23,1,.32,1] }}
      className="sticky top-0 hidden h-dvh shrink-0 flex-col overflow-hidden bg-transparent px-3 pt-3 md:flex">{/* no own fill: shares the app tint */}
      {/* workspace switcher */}
      <div className="flex h-10 items-center gap-2 px-1">
        <button className="flex min-w-0 flex-1 items-center gap-2 rounded-lg px-1.5 py-1 hover:bg-black/[.04]">
          <span className="grid size-6 shrink-0 place-items-center rounded-md bg-[#171717] text-[11px] font-semibold text-white">A</span>
          {!collapsed && <span className="truncate text-[14px] font-medium tracking-[-0.01em] text-[#171717]">Acme Inc</span>}
          {!collapsed && <ChevronsUpDown className="ml-auto size-3.5 text-[#A3A3A3]" strokeWidth={1.5} />}
        </button>
        <button aria-label="Toggle sidebar" onClick={() => setCollapsed(!collapsed)}
          className="grid size-7 shrink-0 place-items-center rounded-md text-[#A3A3A3] hover:bg-black/[.04] hover:text-[#171717]">
          <PanelLeft className="size-4" strokeWidth={1.5} />
        </button>
      </div>
      <nav aria-label="Main" className="mt-3 flex flex-1 flex-col gap-5 overflow-y-auto">
        {groups.map((g) => (
          <div key={g.label}>
            {!collapsed && <div className="mb-1 px-2.5 text-[12px] font-medium text-[#A3A3A3]">{g.label}</div>}
            <ul className="flex flex-col gap-0.5">
              {g.items.map((it) => (
                <li key={it.id}>
                  <NavItem it={it} active={active} collapsed={collapsed}
                    onClick={() => it.children ? setOpen({ ...open, [it.id]: !open[it.id] }) : onSelect(it.id)}
                    expanded={it.children ? !!open[it.id] : undefined} />
                  <AnimatePresence initial={false}>
                    {it.children && open[it.id] && !collapsed && (
                      <motion.ul initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} transition={{ duration: .2, ease: [.23,1,.32,1] }}
                        className="ml-[26px] flex flex-col gap-0.5 overflow-hidden pt-0.5">
                        {it.children.map((c) => <li key={c.id}><NavItem it={c} active={active} onClick={() => onSelect(c.id)} /></li>)}
                      </motion.ul>)}
                  </AnimatePresence>
                </li>))}
            </ul>
          </div>))}
      </nav>
      {/* footer / user block */}
      <div className="mt-auto flex items-center gap-2 border-t border-black/[.06] px-1 py-3">
        <img src="/avatars/maya.jpg" alt="" className="size-7 shrink-0 rounded-full" />
        {!collapsed && <div className="min-w-0 leading-tight"><div className="truncate text-[13px] font-medium text-[#171717]">Maya Patel</div>
          <div className="truncate text-[12px] text-[#A3A3A3]">maya@acme.co</div></div>}
      </div>
    </motion.aside>
  );
}

function NavItem({ it, active, collapsed = false, onClick, expanded }) {
  const isActive = active === it.id;
  return (
    <button onClick={onClick} aria-current={isActive ? "page" : undefined} aria-expanded={expanded}
      /* collapsed: wrap this button in your Tooltip primitive (side="right"), not `title` */
      className="group relative flex h-8 w-full items-center gap-2 whitespace-nowrap rounded-lg px-2.5 text-[14px] text-[#737373] transition-colors duration-[120ms] hover:bg-black/[.04] hover:text-[#171717] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]">
      {isActive && <motion.span layoutId="sb-pill" className="absolute inset-0 rounded-lg bg-white shadow-[var(--shadow-btn)]"
        transition={{ type: "spring", visualDuration: .25, bounce: .15 }} />}
      {it.swatch ? <span className="relative size-2.5 shrink-0 rounded-[3px]" style={{ background: it.swatch }} />
                 : <it.icon className="relative size-4 shrink-0" strokeWidth={1.5} />}
      <span className={cn("relative truncate transition-opacity duration-[120ms]", collapsed && "opacity-0", isActive && "text-[#171717]")}>{it.label}</span>
      {!collapsed && it.count != null && <span className="relative ml-auto rounded-md bg-black/[.05] px-1.5 text-[11px] tabular-nums text-[#737373]">{it.count}</span>}
      {!collapsed && expanded != null && <ChevronRight className={cn("relative ml-auto size-3.5 text-[#A3A3A3] transition-transform duration-150", expanded && "rotate-90")} strokeWidth={1.5} />}
    </button>
  );
}
```
Inset shell layout:
```tsx
<div className="flex h-dvh overflow-hidden bg-[#F7F7F7]">          {/* tinted app bg, shared by sidebar */}
  <Sidebar />
  <main className="my-2 mr-2 flex-1 overflow-auto rounded-[14px] bg-white
                   shadow-[0_0_0_1px_rgb(0_0_0/.06),0_1px_2px_rgb(0_0_0/.04)]
                   max-md:m-0 max-md:rounded-none">…</main>       {/* inset, slightly elevated panel */}
</div>
```
Flush shell: drop the margins and radius on `<main>` and keep it white, and give the sidebar its own surface: `bg-[#FAFAFA] border-r border-black/[.06]` (one step up from the base in dark). On mobile, render the same `<nav>` inside a [sheet](components.md#modal--bottom-sheet) from the left, and put a hamburger in a sticky 56px top bar.
