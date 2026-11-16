"use client"

import { TriangleAlertIcon } from "lucide-react"

import { FilterToggle } from "@/components/domain/filter-toggle"
import { SearchField } from "@/components/domain/search-field"
import { SegmentedControl } from "@/components/domain/segmented-control"
import {
  LOW_LABEL,
  VERDICT_FILTERS,
  type VerdictFilter,
} from "@/features/history/filter"

type Props = {
  query: string
  onQueryChange: (query: string) => void
  verdict: VerdictFilter
  onVerdictChange: (verdict: VerdictFilter) => void
  /** Only rows below the confidence cut-off. */
  lowOnly: boolean
  onLowOnlyChange: (lowOnly: boolean) => void
}

// Filters first, then the table. The row count sits beside the page title, not here. Every control is 28 px and shares the rounded-md family.
export function HistoryToolbar({
  query,
  onQueryChange,
  verdict,
  onVerdictChange,
  lowOnly,
  onLowOnlyChange,
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
      <FilterToggle pressed={lowOnly} onPressedChange={onLowOnlyChange}>
        <TriangleAlertIcon
          aria-hidden
          strokeWidth={1.5}
          className="size-3.5 text-fg-warning"
        />
        {LOW_LABEL}
      </FilterToggle>
    </div>
  )
}
