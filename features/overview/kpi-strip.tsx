import { TriangleAlertIcon } from "lucide-react"
import Link from "next/link"
import type { ReactNode } from "react"

import { SurfaceCard } from "@/components/domain/surface-card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  formatDelta,
  formatPercent,
  LOW_CONFIDENCE_HINT,
  type Kpis,
  type Period,
} from "@/features/overview/stats"

// One card shape for every figure: label, value, note.
function Cell({ label, value, note }: { label: ReactNode; value: ReactNode; note: ReactNode }) {
  return (
    <SurfaceCard size="stat">
      <dt className="flex items-center gap-1.5 text-caption-lg font-medium text-fg-secondary">{label}</dt>
      <dd className="text-heading-5 text-fg-primary tabular-nums">{value}</dd>
      <dd className="truncate text-caption-lg text-fg-tertiary tabular-nums">{note}</dd>
    </SurfaceCard>
  )
}

const EMPTY = <span className="text-fg-tertiary">—</span>

function Strip({ children }: { children: ReactNode }) {
  return (
    <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {children}
    </dl>
  )
}

export function KpiStrip({ kpis, period }: { kpis: Kpis; period: Period }) {
  const shaky = kpis.lowConfidence > 0
  return (
    <Strip>
      <Cell
        label="Classifications"
        value={kpis.total}
        note={formatDelta(kpis.total, kpis.previousTotal, period)}
      />
      <Cell
        label={
          <>
            {/* Ties the figure to its chart series; the word carries the meaning. */}
            <span aria-hidden className="size-2 rounded-xs bg-chart-hot-dog" />
            Hot Dog rate
          </>
        }
        value={kpis.hotDogRate === null ? EMPTY : formatPercent(kpis.hotDogRate)}
        note={`${kpis.hotDog} of ${kpis.total}`}
      />
      <Cell
        label="Average confidence"
        value={kpis.averageConfidence === null ? EMPTY : formatPercent(kpis.averageConfidence)}
        note="Across both verdicts"
      />
      {/* The exception: colour only when there is something to look at. */}
      <Cell
        label={
          <>
            {shaky ? <TriangleAlertIcon aria-hidden strokeWidth={1.5} className="size-3.5 text-fg-warning" /> : null}
            Low confidence
          </>
        }
        value={kpis.lowConfidence}
        note={
          shaky ? (
            <Link href="/history" className="text-fg-secondary underline decoration-line-strong underline-offset-4 hover:text-fg-primary">
              {LOW_CONFIDENCE_HINT} · Review
            </Link>
          ) : (
            LOW_CONFIDENCE_HINT
          )
        }
      />
    </Strip>
  )
}

const KEYS = ["a", "b", "c", "d"] as const

export function KpiStripSkeleton() {
  return (
    <Strip>
      {KEYS.map((key) => (
        <Cell key={key} label={<Skeleton className="h-3 w-24" />} value={<Skeleton className="my-1.5 h-5 w-12" />} note={<Skeleton className="h-3 w-28" />} />
      ))}
    </Strip>
  )
}
