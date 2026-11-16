"use client"

// L3 atom. Copies a value and confirms it in place: the copy icon crossfades to a check
// (opacity, scale and a slight blur, 150 ms on ease-press), then back after a moment. The
// icon-only form names itself in a tooltip that also reports the result; the labelled form
// keeps its text steady so the button never changes width.
import { cva } from "class-variance-authority"
import { CheckIcon, CopyIcon } from "lucide-react"
import { useRef, useState, type ReactNode } from "react"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type CopyState = "idle" | "copied" | "failed"

const CONFIRM_MS = 1500

// Both icons stay mounted in one grid cell, so a second click retargets the transition mid-way.
const swapIcon = cva(
  "col-start-1 row-start-1 transition duration-150 ease-press motion-reduce:transition-none",
  {
    variants: {
      shown: {
        true: "scale-100 opacity-100 blur-none",
        false: "scale-50 opacity-0 blur-xs",
      },
    },
  }
)

function SwapIcon({ copied }: { copied: boolean }) {
  return (
    <span aria-hidden className="grid place-items-center">
      <CopyIcon strokeWidth={1.5} className={swapIcon({ shown: !copied })} />
      <CheckIcon strokeWidth={1.5} className={swapIcon({ shown: copied })} />
    </span>
  )
}

type Props = {
  /** The text to copy, or a function that builds it at click time. */
  value: string | (() => string)
  /** What the button does, e.g. "Copy ID". The icon-only form shows it as a tooltip. */
  label: string
  /** What is copied, for screen readers: "Copy ID: cls_1763edca". */
  subject?: string
  /** Said instead of "Couldn't copy" when the copy fails, e.g. "Couldn't copy. Select the ID instead". */
  failedLabel?: string
  /** Visible text. Without it the button is icon-only. */
  children?: ReactNode
  size?: "icon-xs" | "icon-sm" | "sm"
  variant?: "ghost" | "outline"
  onFail?: (text: string) => void
}

export function CopyButton({
  value,
  label,
  subject,
  failedLabel = "Couldn't copy",
  children,
  size = children ? "sm" : "icon-xs",
  variant = "ghost",
  onFail,
}: Props) {
  const [state, setState] = useState<CopyState>("idle")
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const status = { idle: label, copied: "Copied", failed: failedLabel }[state]

  async function copy() {
    const text = typeof value === "function" ? value() : value
    try {
      await navigator.clipboard.writeText(text)
      setState("copied")
    } catch {
      setState("failed")
      onFail?.(text)
    }
    // A second click restarts the confirmation instead of being cut short by the first timer.
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setState("idle"), CONFIRM_MS)
  }

  if (children) {
    return (
      <Button size={size} variant={variant} onClick={copy}>
        <SwapIcon copied={state === "copied"} />
        {children}
        <output className="sr-only">
          {state === "idle" ? "" : status}
        </output>
      </Button>
    )
  }

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant={variant}
            size={size}
            aria-label={subject ? `${status}: ${subject}` : status}
            onClick={copy}
          />
        }
      >
        <SwapIcon copied={state === "copied"} />
      </TooltipTrigger>
      <TooltipContent>{status}</TooltipContent>
    </Tooltip>
  )
}
