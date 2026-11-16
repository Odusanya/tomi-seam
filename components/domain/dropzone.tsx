// L3 atom. The main control on Classify. A real button, so it is keyboard reachable and gets the
// global focus ring; the feature owns the file input and the drag handlers.
import { cva, type VariantProps } from "class-variance-authority"
import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"

const dropzoneVariants = cva(
  "flex min-h-48 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-6 py-8 text-center transition-colors duration-150 focus-visible:border-sidebar-ring focus-visible:ring-3 focus-visible:ring-sidebar-ring motion-reduce:transition-none",
  {
    variants: {
      state: {
        idle: "border-strong bg-page text-fg-secondary hover:bg-component",
        dragging: "border-brand bg-brand-subtle text-fg-primary",
        rejected: "border-danger bg-page text-fg-secondary hover:bg-component",
      },
    },
    defaultVariants: { state: "idle" },
  },
)

type Props = Omit<ComponentProps<"button">, "type"> & VariantProps<typeof dropzoneVariants>

export function Dropzone({ state, className, ...props }: Props) {
  return <button type="button" className={cn(dropzoneVariants({ state }), className)} {...props} />
}
