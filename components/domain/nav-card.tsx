// L3 atom. Card surfaces for the sidebar: the edge-to-edge header and the nav groups.
// A plain div because SidebarHeader / SidebarGroup have no variant and cannot be recoloured.
import { cva, type VariantProps } from "class-variance-authority"
import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"

const navCardVariants = cva("flex flex-col", {
  variants: {
    variant: {
      header:
        "mb-2 gap-1 rounded-b-lg border-b border-default bg-container px-2 py-1.5 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:border-transparent group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:px-1",
      group:
        "mx-2 rounded-lg bg-page p-1 group-data-[collapsible=icon]:mx-1 group-data-[collapsible=icon]:rounded-xl group-data-[collapsible=icon]:shadow-default",
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
