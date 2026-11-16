// L3 atom. The verdict in a table row as a pill button: the column people scan for, and the
// handle for the row's actions (retry, appeal). Neutral by default; colour only for the
// exceptions: violet while the model re-runs (DESIGN rule 1), a danger glyph when a re-run failed.
import { cva, type VariantProps } from "class-variance-authority"
import { ChevronDownIcon, CircleAlertIcon } from "lucide-react"
import { Arc } from "loading-dev"
import type { ComponentProps } from "react"

import { VERDICT_GLYPH } from "@/components/domain/verdict-mark"
import { VERDICT_LABEL, type Verdict } from "@/lib/fixtures/classification"
import { cn } from "@/lib/utils"

const verdictPillVariants = cva(
  "inline-flex h-7 shrink-0 items-center gap-1.5 rounded-2xl border px-2 text-body-sm font-medium whitespace-nowrap transition-colors duration-150 ease-press select-none disabled:cursor-default motion-reduce:transition-none",
  {
    variants: {
      status: {
        idle: "border-default bg-container text-fg-primary hover:bg-component data-popup-open:bg-component",
        appealed: "border-default bg-container text-fg-primary hover:bg-component data-popup-open:bg-component",
        failed: "border-default bg-container text-fg-primary hover:bg-component data-popup-open:bg-component",
        running: "border-ai-border bg-ai-subtle text-ai-fg",
      },
    },
    defaultVariants: { status: "idle" },
  },
)

type Status = NonNullable<VariantProps<typeof verdictPillVariants>["status"]>

type Props = Omit<ComponentProps<"button">, "children"> & { verdict: Verdict; status?: Status }

export function VerdictPill({ verdict, status = "idle", className, type = "button", ...props }: Props) {
  const Glyph = VERDICT_GLYPH[verdict]
  const running = status === "running"
  return (
    <button
      type={type}
      disabled={running || props.disabled}
      className={cn(verdictPillVariants({ status }), className)}
      {...props}
    >
      {running ? (
        <span aria-hidden className="flex size-4 items-center justify-center">
          <Arc size={14} />
        </span>
      ) : (
        <Glyph aria-hidden strokeWidth={1.5} className="size-4 shrink-0" />
      )}
      <span>{running ? "Re-running" : VERDICT_LABEL[verdict]}</span>
      {status === "failed" ? (
        <CircleAlertIcon aria-label="Re-run failed" strokeWidth={1.5} className="size-3.5 shrink-0 text-fg-danger" />
      ) : null}
      {running ? null : <ChevronDownIcon aria-hidden strokeWidth={1.5} className="size-3.5 shrink-0 text-fg-tertiary" />}
    </button>
  )
}
