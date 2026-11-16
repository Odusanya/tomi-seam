// L3 atom. A model confidence as a short bar, the figure and, below the cut-off, a warning glyph.
// Every part sits in a fixed slot (bar 72 px, figure 36 px, glyph 14 px), so the bars, figures
// and glyphs form straight lanes down a table. Colour only on the exception: the bar is neutral
// until the value falls below the cut-off.
import { cva, type VariantProps } from "class-variance-authority"
import { TriangleAlertIcon } from "lucide-react"
import type { ComponentProps, CSSProperties } from "react"

import { cn } from "@/lib/utils"

const fillVariants = cva("block h-full w-(--meter) rounded-full", {
  variants: {
    tone: {
      neutral: "bg-fg-secondary",
      low: "bg-warning-solid",
      // While the model re-runs the old value is stale, so it steps back.
      muted: "bg-fg-disabled",
    },
  },
  defaultVariants: { tone: "neutral" },
})

const figureVariants = cva("w-9 shrink-0 text-right tabular-nums", {
  variants: {
    tone: { neutral: "text-fg-primary", low: "text-fg-primary", muted: "text-fg-tertiary" },
  },
  defaultVariants: { tone: "neutral" },
})

type Props = Omit<ComponentProps<"span">, "children"> &
  VariantProps<typeof fillVariants> & {
    /** 0 to 1. */
    value: number
    /** The figure as shown, e.g. "91%". */
    label: string
  }

export function ConfidenceMeter({ value, label, tone = "neutral", className, ...props }: Props) {
  const percent = Math.max(0, Math.min(100, Math.round(value * 100)))
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)} {...props}>
      <span aria-hidden className="h-1 w-18 shrink-0 overflow-hidden rounded-full bg-component">
        <span className={fillVariants({ tone })} style={{ "--meter": `${percent}%` } as CSSProperties} />
      </span>
      <span className={figureVariants({ tone })}>{label}</span>
      <span className="flex w-3.5 shrink-0 justify-center">
        {tone === "low" ? (
          <TriangleAlertIcon aria-label="Low confidence" strokeWidth={1.5} className="size-3.5 text-fg-warning" />
        ) : null}
      </span>
    </span>
  )
}
