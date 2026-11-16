// L3 atom. Marks a whole nav group as not available yet. An outline pill, smaller than the
// group label it sits beside, in shadcn's border and muted-foreground colours.
// Proportions follow the Linear status-badge reference: full radius, regular weight, caption
// type, about 2 px above and below the text.
import { cva } from "class-variance-authority"
import type { ComponentProps } from "react"

// cva joins classes without merging: the merge helper would read `text-caption-base` as a colour
// and drop it next to `text-muted-foreground`.
const soonPillVariants = cva(
  "inline-flex h-4.5 shrink-0 items-center rounded-full border px-1.5 text-caption-base font-normal",
  {
    variants: { tone: { outline: "border-border bg-background text-muted-foreground" } },
    defaultVariants: { tone: "outline" },
  },
)

export function SoonPill({ className, ...props }: Omit<ComponentProps<"span">, "children">) {
  return (
    <span className={soonPillVariants({ className })} {...props}>
      Soon
    </span>
  )
}
