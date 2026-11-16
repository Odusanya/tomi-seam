"use client"

// Appealing a verdict overrides the model, so it needs a reason, and the reason is kept
// with the row (DESIGN rule 3). The submit stays disabled, with a hint, until there is one.
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { formatConfidence } from "@/features/history/format"
import { otherVerdict, type HistoryRow } from "@/features/history/row-edits"
import { VERDICT_LABEL } from "@/lib/fixtures/classification"

type FormProps = { row: HistoryRow; onSubmit: (reason: string) => void }

function AppealForm({ row, onSubmit }: FormProps) {
  const [reason, setReason] = useState("")
  const next = VERDICT_LABEL[otherVerdict(row.verdict)]
  const ready = reason.trim().length > 0

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault()
        if (ready) {
          onSubmit(reason.trim())
        }
      }}
    >
      <DialogHeader>
        <DialogTitle>Appeal verdict</DialogTitle>
        <DialogDescription>
          {`SeeFood said ${VERDICT_LABEL[row.verdict]} at ${formatConfidence(row.confidence)}. Appealing records ${next} for `}
          <span className="font-mono text-fg-secondary">{row.id}</span>.
        </DialogDescription>
      </DialogHeader>
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="appeal-reason"
          className="text-caption-lg font-medium text-fg-secondary"
        >
          Reason
        </label>
        <Textarea
          id="appeal-reason"
          autoFocus
          required
          aria-describedby="appeal-hint"
          placeholder="What did the model miss?"
          value={reason}
          onChange={(event) => setReason(event.currentTarget.value)}
        />
        <p id="appeal-hint" className="text-caption-lg text-fg-tertiary">
          A reason is required. It is saved with the appeal.
        </p>
      </div>
      <DialogFooter>
        <DialogClose render={<Button variant="outline" size="sm" />}>
          Cancel
        </DialogClose>
        <Button type="submit" size="sm" disabled={!ready}>
          {`Change to ${next}`}
        </Button>
      </DialogFooter>
    </form>
  )
}

type Props = {
  /** The row being appealed. Kept while the dialog animates out. */
  row: HistoryRow | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onAppeal: (row: HistoryRow, reason: string) => void
}

export function AppealDialog({ row, open, onOpenChange, onAppeal }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {/* Keyed by row, so a new appeal starts with an empty reason. */}
        {row ? (
          <AppealForm
            key={row.id}
            row={row}
            onSubmit={(reason) => onAppeal(row, reason)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
