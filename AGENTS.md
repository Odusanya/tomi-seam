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
- Fixtures are deterministic: use `prng()` and `DEMO_NOW` from `lib/fixtures/prng.ts`. Never `Math.random()` or `Date.now()`.
- To show latency or a failure, use `fakeAI()` from `lib/fixtures/fake-ai.ts`. Nothing more.
- If a feature needs real logic to look right, fake the result in a fixture and say so in your report.

## 2. Where code goes (layers)

| Folder | Layer | Rule |
|---|---|---|
| `components/ui/` | L1 primitives | shadcn (`base-rhea`: Base UI, not Radix). Add with `npx shadcn@latest add <name>`. Don't hand-edit unless asked |
| `components/domain/` | L3 atoms | SeverityBadge, ClauseRef, Citation and so on. Variants via `cva`, colours via tokens |
| `features/<name>/` | L4–L5 | One folder per screen or composite. Each owns its own state |
| `lib/fixtures/` | data | Typed dummy data and the helpers above |
| `hooks/` | effects | The only place `useEffect` is allowed (external systems such as keys and media queries). `use-hotkey.ts` covers shortcuts |

Imports flow down only: `app` → `features` → `domain` → `ui`.

## 3. Styling

- Use variants, sizes and tokens. Never restyle a component with `className`; lint enforces this. If a treatment is missing, make an L3 atom with a variant.
- Colours come from tokens only: `text-fg-*`, `bg-sev-*`, `bg-ai-*`, `border-line-*`. No palette classes, no hex, no `dark:`.
- Type: `text-body-sm` (13), `text-caption-lg` (12), `text-caption-base` (11). Not `text-sm`.
- Light theme only.
- Rules and their reasons: `DESIGN.md`. Short checklists: `docs/yardsticks/`. More context: `docs/INDEX.md`.

## 4. Check your work

Run `npm run lint` after every change and fix every error before reporting. The lint messages tell you the fix. Run `npm run check` (types, lint, build) before you say you're done, and paste the result.

Commands: `npm run dev` (port 3100) · `npm run check` · `npm run deploy` (Cloudflare, seamflow.tomiodusanya.com).

Don't add dependencies, commit or deploy without asking.
