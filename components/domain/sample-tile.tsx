// L3 atom. One sample image as a button. Picking it feeds the same pipeline as a dropped file.
import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"

type Props = Omit<ComponentProps<"button">, "type" | "children"> & { src: string; alt: string; label: string }

export function SampleTile({ src, alt, label, className, ...props }: Props) {
  return (
    <button
      type="button"
      className={cn(
        "flex flex-col gap-1.5 rounded-md text-left text-caption-lg text-fg-secondary transition-colors duration-150 hover:text-fg-primary focus-visible:ring-3 focus-visible:ring-sidebar-ring motion-reduce:transition-none",
        className,
      )}
      {...props}
    >
      {/* Local placeholder SVG; next/image adds nothing for a static 300 px tile. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="aspect-3/2 w-full rounded-md border border-subtle object-cover" />
      <span>{label}</span>
    </button>
  )
}
