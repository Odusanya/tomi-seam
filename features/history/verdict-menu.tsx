"use client"

// A row's actions, from a "…" button in the table's last column: re-run the model, appeal its
// verdict, or withdraw an appeal. The button shows on row hover and focus, and stays while the
// row is selected or its menu is open. Touch screens have no hover, so it always shows there.
import { EllipsisIcon, FlagIcon, RotateCcwIcon, Undo2Icon } from "lucide-react"

import { RowReveal } from "@/components/domain/row-reveal"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { HistoryRow } from "@/features/history/row-edits"

export type RowActions = {
  onRetry: (row: HistoryRow) => void
  onAppeal: (row: HistoryRow) => void
  onWithdraw: (row: HistoryRow) => void
}

const ICON_STROKE = 1.5

export function RowActionsMenu({
  row,
  onRetry,
  onAppeal,
  onWithdraw,
}: { row: HistoryRow } & RowActions) {
  const appealed = row.status === "appealed"
  return (
    <RowReveal align="end">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Actions for ${row.id}`}
              disabled={row.status === "running"}
            />
          }
        >
          <EllipsisIcon aria-hidden strokeWidth={ICON_STROKE} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-auto">
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
    </RowReveal>
  )
}
