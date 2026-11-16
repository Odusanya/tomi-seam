import { HistoryIcon, SearchIcon, TriangleAlertIcon } from "lucide-react"
import Link from "next/link"

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { VERDICT_LABEL } from "@/lib/fixtures/classification"
import type { VerdictFilter } from "@/features/history/filter"

/** Zero data: nothing has been classified yet. */
export function HistoryEmpty() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <HistoryIcon aria-hidden strokeWidth={1.5} />
        </EmptyMedia>
        <EmptyTitle>No classifications yet</EmptyTitle>
        <EmptyDescription>
          Classified images are listed here, newest first.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Link href="/" className={buttonVariants({ variant: "secondary" })}>
          Classify an image
        </Link>
      </EmptyContent>
    </Empty>
  )
}

type NoResultsProps = {
  query: string
  verdict: VerdictFilter
  onClearQuery: () => void
  /** Resets the verdict filter. */
  onClearVerdict: () => void
}

// What the filters (not the search) are asking for, in words.
function filterPhrase(verdict: VerdictFilter): string {
  const which =
    verdict === "all" ? "classification" : `${VERDICT_LABEL[verdict]} verdict`
  return `No ${which} matches.`
}

/** There is data, but the search or the verdict filter hides all of it. */
export function HistoryNoResults({
  query,
  verdict,
  onClearQuery,
  onClearVerdict,
}: NoResultsProps) {
  const term = query.trim()
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <SearchIcon aria-hidden strokeWidth={1.5} />
        </EmptyMedia>
        <EmptyTitle>No classifications match</EmptyTitle>
        <EmptyDescription>
          {term ? (
            <>
              No ID contains{" "}
              <span className="font-mono text-fg-secondary">{term}</span>
              {verdict === "all" ? "." : ` in ${VERDICT_LABEL[verdict]}.`}
            </>
          ) : (
            filterPhrase(verdict)
          )}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        {term ? (
          <Button variant="ghost" size="sm" onClick={onClearQuery}>
            Clear search
          </Button>
        ) : (
          <Button variant="ghost" size="sm" onClick={onClearVerdict}>
            Clear filters
          </Button>
        )}
      </EmptyContent>
    </Empty>
  )
}

/** The list failed to load: say what failed and offer a retry. */
export function HistoryError({
  message,
  onRetry,
}: {
  message: string
  onRetry: () => void
}) {
  return (
    <Alert variant="destructive">
      <TriangleAlertIcon aria-hidden strokeWidth={1.5} />
      <AlertTitle>History could not be loaded</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
      <AlertAction>
        <Button variant="outline" size="sm" onClick={onRetry}>
          Retry
        </Button>
      </AlertAction>
    </Alert>
  )
}
