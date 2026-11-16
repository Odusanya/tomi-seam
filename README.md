# [Product name]

[One line: what this is and who it's for.] · **Live:** https://seamflow.tomiodusanya.com

## The user and the job
[Two sentences.]

## What I built
- 
- 
- 

## Decisions
[3–5 from DECISIONS.md: density, AI provenance, override with reason, keyboard.]

## What I cut, and what's next
[Cut and why. What I'd test with a real reviewer.]

## How I worked
- Starter before the clock: this repo's first commit (Next 16, shadcn on Base UI, tokens, lint, fixtures helpers). No screens.
- Built in the session: everything after that commit.
- Agents: [what they did, how I reviewed it]. Lint (`@shadcn/lint`, `oxlint-tailwindcss`) kept their output on-system.
- Data is dummy and deterministic (`lib/fixtures`). State is in the UI; no backend by design.

## Run
```bash
npm install
npm run dev     # http://localhost:3100
npm run check   # types, lint, build
```

## Keyboard
| Key | Action |
|---|---|
| `j` / `k` | Next / previous |
| `a` `r` `e` | Accept / reject / edit |
| `?` | Shortcuts |
