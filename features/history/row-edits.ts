// What a person has done to History rows this session: a re-run of the model, or an appeal
// that overrides the verdict. Kept as edits on top of the fixture, so the fixture stays
// untouched and the visible rows are derived during render.
import type {
  ClassificationResult,
  Verdict,
} from "@/lib/fixtures/classification"

export type RowEdit =
  | { kind: "running"; attempt: number }
  | { kind: "failed"; attempt: number }
  | { kind: "rerun"; attempt: number; confidence: number }
  | { kind: "appealed"; attempt: number; verdict: Verdict; reason: string }
  // An appeal was withdrawn. Kept, not deleted, so attempt numbers never restart.
  | { kind: "idle"; attempt: number }

export type RowStatus = "idle" | "running" | "failed" | "appealed"

/** A row as the table shows it: the fixture row with any edit applied. */
export type HistoryRow = ClassificationResult & {
  status: RowStatus
  appealReason?: string
}

export type RowEdits = Readonly<Record<string, RowEdit>>

export type RowEditAction =
  | { type: "start"; id: string; attempt: number }
  | { type: "fail"; id: string; attempt: number }
  | { type: "finish"; id: string; attempt: number; confidence: number }
  | { type: "appeal"; id: string; verdict: Verdict; reason: string }
  | { type: "withdraw"; id: string }

type Settle = Extract<RowEditAction, { type: "fail" | "finish" }>

// A late result from an older attempt, or one that lands after an appeal, is dropped.
// Every edit carries the row's last attempt number (0 = never re-run) so the count only grows.
function settle(edits: RowEdits, action: Settle): RowEdits {
  const current = edits[action.id]
  if (current?.kind !== "running" || current.attempt !== action.attempt) {
    return edits
  }
  const next: RowEdit =
    action.type === "fail"
      ? { kind: "failed", attempt: action.attempt }
      : {
          kind: "rerun",
          attempt: action.attempt,
          confidence: action.confidence,
        }
  return { ...edits, [action.id]: next }
}

export function rowEditsReducer(
  edits: RowEdits,
  action: RowEditAction
): RowEdits {
  switch (action.type) {
    case "start":
      return {
        ...edits,
        [action.id]: { kind: "running", attempt: action.attempt },
      }
    case "fail":
    case "finish":
      return settle(edits, action)
    case "appeal": {
      const attempt = lastAttempt(edits, action.id)
      return {
        ...edits,
        [action.id]: {
          kind: "appealed",
          attempt,
          verdict: action.verdict,
          reason: action.reason,
        },
      }
    }
    case "withdraw":
      return withdraw(edits, action.id)
  }
}

function lastAttempt(edits: RowEdits, id: string): number {
  return edits[id]?.attempt ?? 0
}

// A row that was never re-run goes back to the fixture; one that was keeps its count.
function withdraw(edits: RowEdits, id: string): RowEdits {
  const attempt = lastAttempt(edits, id)
  if (attempt > 0) {
    return { ...edits, [id]: { kind: "idle", attempt } }
  }
  const { [id]: _withdrawn, ...rest } = edits
  return rest
}

/** The attempt number for the next re-run of a row. */
export function nextAttempt(edit: RowEdit | undefined): number {
  return (edit?.attempt ?? 0) + 1
}

export function applyEdits(
  rows: readonly ClassificationResult[],
  edits: RowEdits
): HistoryRow[] {
  return rows.map((row) => {
    const edit = edits[row.id]
    switch (edit?.kind) {
      case undefined:
      case "idle":
        return { ...row, status: "idle" }
      case "running":
        return { ...row, status: "running" }
      case "failed":
        return { ...row, status: "failed" }
      case "rerun":
        return { ...row, status: "idle", confidence: edit.confidence }
      case "appealed":
        return {
          ...row,
          status: "appealed",
          verdict: edit.verdict,
          appealReason: edit.reason,
        }
    }
  })
}

export function otherVerdict(verdict: Verdict): Verdict {
  return verdict === "hot-dog" ? "not-hot-dog" : "hot-dog"
}
