// The five newest verdicts, drawn exactly like a History row: same thumbnail, ID, Yes/No answer,
// confidence meter and UTC date. No actions or details sheet; the full row lives in History.
import Link from "next/link"
import type { ReactNode } from "react"

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
import { CopyIdButton } from "@/features/history/copy-id-button"
import { formatClassifiedAt, formatConfidence } from "@/features/history/format"
import { ChartSection } from "@/features/overview/daily-chart"
import { isLowConfidence } from "@/features/overview/stats"
import type { ClassificationResult } from "@/lib/fixtures/classification"

const SKELETON_ROWS = ["a", "b", "c", "d", "e"] as const

// Same row height as History, so the thumbnail and meter sit the same way in both.
const DENSITY = "comfortable"

function End({ children }: { children: ReactNode }) {
  return <div className="text-right tabular-nums">{children}</div>
}

function Head() {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-12">
          <span className="sr-only">Image</span>
        </TableHead>
        <TableHead>ID</TableHead>
        <TableHead>Hot dog?</TableHead>
        <TableHead>Confidence</TableHead>
        <TableHead>
          <End>Date (UTC)</End>
        </TableHead>
      </TableRow>
    </TableHeader>
  )
}

const VIEW_ALL = (
  <Link
    href="/history"
    className="text-caption-lg font-medium text-fg-secondary hover:text-fg-primary"
  >
    View all
  </Link>
)

function Row({ row }: { row: ClassificationResult }) {
  return (
    <TableRow data-interactive>
      <TableCell>
        <Thumbnail src={row.thumbnail} alt="" size="md" />
      </TableCell>
      <TableCell>
        <span className="flex items-center gap-1.5">
          <span className="font-mono text-caption-lg text-fg-secondary">
            {row.id}
          </span>
          <CopyIdButton id={row.id} />
          {row.source === "upload" ? <SourceTag source="upload" /> : null}
        </span>
      </TableCell>
      <TableCell>
        <VerdictAnswer verdict={row.verdict} />
      </TableCell>
      <TableCell>
        {/* The warning follows Overview's own line (stats.ts), so it agrees with the summary above. */}
        <ConfidenceMeter
          value={row.confidence}
          label={formatConfidence(row.confidence)}
          tone={isLowConfidence(row) ? "low" : "neutral"}
        />
      </TableCell>
      <TableCell>
        <End>
          <time dateTime={row.classifiedAt} className="text-fg-secondary">
            {formatClassifiedAt(row.classifiedAt)}
          </time>
        </End>
      </TableCell>
    </TableRow>
  )
}

export function RecentTable({
  rows,
}: {
  rows: readonly ClassificationResult[]
}) {
  return (
    <ChartSection title="Recent classifications" aside={VIEW_ALL}>
      <Table data-density={DENSITY}>
        <Head />
        <TableBody>
          {rows.map((row) => (
            <Row key={row.id} row={row} />
          ))}
        </TableBody>
      </Table>
    </ChartSection>
  )
}

export function RecentTableSkeleton() {
  return (
    <ChartSection title="Recent classifications">
      <Table data-density={DENSITY}>
        <Head />
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
                <Skeleton className="ml-auto h-3 w-28" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ChartSection>
  )
}
