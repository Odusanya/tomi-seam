// L3 atom. The one raised surface on the Overview: KPI figures and the sections below them.
// Same radius as the sidebar group cards (rounded-lg) and the shared hairline shadow, so every
// card reads as one family. shadcn's Card carries a 24 px radius and looser spacing, which is
// too soft for a dense tool.
import { cva, type VariantProps } from "class-variance-authority"
import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"

const surfaceCardVariants = cva("flex min-w-0 flex-col rounded-lg border border-default bg-container shadow-default", {
  variants: {
    size: {
      // One headline figure: label, value, note stacked tight.
      stat: "gap-1 p-4",
      // A titled section (chart, table, property list).
      section: "gap-4 p-5",
    },
  },
  defaultVariants: { size: "stat" },
})

type Props = ComponentProps<"div"> & VariantProps<typeof surfaceCardVariants>

export function SurfaceCard({ size, className, ...props }: Props) {
  return <div className={cn(surfaceCardVariants({ size }), className)} {...props} />
}
