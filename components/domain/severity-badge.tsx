// L3 atom. Severity is a domain concept; it reads sev-* tokens, never status colours.
import { cva, type VariantProps } from "class-variance-authority"
import type { ComponentProps } from "react"

import { chipBase } from "@/components/domain/chip"
import { cn } from "@/lib/utils"

const severityBadgeVariants = cva(`${chipBase()} capitalize`, {
  variants: {
    severity: {
      major: "bg-sev-major-subtle text-sev-major-fg",
      minor: "bg-sev-minor-subtle text-sev-minor-fg",
      observation: "bg-sev-obs-subtle text-sev-obs-fg",
    },
  },
})

const dotVariants = cva("size-1.5 rounded-full", {
  variants: {
    severity: { major: "bg-sev-major", minor: "bg-sev-minor", observation: "bg-sev-obs" },
  },
})

type Props = Omit<ComponentProps<"span">, "children"> &
  Required<VariantProps<typeof severityBadgeVariants>>

export function SeverityBadge({ severity, className, ...props }: Props) {
  return (
    <span className={cn(severityBadgeVariants({ severity }), className)} {...props}>
      <span aria-hidden className={dotVariants({ severity })} />
      {severity === "observation" ? "Obs" : severity}
    </span>
  )
}
