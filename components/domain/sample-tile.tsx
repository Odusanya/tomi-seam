// L3 atom. One sample image as a button. Picking it feeds the same pipeline as a dropped file.
// Image only, no visible caption: `label` is the button's accessible name.
import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"

type Props = Omit<ComponentProps<"button">, "type" | "children"> & { src: string; alt: string; label: string }

export function SampleTile({ src, alt, label, className, ...props }: Props) {
  return (
    <button
      type="button"
      className={cn(
        "block rounded-md transition-opacity duration-150 ease-press hover:opacity-80 focus-visible:ring-3 focus-visible:ring-sidebar-ring motion-reduce:transition-none",
        className,
      )}
      aria-label={label}
      {...props}
    >
      {/* Local 1200 px photo; next/image adds nothing for a static 300 px tile. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="aspect-3/2 w-full rounded-md border border-subtle object-cover" />
    </button>
  )
}
