"use client"

import { useReducer, useState } from "react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { AppealDialog } from "@/features/history/appeal-dialog"
import { filterHistory, type VerdictFilter } from "@/features/history/filter"
import { HistoryEmpty, HistoryError, HistoryNoResults } from "@/features/history/history-states"
import { HistoryTable, HistoryTableSkeleton } from "@/features/history/history-table"
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
import { workspace } from "@/lib/fixtures/nav"

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
  const [edits, dispatch] = useReducer(rowEditsReducer, {})
  const [appealing, setAppealing] = useState<HistoryRow | null>(null)
  const [appealOpen, setAppealOpen] = useState(false)
  // Filters read the edited rows, so an appealed verdict files under its new verdict.
  const visible = filterHistory(applyEdits(rows, edits), verdict, query)

  function retry(row: HistoryRow) {
    const attempt = nextAttempt(edits[row.id])
    const outcome = rerunOutcome(row, attempt)
    dispatch({ type: "start", id: row.id, attempt })
    fakeAI(outcome.confidence, { ms: 1400, fail: outcome.fail })
      .then((confidence) => dispatch({ type: "finish", id: row.id, attempt, confidence }))
      .catch(() => dispatch({ type: "fail", id: row.id, attempt }))
  }

  return (
    <>
      <HistoryToolbar
        query={query}
        onQueryChange={setQuery}
        verdict={verdict}
        onVerdictChange={setVerdict}
        count={visible.length}
      />
      <HistoryTable
        rows={visible}
        onRetry={retry}
        onAppeal={(row) => {
          setAppealing(row)
          setAppealOpen(true)
        }}
        onWithdraw={(row) => dispatch({ type: "withdraw", id: row.id })}
      />
      <AppealDialog
        row={appealing}
        open={appealOpen}
        onOpenChange={setAppealOpen}
        onAppeal={(row, reason) => {
          dispatch({ type: "appeal", id: row.id, verdict: otherVerdict(row.verdict), reason })
          setAppealOpen(false)
        }}
      />
      {visible.length === 0 ? (
        <HistoryNoResults
          query={query}
          verdict={verdict}
          onClearQuery={() => setQuery("")}
          onClearVerdict={() => setVerdict("all")}
        />
      ) : null}
    </>
  )
}

function HistoryBody({ load, onRetry }: { load: HistoryLoad; onRetry: () => void }) {
  if (load.status === "loading") {
    return <HistoryTableSkeleton />
  }
  if (load.status === "error") {
    return <HistoryError message={load.message} onRetry={onRetry} />
  }
  if (load.rows.length === 0) {
    return <HistoryEmpty />
  }
  return <HistoryList rows={load.rows} />
}

// The fixture is in memory, so the screen starts ready. Pass `initialLoad` to see the
// loading, error or zero-data state; Retry on the error state loads the fixture.
export function HistoryScreen({ initialLoad = READY }: { initialLoad?: HistoryLoad }) {
  const [load, setLoad] = useState(initialLoad)

  return (
    <main className="flex min-w-0 flex-1 flex-col">
      <header className="flex h-12 shrink-0 items-center border-b border-default pr-4 pl-5">
        <h1 className="sr-only">History</h1>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>{workspace.name}</BreadcrumbItem>
            <BreadcrumbSeparator>/</BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage>History</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      <div className="flex min-h-0 flex-1 flex-col gap-4 p-5">
        <HistoryBody load={load} onRetry={() => setLoad(READY)} />
      </div>
    </main>
  )
}
