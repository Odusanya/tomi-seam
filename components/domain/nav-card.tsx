// L3 atom. Sidebar sections: the plain header (workspace row, no surface) and the nav group cards.
// A plain div because SidebarHeader / SidebarGroup have no variant and cannot be recoloured.
import { cva, type VariantProps } from "class-variance-authority"
import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"

const navCardVariants = cva("flex flex-col", {
  variants: {
    variant: {
      header:
        "px-3 py-1.5 group-data-[collapsible=icon]:px-2",
      group:
        "mx-2 rounded-lg bg-page px-1 py-2 group-data-[collapsible=icon]:mx-1 group-data-[collapsible=icon]:rounded-xl group-data-[collapsible=icon]:shadow-default",
      // No card: just lines footer rows up with the rows inside the group cards.
      footer: "gap-0.5 px-1 group-data-[collapsible=icon]:px-0",
    },
  },
})

type Props = ComponentProps<"div"> & Required<VariantProps<typeof navCardVariants>>

export function NavCard({ variant, className, ...props }: Props) {
  return (
    <div
      data-sidebar={variant}
      className={cn(navCardVariants({ variant }), className)}
      {...props}
    />
  )
}
