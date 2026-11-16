// L3 atom. The page's one call to action, in the sidebar's top slot. Ink fill from tokens;
// the focus indicator is an offset outline so it sits against the sidebar, not against the black fill.
import { cva } from "class-variance-authority"
import Link from "next/link"
import type { ComponentProps } from "react"

const scanActionVariants = cva(
  "inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-2xl px-4 text-body-sm font-medium whitespace-nowrap transition-colors duration-150 select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sidebar-ring motion-reduce:transition-none md:h-9",
  {
    variants: {
      tone: { ink: "bg-ink-solid text-on-inverted hover:bg-ink-solid-hover" },
    },
    defaultVariants: { tone: "ink" },
  },
)

export function ScanAction({ className, children, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link className={scanActionVariants({ className })} {...props}>
      {children}
    </Link>
  )
}
