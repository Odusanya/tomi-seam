# Design rules

Dense expert tool, light theme, quiet chrome. Data first, decoration last.
Details live in `docs/yardsticks/`. Each rule has a reason so it can be defended.

## Human in the loop (the core)
1. **Purple means the AI said it.** Once a person accepts something, it stops being purple. → trust stays legible
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

## Dashboards
- **Colour only on the exception.** Everything else is neutral.
- **Status is a glyph plus a neutral label**, not a tinted pill.
- **Icons 16 px, 1.5 stroke**, muted icon colour. The sidebar is the exception: Heroicons 16 px solid (`@heroicons/react/16/solid`), no stroke.
- **One row height**, everywhere in a table.
- **A selected row gets a fill**, not a ring.
- **Order: filters, then chart, then table.**

## Density
- Rows 36 px, compact 32 px (`data-density="compact"` on `Table`), comfortable 44 px (`data-density="comfortable"`, for short tables with room to spare), header 32 px. 13 px text on a 20 px line; one line height per size. Controls: 28 px (`size="sm"`), 24 px compact (`size="xs"`).
- Labels secondary and medium weight; values primary and regular.
- Every list, table and panel has an empty, loading and error state.
