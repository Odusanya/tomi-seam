"use client"
// L3 atom. The sidebar's one call to action, above the nav items. Ink fill from tokens;
// the focus indicator is an offset outline so it sits against the sidebar, not the black fill.
// In the collapsed rail it shrinks to an icon square and the label stays for screen readers.
// Icon: loading-dev's Scan (a frame with a sweeping line), held still at rest and played
// while the button is hovered or keyboard-focused. Reduced motion holds it mid-frame.
import { cva } from "class-variance-authority"
import { Scan } from "loading-dev"
import { useState, type ComponentProps } from "react"

const scanActionVariants = cva(
  "inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-2xl px-4 text-body-sm font-medium whitespace-nowrap transition-colors duration-150 group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:px-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sidebar-ring motion-reduce:transition-none md:h-9",
  {
    variants: {
      tone: { ink: "cursor-pointer bg-ink-solid text-on-inverted hover:bg-ink-solid-hover" },
    },
    defaultVariants: { tone: "ink" },
  },
)

export function ScanAction({
  className,
  children,
  onPointerEnter,
  onPointerLeave,
  onFocus,
  onBlur,
  ...props
}: ComponentProps<"button">) {
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  return (
    <button
      type="button"
      className={scanActionVariants({ className })}
      onPointerEnter={(event) => {
        setHovered(true)
        onPointerEnter?.(event)
      }}
      onPointerLeave={(event) => {
        setHovered(false)
        onPointerLeave?.(event)
      }}
      onFocus={(event) => {
        setFocused(event.currentTarget.matches(":focus-visible"))
        onFocus?.(event)
      }}
      onBlur={(event) => {
        setFocused(false)
        onBlur?.(event)
      }}
      {...props}
    >
      <Scan size={16} playState={hovered || focused ? "running" : "paused"} />
      {children}
    </button>
  )
}

/** The button's text: hidden visually in the collapsed rail, still read out. */
export function ScanActionLabel({ children }: { children: string }) {
  return <span className="group-data-[collapsible=icon]:sr-only">{children}</span>
}
