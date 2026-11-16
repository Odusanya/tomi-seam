import type { ReactNode } from "react"

import { SourceTag } from "@/components/domain/source-tag"
import { Thumbnail } from "@/components/domain/thumbnail"
import { VerdictMark } from "@/components/domain/verdict-mark"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatClassifiedAt, formatConfidence } from "@/features/history/format"
import type { ClassificationResult } from "@/lib/fixtures/classification"

const SKELETON_ROWS = ["a", "b", "c", "d", "e", "f", "g", "h"] as const

// Column widths from the design. The table stays in auto layout, so the ID column takes
// the slack and a narrow viewport scrolls sideways instead of wrapping a row.
function Columns() {
  return (
    <colgroup>
      <col className="w-13" />
      <col className="w-50" />
      <col className="w-24" />
      <col className="w-50" />
      <col className="w-44" />
      <col />
    </colgroup>
  )
}

// Numbers and dates are compared down the column: tabular figures, end-aligned, header included.
function End({ children }: { children: ReactNode }) {
  return <div className="text-right tabular-nums">{children}</div>
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
          <div className="pl-6">Model</div>
        </TableHead>
        <TableHead>
          <End>Classified</End>
        </TableHead>
        <TableHead>
          <div className="pl-6">ID</div>
        </TableHead>
      </TableRow>
    </TableHeader>
  )
}

function HistoryRow({ row }: { row: ClassificationResult }) {
  return (
    <TableRow>
      <TableCell>
        <Thumbnail src={row.thumbnail} alt="" />
      </TableCell>
      <TableCell>
        <VerdictMark verdict={row.verdict} size="sm" tone="neutral" />
      </TableCell>
      <TableCell>
        <End>{formatConfidence(row.confidence)}</End>
      </TableCell>
      <TableCell>
        <div className="pl-6 text-fg-secondary">{`${row.model.name} ${row.model.version}`}</div>
      </TableCell>
      <TableCell>
        <End>
          <time dateTime={row.classifiedAt} className="text-fg-secondary">
            {formatClassifiedAt(row.classifiedAt)}
          </time>
        </End>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2 pl-6">
          <span className="font-mono text-caption-lg text-fg-secondary">{row.id}</span>
          {row.source === "upload" ? <SourceTag source="upload" /> : null}
        </div>
      </TableCell>
    </TableRow>
  )
}

/** Rows as given, newest first. No sorting: the order is the fixture's. */
export function HistoryTable({ rows }: { rows: readonly ClassificationResult[] }) {
  return (
    <Table>
      <Columns />
      <HeaderRow />
      <TableBody>
        {rows.map((row) => (
          <HistoryRow key={row.id} row={row} />
        ))}
      </TableBody>
    </Table>
  )
}

/** Loading: the same header and row height, with a bar where each value will land. */
export function HistoryTableSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading classifications">
      <Table>
        <Columns />
        <HeaderRow />
        <TableBody>
          {SKELETON_ROWS.map((key) => (
            <TableRow key={key}>
              <TableCell>
                <Skeleton className="size-7" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-3 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="ml-auto h-3 w-8" />
              </TableCell>
              <TableCell>
                <Skeleton className="ml-6 h-3 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="ml-auto h-3 w-28" />
              </TableCell>
              <TableCell>
                <Skeleton className="ml-6 h-3 w-24" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
