import type { ReactNode } from "react"

import { SourceTag } from "@/components/domain/source-tag"
import { Thumbnail } from "@/components/domain/thumbnail"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { formatClassifiedAt, formatConfidence } from "@/features/history/format"
import type { HistoryRow } from "@/features/history/row-edits"
import { VerdictMenu, type RowActions } from "@/features/history/verdict-menu"

const SKELETON_ROWS = ["a", "b", "c", "d", "e", "f", "g", "h"] as const

// History is short and the page is wide, so it uses comfortable rows (44 px).
const DENSITY = "comfortable"

// Column widths. The table stays in auto layout, so the ID column takes the slack and a
// narrow viewport scrolls sideways instead of wrapping a row.
function Columns() {
  return (
    <colgroup>
      <col className="w-15" />
      <col className="w-60" />
      <col className="w-28" />
      <col className="w-56" />
      <col className="w-48" />
      <col />
    </colgroup>
  )
}

// Numbers and dates are compared down the column: tabular figures, end-aligned, header included.
function End({ children }: { children: ReactNode }) {
  return <div className="text-right tabular-nums">{children}</div>
}

// Model and ID sit after end-aligned columns; the inset keeps them off the numbers.
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
        <TableHead>Verdict</TableHead>
        <TableHead>
          <End>Confidence</End>
        </TableHead>
        <TableHead>
          <Inset>Decided by</Inset>
        </TableHead>
        <TableHead>
          <End>Classified</End>
        </TableHead>
        <TableHead>
          <Inset>ID</Inset>
        </TableHead>
      </TableRow>
    </TableHeader>
  )
}

// After an appeal a person owns the verdict: the model's confidence no longer describes it,
// and the reason is one hover away.
function DecidedBy({ row }: { row: HistoryRow }) {
  if (row.status !== "appealed") {
    return <span className="text-fg-secondary">{`${row.model.name} ${row.model.version}`}</span>
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

function Confidence({ row }: { row: HistoryRow }) {
  if (row.status === "appealed") {
    return <span className="text-fg-tertiary" aria-label="Not applicable">—</span>
  }
  return <span className={row.status === "running" ? "text-fg-tertiary" : undefined}>{formatConfidence(row.confidence)}</span>
}

function HistoryTableRow({ row, ...actions }: { row: HistoryRow } & RowActions) {
  return (
    <TableRow>
      <TableCell>
        <Thumbnail src={row.thumbnail} alt="" size="md" />
      </TableCell>
      <TableCell>
        <VerdictMenu row={row} {...actions} />
      </TableCell>
      <TableCell>
        <End>
          <Confidence row={row} />
        </End>
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
        <Inset>
          <span className="font-mono text-caption-lg text-fg-secondary">{row.id}</span>
          {row.source === "upload" ? <SourceTag source="upload" /> : null}
        </Inset>
      </TableCell>
    </TableRow>
  )
}

type Props = { rows: readonly HistoryRow[] } & RowActions

/**
 * Rows as given, newest first. No sorting: the order is the fixture's.
 * Each row's actions open from its verdict pill: re-run the model, appeal, withdraw an appeal.
 */
export function HistoryTable({ rows, ...actions }: Props) {
  return (
    <Table data-density={DENSITY}>
      <Columns />
      <HeaderRow />
      <TableBody>
        {rows.map((row) => (
          <HistoryTableRow key={row.id} row={row} {...actions} />
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
                <Skeleton className="size-9" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-7 w-32" />
              </TableCell>
              <TableCell>
                <Skeleton className="ml-auto h-3 w-8" />
              </TableCell>
              <TableCell>
                <Skeleton className="ml-8 h-3 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="ml-auto h-3 w-28" />
              </TableCell>
              <TableCell>
                <Skeleton className="ml-8 h-3 w-24" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
