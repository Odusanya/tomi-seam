"use client"

// One classification, opened from its History row. The row is read fresh on every render, so a
// re-run started here shows its progress here and in the table at the same time.
import { FlagIcon, RotateCcwIcon, Undo2Icon } from "lucide-react"
import { Arc } from "loading-dev"
import type { ReactNode } from "react"

import { Thumbnail } from "@/components/domain/thumbnail"
import { VERDICT_GLYPH } from "@/components/domain/verdict-mark"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { formatClassifiedAt, formatConfidence } from "@/features/history/format"
import type { HistoryRow } from "@/features/history/row-edits"
import type { RowActions } from "@/features/history/verdict-menu"
import { VERDICT_LABEL } from "@/lib/fixtures/classification"

const ICON_STROKE = 1.5
const SOURCE_LABEL = { sample: "Sample photo", upload: "Upload" } as const

function Property({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-3 items-baseline gap-3 py-1.5">
      <dt className="text-caption-lg font-medium text-fg-secondary">{label}</dt>
      <dd className="col-span-2 min-w-0 text-body-sm text-fg-primary">{children}</dd>
    </div>
  )
}

function Status({ row }: { row: HistoryRow }) {
  switch (row.status) {
    case "running":
      return (
        <span className="inline-flex items-center gap-1.5 text-ai-fg">
          <Arc size={12} />
          Re-running the model
        </span>
      )
    case "failed":
      return (
        <span className="text-fg-danger">
          Last re-run failed. The earlier result stands.
        </span>
      )
    case "appealed":
      return <span>Overridden on appeal</span>
    case "idle":
      return <span className="text-fg-secondary">Model result</span>
  }
}

function Details({
  row,
  onRetry,
  onAppeal,
  onWithdraw,
}: { row: HistoryRow } & RowActions) {
  const Glyph = VERDICT_GLYPH[row.verdict]
  const appealed = row.status === "appealed"
  const running = row.status === "running"
  return (
    <>
      <SheetHeader>
        <SheetTitle>
          <span className="inline-flex items-center gap-2">
            <Glyph
              aria-hidden
              strokeWidth={ICON_STROKE}
              className="size-4 shrink-0"
            />
            {VERDICT_LABEL[row.verdict]}
          </span>
        </SheetTitle>
        <SheetDescription>
          <span className="font-mono">{row.id}</span>
        </SheetDescription>
      </SheetHeader>

      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6">
        <Thumbnail
          src={row.thumbnail}
          alt={`Classified image ${row.id}`}
          size="hero"
        />

        <dl className="flex flex-col divide-y divide-line-default">
          <Property label="Status">
            <Status row={row} />
          </Property>
          <Property label="Confidence">
            {appealed ? (
              <span className="text-fg-tertiary">
                Not applicable after appeal
              </span>
            ) : (
              <span
                className={
                  running ? "text-fg-tertiary tabular-nums" : "tabular-nums"
                }
              >
                {formatConfidence(row.confidence)}
              </span>
            )}
          </Property>
          <Property label="Decided by">
            {appealed
              ? "You, on appeal"
              : `${row.model.name} ${row.model.version}`}
          </Property>
          {appealed ? (
            <Property label="Reason">{row.appealReason}</Property>
          ) : null}
          <Property label="Classified">
            <time dateTime={row.classifiedAt} className="tabular-nums">
              {formatClassifiedAt(row.classifiedAt)}
            </time>
          </Property>
          <Property label="Source">{SOURCE_LABEL[row.source]}</Property>
        </dl>
      </div>

      <SheetFooter>
        <div className="flex flex-wrap gap-2">
          {appealed ? (
            <Button size="sm" variant="outline" onClick={() => onWithdraw(row)}>
              <Undo2Icon aria-hidden strokeWidth={ICON_STROKE} />
              Withdraw appeal
            </Button>
          ) : (
            <>
              <Button
                size="sm"
                variant="outline"
                disabled={running}
                onClick={() => onRetry(row)}
              >
                <RotateCcwIcon aria-hidden strokeWidth={ICON_STROKE} />
                {row.status === "failed" ? "Retry re-run" : "Re-run model"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={running}
                onClick={() => onAppeal(row)}
              >
                <FlagIcon aria-hidden strokeWidth={ICON_STROKE} />
                Appeal verdict
              </Button>
            </>
          )}
        </div>
      </SheetFooter>
    </>
  )
}

type Props = {
  /** The open row, read from the current list. Kept by the caller while the sheet animates out. */
  row: HistoryRow | null
  open: boolean
  onOpenChange: (open: boolean) => void
} & RowActions

export function HistoryDetailSheet({
  row,
  open,
  onOpenChange,
  ...actions
}: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right">
        {row ? <Details row={row} {...actions} /> : null}
      </SheetContent>
    </Sheet>
  )
}
