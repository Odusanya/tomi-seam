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
    },
  },
  defaultVariants: { size: "lg" },
})

const glyphVariants = cva("shrink-0 text-fg-brand", {
  variants: { size: { lg: "size-10 sm:size-12", md: "size-5" } },
  defaultVariants: { size: "lg" },
})

const glyphs = { "hot-dog": CircleCheckIcon, "not-hot-dog": CircleXIcon } as const

type Props = Omit<ComponentProps<"div">, "children"> &
  VariantProps<typeof verdictMarkVariants> & { verdict: Verdict }

export function VerdictMark({ verdict, size, className, ...props }: Props) {
  const Glyph = glyphs[verdict]
  return (
    <div className={cn(verdictMarkVariants({ size }), className)} {...props}>
      <Glyph aria-hidden strokeWidth={1.5} className={glyphVariants({ size })} />
      <span>{VERDICT_LABEL[verdict]}</span>
    </div>
  )
}
