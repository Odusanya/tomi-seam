// L3 atom. Initials chip for the sidebar: workspace mark (accent) and user avatar (neutral).
import { cva, type VariantProps } from "class-variance-authority"
import type { ComponentProps } from "react"

// cva joins classes without merging. The merge helper reads `text-caption-*` as a colour and drops it
// next to `text-fg-*`, which left both chips at 13 px.
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
    <span aria-hidden className={initialsVariants({ kind, className })} {...props}>
      {children}
    </span>
  )
}
