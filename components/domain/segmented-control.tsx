"use client"

// L3 atom. A single-choice filter at control height (28 px): a recessed track with the chosen
// segment raised. ToggleGroup in components/ui is a row of ghost toggles with its own radius,
// so this treatment lives here. Every segment is medium weight, so choosing one never shifts
// the others sideways.
import { Toggle } from "@base-ui/react/toggle"
import { ToggleGroup } from "@base-ui/react/toggle-group"

import { cn } from "@/lib/utils"

type Option<T extends string> = { value: T; label: string }

type Props<T extends string> = {
  options: readonly Option<T>[]
  value: T
  onValueChange: (value: T) => void
  "aria-label": string
  className?: string
}

export function SegmentedControl<T extends string>({ options, value, onValueChange, className, ...props }: Props<T>) {
  return (
    <ToggleGroup
      aria-label={props["aria-label"]}
      value={[value]}
      onValueChange={(next) => {
        // Cannot be cleared: pressing the chosen segment keeps it.
        const picked = options.find((option) => option.value === next[0])
        if (picked) {
          onValueChange(picked.value)
        }
      }}
      className={cn("inline-flex h-7 shrink-0 items-center gap-0.5 rounded-md bg-component p-0.5", className)}
    >
      {options.map((option) => (
        <Toggle
          key={option.value}
          value={option.value}
          className="h-6 rounded-sm px-2.5 text-body-sm font-medium whitespace-nowrap text-fg-secondary transition-colors duration-150 ease-press hover:text-fg-primary data-pressed:bg-container data-pressed:text-fg-primary data-pressed:shadow-default motion-reduce:transition-none"
        >
          {option.label}
        </Toggle>
      ))}
    </ToggleGroup>
  )
}
