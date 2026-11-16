// L3 atom. The one header every screen starts with: a 48 px bar, the page title (18 px) at the
// left edge, a hairline below. No breadcrumb: the app name already sits in the sidebar.
// Every page shares one top edge and one left edge, so moving between screens doesn't shift
// where the eye lands.
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type Props = {
  /** The page name, shown as the document's h1. */
  title: string
  /** Optional controls at the right end of the bar. */
  actions?: ReactNode
  /** Optional count of what the page lists, set right after the title in tertiary figures. */
  count?: ReactNode
}

export function PageHeader({ title, actions, count }: Props) {
  return (
    <header className="flex h-12 shrink-0 items-center gap-3 border-b border-default pr-4 pl-5">
      <div className="flex min-w-0 items-baseline gap-2">
        <h1 className="truncate text-body-lg font-medium text-fg-primary">{title}</h1>
        {count === undefined ? null : (
          <span aria-live="polite" className="shrink-0 text-body-sm text-fg-tertiary tabular-nums">
            {count}
          </span>
        )}
      </div>
      {actions ? (
        <div className="ml-auto flex items-center gap-2">{actions}</div>
      ) : null}
    </header>
  )
}

/** The body under the header: the same 20 px inset on every page, content from the left edge. */
export function PageBody({
  children,
  width = "full",
}: {
  children: ReactNode
  width?: "narrow" | "wide" | "full"
}) {
  const max = { narrow: "max-w-xl", wide: "max-w-6xl", full: undefined }[width]
  return (
    <div className={cn("flex min-h-0 w-full flex-1 flex-col gap-5 p-5", max)}>
      {children}
    </div>
  )
}
