// L3 atom. Where a classified image came from. Plain tertiary text, not a chip: it is
// secondary to the ID it follows, and only uploads are worth marking.
import { cva } from "class-variance-authority"
import type { ComponentProps } from "react"

import type { ClassificationSource } from "@/lib/fixtures/classification"
import { cn } from "@/lib/utils"

const sourceTagVariants = cva("text-caption-base", {
  variants: { tone: { quiet: "text-fg-tertiary" } },
  defaultVariants: { tone: "quiet" },
})

const SOURCE_LABEL: Record<ClassificationSource, string> = { upload: "Upload", sample: "Sample" }

type Props = Omit<ComponentProps<"span">, "children"> & { source: ClassificationSource }

export function SourceTag({ source, className, ...props }: Props) {
  return (
    <span className={cn(sourceTagVariants(), className)} {...props}>
      {SOURCE_LABEL[source]}
    </span>
  )
}
