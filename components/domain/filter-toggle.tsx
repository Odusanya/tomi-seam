"use client"

// L3 atom. An on/off filter at control height (28 px), in the same rounded-md family as the
// search field and the segmented control. Off it is a quiet outline; on it fills like a chosen
// segment. components/ui/toggle is rounded-2xl, so this treatment lives here.
import { Toggle } from "@base-ui/react/toggle"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type Props = {
  pressed: boolean
  onPressedChange: (pressed: boolean) => void
  children: ReactNode
  className?: string
}

export function FilterToggle({ pressed, onPressedChange, children, className }: Props) {
  return (
    <Toggle
      pressed={pressed}
      onPressedChange={onPressedChange}
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-md border border-default px-2.5 text-body-sm font-medium whitespace-nowrap text-fg-secondary transition-colors duration-150 ease-press hover:text-fg-primary data-pressed:border-strong data-pressed:bg-component data-pressed:text-fg-primary motion-reduce:transition-none",
        className,
      )}
    >
      {children}
    </Toggle>
  )
}
