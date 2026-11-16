# Dashboard audit: shell, tokens, L1/L3 vocabulary

Read-only audit using the `dashboard-audit` playbook (10 patterns). Compared against Linear's app UI. Nothing was edited. Where the playbook says "fix", this file gives a proposal.

Evidence: code (file:line) plus measured computed styles from `http://localhost:3100` at 1440x900 (1280 was not separately measured; the table is fluid and the sidebar fixed at 16rem, so only the empty right-hand gap changes). The audit script `audit.py` is Paper-only and was not run.

Linear reference values used (from memory of the app, not measured): sidebar about 244px, 13px text with 20px line, rows 36-40px, 12px muted column headers, 1px hairlines at about 6% ink, icons 16px at about 1.5px stroke in a muted tone, status and priority as small glyphs, one violet-blue accent, keyboard hints shown on hover only.

## 0. Root cause worth knowing first

The L1 files in `components/ui/` are stock shadcn `base-rhea` output. They use `text-sm` (14px), `text-xs`, `rounded-2xl` (12px), `rounded-xl` (10px) and `ring-3` focus halos. The product tokens (13/12/11 type, hairline focus, small radii) exist in `styles/tokens/` and `DESIGN.md`, but nothing bridges them. Measured at 1440: table text 14px (`table.tsx:14`), header 14px/40px tall, row 39px, sidebar button radius 10px, `<body>` 16px. Most findings below follow from this one gap. Two token-level overrides fix most of it without touching a ui file (proposals P1 and P2).

## 1. Scorecard

| # | Pattern | Result | Evidence |
|---|---|---|---|
| 1 | Neutral base, colour for state only | Partial | Neutral ramp is good: `semantic.css:36-39` (fg primary/secondary/tertiary/disabled), borders `:76-78`. One brand accent plus violet for AI (`app-tokens.css:3-10`), which matches Linear's restraint. Slip: severity is a tinted pill with a dot on every row (`severity-badge.tsx:8-14`), so colour is a fill, not a glyph. Brand is blue 9 (`generated.css:2`), fine. |
| 2 | Colour only on the exception | Fail | In the placeholder, 4 of 6 rows show a red Major pill and 1 an orange Minor (screenshot, `example.ts:23` picks severity at random). Colour is on most rows so it signals nothing. "No source" in `text-fg-danger` (`page.tsx:41`) is the one true exception and is drowned by the pills. |
| 3 | One meaning, one treatment, one place | Partial | Severity has tokens (`app-theme.css:9-17`), good. But `sev-major` duplicates `danger` (both tomato) and `sev-minor` duplicates `warning` (both orange); the comment says "shares hues" which is fine, though `--sev-major-subtle` is tomato-a3 while `--ui-danger-subtle` is tomato-a2, a near-copy. Pill shows state three ways at once: dot, tint, text (`severity-badge.tsx:32-35`). |
| 4 | One repeating unit | Fail | Row is 39px measured, spec is 41 (`DESIGN.md`, `app-theme.css:21`); the token is defined but never consumed (grep: no `h-row` anywhere). `TableRow`/`TableCell` have no height; height comes from `p-2` plus a 20px line (`table.tsx:85`). No fixed-width lanes: columns auto-size, so the lanes move with content (`page.tsx:15-23`). No leading status slot, no trailing slot. |
| 5 | Type has jobs | Fail | Product scale is 13/12/11 (`theme.css:136-141`) but `Table` uses `text-sm` = 14px (`table.tsx:14`), header is 14px/500 in full-ink (`table.tsx:72`, measured), nav is `text-xs` (12px, `sidebar.tsx:491`), Input is `text-base` (16px) with `md:text-sm` (`input.tsx:11`), tooltip, kbd, badge use `text-xs`. Headers should be a muted 12px label, values 13px. Page `h1` is 20px/500 with -0.01em (`page.tsx:11`), too loud for a Linear-style header (Linear uses about 13px). Heading tracking is tightened only on large sizes (`theme.css:148-163`), fine. `font-semimedium: 450` is defined (`theme.css:131`) and unused. |
| 6 | Data aligns | Partial | `tabular-nums` is applied globally to `table, td` (`theme.css:199`), pass. Mono used on the clause ref (`page.tsx:35`), per DESIGN. Slip: the source cell is one string "TD-131 · Sterilisation report · p.64" (`page.tsx:39`), so the doc ID (which DESIGN says is mono) is not in its own lane and the page number does not align. No right-aligned numeric columns exist yet. |
| 7 | One icon family | Partial | Lucide only (`components.json:14`, 42 files import it incl. ui). Size slot is consistent at 16px (`sidebar.tsx:481`) with 12px in xs buttons. Gap: stroke is Lucide's default 2px at 24 viewBox, which is 1.33px at 16px and reads heavier than Linear. No icon colour token, so icons take label colour (grep `ui-icon`: nothing). Status is a dot, not a glyph. |
| 8 | One focal point and reading path | Partial | Page order is header then table, correct. No filter/view bar, no count, no result summary. Header `h1` plus right-aligned fixture note ("Dummy data · lib/fixtures", `page.tsx:12`) competes with nothing but also gives nothing; it should be a header bar (title, count, view controls). Kbd hints are not shown anywhere yet. Kbd uses `text-xs` and `bg-muted` pill (`kbd.tsx:8`). |
| 9 | One container style per role | Partial | Chips: `Badge` is a 20px `rounded-2xl` pill (`badge.tsx:7`) while `SeverityBadge` is a `rounded-sm` 4px chip (`severity-badge.tsx:8`), two radii for chips. Controls: Button/Input/Select are `rounded-2xl` 12px (`button.tsx:6`, `input.tsx:11`) but menu items `rounded-xl` and sidebar buttons 10px; Linear is a uniform 6px. Content inset has no radius or border (`layout.tsx:30`, measured 0px). Table rows use hairlines, correct. |
| 10 | Legible and intact | Partial | `fg-tertiary` is neutral-a9 (`semantic.css:38`), about 3.3:1 on white, below 4.5:1, and is used for the ID column (`page.tsx:28`) and the footer note. `fg-secondary` (a11) is about 6:1, passes. `prefers-contrast` bump exists (`semantic.css:217`), good. Table is `whitespace-nowrap` with `overflow-x-auto` (`table.tsx:10,85`) but no truncation rule, tooltip or fade cue. Orange/tomato `fg-*` at a10 on white are about 4:1, borderline for "No source". |

Plus the Linear-specific checks asked for:

| Check | Result | Evidence |
|---|---|---|
| Sidebar density and grouping | Fail | Width 255px (`sidebar.tsx:30`, Linear about 244). Items are `size="sm"` 28px at 12px text (`app-sidebar.tsx:43`, `sidebar.tsx:490-491`), radius 10px, no group labels, header is a bare "Workspace" text link (`app-sidebar.tsx:32`) with no workspace switcher, no search/⌘K row, no footer. Group label token is 32px tall, `text-xs`, 70% opacity (`sidebar.tsx:406`) and wasted vertical space. |
| 13px type, tight line-height | Fail | See #5. The scale is correct in tokens, wrong in ui. |
| Low-contrast hairlines | Pass (tokens) / Partial (use) | `--ui-border-default` neutral-a3 is about 6% ink (`semantic.css:76`). Rows use 1px full borders (measured 1px, a3), `--ui-hairline: 0.5px` is defined (`semantic.css:204`) but never used. Sidebar right border is a full 1px (`sidebar.tsx:237`). |
| Muted icon vs text colour | Fail | No icon token. Active nav icon measured at full ink (0.875 alpha) while inactive label is 0.608. |
| 36px rows with hover tint | Partial | Row is 39px; hover tint exists (`table.tsx:59`, `bg-muted/50`, i.e. 50% of neutral-a3, very faint). DESIGN says "none on row hover" (`DESIGN.md`, Visual) which contradicts `table.tsx:59` and the polish yardstick says hover only on clickable. For a Linear-like list that is clickable, a hover tint is right; resolve in P3. |
| Header bar with view controls | Fail | Bare `<header>` with h1 (`page.tsx:10-13`). No SidebarTrigger, no breadcrumb, no filter/display controls, no count. |
| Status/priority glyphs | Fail | Dot in a filled pill (`severity-badge.tsx:20-24`). No status glyph atom. |
| Keyboard hints | Partial | `Kbd` exists, `useHotkey` exists, nothing shows a key. DESIGN rule 4 says "shown on focus". |
| One accent | Pass | Blue brand plus violet AI only (`app-tokens.css`). Primary button is inverted black (`generated.css:61`, `"primary":"inverted"`), matching Linear's neutral-first feel. |
| Focus | Partial (conflict) | Global rule is 1px inset brand outline, no halo (`theme.css:200-201`, yardstick polish #1). But ui components add `focus-visible:ring-3 ring-ring/30` plus `border-ring` (`button.tsx:6`, `input.tsx:11`, `select.tsx:43`, `textarea`, `checkbox`, `input-group`, `sidebar.tsx` x5), so two indicators show at once. `tabs.tsx:60` adds `outline-1` and `ring-[3px]`. |
| Disabled | Fail vs yardstick | `disabled:opacity-50` in button/input/select/sidebar/menu items (e.g. `button.tsx:6`); polish #3 says use disabled tokens. |
| Empty / loading | Partial | `Empty` is `rounded-3xl border-dashed p-12` with `text-lg` title and 40px `bg-muted` icon tile (`empty.tsx:9,27-33,62`), a marketing-style empty state, not a dense-list one. `Skeleton` is `animate-pulse rounded-2xl bg-muted` (`skeleton.tsx:7`): pulse is at odds with "no motion on rows", the radius is 12px, and there is no row-shaped skeleton. No error state atom. |
| Tooltip | Partial | `rounded-xl bg-foreground px-3 py-1.5 text-xs` with an arrow (`tooltip.tsx:52,58`). Linear tooltips are small, no arrow, about 6px radius, label plus kbd chip. `delay=0` default (`tooltip.tsx:7`) is too eager for a dense UI. |
| Dropdown / Select | Partial | Items `min-h-7` (28px) `text-sm` 14px, `rounded-xl` (`dropdown-menu.tsx:90`, `select.tsx:119`); popup `rounded-2xl p-1 shadow-lg ring-1` (`dropdown-menu.tsx:43`). Needs 13px text and 6-8px radii. Shadow token is fine (`semantic.css:95`). |
| Docs drift | Note | `app-tokens.css:1` points at `docs/yardsticks/tokens.md` which does not exist. `DESIGN.md` says row 41/header 36/compact 32, Linear is about 36-40. |

## 2. Fix proposals, ranked by impact

Grouped by the file they touch. Packages A to F touch disjoint files, so they can run in parallel. "Token names" lists the exact additions. No fix uses a call-site `className`, so `shadcn/no-restyle` is respected. Files under `components/ui/` are lint-exempt (`.oxlintrc.json` overrides) but AGENTS.md says do not hand-edit them unless asked; P2 and P6 are the only ones that need that sign-off, and P1/P3 are written to avoid them.

### Package A: `app/app-theme.css` (type and radius bridge, row tokens) — impact: highest

**P1. Make the shadcn type utilities the product scale.** Add inside `@theme inline`:
`--text-xs: 12px; --text-xs--line-height: 16px; --text-sm: 13px; --text-sm--line-height: 20px; --text-base: 13px; --text-base--line-height: 20px;`
Every ui file using `text-sm` / `text-xs` / `text-base` (table, input, select, dropdown, tabs, sidebar, kbd, tooltip, badge, button) becomes 13/12 instantly without a single edit. Fixes the table's 14px and the Input's 16px. The lint rule that bans `text-sm` at call sites still holds because this is in tokens. Also add `html { font-size: 13px }` only if rem-based utilities leak; not recommended, prefer px tokens.

**P2. Bring the radius ladder to Linear's.** Override in the same `@theme inline` block (it is imported last so it wins):
`--radius-xl: 6px; --radius-2xl: 6px; --radius-3xl: 8px;` (leave `--radius-lg` 8px for popovers/dialog via `rounded-lg`; if menus use `rounded-2xl` they land at 6px, acceptable, Linear menus are about 8px, so use `--radius-2xl: 8px` only if you want menus rounder and set controls via P6).
Result: buttons, inputs, selects, menu items, sidebar items, skeletons all become 6px with zero ui edits.

**P3. Consume the density tokens and add row/header/icon tokens.** Add:
`--spacing-row: 36px` (was 41), `--spacing-row-compact: 28px` (was 32), `--spacing-header: 32px` (new, table header), `--spacing-control: 28px`, `--spacing-slot-icon: 16px`, `--spacing-slot-status: 20px`, `--spacing-slot-key: 28px` (lane widths, so the grid lines up). Decision for the owner: DESIGN.md says 41/32; Linear is about 36-40, and 36 reads denser for a "design engineer" signal. Update `DESIGN.md` Density block to match (see package F).

Token names to add to colours here: `--color-icon: var(--ui-icon)`, `--color-icon-hover: var(--ui-icon-hover)`, `--color-row-hover: var(--ui-row-hover)` (definitions in package B).

### Package B: `styles/tokens/semantic.css` (+ `theme.css` for the Tailwind names)

**P4. Muted icon, row hover and selected tokens.** In `:root` (and the `.dark` block, same values via alpha scale): `--ui-icon: var(--neutral-a9); --ui-icon-hover: var(--neutral-a11); --ui-icon-active: var(--neutral-a12); --ui-row-hover: var(--neutral-a2); --ui-row-selected: var(--brand-a3); --ui-hairline-color: var(--neutral-a3)`. Expose in `theme.css` `@theme inline`: `--color-icon`, `--color-icon-hover`, `--color-icon-active`, `--color-row-hover`, `--color-row-selected`. Icon at a9 on white is about 3.3:1, which passes the 3:1 non-text bar. Rule: icons are `text-icon` by default, brighten on hover/active; text stays on `fg-*`.

**P5. Raise tertiary text to pass 4.5:1.** Change `--ui-fg-tertiary` from `neutral-a9` to `neutral-a10` (about 4.6:1 on white), keep `fg-disabled` at a8, and keep icons on the new a9 token. This is the only way to use "tertiary" for IDs and ages and still pass pattern 10. `theme.css:199` base rule: add `[data-slot=table-head]`-style header colour in P6 rather than here.

**P5b (optional).** Add `--ui-sidebar-width: 244px` consumption: not a token change, see package C.

### Package C: `components/app-sidebar.tsx`, `app/layout.tsx` (shell) — impact: high

**P7. Linear-density sidebar.** In `app-sidebar.tsx`: add a workspace header row (avatar glyph, name, chevron) in `SidebarHeader`; a search/command row with `Kbd` "⌘K" shown muted; two `SidebarGroup`s with `SidebarGroupLabel` ("Workspace", "Views") using the compact label; items as `size="sm"` with `text-icon` icons (class-free, via P4 + P8) and a count on the right via `SidebarMenuBadge`; a footer with user row. Use `SidebarMenuBadge` rather than custom spans. Keep one nav item per real screen only; do not invent screens, use placeholder entries clearly marked.
In `layout.tsx`: set `<SidebarProvider>` width via the provider's style prop is not allowed (inline style lint); instead set `SIDEBAR_WIDTH` in `ui/sidebar.tsx:30` to `15.25rem` (244px) as part of P8, and render `<SidebarInset>` with the `inset` Sidebar `variant="inset"` so the content area is a bordered rounded container on the shell, as Linear does (`sidebar.tsx:310` already has `peer-data-[variant=inset]:rounded-2xl`; with P2 this becomes 6px; tweak to 8px via `--radius-3xl` if needed).

### Package D: `components/ui/*` (needs sign-off) — impact: medium-high

**P6/P8. Focus, disabled, sidebar sizing, table slots in the variants layer.**
- `button.tsx:6`, `input.tsx:11`, `select.tsx:43`, `textarea.tsx`, `checkbox.tsx`, `input-group.tsx`, `sidebar.tsx` (5 sites): remove `focus-visible:ring-3 focus-visible:ring-ring/30` and `focus-visible:border-ring`; the global 1px inset outline (`theme.css:201`) stays the single focus treatment. `tabs.tsx:60`: drop `focus-visible:ring-[3px] focus-visible:outline-1`.
- Same files: replace `disabled:opacity-50` / `aria-disabled:opacity-50` / `data-disabled:opacity-50` with `disabled:text-fg-disabled disabled:bg-disabled` (tokens exist: `theme.css:66,72`).
- `sidebar.tsx:30` `SIDEBAR_WIDTH = "15.25rem"`; `:481` menu button `&_svg]:size-4` keep, add `[&_svg]:text-icon data-active:[&_svg]:text-icon-active hover:[&_svg]:text-icon-hover`; `:490` default size `h-7 text-sm`, drop the `lg` footprint; `:406` group label `h-7 text-caption-lg text-fg-tertiary` and remove `/70` opacity.
- `table.tsx` add variants (cva) instead of fixed classes: `TableRow` `density: comfortable | compact` -> `h-row` / `h-row-compact`, hover `hover:bg-row-hover`, selected `data-[state=selected]:bg-row-selected`; `TableHead` `h-(--spacing-header) px-3 text-caption-lg font-medium text-fg-secondary` (not full ink); `TableCell` `px-3 py-0`; `Table` `text-body-sm`; row border `border-b border-line-subtle`. Removes `bg-muted/50` hover (`table.tsx:59`).
- `badge.tsx`: add variants `neutral` (text only, no fill), `outline`, `count`; reduce to `rounded-sm h-5 text-caption-lg`. `empty.tsx`: add a `density="compact"` size (`p-6`, `text-body-sm` title, `size-8` icon, no dashed border, no `rounded-3xl`). `skeleton.tsx`: remove `animate-pulse`, use a slow `bg-component` opacity shimmer via `motion-safe` and add `Skeleton` row preset in the L3 atom (package E). `tooltip.tsx`: `delay` default 400, `rounded-md px-2 py-1 text-caption-lg`, remove the arrow element at `:58`. `kbd.tsx:8`: `text-caption-base h-4 min-w-4 rounded-sm bg-component text-fg-tertiary`; hide until row hover/focus via a variant `visible: always | hover`.
- `dropdown-menu.tsx` / `select.tsx`: items `min-h-7 text-body-sm`, popup `p-1 rounded-lg`, icons `size-4 text-icon`.

### Package E: new L3 atoms in `components/domain/` — impact: high (this is the Linear look)

**P9. `status-glyph.tsx` (new).** Inline SVG atom, 14px glyph in a 16px slot, `cva` variants `status: open | in-review | accepted | rejected | stale`, drawn as ring (open), half ring (in review), ring with check (accepted), ring with cross (rejected), dashed ring (stale), strokes use `text-icon` (accepted uses `text-fg-positive`, rejected `text-fg-danger`, AI draft uses `text-ai`). Colour is on the glyph stroke only, never a fill pill.
**P10. `severity-glyph.tsx` (new)** (Linear priority bars): three ascending bars, `severity: major | minor | observation`, bars filled count 3/2/1, colour `text-sev-major` on major only and `text-icon` for the rest (spend colour on the exception).
**P11. Edit `severity-badge.tsx`.** Add variant `display: glyph | pill`, default `glyph`: glyph plus label in `text-fg-secondary text-body-sm`, no background; `pill` keeps the current tint for filter chips and detail panels. Align height to `h-5`, remove the dot (`:20-24`) in glyph mode. This is what removes "red on every row".
**P12. `row-lane.tsx` / `list-row.tsx` (new, L3).** `ListRow` with named fixed-width slots (status slot `w-(--spacing-slot-status)`, id slot `w-16` tabular, title flex-1 truncate with tooltip, meta slots right-aligned, trailing slot `w-(--spacing-slot-key)`), so every future screen reuses one row. Adds a `loading` prop that renders the row-shaped skeleton and an `empty`/`error` helper using `Empty` compact (states.md).
**P13. `page-header.tsx` (new, L3).** 36px bar: `SidebarTrigger`, breadcrumb or title in `text-body-sm font-medium`, count in `text-fg-tertiary`, then a right slot for view controls (a `Button size="xs" variant="ghost"` for Filter and Display, `Kbd` hints shown on hover). Replaces the 20px `h1` pattern in `app/page.tsx:10-13`. Also `DocRef` micro-atom (mono doc ID plus normal title) to split the source cell.

### Package F: docs

**P14. `DESIGN.md` and `docs/yardsticks/type-density.md`, `docs/yardsticks/polish.md`.** Update row 41/32 -> 36/28, header 36 -> 32, add rules "icons use `text-icon`, 16px, stroke 1.5", "severity is a glyph, colour only on the exception", reconcile the "no hover on rows" line (`DESIGN.md` Visual) with `row-hover` for clickable rows, add the missing `docs/yardsticks/tokens.md` referenced by `app-tokens.css:1`.

### Package G: `app/page.tsx` (placeholder screen only) — impact: low

**P15.** After A-E land, rewrite the placeholder to use `PageHeader`, `ListRow`/Table variants and `SeverityBadge display=glyph` so it is the visual proof of the vocabulary. Not a feature screen. Also make fixtures show at most one Major (`lib/fixtures/example.ts:23`) so the exception reads.

### Ordering for the 3-hour budget
1. A (P1-P3) and B (P4-P5) first, about 20 minutes, biggest visible win with zero risk.
2. E (P9-P13) in parallel with C (P7).
3. D (focus/disabled/table variants) once A-B are in.
4. F and G last.
Packages A, B, C, E, F, G touch disjoint files; D touches ui only and depends on A/B token names.

## 3. Icon set recommendation

Figures are from memory and the shadcn registry list, not freshly verified; confirm a few before a swap.

| Set | Stroke at 16px | Coverage | Licence | shadcn support |
|---|---|---|---|---|
| Lucide (current, v1.73) | 2px at 24 viewBox, so 1.33px at 16, adjustable via `strokeWidth` or `absoluteStrokeWidth` | about 1,500+ | ISC | Default, `iconLibrary: "lucide"` |
| Tabler | 2px at 24 (1.33px at 16), adjustable | about 5,000+ outline, plus filled | MIT | Supported as `iconLibrary: "tabler"` |
| Phosphor | Regular is 1.5px at 24 equivalent, plus thin/light/bold/fill/duotone weights | about 1,500 shapes x 6 weights | MIT | Supported as `iconLibrary: "phosphor"` |
| Hugeicons | 1.5px stroke rounded; free set about 4,000, rest Pro | large | Free tier limited, Pro paid | Supported as `iconLibrary: "hugeicons"` |
| Central Icons | Many weights, 1.5px regular, 16px-tuned | about 1,000+ | Commercial, paid | Not a first-class shadcn library; would be a manual swap |

**Recommendation: stay on Lucide for the 3-hour build, set stroke to 1.5 via a token, and draw status/severity as custom glyphs.** The Linear look comes more from 16px size, muted colour (`text-icon`), 1.5px stroke and glyph-based status than from the family. Lucide at 1.5px is close to Linear's weight, covers every nav/action icon this app needs, and is already wired through 42 files including ui. Switching to Phosphor (regular) is the best like-for-like alternative if you want a more compact, slightly more geometric 16px feel, and is a shadcn-supported swap (`npx shadcn@latest add ... --icon-library phosphor` style flow or re-add components), but costs time for little visible gain; Central Icons is the closest to Linear but paid and manual.

Implementation (no call-site classes): add to `app/globals.css` base layer `svg.lucide { stroke-width: 1.5 }` (or `[data-icon] svg`), set icon colour via the `text-icon` token in the sidebar and header variants (P4, P8), and keep 16px as the single slot size (`--spacing-slot-icon`). Status and severity icons are the custom SVG atoms in P9/P10, so the family only matters for chrome icons.
