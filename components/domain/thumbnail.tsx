// L3 atom. A classified image at row size: square, cropped to fill, hairline edge so pale
// images keep a boundary on the page.
import { cva, type VariantProps } from "class-variance-authority"
import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"

// max-w-none: preflight caps images at 100% of the cell, which lets an auto-layout table
// squeeze the tile to a sliver on narrow screens.
const thumbnailVariants = cva(
  "block max-w-none shrink-0 rounded-sm border border-default object-cover",
  {
    variants: {
      // md sits inside a comfortable 44 px row, sm inside a 36 px row, xs inside a compact 32 px row.
      // hero fills the detail sheet's width at a square crop.
      size: {
        hero: "aspect-square h-auto w-full rounded-md",
        md: "size-8 rounded-md",
        sm: "size-7",
        xs: "size-6",
      },
    },
    defaultVariants: { size: "sm" },
  }
)

type Props = Omit<ComponentProps<"img">, "children" | "alt"> &
  VariantProps<typeof thumbnailVariants> & { src: string; alt: string }

export function Thumbnail({ src, alt, size, className, ...props }: Props) {
  return (
    // Fixture SVGs and object URLs; next/image adds nothing for a 28 px tile.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={cn(thumbnailVariants({ size }), className)}
      {...props}
    />
  )
}
