// Shared chip shape for domain atoms (SeverityBadge, AIMark): one height, radius,
// padding and type size, so chips line up in any row. Variants add colour only.
import { cva } from "class-variance-authority"

export const chipBase = cva(
  "inline-flex h-5 shrink-0 items-center gap-1.5 rounded-sm px-1.5 text-caption-lg font-medium",
)
