# Type and density

- [ ] Body 13 px (`text-body-sm`; primitives already render 13), headers and badges 12 px (`text-caption-lg`), kbd 11 px.
- [ ] Numbers, dates, IDs: `tabular-nums`, right-aligned when compared in a column.
- [ ] Clause refs and doc IDs in mono; nothing else.
- [ ] Four text tiers: primary, secondary, tertiary, disabled. Don't invent a fifth.
- [ ] Rows 36 px (32 with `data-density="compact"`); header 32 px; 13 px on a 20 px line; cells `px-3`. `Table` does this for you.
- [ ] Hairline row dividers; no zebra stripes; no card-per-row.
- [ ] Truncate long text with a tooltip; never wrap a table row.
- [ ] One focal point per screen. Secondary info is tertiary text, not smaller boxes.
