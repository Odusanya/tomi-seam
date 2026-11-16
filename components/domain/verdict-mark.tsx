// L3 atom. The verdict as glyph plus label. Both verdicts share layout, weight and colour:
// the glyph shape and the words carry the difference, so "Not Hot Dog" never reads as an error.
import { cva, type VariantProps } from "class-variance-authority"
import { CircleCheckIcon, CircleXIcon } from "lucide-react"
import type { ComponentProps } from "react"

import { VERDICT_LABEL, type Verdict } from "@/lib/fixtures/classification"
import { cn } from "@/lib/utils"

const verdictMarkVariants = cva("flex items-center font-medium text-fg-primary", {
  variants: {
    size: {
      lg: "gap-4 text-heading-3 sm:text-heading-2",
      md: "gap-2 text-heading-6",
      // Table rows: 13 px on the 20 px line, so the mark never grows a 36 px row.
      sm: "gap-2 text-body-sm",
    },
  },
  defaultVariants: { size: "lg" },
})

// `tone` is the glyph colour only. Brand is the Classify result; neutral is for dense lists,
// where colour is kept for the exception.
const glyphVariants = cva("shrink-0", {
  variants: {
    size: { lg: "size-10 sm:size-12", md: "size-5", sm: "size-4" },
    tone: { brand: "text-fg-brand", neutral: "text-fg-primary" },
  },
  defaultVariants: { size: "lg", tone: "brand" },
})

/** One glyph per verdict, shared with VerdictPill so a verdict looks the same everywhere. */
export const VERDICT_GLYPH = { "hot-dog": CircleCheckIcon, "not-hot-dog": CircleXIcon } as const
const glyphs = VERDICT_GLYPH

type Props = Omit<ComponentProps<"div">, "children"> &
  VariantProps<typeof verdictMarkVariants> &
  Pick<VariantProps<typeof glyphVariants>, "tone"> & { verdict: Verdict }

export function VerdictMark({ verdict, size, tone, className, ...props }: Props) {
  const Glyph = glyphs[verdict]
  return (
    <div className={cn(verdictMarkVariants({ size }), className)} {...props}>
      <Glyph aria-hidden strokeWidth={1.5} className={glyphVariants({ size, tone })} />
      <span>{VERDICT_LABEL[verdict]}</span>
    </div>
  )
}
