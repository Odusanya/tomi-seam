# Architecture plan: lean starter

16 Nov 2026. Output of the `improve-codebase-architecture` playbook, turned into parallel work packages. Visual version of the findings: [report.html](report.html). Baseline: `npm run check` passes on `3d3b3f2`, tree clean.

Vocabulary: **module** (anything with an interface), **interface** (everything a caller must know), **seam** (where an interface lives), **deep / shallow** (much / little behaviour behind the interface), **deletion test** (delete it: does complexity vanish or reappear in N callers?).

## 1. Findings

Severity: **H** visible in the judged output or breaks a written rule on the day · **M** costs minutes or consistency on the day · **L** tidy-up.

### Leaky seams

| # | Finding | Files | Sev |
|---|---|---|---|
| F1 | DESIGN.md and the L1 primitives disagree. Table renders `text-sm` (14 px, 46 uses across `components/ui`), rows are `p-2` (not 41 px), header is `h-10 px-2` (spec: 36, `px-3`), row hover is on by default (spec: none on plain rows). `no-restyle` stops a caller fixing any of it | `components/ui/table.tsx`, `app/app-theme.css`, `DESIGN.md`, `docs/yardsticks/type-density.md` | H |
| F2 | `--spacing-row`, `--spacing-row-compact`, `--spacing-control-compact` are defined and read by nothing | `app/app-theme.css` | H |
| F3 | DESIGN.md gives control sizes in px (28 / 24). Primitives default to 32. The matching variants exist (`size="sm"` = 28, `"xs"` = 24) but no doc names them | `DESIGN.md`, `AGENTS.md` | M |
| F4 | `polish.md` claims a 1 px inset focus ring and token-based disabled states. Primitives ship `ring-3` halos and `disabled:opacity-50` (18 uses) | `docs/yardsticks/polish.md` | M |
| F5 | `keyboard.md` lists `⌘K`. `useHotkey` returns early on `metaKey`, and effects are banned in features, so the caller has no legal route | `hooks/use-hotkey.ts`, `docs/yardsticks/keyboard.md` | H |
| F6 | Lint lets through what AGENTS.md forbids (each confirmed with a probe file against a scratch copy of the config): `text-xs` / `text-xl` / `text-2xl`; `Math.random()` / `Date.now()`; upward imports (`lib` → `components`, `domain` → `features`); restyling a domain atom (`<SeverityBadge className="bg-ai p-4">`) | `.oxlintrc.json` | H |
| F7 | `lint:deprecated` lists `app components lib hooks` and skips `features`, where all code on the day goes | `package.json` | M |

### Shallow modules

| # | Finding | Files | Sev |
|---|---|---|---|
| F8 | `AIOutput<T>` keeps its invariants in comments: `reason?` "required when rejected or edited", `reviewedBy?` optional. A fixture or handler can break DESIGN rule 3 and still compile | `lib/fixtures/types.ts` | H |
| F9 | `fakeAI` fails the deletion test: it is one timeout. The real work (running, narration, error, retry) reappears in every caller. `hitl.md` and `states.md` both require narration, and nothing provides it | `lib/fixtures/fake-ai.ts` | M |
| F10 | DESIGN rule 1 ("purple means the AI said it") has `ai-*` tokens and no module that applies them. The only atom is `SeverityBadge`, which only one of the three likely briefs needs | `components/domain/` | M |

### Naming and language

| # | Finding | Files | Sev |
|---|---|---|---|
| F11 | "approve" (DESIGN.md, hitl.md) vs "accept" (type, key `a`, button) | `DESIGN.md`, `docs/yardsticks/hitl.md` | L |
| F12 | Layers go L1, L3, L4–L5. L2 (DataTable, PropertyList) has no stated home | `AGENTS.md` | M |
| F13 | `@tanstack/react-table` 9 is installed and unused, and no doc mentions it. Agents write the v8 API | `AGENTS.md` | M |
| F14 | README says the starter is "this repo's first commit". It is 13 commits and will be more | `README.md` | L |
| F15 | Comment cites `docs/yardsticks/tokens.md`, which does not exist | `app/app-tokens.css` | L |

### Dead weight

| # | Finding | Files | Sev |
|---|---|---|---|
| F16 | `zod` is a dependency, unused, and AGENTS.md bans validation layers. It stays available transitively through `shadcn` | `package.json` | L |
| F17 | `--brand` and `--color-brand` duplicate `--ui-brand-solid` / `bg-brand-solid`. One use (`::selection`) | `app/app-tokens.css`, `app/app-theme.css`, `app/globals.css` | L |
| F18 | 35 files fail `prettier --check`, 10 of them vendored. `npm run format` is pre-allowed for agents, so one run on the day rewrites all 35 inside a feature commit | `.prettierignore` and most files | M |

## 2. Decisions

### Change

| Decision | Fixes | Why this shape |
|---|---|---|
| Bridge type in the theme: `--text-sm` becomes 13 px / 20 px | F1 | One line fixes 46 vendored uses. Same idea as `shadcn-bridge.css` does for colour. Lint still bans `text-sm` at call sites |
| Edit `table.tsx` to read the row tokens, `data-density="compact"`, hover only on `data-interactive` rows | F1, F2 | Density is the judged criterion and the caller cannot reach it. No new props, no cva |
| Docs name variants, not pixels; `polish.md` describes what the primitives do | F3, F4 | Cheaper and safer than restyling 34 vendored files before the task |
| `useHotkey` accepts `"mod+k"` | F5 | Same signature. One more key form |
| Five lint additions (type scale, `Math.random` / `Date.now`, layer direction, domain atoms, `outline-none`) and `features` in `lint:deprecated` | F6, F7 | Rules that fail with their fix beat rules in prose |
| `AIOutput<T>` becomes a discriminated union on `status`; `reviewedBy` → `by`; name `Confidence`, `Source`, `Review` | F8, F11 | The compiler holds "override needs a reason" |
| `fakeAI` takes narration `steps`; add `useFakeAI()` returning `AIRun<T>` and `run` | F9 | **Addition 1 of 2.** About 30 lines. Saves writing a status union, timers and retry per AI block, in the one place effects are banned |
| Add `AIMark` atom (draft violet; accepted / edited / rejected neutral) | F10 | **Addition 2 of 2.** About 35 lines. Needed by all three likely briefs. Rule 1 lives in one file |
| One sentence in AGENTS.md for L2 and for TanStack Table 9 | F12, F13 | L2 starts inside its feature and moves on second use. One adapter is a hypothetical seam |
| Remove `zod`, `--brand`, `--color-brand`, `--spacing-control-compact`; fix the stale comment and the README line | F14–F17 | Deleting |
| Ignore vendored and generated files in prettier, then format once | F18 | One mechanical commit now, so no format noise in task commits |

### Leave alone (over-engineering, rejected)

| Rejected | Reason |
|---|---|
| DataTable wrapper, PropertyList, PageHeader, three-pane shell | Brief-dependent. Built live. One caller each until then |
| Command registry, shortcut sheet, `useHotkeys(map)`, scopes | One hook call per key is enough for seven keys |
| Confidence, Citation, ClauseRef, StatusChip atoms; a `canAccept()` helper | Brief-specific labels, or one-line expressions |
| "Stale" and "queued" in `AIRun` | Depend on what the brief edits. A flag in the feature on the day |
| Generic state machine, store, persistence, API routes, tests, zod schemas | Banned by the brief and by AGENTS.md |
| Delete `ThemeProvider` | Passes the deletion test: without it `ui/sonner.tsx` reads `theme = "system"` and toasts follow the OS |
| Delete dark tokens and `dark:` classes | No time saved on the day. Generated files |
| Delete `lib/utils.ts` (pass-through of `cn`) | Agents import `@/lib/utils` by habit. One line |
| Restyle focus ring, disabled, radius in `components/ui/*` | 34 files, large diff. See overlap note in section 4 |
| A constant for the product name ("Workspace" appears 3 times) | Three string edits on the day |
| Remove `className` from `SeverityBadge` | Layout classes are legitimate. The lint contract now covers restyling |
| Move `app/app-*.css` into `styles/tokens/` | The split (app additions vs reference tokens) is real. Churn |
| Change the 41 / 32 row heights | A recorded decision in DESIGN.md. Not reopened here |

### Assumptions (made instead of asking)

1. Body text should render at 13 px inside primitives. The 14 px today is an oversight.
2. Editing `components/ui/table.tsx` is acceptable: this plan is the "unless asked". AGENTS.md records the exception.
3. Status vocabulary is draft · accepted · edited · rejected. "Approved" goes.
4. `@tanstack/react-table`, `motion`, `cmdk`, `react-resizable-panels` stay installed for the day.
5. The two additions are wanted. Each sits in its own commit, so dropping one is a revert.
6. `.claude/settings.json`, `docs/INDEX.md`, `DECISIONS.md`, `components/theme-provider.tsx`, `components/app-sidebar.tsx`, `app/layout.tsx` need no change. No package owns them.

## 3. Work packages

Four run in parallel. One runs after.

**How to run them in parallel.** Give each package its own git worktree and branch (`wp1-lint`, `wp2-seams`, `wp3-tokens`, `wp4-docs`) and run `npm ci` in it first. Do not share one working tree: two `next build` runs in one `.next` folder collide. File ownership is disjoint, so the merges in WP5 cannot conflict. This plan is untracked, so a fresh worktree does not contain it: paste the package's section and the two shared blocks below into each agent's brief, or give it this file's absolute path.

**Rules for every package**

- Touch only the files you own. If a check fails in a file you do not own, report it; do not fix it.
- Read `AGENTS.md` first. Do not add dependencies. Do not push. Do not deploy.
- Commits: conventional messages as given, no `Co-authored-by` or other AI trailer.
- `Edit(package.json)`, `Edit(.oxlintrc.json)`, `Edit(components/ui/**)`, `npm uninstall` and `npm ci` prompt for approval (`.claude/settings.json`). Someone must be there to approve WP1 and WP3.
- Done means: `npm run check` passes in your worktree, output pasted in your report.

**Names fixed by this plan** (WP4 documents them before the code merges, so do not rename):

| Name | Lives in | Owner |
|---|---|---|
| `Review`, `Confidence`, `Source`, `AIOutput<T>`, `AIRun<T>` | `lib/fixtures/types.ts` | WP2 |
| `fakeAI(value, { ms, fail, steps, onStep })` | `lib/fixtures/fake-ai.ts` | WP2 |
| `useFakeAI<T>()` → `[state, run]` | `hooks/use-fake-ai.ts` | WP2 |
| `useHotkey("mod+k", handler)` | `hooks/use-hotkey.ts` | WP2 |
| `<AIMark status by? />` | `components/domain/ai-mark.tsx` | WP3 |
| `<Table data-density="compact">`, `<TableRow data-interactive>` | `components/ui/table.tsx` | WP3 |

### WP1: Lint guardrails and dependency trim

**Owns:** `.oxlintrc.json`, `package.json`, `package-lock.json`. **Est.** 20 min.

Steps

1. `.oxlintrc.json` → `settings.shadcn`: add `"componentImports": ["^@/components/domain(/|$)"]`.
2. `rules["tailwindcss/no-restricted-classes"]` → `patterns`:
   - Change the first pattern from `^text-(sm|base|lg)$` to `^text-(xs|sm|base|lg|xl|[2-9]xl)$`. Keep its message.
   - Append `{ "pattern": "^outline-(none|hidden)$", "message": "Keep the focus outline. The global 1 px inset outline is the focus style." }`.
3. Add to `rules`:
   ```json
   "no-restricted-properties": ["error",
     { "object": "Math", "property": "random", "message": "Use prng() from lib/fixtures/prng.ts." },
     { "object": "Date", "property": "now", "message": "Use DEMO_NOW from lib/fixtures/prng.ts." }
   ],
   ```
4. In the existing override for `components/ui/**` and `hooks/**`, add `"no-restricted-properties": "off"` (`components/ui/sidebar.tsx` uses `Math.random`).
5. Insert three overrides **before** that existing override (later overrides win, so `hooks/**` stays exempt). An override replaces the base options, so each repeats the `react` path entry. Copy the `react` entry (name, importNames, message) from the base rule exactly.
   ```json
   { "files": ["lib/**"],
     "rules": { "no-restricted-imports": ["error", {
       "paths": [ <react entry> ],
       "patterns": [{ "group": ["@/app/**", "@/features/**", "@/components/**", "@/hooks/**"],
         "message": "lib/ is data only. Imports flow down: app → features → domain → ui." }] }] } },
   { "files": ["components/domain/**"],
     "rules": { "no-restricted-imports": ["error", {
       "paths": [ <react entry> ],
       "patterns": [{ "group": ["@/app/**", "@/features/**"],
         "message": "Imports flow down: app → features → domain → ui." }] }] } },
   { "files": ["features/**"],
     "rules": { "no-restricted-imports": ["error", {
       "paths": [ <react entry> ],
       "patterns": [{ "group": ["@/app/**"],
         "message": "Imports flow down: app → features → domain → ui." }] }] } }
   ```
6. `package.json` → `scripts["lint:deprecated"]`: append ` features` to the path list.
7. Run `npm uninstall zod`. Confirm `npm ls zod` still shows it under `shadcn` (expected).
8. Prove the rules. Create `features/_probe/probe.tsx` and `lib/fixtures/_probe.ts` with the content below, run `npx oxlint features lib`, then **delete both** before committing.
   ```tsx
   // features/_probe/probe.tsx
   import { SeverityBadge } from "@/components/domain/severity-badge"
   export function Probe() {
     return (
       <div className="text-xs outline-none">
         <p className="text-xl">{Math.random()}</p>
         <p className="text-2xl">{Date.now()}</p>
         <SeverityBadge severity="major" className="bg-ai p-4" />
       </div>
     )
   }
   ```
   ```ts
   // lib/fixtures/_probe.ts
   import { SeverityBadge } from "@/components/domain/severity-badge"
   export const probe = SeverityBadge
   ```

Acceptance

- Probe run reports, at least: `no-restricted-classes` for `text-xs`, `text-xl`, `text-2xl`, `outline-none`; `no-restricted-properties` twice; `shadcn(no-restyle)` on `SeverityBadge`; `no-restricted-imports` "by a pattern" in `lib/fixtures/_probe.ts`.
- `git status` shows no `_probe` files. `grep -c zod package.json` prints `0`.
- `npm run check` passes.

Commits

1. `chore(lint): enforce type scale, deterministic fixtures and import direction` (steps 2–5)
2. `chore(lint): hold domain atoms to the restyle contract and scan features for deprecated APIs` (step 1, step 6)
3. `chore(deps): remove unused zod`

### WP2: AI and keyboard seams

**Owns:** `lib/fixtures/types.ts`, `lib/fixtures/fake-ai.ts`, `lib/fixtures/example.ts`, `hooks/use-hotkey.ts`, `hooks/use-fake-ai.ts` (new). **Est.** 25 min.

Do not use `Math.random`, `Date.now`, `text-xs`, or imports from `@/components` in `lib/` (WP1 makes these errors).

Steps

1. `lib/fixtures/types.ts`: replace the `AIOutput` block. Keep the file header, `Actor` and `AuditEvent` as they are.
   ```ts
   export type Confidence = "high" | "medium" | "low"
   export type Source = { doc: string; page: number; quote?: string }

   /** What a person did with an AI output. Edit and reject cannot exist without a reason. */
   export type Review =
     | { status: "draft" }
     | { status: "accepted"; by: string }
     | { status: "edited" | "rejected"; by: string; reason: string }

   /** Anything the AI produced. Purple while status is "draft". No source = cannot be accepted. */
   export type AIOutput<T> = { value: T; confidence: Confidence; source?: Source } & Review

   /** One AI job on screen. `step` is the narration line, e.g. "Reading TD-118 · p.42". */
   export type AIRun<T> =
     | { status: "idle" }
     | { status: "running"; step?: string }
     | { status: "done"; value: T }
     | { status: "error"; message: string }
   ```
2. `lib/fixtures/example.ts`: must still typecheck unchanged (`status: "draft"`). Edit only if `tsc` complains.
3. `lib/fixtures/fake-ai.ts`: replace the body. No `await` inside a loop (lint: `no-await-in-loop`).
   ```ts
   // Fake latency and narration so running / failed states are real on screen. Not a backend.
   export type FakeAIOptions = {
     ms?: number
     fail?: boolean
     /** Narration lines, spread evenly over `ms`. */
     steps?: readonly string[]
     onStep?: (step: string) => void
   }

   export async function fakeAI<T>(value: T, options: FakeAIOptions = {}): Promise<T> {
     const { ms = 900, fail = false, steps = [], onStep } = options
     steps.forEach((step, index) => {
       setTimeout(() => onStep?.(step), (ms / steps.length) * index)
     })
     await new Promise((resolve) => setTimeout(resolve, ms))
     if (fail) {
       throw new Error("The model did not respond. Try again.")
     }
     return value
   }
   ```
4. Create `hooks/use-fake-ai.ts`. No effect. A run started later wins over an earlier one.
   ```ts
   "use client"

   import { useRef, useState } from "react"

   import { fakeAI, type FakeAIOptions } from "@/lib/fixtures/fake-ai"
   import type { AIRun } from "@/lib/fixtures/types"

   /**
    * One fake AI job as state: idle → running (with narration) → done | error.
    * Call `run` from an event handler. Call it again to retry.
    */
   export function useFakeAI<T>() {
     const [state, setState] = useState<AIRun<T>>({ status: "idle" })
     const latest = useRef(0)

     async function run(value: T, options: Omit<FakeAIOptions, "onStep"> = {}) {
       const id = ++latest.current
       const set = (next: AIRun<T>) => {
         if (id === latest.current) {
           setState(next)
         }
       }
       set({ status: "running", step: options.steps?.[0] })
       try {
         const result = await fakeAI(value, { ...options, onStep: (step) => set({ status: "running", step }) })
         set({ status: "done", value: result })
       } catch (error) {
         set({ status: "error", message: error instanceof Error ? error.message : "Something went wrong." })
       }
     }

     return [state, run] as const
   }
   ```
   If lint objects to a line, change that line only and say so in your report.
5. `hooks/use-hotkey.ts`: accept a `mod+` prefix. `mod` is ⌘ on macOS and Ctrl elsewhere. Mod combos fire while typing (a palette must open from an input). Plain keys behave exactly as today.
   - Before the effect: `const wantsMod = key.startsWith("mod+")` and `const wanted = wantsMod ? key.slice(4) : key`.
   - In `onKeyDown`:
     ```ts
     const hasMod = event.metaKey || event.ctrlKey
     const blocked =
       event.defaultPrevented ||
       event.altKey ||
       hasMod !== wantsMod ||
       (!wantsMod && !allowInInputs && isTypingTarget(event.target))
     const pressed = wantsMod ? event.key.toLowerCase() : event.key
     if (blocked || pressed !== wanted) {
       return
     }
     ```
   - Effect deps: `[wanted, wantsMod, enabled, allowInInputs]`.
   - Update the doc comment: `Shortcut: a single key ("j", "/", "?", "Escape") or "mod+k" (⌘K / Ctrl+K).`

Acceptance

- `grep -rn "reviewedBy" lib app components hooks` prints nothing.
- `grep -n "useEffect" hooks/use-fake-ai.ts` prints nothing.
- `npm run check` passes.
- Behaviour is smoke-tested in WP5 (no page in this package to host it).

Commits

1. `refactor(fixtures): make AIOutput a union so overrides carry a reason`
2. `feat(fixtures): add narration steps to fakeAI and a useFakeAI hook`
3. `feat(keyboard): support mod+key in useHotkey`

### WP3: Density bridge, token trim and AI mark

**Owns:** `app/app-theme.css`, `app/app-tokens.css`, `app/globals.css`, `app/page.tsx`, `components/ui/table.tsx`, `components/domain/ai-mark.tsx` (new). **Est.** 30 min.

Use only token classes. `text-xs`, `text-sm`, `outline-none` and `className` restyling of domain atoms will be lint errors after WP1.

Steps

1. `app/app-tokens.css`:
   - Replace the header comment with: `/* Domain tokens (L0 additions). Aliases of existing scales; the only new hue is the AI accent. Tailwind names: app-theme.css. */`
   - Delete the line `--brand: var(--ui-brand-solid);`.
2. `app/globals.css`: in `::selection`, change `var(--brand)` to `var(--ui-brand-solid)`.
3. `app/app-theme.css`:
   - Delete `--color-brand: var(--brand);` and `--spacing-control-compact: 24px;`.
   - Add at the end of the `@theme inline` block:
     ```css
     /* Bridge: shadcn primitives say text-sm; the product body size is 13 px (= text-body-sm). */
     --text-sm: 13px;
     --text-sm--line-height: 20px;
     ```
4. `components/ui/table.tsx`: change class strings only. No new props.

   | Part | From | To |
   |---|---|---|
   | `Table` (`<table>`) | `w-full caption-bottom text-sm` | `group/table w-full caption-bottom text-sm` |
   | `TableRow` | `border-b transition-colors hover:bg-muted/50 has-aria-expanded:bg-muted/50 data-[state=selected]:bg-muted` | `border-b has-aria-expanded:bg-muted/50 data-interactive:cursor-pointer data-interactive:hover:bg-muted/50 data-[state=selected]:bg-muted` |
   | `TableHead` | `h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground …` | `h-9 px-3 text-left align-middle text-caption-lg font-medium whitespace-nowrap text-fg-secondary …` (keep the checkbox selector) |
   | `TableCell` | `p-2 align-middle whitespace-nowrap …` | `h-row px-3 py-0 align-middle whitespace-nowrap group-data-[density=compact]/table:h-row-compact …` (keep the checkbox selector) |
5. Create `components/domain/ai-mark.tsx`:
   ```tsx
   // L3 atom. DESIGN rule 1 in one place: violet while the AI's word stands,
   // neutral once a person has accepted, edited or rejected it.
   import { cva, type VariantProps } from "class-variance-authority"
   import { SparklesIcon } from "lucide-react"
   import type { ComponentProps } from "react"

   import { cn } from "@/lib/utils"

   const aiMarkVariants = cva(
     "inline-flex h-5 shrink-0 items-center gap-1 rounded-sm px-1.5 text-caption-lg font-medium",
     {
       variants: {
         status: {
           draft: "bg-ai-subtle text-ai-fg",
           accepted: "bg-component text-fg-secondary",
           edited: "bg-component text-fg-secondary",
           rejected: "bg-component text-fg-tertiary",
         },
       },
     },
   )

   const labels = { draft: "AI draft", accepted: "Accepted", edited: "Edited", rejected: "Rejected" } as const

   type Props = Omit<ComponentProps<"span">, "children"> &
     Required<VariantProps<typeof aiMarkVariants>> & { by?: string }

   export function AIMark({ status, by, className, ...props }: Props) {
     return (
       <span className={cn(aiMarkVariants({ status }), className)} {...props}>
         {status === "draft" ? <SparklesIcon aria-hidden className="size-3" /> : null}
         {status !== "draft" && by ? `${labels[status]} by ${by}` : labels[status]}
       </span>
     )
   }
   ```
   `status` must not be null: if `Required<VariantProps<…>>` still allows `null`, type it as `keyof typeof labels`.
6. `app/page.tsx`: add a last column. Header `<TableHead>Status</TableHead>`, cell `<TableCell><AIMark status={f.ai.status} /></TableCell>`. Import `AIMark`. Change nothing else.
7. Measure. `npm run dev`, open `http://localhost:3100`, and in the page console read:
   `getComputedStyle(document.querySelector("td")).fontSize` and `document.querySelector("tbody tr").getBoundingClientRect().height`.
   Then add `data-density="compact"` to `<Table>` in the browser devtools only (not in the file) and read the row height again.
   If the row measures 42 / 33 (cell height plus the row border), move `h-row` and the compact class from `TableCell` to `TableRow` and measure again. If you have no browser tool, say so; WP5 measures.

Acceptance

- Font size `13px`. Row height `41` comfortable, `32` compact. Header cell `36`.
- Hovering a row changes nothing (no `data-interactive` on the placeholder rows).
- The Status column shows six violet "AI draft" marks with a sparkle icon.
- `grep -rn "\-\-brand)\|color-brand:\|control-compact" app styles` prints nothing.
- `npm run check` passes.

Commits

1. `refactor(tokens): drop the duplicate brand alias and an unused control token`
2. `fix(density): render primitives at 13 px and wire table rows to the row tokens`
3. `feat(domain): add AIMark atom for AI provenance`

### WP4: Make the docs true

**Owns:** `AGENTS.md`, `DESIGN.md`, `README.md`, `docs/yardsticks/hitl.md`, `keyboard.md`, `states.md`, `polish.md`, `type-density.md`. **Est.** 20 min.

Docs only. You describe names fixed by this plan (table above); the code lands from other packages. Keep every file at or under its current length plus five lines. Do not touch the `nextjs-agent-rules` block at the top of `AGENTS.md`.

Steps

| File | Change |
|---|---|
| `AGENTS.md` §1 | Replace the `fakeAI()` bullet with: "To show AI latency, narration or failure, use `useFakeAI()` from `hooks/use-fake-ai.ts` (idle → running + step → done or error). Nothing more." |
| `AGENTS.md` §1 | Add a bullet: "AI output is `AIOutput<T>` (`lib/fixtures/types.ts`). Status is draft, accepted, edited or rejected. Edited and rejected carry `by` and `reason`." |
| `AGENTS.md` §1 | In the determinism bullet, append: "Lint blocks both." |
| `AGENTS.md` §2 table | `components/ui/` rule: append "Exception: `table.tsx` is edited for density; don't re-add it". `components/domain/` rule: start the list with "AIMark, SeverityBadge, then ClauseRef, Citation and so on as the brief needs". `hooks/` rule: "`use-hotkey.ts` covers shortcuts (`\"j\"`, `\"mod+k\"`), `use-fake-ai.ts` covers AI jobs" |
| `AGENTS.md` §2, after the table | "Imports flow down only: `app` → `features` → `domain` → `ui`. Lint enforces it." Then: "L2 pieces (a data table, a property list) start inside their feature. Move one to `components/domain/` when a second screen uses it." Then: "`@tanstack/react-table` 9 is installed for sorting and selection. Its API is not v8: read the types in `node_modules/@tanstack/react-table` first." |
| `AGENTS.md` §3 | Type bullet ends "Not `text-sm`, `text-xs` or `text-xl`." Add a bullet: "Density: `<Table data-density=\"compact\">` gives 32 px rows; `data-interactive` on a `TableRow` gives it hover. Buttons in toolbars and rows are `size=\"sm\"` (28 px), `size=\"xs\"` (24 px) in compact rows." |
| `DESIGN.md` rule 1 | "Once a person approves something" → "Once a person accepts or edits something" |
| `DESIGN.md` Density | First bullet → "Rows: 41 px comfortable, 32 px compact (`data-density=\"compact\"` on `Table`). Controls: 28 px (`size=\"sm\"`), 24 px compact (`size=\"xs\"`)." |
| `hitl.md` | Line 1 of the list: "approved by X" → "accepted by X", and append "Use `AIMark`." · "After approval" → "After accept" · narration item: append "Pass `steps` to `useFakeAI`." |
| `keyboard.md` | First bullet → "Use `useHotkey()` from `hooks/use-hotkey.ts`; it ignores keys while typing. `useHotkey(\"mod+k\", …)` is ⌘K / Ctrl+K and fires while typing." |
| `states.md` | Last line → "Use `Empty`, `Skeleton`, `Alert` from `components/ui`. Drive AI blocks from `useFakeAI()`: idle, running, done and error map to the rows above. Stale is a flag you set when the input changes." |
| `polish.md` 1 | "Focus ring visible on every interactive thing. Primitives bring their own; anything custom keeps the global 1 px inset outline (lint blocks `outline-none`)." |
| `polish.md` 3 | "Disabled: primitives handle it. Custom elements use `text-fg-disabled` and `bg-disabled`, not `opacity-50`." |
| `type-density.md` | Item 1: after `text-body-sm` add "; primitives already render 13". Row item → "Rows 41 px (32 with `data-density=\"compact\"`); header 36 px; cells `px-3`. `Table` does this for you." |
| `README.md` "How I worked" | "this repo's first commit" → "every commit up to the `starter` tag". "everything after that commit" → "everything after that tag". |

Acceptance

- `grep -rniE "approv" AGENTS.md DESIGN.md docs/yardsticks` prints nothing.
- `grep -n "first commit" README.md` prints nothing.
- `grep -c "nextjs-agent-rules" AGENTS.md` prints `2`.
- `npm run check` passes.

Commits

1. `docs(agents): name the AI, keyboard and density seams and where L2 lives`
2. `docs(design): use accept, name control sizes by variant, match the primitives`

### WP5: Sequential follow-up (after WP1–WP4)

**Owns:** `.prettierignore`, plus a format-only pass over every non-ignored file. **Est.** 20 min. One agent, on `main`.

Steps

1. Merge `wp1-lint`, `wp2-seams`, `wp3-tokens`, `wp4-docs` into `main` in that order (fast-forward or rebase; keep the commits, no squash). Run `npm install` once (zod removal).
2. `npm run check`. This is the first time the new lint rules see the new code. Fix only lint errors, in the file that raises them, in a commit of its own: `fix(lint): satisfy the tightened rules`.
3. Check the docs point at real things. Each must print at least one line:
   `grep -n "export function useFakeAI" hooks/use-fake-ai.ts` · `grep -n "export function AIMark" components/domain/ai-mark.tsx` · `grep -n "mod+" hooks/use-hotkey.ts` · `grep -n "density=compact" components/ui/table.tsx`.
4. Smoke-test the hooks, then throw the test away. Create `features/_smoke/smoke.tsx` (a client module with a button that calls `run("ok", { ms: 1500, steps: ["Reading TD-118 · p.42", "Checking clause refs"] })`, a second button with `fail: true`, the state printed as JSON, and `useHotkey("mod+k", …)` plus `useHotkey("j", …)` writing to state). Render it from `app/page.tsx` temporarily. Confirm: both narration lines appear in order; the failure shows the error message; a second click retries; ⌘K fires with focus in an input; `j` does not fire while typing. Then `git checkout app/page.tsx`, delete `features/_smoke/`, and confirm `git status` shows no change outside `docs/architecture/`.
5. If WP3 could not measure, do step 7 of WP3 now.
6. `.prettierignore`: append `components/ui/`, `styles/tokens/`, `docs/architecture/`, `AGENTS.md` (its top block is rewritten by `next dev`).
7. `npm run format`. Confirm `git diff --stat` touches no file under `components/ui/` or `styles/tokens/`. `npm run check` again.
8. Look at `http://localhost:3100` at 1280 and 1440 px wide: nothing clips, the table reads as before plus the Status column.

Acceptance

- `npm run check` passes. `npx prettier --check "**/*.{ts,tsx,css,md}"` passes.
- `git status` shows nothing outside `docs/architecture/` (untracked plan files; the owner decides whether to commit them). No `_probe` or `_smoke` paths in `git ls-files`.

Commits

1. `fix(lint): satisfy the tightened rules` (only if step 2 needed it)
2. `chore(format): ignore vendored and generated files`
3. `style: format with prettier`

For the owner, not an agent: after reviewing, `git tag starter` and push the branch and tag. The README now refers to that tag.

## 4. Risks and what was left out

| Risk | Mitigation |
|---|---|
| **Overlap with `docs/architecture/dashboard-audit.md`.** That visual audit (written alongside this plan) proposes its own changes to `app/app-theme.css`, `components/ui/*`, `components/domain/*`, `app/page.tsx` and the docs, including 36 / 28 rows and new atoms | Pick one owner per file before dispatch. WP3 here is the minimal version. If the audit's packages A, D, E or G are adopted, drop the matching WP3 steps (3, 4, 6) and the matching WP4 rows; WP1 and WP2 are unaffected |
| WP4 documents code it cannot see | Names are fixed in the table in section 3. WP5 step 3 checks them |
| New lint rules meet new code only at merge | WP2 and WP3 are told the rules up front. WP5 step 2 is the catch |
| `--text-sm` bridge changes every primitive from 14 to 13 px | Intended. WP5 step 8 is a visual check. Revert is two lines |
| `table.tsx` no longer matches upstream shadcn | Recorded in AGENTS.md. `npx shadcn add table` would overwrite it |
| Row height lands at 42 because of the row border | WP3 step 7 measures and has a fallback |
| `useFakeAI` and `AIMark` turn out not to fit the brief | Each is one file and one commit. Delete on the day |
| `outline-none` pattern was not probed (the other four rules were) | WP1 step 8 probes it |
| Approval prompts stall WP1 and WP3 | Run them while someone is present |

Deliberately left out: any screen or composite; DataTable; command palette and shortcut sheet; Confidence, Citation and ClauseRef atoms; focus-ring, disabled and radius changes in vendored files; dark theme; stores, APIs, persistence, auth, tests; a product-name constant; changes to `.claude/settings.json`; moving token files; a `tokens.md` yardstick (the tokens are 23 lines of CSS).
