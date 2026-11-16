"use client"

// Copies a classification ID, the value people paste into tickets and searches. Hidden in the
// row until wanted; the shared CopyButton confirms the copy (or says it failed) for a moment.
import { CopyButton } from "@/components/domain/copy-button"
import { RowReveal } from "@/components/domain/row-reveal"

export function CopyIdButton({ id }: { id: string }) {
  return (
    <RowReveal>
      <CopyButton
        value={id}
        label="Copy ID"
        subject={id}
        failedLabel="Couldn't copy. Select the ID instead"
      />
    </RowReveal>
  )
}
