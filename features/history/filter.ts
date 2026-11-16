// Filtering for the History table: a verdict filter and a search by ID. Pure functions,
// so the screen derives the visible rows during render.
import {
  LOW_CONFIDENCE,
  type ClassificationResult,
  type Verdict,
} from "@/lib/fixtures/classification"

export type VerdictFilter = "all" | Verdict

export const VERDICT_FILTERS: readonly { value: VerdictFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "hot-dog", label: "Hot Dog" },
  { value: "not-hot-dog", label: "Not Hot Dog" },
]

// TODO(you): decide the search-by-ID match rule. The default below is a case-insensitive
// substring match on the whole `id`, which is the most forgiving choice. Open choices:
//   1. Prefix vs substring. Substring finds "9b" anywhere in the ID; prefix only matches
//      from the start, which is stricter but is how people paste the head of an ID.
//   2. Case. IDs are lower-case hex today. Fold case (as now) or match exactly?
//   3. The `cls_` prefix. Every ID starts with it, so typing "c", "cls" or "cls_" matches
//      every row and "s_" matches all of them too. Should the prefix be stripped from the
//      query and the ID before matching, so only the hex part counts?
// Whatever you choose, an empty (or whitespace-only) query should keep matching every row.
export function matchesQuery(row: ClassificationResult, query: string): boolean {
  const needle = query.trim().toLowerCase()
  return row.id.toLowerCase().includes(needle)
}

export function matchesVerdict(row: ClassificationResult, filter: VerdictFilter): boolean {
  return filter === "all" || row.verdict === filter
}

/**
 * A model verdict below the cut-off. An appealed row is a person's verdict, so the model's
 * confidence no longer describes it and it never counts as low.
 */
export function isLowConfidence(row: ClassificationResult & { status?: string }): boolean {
  return row.status !== "appealed" && row.confidence < LOW_CONFIDENCE
}

export function filterHistory<Row extends ClassificationResult>(
  rows: readonly Row[],
  filter: VerdictFilter,
  query: string,
): Row[] {
  return rows.filter((row) => matchesVerdict(row, filter) && matchesQuery(row, query))
}
