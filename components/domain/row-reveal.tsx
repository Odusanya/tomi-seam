// L3 atom. Holds a row control that stays out of the way until it is wanted: hidden at rest,
// shown while the pointer is over the row, while it has keyboard focus, while the row is
// selected and while its menu is open. Touch screens have no hover, so it always shows there.
import { cva } from "class-variance-authority"
import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"

const rowRevealVariants = cva(
  "flex opacity-0 transition-opacity duration-150 focus-within:opacity-100 in-data-[state=selected]:opacity-100 in-[tr:hover]:opacity-100 has-data-popup-open:opacity-100 motion-reduce:transition-none pointer-coarse:opacity-100",
  {
    variants: { align: { start: "justify-start", end: "justify-end" } },
    defaultVariants: { align: "start" },
  }
)

type Props = ComponentProps<"span"> & { align?: "start" | "end" }

export function RowReveal({ align, className, ...props }: Props) {
  return (
    <span className={cn(rowRevealVariants({ align }), className)} {...props} />
  )
}
