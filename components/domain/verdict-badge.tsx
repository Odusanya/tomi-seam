// L3 atom. The verdict pinned to the corner of an image: the VerdictMark glyph and label on a
// solid container pill, so it reads on any photo. Both verdicts share one treatment, as in
// VerdictMark: the glyph shape and the words carry the difference.
import { cva } from "class-variance-authority"
import type { ComponentProps } from "react"

import { VERDICT_GLYPH } from "@/components/domain/verdict-mark"
import { VERDICT_LABEL, type Verdict } from "@/lib/fixtures/classification"
import { cn } from "@/lib/utils"

const verdictBadgeVariants = cva(
  "inline-flex h-7 items-center gap-1.5 rounded-full border border-default bg-container pr-2.5 pl-2 text-body-sm font-medium whitespace-nowrap text-fg-primary shadow-default",
)

type Props = Omit<ComponentProps<"span">, "children"> & { verdict: Verdict }

export function VerdictBadge({ verdict, className, ...props }: Props) {
  const Glyph = VERDICT_GLYPH[verdict]
  return (
    <span className={cn(verdictBadgeVariants(), className)} {...props}>
      <Glyph aria-hidden strokeWidth={1.5} className="size-4 shrink-0 text-fg-brand" />
      {VERDICT_LABEL[verdict]}
    </span>
  )
}
