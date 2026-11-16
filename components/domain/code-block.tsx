// L3 atom. Read-only monospace text in a recessed box, with an optional action (a copy
// button) pinned to the top-right corner. The right padding keeps the action off the text.
import { cva } from "class-variance-authority"
import type { ReactNode } from "react"

const codeBlockVariants = cva(
  "overflow-x-auto rounded-lg border border-default bg-container-recessed py-2.5 pr-10 pl-3 font-mono text-caption-lg whitespace-pre text-fg-primary"
)

type Props = {
  code: string
  /** Pinned to the top-right corner, e.g. a CopyButton. */
  action?: ReactNode
  "aria-label"?: string
}

export function CodeBlock({ code, action, "aria-label": ariaLabel }: Props) {
  return (
    <div className="relative">
      <pre className={codeBlockVariants()} aria-label={ariaLabel}>
        <code>{code}</code>
      </pre>
      {action ? (
        <span className="absolute top-1.5 right-1.5">{action}</span>
      ) : null}
    </div>
  )
}
