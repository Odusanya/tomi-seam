// L3 atom. Initials chip for the sidebar: workspace mark (accent) and user avatar (neutral).
import { cva, type VariantProps } from "class-variance-authority"
import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"

const initialsVariants = cva("inline-flex shrink-0 items-center justify-center", {
  variants: {
    kind: {
      workspace:
        "-mx-0.5 size-5 rounded-sm bg-sidebar-primary text-caption-base font-semibold text-sidebar-primary-foreground",
      user: "size-4 rounded-full bg-sunken text-caption-xs font-semibold text-fg-secondary",
    },
  },
})

type Props = Omit<ComponentProps<"span">, "children"> &
  Required<VariantProps<typeof initialsVariants>> & { children: string }

export function Initials({ kind, className, children, ...props }: Props) {
  return (
    <span aria-hidden className={cn(initialsVariants({ kind }), className)} {...props}>
      {children}
    </span>
  )
}
