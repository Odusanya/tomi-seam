"use client"

import { useReducer, useState, type ReactNode } from "react"

import { PageBody, PageHeader } from "@/components/domain/page-header"
import { useSessionResults } from "@/hooks/use-session-results"
import { AppealDialog } from "@/features/history/appeal-dialog"
import { HistoryDetailSheet } from "@/features/history/history-detail-sheet"
import { filterHistory, type VerdictFilter } from "@/features/history/filter"
import { formatShown } from "@/features/history/format"
import {
  HistoryEmpty,
  HistoryError,
  HistoryNoResults,
} from "@/features/history/history-states"
import {
  HistoryTable,
  HistoryTableSkeleton,
} from "@/features/history/history-table"
import { HistoryToolbar } from "@/features/history/history-toolbar"
import {
  applyEdits,
  nextAttempt,
  otherVerdict,
  rowEditsReducer,
  type HistoryRow,
} from "@/features/history/row-edits"
import type { ClassificationResult } from "@/lib/fixtures/classification"
import { fakeAI } from "@/lib/fixtures/fake-ai"
import { rerunOutcome, seededHistory } from "@/lib/fixtures/history"

/** What the list is doing. One value, so "loading with rows" cannot be written. */
export type HistoryLoad =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; rows: readonly ClassificationResult[] }

const READY: HistoryLoad = { status: "ready", rows: seededHistory }

type ListProps = { rows: readonly ClassificationResult[] }

// Toolbar, table and the filtered no-results state. Filter state and row edits (re-runs,
// appeals) live here, so they reset with the list and the screen above only decides which
// state to show.
function HistoryList({ rows }: ListProps) {
  const [query, setQuery] = useState("")
  const [verdict, setVerdict] = useState<VerdictFilter>("all")
  const [lowOnly, setLowOnly] = useState(false)
  const [edits, dispatch] = useReducer(rowEditsReducer, {})
  const [appealing, setAppealing] = useState<HistoryRow | null>(null)
  const [appealOpen, setAppealOpen] = useState(false)
  // The open row is kept by id and read from the edited rows, so the sheet follows re-runs and
  // appeals live. The id stays set while the sheet animates out.
  const [detailId, setDetailId] = useState<string | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  // Filters read the edited rows, so an appealed verdict files under its new verdict.
  const edited = applyEdits(rows, edits)
  const visible = filterHistory(edited, verdict, query, { lowOnly })
  const detailRow = edited.find((row) => row.id === detailId) ?? null

  function retry(row: HistoryRow) {
    const attempt = nextAttempt(edits[row.id])
    const outcome = rerunOutcome(row, attempt)
    dispatch({ type: "start", id: row.id, attempt })
    fakeAI(outcome.confidence, { ms: 1400, fail: outcome.fail })
      .then((confidence) =>
        dispatch({ type: "finish", id: row.id, attempt, confidence })
      )
      .catch(() => dispatch({ type: "fail", id: row.id, attempt }))
  }

  const actions = {
    onRetry: retry,
    onAppeal: (row: HistoryRow) => {
      setAppealing(row)
      setAppealOpen(true)
    },
    onWithdraw: (row: HistoryRow) => dispatch({ type: "withdraw", id: row.id }),
  }

  return (
    <>
      <PageHeader
        title="History"
        count={formatShown(visible.length, rows.length)}
      />
      <PageBody>
        <HistoryToolbar
          query={query}
          onQueryChange={setQuery}
          verdict={verdict}
          onVerdictChange={setVerdict}
          lowOnly={lowOnly}
          onLowOnlyChange={setLowOnly}
        />
        <HistoryTable
          rows={visible}
          openId={detailOpen ? detailId : null}
          onOpen={(row) => {
            setDetailId(row.id)
            setDetailOpen(true)
          }}
          {...actions}
        />
        <HistoryDetailSheet
          row={detailRow}
          open={detailOpen}
          onOpenChange={setDetailOpen}
          {...actions}
        />
        <AppealDialog
          row={appealing}
          open={appealOpen}
          onOpenChange={setAppealOpen}
          onAppeal={(row, reason) => {
            dispatch({
              type: "appeal",
              id: row.id,
              verdict: otherVerdict(row.verdict),
              reason,
            })
            setAppealOpen(false)
          }}
        />
        {visible.length === 0 ? (
          <HistoryNoResults
            query={query}
            verdict={verdict}
            lowOnly={lowOnly}
            onClearQuery={() => setQuery("")}
            onClearVerdict={() => {
              setVerdict("all")
              setLowOnly(false)
            }}
          />
        ) : null}
      </PageBody>
    </>
  )
}

// Every state but the list has nothing to count, so its header shows the title alone.
function Frame({ children }: { children: ReactNode }) {
  return (
    <>
      <PageHeader title="History" />
      <PageBody>{children}</PageBody>
    </>
  )
}

function HistoryBody({
  load,
  onRetry,
}: {
  load: HistoryLoad
  onRetry: () => void
}) {
  if (load.status === "loading") {
    return (
      <Frame>
        <HistoryTableSkeleton />
      </Frame>
    )
  }
  if (load.status === "error") {
    return (
      <Frame>
        <HistoryError message={load.message} onRetry={onRetry} />
      </Frame>
    )
  }
  if (load.rows.length === 0) {
    return (
      <Frame>
        <HistoryEmpty />
      </Frame>
    )
  }
  return <HistoryList rows={load.rows} />
}

// The fixture is in memory, so the screen starts ready. Pass `initialLoad` to see the
// loading, error or zero-data state; Retry on the error state loads the fixture.
export function HistoryScreen({
  initialLoad = READY,
}: {
  initialLoad?: HistoryLoad
}) {
  const [load, setLoad] = useState(initialLoad)
  const { results } = useSessionResults()
  // The user's own results sit above the seeded rows, newest first.
  const shown: HistoryLoad =
    load.status === "ready"
      ? { status: "ready", rows: [...results, ...load.rows] }
      : load

  return (
    <main className="flex min-w-0 flex-1 flex-col">
      {/* The list renders its own header, so the count beside the title follows the filters. */}
      <HistoryBody load={shown} onRetry={() => setLoad(READY)} />
    </main>
  )
}
