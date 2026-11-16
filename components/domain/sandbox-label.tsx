// L3 atom. Says the verdicts are simulated; sits in the shell, so it is quiet and neutral.
import { cva } from "class-variance-authority"
import type { ComponentProps } from "react"

import { chipBase } from "@/components/domain/chip"
import { cn } from "@/lib/utils"

const sandboxLabelVariants = cva(chipBase(), {
  variants: {
    tone: { neutral: "bg-component text-fg-secondary" },
  },
  defaultVariants: { tone: "neutral" },
})

export function SandboxLabel({ className, ...props }: Omit<ComponentProps<"span">, "children">) {
  return (
    <span title="Inference is simulated" className={cn(sandboxLabelVariants(), className)} {...props}>
      Sandbox
    </span>
  )
}
