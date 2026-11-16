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

// Filters first, then the table. The row count sits beside the page title, not here. Every control is 28 px and shares the rounded-md family.
export function HistoryToolbar({
  query,
  onQueryChange,
  verdict,
  onVerdictChange,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <SearchField
        className="w-full sm:w-70"
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
