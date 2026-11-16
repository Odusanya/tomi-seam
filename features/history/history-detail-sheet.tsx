"use client"

// One classification, opened from its History row. The row is read fresh on every render, so a
// re-run started here shows its progress here and in the table at the same time.
import { FlagIcon, RotateCcwIcon, Undo2Icon } from "lucide-react"
import { Arc } from "loading-dev"
import type { ReactNode } from "react"

import { CodeBlock } from "@/components/domain/code-block"
import { CopyButton } from "@/components/domain/copy-button"
import { Thumbnail } from "@/components/domain/thumbnail"
import { VerdictBadge } from "@/components/domain/verdict-badge"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  formatClassifiedAt,
  formatConfidence,
  imageName,
} from "@/features/history/format"
import type { HistoryRow } from "@/features/history/row-edits"
import type { RowActions } from "@/features/history/verdict-menu"

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

/** The row as the API would return it. Built every render, so it follows re-runs and appeals. */
function payloadFor(row: HistoryRow): string {
  return JSON.stringify(
    {
      id: row.id,
      verdict: row.verdict,
      confidence: row.confidence,
      model: row.model,
      classifiedAt: row.classifiedAt,
      source: row.source,
      ...(row.fileName ? { fileName: row.fileName } : {}),
      status: row.status,
      ...(row.status === "appealed" ? { appealReason: row.appealReason } : {}),
    },
    null,
    2
  )
}

function Details({
  row,
  onRetry,
  onAppeal,
  onWithdraw,
}: { row: HistoryRow } & RowActions) {
  const name = imageName(row)
  const payload = payloadFor(row)
  const appealed = row.status === "appealed"
  const running = row.status === "running"
  return (
    <>
      <SheetHeader>
        <SheetTitle>
          <span className="block truncate">{name}</span>
        </SheetTitle>
        <SheetDescription>
          <span className="font-mono">{row.id}</span>
        </SheetDescription>
      </SheetHeader>

      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6">
        <div className="relative">
          <Thumbnail
            src={row.thumbnail}
            alt={name}
            size="hero"
          />
          <VerdictBadge
            verdict={row.verdict}
            aria-hidden
            className="absolute top-3 left-3"
          />
        </div>

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

        <section aria-labelledby="history-payload" className="flex flex-col gap-2 pb-6">
          <h3
            id="history-payload"
            className="text-caption-lg font-medium text-fg-secondary"
          >
            Payload
          </h3>
          <CodeBlock
            code={payload}
            aria-label="Classification payload as JSON"
            action={<CopyButton value={payload} label="Copy payload" />}
          />
        </section>
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
      <SheetContent side="right" size="lg">
        {row ? <Details row={row} {...actions} /> : null}
      </SheetContent>
    </Sheet>
  )
}
