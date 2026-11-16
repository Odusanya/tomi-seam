import type { MouseEvent, ReactNode } from "react"

import { ConfidenceMeter } from "@/components/domain/confidence-meter"
import { SourceTag } from "@/components/domain/source-tag"
import { Thumbnail } from "@/components/domain/thumbnail"
import { VerdictAnswer } from "@/components/domain/verdict-answer"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { isLowConfidence } from "@/features/history/filter"
import { CopyIdButton } from "@/features/history/copy-id-button"
import { formatClassifiedAt, formatConfidence } from "@/features/history/format"
import type { HistoryRow } from "@/features/history/row-edits"
import {
  RowActionsMenu,
  type RowActions,
} from "@/features/history/verdict-menu"

const SKELETON_ROWS = ["a", "b", "c", "d", "e", "f", "g", "h"] as const

// History is short and the page is wide, so it uses comfortable rows (44 px).
const DENSITY = "comfortable"

// Column order: image, ID (people arrive with an ID in hand), verdict, confidence, who decided,
// date, actions. The table stays in auto layout, so "Decided by" takes the slack and a narrow
// viewport scrolls sideways instead of wrapping a row.
function Columns() {
  return (
    <colgroup>
      <col className="w-15" />
      <col className="w-64" />
      <col className="w-32" />
      <col className="w-44" />
      <col />
      <col className="w-48" />
      <col className="w-14" />
    </colgroup>
  )
}

// Numbers and dates are compared down the column: tabular figures, end-aligned, header included.
function End({ children }: { children: ReactNode }) {
  return <div className="text-right tabular-nums">{children}</div>
}

// "Decided by" follows the confidence figures; the inset keeps it off the numbers.
function Inset({ children }: { children: ReactNode }) {
  return <div className="flex items-center gap-2 pl-8">{children}</div>
}

function HeaderRow() {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>
          <span className="sr-only">Image</span>
        </TableHead>
        <TableHead>ID</TableHead>
        <TableHead>Hot dog?</TableHead>
        <TableHead>Confidence</TableHead>
        <TableHead>
          <Inset>Decided by</Inset>
        </TableHead>
        <TableHead>
          {/* Dates are formatted in UTC; the zone is stated once here, not on every row. */}
          <End>Date (UTC)</End>
        </TableHead>
        <TableHead>
          <span className="sr-only">Actions</span>
        </TableHead>
      </TableRow>
    </TableHeader>
  )
}

// After an appeal a person owns the verdict: the model's confidence no longer describes it,
// and the reason is one hover away.
function DecidedBy({ row }: { row: HistoryRow }) {
  if (row.status !== "appealed") {
    return (
      <span className="text-fg-secondary">{`${row.model.name} ${row.model.version}`}</span>
    )
  }
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            aria-label="You, on appeal. Show the reason"
            className="cursor-default text-fg-primary underline decoration-line-strong decoration-dotted underline-offset-4"
          />
        }
      >
        You, on appeal
      </TooltipTrigger>
      <TooltipContent>{row.appealReason}</TooltipContent>
    </Tooltip>
  )
}

// Yes or No. A failed re-run leaves the earlier answer standing, and says so quietly.
function Verdict({ row }: { row: HistoryRow }) {
  return (
    <span className="flex items-center gap-2">
      <VerdictAnswer verdict={row.verdict} running={row.status === "running"} />
      {row.status === "failed" ? (
        <span className="text-caption-base text-fg-tertiary">
          Re-run failed
        </span>
      ) : null}
    </span>
  )
}

function meterTone(row: HistoryRow) {
  if (row.status === "running") {
    return "muted"
  }
  return isLowConfidence(row) ? "low" : "neutral"
}

// The number people judge a verdict by, drawn as a bar so 66% and 97% differ at a glance.
function Confidence({ row }: { row: HistoryRow }) {
  if (row.status === "appealed") {
    return (
      <span className="text-fg-tertiary" aria-label="Not applicable">
        —
      </span>
    )
  }
  return (
    <ConfidenceMeter
      value={row.confidence}
      label={formatConfidence(row.confidence)}
      tone={meterTone(row)}
    />
  )
}

// The ID opens the row's details; the copy button beside it shows on hover or focus.
function IdCell({
  row,
  onOpen,
}: {
  row: HistoryRow
  onOpen?: (row: HistoryRow) => void
}) {
  return (
    <span className="flex items-center gap-1.5">
      {onOpen ? (
        <button
          type="button"
          aria-label={`Open details for ${row.id}`}
          className="cursor-pointer rounded-sm font-mono text-caption-lg text-fg-secondary hover:text-fg-primary"
          onClick={() => onOpen(row)}
        >
          {row.id}
        </button>
      ) : (
        <span className="font-mono text-caption-lg text-fg-secondary">
          {row.id}
        </span>
      )}
      <CopyIdButton id={row.id} />
      {row.source === "upload" ? <SourceTag source="upload" /> : null}
    </span>
  )
}

type OpenProps = {
  /** The row whose detail sheet is open, if any. */
  openId?: string | null
  onOpen?: (row: HistoryRow) => void
}

// A click anywhere on the row opens its details, except on the row's own controls (the actions
// button, the appeal tooltip, the ID) and on menu items, which React bubbles up from their portal.
function isRowClick(event: MouseEvent<HTMLTableRowElement>) {
  const target = event.target as Element
  return (
    event.currentTarget.contains(target) &&
    !target.closest("button, a, [role=menuitem]")
  )
}

function HistoryTableRow({
  row,
  selected,
  onOpen,
  ...actions
}: {
  row: HistoryRow
  selected: boolean
  onOpen?: (row: HistoryRow) => void
} & RowActions) {
  return (
    <TableRow
      data-interactive={onOpen ? "" : undefined}
      data-state={selected ? "selected" : undefined}
      onClick={(event) => {
        if (onOpen && isRowClick(event)) {
          onOpen(row)
        }
      }}
    >
      <TableCell>
        <Thumbnail src={row.thumbnail} alt="" size="md" />
      </TableCell>
      <TableCell>
        <IdCell row={row} onOpen={onOpen} />
      </TableCell>
      <TableCell>
        <Verdict row={row} />
      </TableCell>
      <TableCell>
        <Confidence row={row} />
      </TableCell>
      <TableCell>
        <Inset>
          <DecidedBy row={row} />
        </Inset>
      </TableCell>
      <TableCell>
        <End>
          <time dateTime={row.classifiedAt} className="text-fg-secondary">
            {formatClassifiedAt(row.classifiedAt)}
          </time>
        </End>
      </TableCell>
      <TableCell>
        <RowActionsMenu row={row} {...actions} />
      </TableCell>
    </TableRow>
  )
}

type Props = { rows: readonly HistoryRow[] } & RowActions & OpenProps

/**
 * Rows as given, newest first. No sorting: the order is the fixture's.
 * Each row's actions open from the "…" button in the last column: re-run, appeal, withdraw.
 * Clicking anywhere else on a row (or Enter on its ID) opens the row's detail sheet.
 */
export function HistoryTable({ rows, openId, onOpen, ...actions }: Props) {
  return (
    <Table data-density={DENSITY}>
      <Columns />
      <HeaderRow />
      <TableBody>
        {rows.map((row) => (
          <HistoryTableRow
            key={row.id}
            row={row}
            selected={row.id === openId}
            onOpen={onOpen}
            {...actions}
          />
        ))}
      </TableBody>
    </Table>
  )
}

/** Loading: the same header and row height, with a bar where each value will land. */
export function HistoryTableSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading classifications">
      <Table data-density={DENSITY}>
        <Columns />
        <HeaderRow />
        <TableBody>
          {SKELETON_ROWS.map((key) => (
            <TableRow key={key}>
              <TableCell>
                <Skeleton className="size-8" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-3 w-28" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-3 w-10" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-3 w-28" />
              </TableCell>
              <TableCell>
                <Skeleton className="ml-8 h-3 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="ml-auto h-3 w-28" />
              </TableCell>
              <TableCell />
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
