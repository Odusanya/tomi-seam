// The five newest verdicts, borrowed from the History row: same thumbnail, same neutral
// verdict mark, same figures. Compact rows and no actions; the full row lives in History.
import { TriangleAlertIcon } from "lucide-react"
import Link from "next/link"
import type { ReactNode } from "react"

import { Thumbnail } from "@/components/domain/thumbnail"
import { VerdictMark } from "@/components/domain/verdict-mark"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChartSection } from "@/features/overview/daily-chart"
import { formatClassifiedAt, formatConfidence } from "@/features/history/format"
import { isLowConfidence, LOW_CONFIDENCE_HINT } from "@/features/overview/stats"
import type { ClassificationResult } from "@/lib/fixtures/classification"

const SKELETON_ROWS = ["a", "b", "c", "d", "e"] as const

function End({ children }: { children: ReactNode }) {
  return <div className="flex items-center justify-end gap-1.5 text-right tabular-nums">{children}</div>
}

function Head() {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-10">
          <span className="sr-only">Image</span>
        </TableHead>
        <TableHead>Verdict</TableHead>
        <TableHead>
          <End>Confidence</End>
        </TableHead>
        <TableHead>
          <End>Classified</End>
        </TableHead>
      </TableRow>
    </TableHeader>
  )
}

const VIEW_ALL = (
  <Link href="/history" className="text-caption-lg font-medium text-fg-secondary hover:text-fg-primary">
    View all
  </Link>
)

export function RecentTable({ rows }: { rows: readonly ClassificationResult[] }) {
  return (
    <ChartSection title="Recent classifications" aside={VIEW_ALL}>
      <Table data-density="compact">
        <Head />
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>
                <Thumbnail src={row.thumbnail} alt="" size="xs" />
              </TableCell>
              <TableCell>
                <VerdictMark verdict={row.verdict} size="sm" tone="neutral" />
              </TableCell>
              <TableCell>
                <End>
                  {/* Fixed glyph slot so figures stay in one lane whether or not a row is flagged. */}
                  <span className="flex size-3.5 items-center">
                    {isLowConfidence(row) ? (
                      <>
                        <TriangleAlertIcon aria-hidden strokeWidth={1.5} className="size-3.5 text-fg-warning" />
                        <span className="sr-only">{LOW_CONFIDENCE_HINT}</span>
                      </>
                    ) : null}
                  </span>
                  <span className="w-9">{formatConfidence(row.confidence)}</span>
                </End>
              </TableCell>
              <TableCell>
                <End>
                  <time dateTime={row.classifiedAt} className="text-fg-secondary">
                    {formatClassifiedAt(row.classifiedAt)}
                  </time>
                </End>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ChartSection>
  )
}

export function RecentTableSkeleton() {
  return (
    <ChartSection title="Recent classifications">
      <Table data-density="compact">
        <Head />
        <TableBody>
          {SKELETON_ROWS.map((key) => (
            <TableRow key={key}>
              <TableCell>
                <Skeleton className="size-6" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-3 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="ml-auto h-3 w-8" />
              </TableCell>
              <TableCell>
                <Skeleton className="ml-auto h-3 w-28" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ChartSection>
  )
}
