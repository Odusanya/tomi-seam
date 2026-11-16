// L3 atom. Marks a whole nav group as not available yet. An outline pill, smaller than the
// group label it sits beside, in shadcn's border and muted-foreground colours.
import { cva } from "class-variance-authority"
import type { ComponentProps } from "react"

// cva joins classes without merging: the merge helper would read `text-caption-sm` as a colour
// and drop it next to `text-muted-foreground`.
const soonPillVariants = cva(
  "inline-flex h-4 shrink-0 items-center rounded-full border px-1.5 text-caption-sm font-medium",
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
