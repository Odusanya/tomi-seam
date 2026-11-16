<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Agent rules

A time-boxed prototype (about 3 hours). It is judged on design quality, density, and how the UI handles AI output. It is not judged on the backend.

## 1. Dummy data only. Do not build logic.

- Data lives in `lib/fixtures/` as typed arrays. Pages import it directly.
- UI state is `useState`, `useReducer` or the URL. That is enough.
- Do NOT add APIs, route handlers, databases, persistence, auth, stores (Zustand, Redux), validation layers, generic state machines, data-fetching libraries or tests, unless the user asks.
- Fixtures are deterministic: use `prng()` and `DEMO_NOW` from `lib/fixtures/prng.ts`. Never `Math.random()` or `Date.now()`. Lint blocks both.
- To show latency or a failure, use `fakeAI()` from `lib/fixtures/fake-ai.ts`. Nothing more.
- In components use `useFakeAI()` (`hooks/use-fake-ai.ts`): `[state, run]`, with optional narration `steps`. Show AI status with `AIMark` (`components/domain/ai-mark.tsx`).
- If a feature needs real logic to look right, fake the result in a fixture and say so in your report.

## 2. Where code goes (layers)

| Folder | Layer | Rule |
|---|---|---|
| `components/ui/` | L1 primitives | shadcn (`base-rhea`: Base UI, not Radix). Add with `npx shadcn@latest add <name>`. Don't hand-edit unless asked. Exceptions: `table.tsx` is edited to read the density tokens, `sidebar.tsx` is edited to read the sidebar tokens (width, row metrics, active colour), and `button`, `badge`, `sheet`, `tooltip` carry motion fixes (named properties, `ease-panel`/`ease-press`, press scale, tooltip delay). So `npx shadcn add table` or `sidebar` would overwrite them |
| `components/domain/` | L3 atoms | SeverityBadge, ClauseRef, Citation and so on. Variants via `cva`, colours via tokens |
| `features/<name>/` | L4–L5 | One folder per screen or composite. Each owns its own state |
| `lib/fixtures/` | data | Typed dummy data and the helpers above |
| `hooks/` | effects | The only place `useEffect` is allowed (external systems such as keys and media queries). `use-hotkey.ts` covers shortcuts (`"j"`, `"mod+k"`) |

Imports flow down only: `app` → `features` → `domain` → `ui`. Lint enforces it.

L2 pieces (a data table, a property list) start inside their feature. Move one to `components/domain/` when a second screen uses it.

`@tanstack/react-table` 9 is installed for sorting and selection. Its API is not v8: read the types in `node_modules/@tanstack/react-table` first.

## 3. Styling

- Use variants, sizes and tokens. Never restyle a component with `className`; lint enforces this. If a treatment is missing, make an L3 atom with a variant.
- Product values (type, density, domain colours) live in `styles/tokens/product.css` only. See `docs/tokens.md`.
- Colours come from tokens only: `text-fg-*`, `bg-sev-*`, `bg-ai-*`, `border-line-*`. No palette classes, no hex, no `dark:`.
- Type: `text-body-sm` (13), `text-caption-lg` (12), `text-caption-base` (11). Not `text-sm`, `text-xs` or `text-xl`.
- Density: rows 36 px, compact 32 px (`<Table data-density="compact">`), header 32 px. One line height per size (13/20). `data-interactive` on a `TableRow` gives it hover. Toolbar and row buttons are `size="sm"` (28 px), `size="xs"` (24 px) in compact rows.
- Light theme only.
- Rules and their reasons: `DESIGN.md`. Short checklists: `docs/yardsticks/`. More context: `docs/INDEX.md`.

## 4. Check your work

Run `npm run lint` after every change and fix every error before reporting. The lint messages tell you the fix. Run `npm run check` (types, lint, build) before you say you're done, and paste the result.

Commands: `npm run dev` (port 3100) · `npm run check` · `npm run deploy` (Cloudflare, seamflow.tomiodusanya.com).

Spinners: `loading-dev` (React 19+, MIT). `import { Arc } from "loading-dev"`, props `size`, `duration`; 36 indicators, respects reduced motion. Leave `color` unset so it inherits `currentColor`, and colour the parent with a `text-*` token (lint can't see raw colours inside props).

Don't add dependencies, commit or deploy without asking.
