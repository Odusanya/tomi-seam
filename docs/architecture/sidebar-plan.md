# Sidebar plan: "Sidebar · 16 · top E"

Source: Paper file Seamflow → page "Dashboard · editable" → artboard "Sidebar variants" → Row 4, "16 · top E · Edge-to-edge header" (expanded + rail). Values below were read with `get_jsx` / `get_computed_styles`, not from screenshots. Nothing in the app has been changed.

## 0. Decisions in one screen

| # | Decision | Why |
|---|---|---|
| D1 | `<Sidebar variant="sidebar" collapsible="icon">` + `SidebarRail` (already in place) | Only `variant="sidebar"` has no container padding, so the header can bleed to the edges, and its rail is exactly 48 px. `inset`/`floating` add `p-2` and a 66 px rail |
| D2 | Colour by tokens only: `sf-accent-deep` → `--sidebar-primary`, `sf-accent-wash` → `--sidebar-active` | shadcn already ships `bg-sidebar-primary` / `text-sidebar-primary-foreground`; no new utility names for the mark, active icon or dot |
| D3 | One L3 atom, `NavCard` (plain `div`, `cva` variants `header` / `group`), gives the top-E header card and the group cards | `SidebarHeader` and `SidebarGroup` are styling-only divs; no-restyle forbids colouring them, and they have no variant. A plain-div atom is lint-clean and survives `shadcn add sidebar` |
| D4 | One bounded edit of `components/ui/sidebar.tsx` so it reads product tokens (width, row metrics, active colour). Same precedent as `table.tsx` | Row = 28 px with 13 px text and 6 px radius is not reachable by props: `size="sm"` is 28/12 px, default is 32/13 px, radius is hard-coded `rounded-xl`. Needs your OK (Q1) |
| D5 | Nav is one typed array in `lib/fixtures/nav.ts`; `app-sidebar.tsx` only maps it | Icons swap by editing one import line + one field |
| D6 | Full-screen document = same icon rail, collapsed by default on document routes, `⌘B` toggles | No second mode, no effect, nav stays one click away |

## 1. Paper values (measured)

| Part | Expanded (240 px) | Rail (48 px) |
|---|---|---|
| Sidebar | pad 8, gap 8, bg `#F9FAFB` (raw hex) | pad 8 / 4, gap 8, bg `color-shell`, right border `border-default` |
| Header card | bleeds to edges, bg `color-container`, bottom radius `radius-lg` (8), 1 px bottom border, pad 6 / 8, gap 4 | no card: mark, toggle, search stacked, gap 2 |
| Workspace row | h 32, pl 8, pr 4, gap 6. Mark 20×20 r 5 `sf-accent-deep`, "T" 11/12 semibold white. Name 13/16 medium `fg-primary`. Switcher chevrons 16 `fg-tertiary`. Toggle 24×24, icon 16 | mark in 40×32 cell, toggle in 40×28 cell |
| Search | h 28, r 6, bg `color-component`, px 8, gap 8, "Search" 13/16 `fg-tertiary`, `⌘K` 12/16 | 40×28, r 6, bg `color-component`, icon only |
| Group card | bg `color-page`, r 8, pad 4, gap 1 | w 40, r 10, bg `color-container`, 1 px `border-default`, shadow `0 1px 2px #0000000F` |
| Group label | h 24, px 8, 12/16 medium `fg-tertiary` | hidden |
| Nav row | h 28 (`spacing-control`), px 8, gap 8, r 6, icon 16 (stroke 1.75) `fg-secondary`, label 13/16 regular `fg-secondary` | 34×28 cell, icon centred |
| Active row | bg `sf-accent-wash`, icon `sf-accent-deep`, label `fg-primary` medium, **no left bar** | same wash on the cell |
| Count | 12/16 `fg-tertiary`, right-aligned in a 24 px slot | hidden; Inbox shows a 6 px `sf-accent-deep` dot on the icon |
| Footer | Settings row 28; user row 32 with 16 px round avatar (`color-sunken`, 8 px semibold initials) + name 13 `fg-primary` | Settings 40×28, avatar 20 |

Groups and items: (no label) Inbox 3 · **Work**: Assessments 24 (active), Technical files, Findings 12, Reports · **Planning**: Scheduling, Auditors · **Records**: Audit trail · footer: Settings, Amara Okafor. Workspace: "Notified Body · TÜV".

Beside the content: top E's rail shows the page flush against the sidebar's right border. The older "Assessments · light - audit pass" artboard (variant 14, 232 px) floats the content as a panel (radius 8, 8 px gutter). They conflict; see Q2.

## 2. Mapping table

Kind: **C** config only · **T** token change · **A** small L3 atom · **P** ui primitive edit (WP1b, needs Q1).

| Paper element | shadcn part and props | Kind | Note |
|---|---|---|---|
| Sidebar shell, 240 / 48 | `Sidebar variant="sidebar" collapsible="icon"` | C + P | Width constants are inline styles in the primitive (`16rem` / `3rem`); P makes them read `--spacing-sidebar*`. Without P: 256 px, rail already 48 |
| Header card (top E) | `NavCard variant="header"` in place of `SidebarHeader` | A | See section 4 |
| Workspace mark | `Initials kind="workspace"` inside the button | A | `bg-sidebar-primary text-sidebar-primary-foreground`, 20 px |
| Workspace name + switcher | `SidebarMenu > SidebarMenuItem > SidebarMenuButton` (default size = 32 px), children: mark, `<span>`, `ChevronsUpDownIcon` | C | Inert button for now; wrap in `DropdownMenuTrigger` later if wanted |
| Collapse toggle | `SidebarTrigger` | C | 28 px ghost icon button (Paper 24). Stays visible in the rail |
| Search | `Button variant="secondary" size="sm"` with `SearchIcon`, `<span className="flex-1 text-left text-fg-tertiary">`, `<Kbd>⌘K</Kbd>` | C | Stretches because the header card is `flex-col`. Label and Kbd sit in spans that hide in the rail. Radius is the Button's (12, Paper 6) |
| Group card | `NavCard variant="group"` in place of `SidebarGroup` | A | Flat white on shell when expanded, `shadow-default` + `rounded-xl` in the rail |
| Group label | `SidebarGroupLabel` | C + P | Hides itself in the rail. P: 32→24 px high, px 12→8 |
| Nav item | `SidebarMenuItem > SidebarMenuButton size="sm" tooltip={title} isActive render={<Link/>}` | C + P | 28 px today. P: text 12→13, radius 10→6, px 10→8 |
| Active state | `isActive` → `data-active` | T + P | P points it at `bg-sidebar-active`. Without P set `--sidebar-accent` to the wash and accept hover = active colour |
| Active icon (deep accent) | class on the lucide icon: `group-data-active/menu-button:text-sidebar-primary` | C | Icon is not a ui primitive, class is static and token-based |
| No left bar | nothing to do | C | shadcn has none |
| Count | `SidebarMenuBadge` | C | Hidden in the rail by the primitive. Medium weight, secondary colour (Paper regular, tertiary): accepted |
| Unread dot (rail only) | plain `<span>` in the `SidebarMenuItem`: `absolute top-1 right-1.5 hidden size-1.5 rounded-full bg-sidebar-primary group-data-[collapsible=icon]:block` | C | Inline, no component. Tooltip reads "Inbox · 3" |
| Footer: Settings | `SidebarFooter > SidebarMenu > SidebarMenuButton size="sm" tooltip` | C | |
| Footer: user | `SidebarMenuButton` (default, 32 px) with `Initials kind="user"` + name | A | ui `Avatar` smallest is 24 px and gets clipped in the 32 px rail button; the 16 px atom fits its 16 px content box exactly |
| Collapsed rail | `collapsible="icon"` + `tooltip` on every button | C | Cells are 32×32 (Paper 34×28): accepted, it is the primitive's `size-8!` |
| Edge toggle | `SidebarRail` | C | Already there |

## 3. Tokens

All values go in `styles/tokens/product.css`. `app/app-theme.css` only gains one name.

| Paper token | Value | Code token (where) | Used by |
|---|---|---|---|
| `--color-sf-accent-deep` | `#1E3A5F` | new `--sf-accent-deep` (`:root`, product.css); then `--sidebar-primary: var(--sf-accent-deep)` | mark, active icon, unread dot |
| `--color-sf-white` | `#FFFFFF` | `--sidebar-primary-foreground: var(--ui-on-standout)` | mark letter |
| `--color-sf-accent-wash` | `#F0F6FF` | new `--sf-accent-wash`; then new `--sidebar-active: var(--sf-accent-wash)` | active row |
| `--color-sf-accent` | `#8BB7FF` | new `--sf-accent` (defined for completeness, unused by the sidebar) | none yet |
| (none: raw 240 / 48 px) | 240 px, 48 px | new `--spacing-sidebar: 240px`, `--spacing-sidebar-rail: 48px` (`@theme`, product.css, next to `--spacing-row`) | primitive width constants |
| `--spacing-control` | 28 px | no code token; `h-7` inside primitives. Proposed name if ever needed: `--spacing-control` | not added now |
| `--color-shell` | `#F6F6F6` | `--sidebar: var(--ui-shell)`: unchanged | sidebar bg |
| `--color-page`, `--color-container` | `#FFFFFF` | existing `bg-page`, `bg-container` | cards |
| `--color-component` | `#0000000F` | existing `--sidebar-accent: var(--ui-component)`: unchanged, stays the neutral hover | hover, search fill |

New utility name: `--color-sidebar-active: var(--sidebar-active)` in `app/app-theme.css` (`@theme inline`), so the primitive can say `data-active:bg-sidebar-active`.

Flags:
- **No code equivalent:** `sf-accent`, `sf-accent-wash`, `sf-accent-deep`, sidebar widths, `spacing-control`. Names proposed above.
- **Raw hex in Paper:** expanded sidebar bg `#F9FAFB` equals `sf-gray-50` but is not bound to it, and the rail uses `color-shell`. Plan keeps `--sidebar` on shell for both (Q3).
- Paper's card outline and header bottom border use `color-shell`, which is invisible on a shell background. Plan uses `border-default` on the header (as the Paper caption says) and no outline on cards.

## 4. Header card (top E) under no-restyle

| Path | Verdict |
|---|---|
| Config / variant | Not available. `SidebarHeader` has no variant; `variant="floating"` styles the whole sidebar, not the header |
| Token | Not available. No `--sidebar-header-*` hook in the primitive |
| `className` on `SidebarHeader` | Blocked by `shadcn/no-restyle` (colour, radius, border), in `components/domain` too |
| Add a variant to the primitive | Works, but edits `ui/` for something that is pure styling |
| **Tiny atom (chosen)** | `NavCard` in `components/domain/nav-card.tsx`: a plain `div` with `cva`. `SidebarHeader` is only `flex flex-col gap-2 p-2`, so nothing is lost |

`variant="header"`: `mb-2 flex flex-col gap-1 rounded-b-lg border-b border-default bg-container px-2 py-1.5`, plus rail classes `group-data-[collapsible=icon]:items-center …:border-transparent …:bg-transparent …:px-1`.
`variant="group"`: `mx-2 flex flex-col rounded-lg bg-page p-1`, plus rail classes `…:mx-1 …:rounded-xl …:shadow-default`.

It bleeds for free: with `variant="sidebar"` the first child of `Sidebar` is already edge to edge. The same atom covers the group cards, so it is one file for both card treatments.

## 5. Nav config

`lib/fixtures/nav.ts` (data only; `lib/` may import `lucide-react`, not components):

```ts
import type { LucideIcon } from "lucide-react"
export type NavItem = { id: string; title: string; href: string; icon: LucideIcon; count?: number; unread?: boolean }
export type NavGroup = { id: string; label?: string; items: NavItem[] }
export const workspace = { name: "Notified Body · TÜV", initial: "T" }
export const currentUser = { name: people[0], initials: "AO" }
export const navGroups: NavGroup[] = [ /* inbox, work, planning, records */ ]
export const navFooter: NavItem[] = [ /* settings */ ]
```

- Placeholder icons: `InboxIcon`, `SquareCheckIcon`, `FileIcon`, `TriangleAlertIcon`, `ChartNoAxesColumnIcon`, `CalendarIcon`, `UsersIcon`, `HistoryIcon`, `SlidersHorizontalIcon` (all exist in the installed lucide). To swap: change the import and the `icon:` field in this one file.
- Render: `navGroups.map(group => <NavCard> {label} <SidebarMenu>{group.items.map(...)}</SidebarMenu></NavCard>)`. Keys are `id`. One `strokeWidth` constant at the single render site (Q4).
- Active: `pathname === item.href`, as today. Assessments uses `/` until a real route exists; unbuilt screens use `href: "#"` so the demo never 404s (Q5).

## 6. Collapse and full-screen document

Recommendation: **icon rail + `⌘B`, collapsed by default on document routes.**

- Trade-off: the rail costs 48 px (3.75% at 1280) but keeps navigation, the unread dot and the toggle one click away. `collapsible="offcanvas"` wins those 48 px back but hides everything, needs a trigger inside the doc toolbar, and gives the collapsed state two meanings.
- `⌘B` / `Ctrl+B` is already wired inside `SidebarProvider`. Do **not** add `useHotkey("mod+b")`: it would toggle twice.
- No effect needed. A small client wrapper `components/app-shell.tsx` controls the provider and derives `open` during render:

```tsx
const pathname = usePathname()
const [pref, setPref] = useState<{ path: string; open: boolean } | null>(null)
const open = pref?.path === pathname ? pref.open : !pathname.startsWith(DOC_ROUTE_PREFIX)
return <SidebarProvider open={open} onOpenChange={(next) => setPref({ path: pathname, open: next })}>{children}</SidebarProvider>
```

- The primitive writes a `sidebar_state` cookie that nothing reads (the layout is static). Leave it: reading it would make the layout dynamic.

## 7. Work packages

WP1 and WP2 run in parallel. WP3 starts when both are merged. No file appears in two packages.

### WP1 · Tokens and primitive tune
Files: `styles/tokens/product.css`, `app/app-theme.css`, `components/ui/sidebar.tsx`, `AGENTS.md`.

| Step | Change |
|---|---|
| 1a | product.css `:root`: `--sf-accent`, `--sf-accent-wash`, `--sf-accent-deep`, `--sidebar-primary`, `--sidebar-primary-foreground`, `--sidebar-active`. `@theme`: `--spacing-sidebar`, `--spacing-sidebar-rail`. app-theme.css: `--color-sidebar-active` |
| 1b (only if Q1 = yes) | sidebar.tsx: `SIDEBAR_WIDTH = "var(--spacing-sidebar)"`, `SIDEBAR_WIDTH_ICON = "var(--spacing-sidebar-rail)"`. Menu button base: `rounded-xl`→`rounded-md`, `px-3`→`px-2`, drop the two `has-[>svg…]` paddings, `data-active:bg-sidebar-accent`→`data-active:bg-sidebar-active`; size `sm`: `text-xs`→`text-sm`. Group label: `h-8`→`h-6`, `px-3`→`px-2`, `-mt-8`→`-mt-6`. Add sidebar.tsx to the "edited primitive" exception line in AGENTS.md |

Acceptance: `npm run check` passes; the existing placeholder sidebar still renders; in devtools `--sidebar-width` resolves to 240 px and an active row has background `#F0F6FF`.
Commits: `feat(tokens): add Seamflow accent and sidebar tokens` · `refactor(ui): make sidebar read product tokens for width, rows and active state`.

### WP2 · Nav data and atoms
Files (all new): `lib/fixtures/nav.ts`, `components/domain/nav-card.tsx`, `components/domain/initials.tsx`.

| Step | Change |
|---|---|
| 2a | `nav.ts` as in section 5, with the Paper groups, counts (3, 24, 12) and `unread: true` on Inbox |
| 2b | `NavCard` (`variant: "header" \| "group"`), classes from section 4, plain `div`, `data-sidebar` attribute kept |
| 2c | `Initials` (`kind: "workspace" \| "user"`): workspace = `-mx-0.5 size-5 rounded-sm bg-sidebar-primary text-sidebar-primary-foreground text-caption-base font-semibold`; user = `size-4 rounded-full bg-sunken text-fg-secondary text-caption-xs font-semibold`. Plain `span`, `aria-hidden` |

Acceptance: `npm run check` passes; no `className` on any `ui/` component; no arbitrary values or raw colours; no new dependency.
Commits: `feat(fixtures): add typed nav config` · `feat(domain): add NavCard and Initials for the sidebar`.

### WP3 · Assemble and verify
Files: `components/app-sidebar.tsx` (rewrite), `components/app-shell.tsx` (new), `app/layout.tsx` (swap `SidebarProvider` for `AppShell` only).

| Step | Change |
|---|---|
| 3a | `app-sidebar.tsx`: header `NavCard` (row: workspace `SidebarMenuButton` + `SidebarTrigger`, in a plain `div` that is `flex` and `flex-col` in the rail; then search `Button`), `SidebarContent` mapping `navGroups` into group `NavCard`s, `SidebarFooter` with Settings and user, `SidebarRail`. Items per section 2: `size="sm"`, `tooltip`, `isActive`, `SidebarMenuBadge`, unread dot |
| 3b | `app-shell.tsx` as in section 6 (`DOC_ROUTE_PREFIX = "/documents"`); `layout.tsx` renders `<AppShell>` where `<SidebarProvider>` was |
| 3c | Verify at 1280×800 in the browser against the Paper frame, expanded and rail |

Acceptance:
- Screenshots at 1280 px, expanded and rail, side by side with Paper top E; listed deviations only (section 8).
- Measured with `getBoundingClientRect`: sidebar 240 px (256 if Q1 = no), rail 48 px, nav row 28 px, workspace and user rows 32 px, group label 24 px (32 if Q1 = no), header card touches left, top and right edges and has only bottom corners rounded.
- Active row: wash background, deep-accent icon, medium label, no left bar. Hover on other rows is neutral.
- `⌘B` toggles once; tooltips show in the rail; counts hide and the Inbox dot shows in the rail; `/documents/x` opens with the rail.
- Keyboard: every row reachable by Tab with a visible focus ring.
- `npm run check` passes; output pasted in the report.
Commits: `feat(sidebar): build nav from config with header card and icon rail` · `feat(shell): collapse sidebar to rail on document routes`.

No commit carries an AI co-author trailer. Nobody commits or deploys without your go-ahead (AGENTS.md).

## 8. Accepted deviations (nearest config-only version)

| Paper | Built | Reason |
|---|---|---|
| Rail cell 34×28 | 32×32 | Primitive's collapsed `size-8!`; changing it means more primitive edits |
| Search radius 6 | 12 | It is a stock `Button` |
| Toggle 24 px | 28 px | `SidebarTrigger` default |
| Count regular, tertiary | medium, secondary | `SidebarMenuBadge` default |
| Row gap 1 px | 2 px | `SidebarMenu` `gap-0.5` |
| Mark radius 5 | 4 (`rounded-sm`) | No 5 px radius token |
| Rail avatar 20 | 16 | One size for both states |
| "Technical files" label is `fg-primary` | `fg-secondary` like its siblings | Looks like a slip in Paper |
| Inter | Roobert | App font; text widths differ slightly |

## 9. Risks and open questions

| # | Question / risk | Recommended default |
|---|---|---|
| Q1 | May agents edit `components/ui/sidebar.tsx` (about ten class swaps and two constants, WP1b)? AGENTS.md says not without asking | **Yes.** Without it: 256 px wide, 12 px nav text, 10 px row radius, 32 px labels, and hover shares the active wash. `npx shadcn add sidebar` would overwrite the edit, hence the AGENTS.md note |
| Q2 | Content flush against the sidebar border (top E rail) or floating panel (audit-pass artboard)? | **Flush**, `variant="sidebar"`. `inset` adds padding that breaks the edge-to-edge header and makes the rail 66 px |
| Q3 | Sidebar background: Paper expanded uses raw `#F9FAFB`, rail uses `color-shell` | **Shell for both** (no token change). If you want the cooler grey, add `--sf-gray-50` and point `--sidebar` at it |
| Q4 | Icon stroke: Paper 1.75, DESIGN.md 1.5, lucide default 2 | **1.5** per DESIGN.md, one constant at the render site; revisit when you pick the real icons |
| Q5 | Routes: which items are real? Document route prefix for auto-collapse? | Assessments = `/`, the rest `#`; prefix `/documents`. Both are one-line changes |

Risks agents should know:
- If lint rejects `group-data-[collapsible=icon]:*` in a domain atom, give `NavCard` a `collapsed` boolean variant and pass `useSidebar().state === "collapsed"` from `app-sidebar.tsx`. Same classes, still static.
- The workspace mark is 20 px in a button whose rail content box is 16 px; the `-mx-0.5` on the atom centres it. Check it in the rail screenshot.
- Next here is 16 with breaking changes: only `Link` and `usePathname` are used, both already in `app-sidebar.tsx`. Read `node_modules/next/dist/docs/` before reaching for anything else.

## Decisions (user, 16 Nov)

- Q1: Yes. Edit `components/ui/sidebar.tsx` as planned and record the exception in AGENTS.md.
- Q2: Flush. Content sits against the sidebar border (`variant="sidebar"`).
- Q3: Add a NEW named token for #F9FAFB in `styles/tokens/product.css` (e.g. `--sidebar-surface`) and use it for both the expanded sidebar and the rail. No hex anywhere else.
- Q4: Icon stroke 1.5.
- Q5: Default. Assessments = `/`, the other items `#`, document route prefix `/documents`.
