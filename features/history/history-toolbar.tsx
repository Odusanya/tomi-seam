"use client"

import { SearchField } from "@/components/domain/search-field"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
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

// Filters first, then the table. Every control is 28 px (`size="sm"`).
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
      <ToggleGroup
        aria-label="Filter by verdict"
        size="sm"
        value={[verdict]}
        onValueChange={(next) => {
          // Single choice that cannot be cleared: pressing the active item keeps it.
          const picked = VERDICT_FILTERS.find((option) => option.value === next[0])
          if (picked) {
            onVerdictChange(picked.value)
          }
        }}
      >
        {VERDICT_FILTERS.map((option) => (
          <ToggleGroupItem key={option.value} value={option.value}>
            {option.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <p aria-live="polite" className="ml-auto text-caption-lg text-fg-tertiary tabular-nums">
        {formatCount(count)}
      </p>
    </div>
  )
}
