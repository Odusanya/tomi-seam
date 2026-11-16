"use client"

import { SearchField } from "@/components/domain/search-field"
import { SegmentedControl } from "@/components/domain/segmented-control"
import { VERDICT_FILTERS, type VerdictFilter } from "@/features/history/filter"
import { formatCount } from "@/features/history/format"

type Props = {
  query: string
  onQueryChange: (query: string) => void
  verdict: VerdictFilter
  onVerdictChange: (verdict: VerdictFilter) => void
  /** Rows shown after filtering. */
  count: number
}

// Filters first, then the table. Every control is 28 px and shares the rounded-md family.
export function HistoryToolbar({ query, onQueryChange, verdict, onVerdictChange, count }: Props) {
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
      <p aria-live="polite" className="ml-auto text-caption-lg text-fg-tertiary tabular-nums">
        {formatCount(count)}
      </p>
    </div>
  )
}
