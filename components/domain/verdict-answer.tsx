// L3 atom. The verdict as a one-word answer to "Hot dog?": Yes in green, No in red, each with
// its own glyph so the answer never rests on colour alone. History asked for this on purpose,
// overriding DESIGN.md's neutral status label for that one column. While the model re-runs, the
// old answer is stale, so the cell shows the AI's running state instead (violet, DESIGN rule 1).
import { cva, type VariantProps } from "class-variance-authority"
import { Arc } from "loading-dev"
import type { ComponentProps } from "react"

import { VERDICT_GLYPH } from "@/components/domain/verdict-mark"
import type { Verdict } from "@/lib/fixtures/classification"
import { cn } from "@/lib/utils"

const ANSWER: Record<Verdict, string> = { "hot-dog": "Yes", "not-hot-dog": "No" }

const verdictAnswerVariants = cva("inline-flex items-center gap-1.5 text-body-sm font-medium", {
  variants: {
    tone: {
      "hot-dog": "text-fg-positive",
      "not-hot-dog": "text-fg-danger",
      running: "text-ai-fg",
    },
  },
})

type Props = Omit<ComponentProps<"span">, "children"> & {
  verdict: Verdict
  /** The model is re-running: show progress instead of the stale answer. */
  running?: boolean
}

export function VerdictAnswer({ verdict, running = false, className, ...props }: Props) {
  const tone: VariantProps<typeof verdictAnswerVariants>["tone"] = running ? "running" : verdict
  const Glyph = VERDICT_GLYPH[verdict]
  return (
    <span className={cn(verdictAnswerVariants({ tone }), className)} {...props}>
      {running ? (
        <span aria-hidden className="flex size-4 items-center justify-center">
          <Arc size={14} />
        </span>
      ) : (
        <Glyph aria-hidden strokeWidth={1.5} className="size-4 shrink-0" />
      )}
      {running ? "Re-running" : ANSWER[verdict]}
    </span>
  )
}
