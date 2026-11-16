"use client"

import { TriangleAlertIcon, ScanIcon } from "lucide-react"
import Link from "next/link"
import { useState, type ReactNode } from "react"

import { PageBody, PageHeader } from "@/components/domain/page-header"
import { SegmentedControl } from "@/components/domain/segmented-control"
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button, buttonVariants } from "@/components/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { useSessionResults } from "@/hooks/use-session-results"
import { ConfidenceDistribution } from "@/features/overview/confidence-distribution"
import { ChartSection, DailyBars, DailyChartSkeleton, Legend } from "@/features/overview/daily-chart"
import { KpiStrip, KpiStripSkeleton } from "@/features/overview/kpi-strip"
import { RecentTable, RecentTableSkeleton } from "@/features/overview/recent-table"
import { overviewStats, PERIODS, type ConfidenceBand, type DayBucket, type Period } from "@/features/overview/stats"
import { StatusList } from "@/features/overview/status-list"
import type { ClassificationResult } from "@/lib/fixtures/classification"
import { seededHistory } from "@/lib/fixtures/history"

/** Same shape as History's load, so both screens show their states the same way. */
export type OverviewLoad =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; rows: readonly ClassificationResult[] }

const READY: OverviewLoad = { status: "ready", rows: seededHistory }

// How many and how sure: per-day bars beside a confidence histogram (after Gumloop's score
// dashboard). Trend and distribution share one legend: same two colours, same meaning, both charts.
function TrendAndDistribution({ days, bands }: { days: readonly DayBucket[]; bands: readonly ConfidenceBand[] }) {
  return (
    <ChartSection title="Classifications" aside={<Legend days={days} />}>
      <div className="grid gap-8 lg:grid-cols-3">
        <figure className="flex min-w-0 flex-col gap-3 lg:col-span-2">
          <figcaption className="text-caption-lg font-medium text-fg-secondary">Per day</figcaption>
          <DailyBars days={days} />
        </figure>
        <figure className="flex min-w-0 flex-col gap-3">
          <figcaption className="text-caption-lg font-medium text-fg-secondary">By confidence</figcaption>
          <ConfidenceDistribution bands={bands} />
        </figure>
      </div>
    </ChartSection>
  )
}

const RECENT = 5

// Summary, then detail: figures, then the chart, then the rows behind them.
function Layout({ kpis, chart, recent, status }: Record<"kpis" | "chart" | "recent" | "status", ReactNode>) {
  return (
    <div className="flex flex-col gap-3">
      {kpis}
      {chart}
      {/* Cards stretch to the taller of the pair, so the row ends on one line. */}
      <div className="grid gap-3 lg:grid-cols-3">
        <div className="flex min-w-0 flex-col *:flex-1 lg:col-span-2">{recent}</div>
        <div className="flex min-w-0 flex-col *:flex-1">{status}</div>
      </div>
    </div>
  )
}

/** Zero data. Copy from the Paper "Overview · empty" frame. */
function OverviewEmpty() {
  return (
    <ChartSection title="Classifications">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ScanIcon aria-hidden strokeWidth={1.5} />
          </EmptyMedia>
          <EmptyTitle>No classifications yet</EmptyTitle>
          <EmptyDescription>Daily Hot Dog and Not Hot Dog counts appear here after your first scan.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Link href="/" className={buttonVariants({ variant: "secondary" })}>
            Scan image
          </Link>
        </EmptyContent>
      </Empty>
    </ChartSection>
  )
}

function OverviewBody({ load, period, onRetry }: { load: OverviewLoad; period: Period; onRetry: () => void }) {
  if (load.status === "loading") {
    return (
      <div aria-busy="true" aria-label="Loading overview" className="contents">
        <Layout
          kpis={<KpiStripSkeleton />}
          chart={<DailyChartSkeleton count={Number(period)} />}
          recent={<RecentTableSkeleton />}
          status={<StatusList lastVerdictAt={null} />}
        />
      </div>
    )
  }
  if (load.status === "error") {
    return (
      <Alert variant="destructive">
        <TriangleAlertIcon aria-hidden strokeWidth={1.5} />
        <AlertTitle>Overview could not be loaded</AlertTitle>
        <AlertDescription>{load.message}</AlertDescription>
        <AlertAction>
          <Button variant="outline" size="sm" onClick={onRetry}>
            Retry
          </Button>
        </AlertAction>
      </Alert>
    )
  }

  const { days, kpis, bands } = overviewStats(load.rows, period)
  const recent = load.rows.slice(0, RECENT)
  return (
    <Layout
      kpis={<KpiStrip kpis={kpis} period={period} />}
      chart={load.rows.length === 0 ? <OverviewEmpty /> : <TrendAndDistribution days={days} bands={bands} />}
      recent={
        recent.length === 0 ? (
          <ChartSection title="Recent classifications">
            <p className="py-8 text-center text-body-sm text-fg-tertiary">The five most recent verdicts will be listed here.</p>
          </ChartSection>
        ) : (
          <RecentTable rows={recent} />
        )
      }
      status={<StatusList lastVerdictAt={recent[0]?.classifiedAt ?? null} />}
    />
  )
}

// The fixture is in memory, so the screen starts ready. Pass `initialLoad` to see the
// loading, error or zero-data state; Retry on the error state loads the fixture.
export function OverviewScreen({ initialLoad = READY }: { initialLoad?: OverviewLoad }) {
  const [load, setLoad] = useState(initialLoad)
  const [period, setPeriod] = useState<Period>("14")
  const { results } = useSessionResults()
  const shown: OverviewLoad =
    load.status === "ready" ? { status: "ready", rows: [...results, ...load.rows] } : load

  return (
    <main className="flex min-w-0 flex-1 flex-col">
      <PageHeader
        title="Overview"
        actions={<SegmentedControl aria-label="Period" options={PERIODS} value={period} onValueChange={setPeriod} />}
      />
      <PageBody width="wide">
        <OverviewBody load={shown} period={period} onRetry={() => setLoad(READY)} />
      </PageBody>
    </main>
  )
}
