// L3 atom. A toolbar search input at control height (28 px). InputGroup is fixed at 32 px
// with no size variant, so the toolbar size lives here.
import { cva, type VariantProps } from "class-variance-authority"
import { SearchIcon, XIcon } from "lucide-react"
import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"

// The input fills the field, so the global focus outline lands on the field's own edge.
const searchFieldVariants = cva(
  "w-full min-w-0 appearance-none rounded-md border border-default bg-transparent pr-7 pl-8 text-body-sm text-fg-primary not-placeholder-shown:border-strong placeholder:text-fg-tertiary [&::-webkit-search-cancel-button]:hidden",
  {
    variants: { size: { sm: "h-7" } },
    defaultVariants: { size: "sm" },
  },
)

type Props = Omit<ComponentProps<"input">, "type" | "size" | "value" | "onChange" | "children"> &
  VariantProps<typeof searchFieldVariants> & {
    value: string
    onValueChange: (value: string) => void
    /** Accessible name; the placeholder is not one. */
    label: string
  }

export function SearchField({ value, onValueChange, label, size, className, ...props }: Props) {
  return (
    <div className={cn("relative", className)}>
      <SearchIcon
        aria-hidden
        strokeWidth={1.5}
        className="pointer-events-none absolute top-1.5 left-2 size-4 text-fg-tertiary"
      />
      <input
        type="search"
        aria-label={label}
        value={value}
        onChange={(event) => onValueChange(event.currentTarget.value)}
        autoComplete="off"
        spellCheck={false}
        className={searchFieldVariants({ size })}
        {...props}
      />
      {value ? (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => onValueChange("")}
          className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-sm text-fg-tertiary hover:bg-ghost-hover hover:text-fg-primary"
        >
          <XIcon aria-hidden strokeWidth={1.5} className="size-3.5" />
        </button>
      ) : null}
    </div>
  )
}
