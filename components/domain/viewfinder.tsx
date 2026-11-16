// L3 atom. The Classify frame: a 3:2 stage with four corner brackets, like a camera viewfinder.
// The frame never changes size; `state` changes its surface and how tightly the brackets sit.
// Light for picking and the verdict, the black scan stage only while the model is scanning.
// `Viewfinder` is a plain frame; `ViewfinderButton` is the same frame as the drop target.
import { cva, type VariantProps } from "class-variance-authority"
import type { ComponentProps, ReactNode } from "react"

import { cn } from "@/lib/utils"

const viewfinderVariants = cva(
  "relative flex aspect-3/2 w-full flex-col items-center justify-center gap-1 overflow-hidden rounded-lg text-center transition-colors duration-150 motion-reduce:transition-none",
  {
    variants: {
      state: {
        idle: "bg-page text-fg-primary",
        dragging: "bg-brand-subtle text-fg-primary",
        rejected: "bg-page text-fg-danger",
        scanning: "bg-scan-stage text-on-inverted",
        verdict: "bg-page text-fg-primary",
      },
      interactive: {
        true: "hover:bg-component focus-visible:ring-3 focus-visible:ring-sidebar-ring",
        false: "",
      },
    },
    defaultVariants: { state: "idle", interactive: false },
  },
)

// The brackets ride on one box, so tightening them is a single transform.
const bracketsVariants = cva(
  "pointer-events-none absolute inset-2 transition-transform duration-300 ease-panel motion-reduce:transition-none",
  {
    variants: {
      fit: { loose: "scale-90", tight: "scale-100" },
    },
    defaultVariants: { fit: "loose" },
  },
)

const cornerVariants = cva("absolute size-5 border-current", {
  variants: {
    corner: {
      tl: "top-0 left-0 border-t-2 border-l-2",
      tr: "top-0 right-0 border-t-2 border-r-2",
      bl: "bottom-0 left-0 border-b-2 border-l-2",
      br: "right-0 bottom-0 border-r-2 border-b-2",
    },
  },
})

type State = NonNullable<VariantProps<typeof viewfinderVariants>["state"]>

// Brackets hug the subject once there is one.
function fitFor(state: State) {
  return state === "scanning" || state === "verdict" ? "tight" : "loose"
}

function Brackets({ state }: { state: State }) {
  return (
    <span aria-hidden className={bracketsVariants({ fit: fitFor(state) })}>
      <span className={cornerVariants({ corner: "tl" })} />
      <span className={cornerVariants({ corner: "tr" })} />
      <span className={cornerVariants({ corner: "bl" })} />
      <span className={cornerVariants({ corner: "br" })} />
    </span>
  )
}

type FrameProps = { state?: State; children?: ReactNode }

export function Viewfinder({ state = "idle", className, children, ...props }: ComponentProps<"div"> & FrameProps) {
  return (
    <div className={cn(viewfinderVariants({ state }), className)} {...props}>
      {children}
      <Brackets state={state} />
    </div>
  )
}

export function ViewfinderButton({
  state = "idle",
  className,
  children,
  ...props
}: Omit<ComponentProps<"button">, "type"> & FrameProps) {
  return (
    <button type="button" className={cn(viewfinderVariants({ state, interactive: true }), className)} {...props}>
      {children}
      <Brackets state={state} />
    </button>
  )
}
