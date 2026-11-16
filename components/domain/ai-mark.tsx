// L3 atom. DESIGN rule 1 in one place: violet while the AI's word stands,
// neutral once a person has accepted, edited or rejected it. Neutral states
// differ by icon shape, not colour.
import { cva } from "class-variance-authority"
import { CheckIcon, PencilIcon, SparklesIcon, XIcon } from "lucide-react"
import type { ComponentProps } from "react"

import { chipBase } from "@/components/domain/chip"
import { cn } from "@/lib/utils"

const aiMarkVariants = cva(chipBase(), {
  variants: {
    status: {
      draft: "bg-ai-subtle text-ai-fg",
      accepted: "bg-component text-fg-secondary",
      edited: "bg-component text-fg-secondary",
      rejected: "bg-component text-fg-secondary",
    },
  },
})

const labels = { draft: "AI draft", accepted: "Accepted", edited: "Edited", rejected: "Rejected" } as const
const icons = { draft: SparklesIcon, accepted: CheckIcon, edited: PencilIcon, rejected: XIcon } as const

type Status = keyof typeof labels
type Props = Omit<ComponentProps<"span">, "children"> & { status: Status; by?: string }

export function AIMark({ status, by, className, ...props }: Props) {
  const Icon = icons[status]
  return (
    <span className={cn(aiMarkVariants({ status }), className)} {...props}>
      <Icon aria-hidden className="size-3" />
      {status !== "draft" && by ? `${labels[status]} by ${by}` : labels[status]}
    </span>
  )
}
