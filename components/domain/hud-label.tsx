// L3 atom. A viewfinder readout: small uppercase mono with open tracking. Used around the
// Classify frame for the model name, the scan state and frame numbers. 11 px is the floor.
import { cva, type VariantProps } from "class-variance-authority"
import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"

const hudLabelVariants = cva("inline-flex items-center gap-1.5 font-mono text-caption-base tracking-wider uppercase", {
  variants: {
    tone: {
      primary: "text-fg-primary",
      secondary: "text-fg-secondary",
      // Machine output in progress (DESIGN rule 1: violet while the AI's word stands).
      ai: "text-ai-fg",
    },
  },
  defaultVariants: { tone: "secondary" },
})

type Props = ComponentProps<"span"> & VariantProps<typeof hudLabelVariants>

export function HudLabel({ tone, className, ...props }: Props) {
  return <span className={cn(hudLabelVariants({ tone }), className)} {...props} />
}
