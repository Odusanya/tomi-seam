"use client"

// Copies a classification ID, the value people paste into tickets and searches. The tooltip
// says what the button does, then confirms the copy (or says it failed) for a moment.
import { CheckIcon, CopyIcon } from "lucide-react"
import { useState } from "react"

import { RowReveal } from "@/components/domain/row-reveal"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type CopyState = "idle" | "copied" | "failed"

const LABEL: Record<CopyState, string> = {
  idle: "Copy ID",
  copied: "Copied",
  failed: "Couldn't copy. Select the ID instead",
}

const CONFIRM_MS = 1500

export function CopyIdButton({ id }: { id: string }) {
  const [state, setState] = useState<CopyState>("idle")

  async function copy() {
    try {
      await navigator.clipboard.writeText(id)
      setState("copied")
    } catch {
      setState("failed")
    }
    setTimeout(() => setState("idle"), CONFIRM_MS)
  }

  return (
    <RowReveal>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label={`${LABEL[state]}: ${id}`}
              onClick={copy}
            />
          }
        >
          {state === "copied" ? (
            <CheckIcon aria-hidden strokeWidth={1.5} />
          ) : (
            <CopyIcon aria-hidden strokeWidth={1.5} />
          )}
        </TooltipTrigger>
        <TooltipContent>{LABEL[state]}</TooltipContent>
      </Tooltip>
    </RowReveal>
  )
}
