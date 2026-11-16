"use client"

// The verdict pill and the row's actions behind it. The pill is the most recognisable thing
// in a row, so the row's actions hang off it: re-run the model, or appeal its verdict.
import { FlagIcon, RotateCcwIcon, Undo2Icon } from "lucide-react"

import { VerdictPill } from "@/components/domain/verdict-pill"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { HistoryRow } from "@/features/history/row-edits"
import { VERDICT_LABEL } from "@/lib/fixtures/classification"

export type RowActions = {
  onRetry: (row: HistoryRow) => void
  onAppeal: (row: HistoryRow) => void
  onWithdraw: (row: HistoryRow) => void
}

const ICON_STROKE = 1.5

export function VerdictMenu({ row, onRetry, onAppeal, onWithdraw }: { row: HistoryRow } & RowActions) {
  const appealed = row.status === "appealed"
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`${VERDICT_LABEL[row.verdict]}. Actions for ${row.id}`}
        render={<VerdictPill verdict={row.verdict} status={row.status} />}
      />
      <DropdownMenuContent align="start">
        {appealed ? (
          <DropdownMenuItem onClick={() => onWithdraw(row)}>
            <Undo2Icon aria-hidden strokeWidth={ICON_STROKE} />
            Withdraw appeal
          </DropdownMenuItem>
        ) : (
          <>
            <DropdownMenuItem onClick={() => onRetry(row)}>
              <RotateCcwIcon aria-hidden strokeWidth={ICON_STROKE} />
              {row.status === "failed" ? "Retry re-run" : "Re-run model"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAppeal(row)}>
              <FlagIcon aria-hidden strokeWidth={ICON_STROKE} />
              Appeal verdict
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
