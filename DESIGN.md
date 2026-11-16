# Design rules

Dense expert tool, light theme, quiet chrome. Data first, decoration last.
Details live in `docs/yardsticks/`. Each rule has a reason so it can be defended.

## Human in the loop (the core)
1. **Purple means the AI said it.** Once a person approves something, it stops being purple. → trust stays legible
2. **No citation, no accept.** Accept is disabled with a hint until a source exists. → nothing unverifiable becomes final
3. **Overriding the AI needs a reason**, and the reason is recorded. → audit and model feedback
4. **Every action has a key**, shown on focus. → reviewers live on the keyboard
5. **Every highlight belongs to exactly one source**: a finding or an AI extraction awaiting review.
6. **A broken citation is a reportable error**, not a dead link.

## Visual
- One accent for brand, one for AI (violet). Severity shares status hues but has its own tokens.
- 13 / 12 / 11 px product scale. Numbers, IDs and dates are `tabular-nums`.
- **Mono only for clause refs and document IDs** (exact, copyable, compared character by character). Everything else is Inter.
- Hairlines, not boxes. Depth only for things that float (menus, popovers, dialogs).
- Motion is functional: 120–200 ms, named properties, none on row hover.

## Density
- Rows: 41 px comfortable, 32 px compact. Controls: 28 px, 24 px compact.
- Labels secondary and medium weight; values primary and regular.
- Every list, table and panel has an empty, loading and error state.
