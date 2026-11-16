"use client"

import { SearchField } from "@/components/domain/search-field"
import { SegmentedControl } from "@/components/domain/segmented-control"
import { VERDICT_FILTERS, type VerdictFilter } from "@/features/history/filter"

type Props = {
  query: string
  onQueryChange: (query: string) => void
  verdict: VerdictFilter
  onVerdictChange: (verdict: VerdictFilter) => void
}

// Lives in the page header's right slot, opposite the title and count. The bar is a fixed 48 px,
// so the controls never wrap; the search narrows on small screens instead. Every control is 28 px.
export function HistoryToolbar({
  query,
  onQueryChange,
  verdict,
  onVerdictChange,
}: Props) {
  return (
    <div className="flex items-center gap-2">
      <SearchField
        className="w-40 sm:w-70"
        label="Search by ID"
        placeholder="Search by ID"
        value={query}
        onValueChange={onQueryChange}
      />
      <SegmentedControl
        aria-label="Filter by verdict"
        options={VERDICT_FILTERS}
        value={verdict}
        onValueChange={onVerdictChange}
      />
    </div>
  )
}
