import { HistoryIcon } from "lucide-react"
import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"

// Placeholder until the History milestone: a real route with an honest empty state.
export function HistoryScreen() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <header>
        <h1 className="text-heading-6 font-medium">History</h1>
      </header>
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HistoryIcon aria-hidden strokeWidth={1.5} />
          </EmptyMedia>
          <EmptyTitle>No classifications yet</EmptyTitle>
          <EmptyDescription>Classified images are listed here, newest first.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Link href="/" className={buttonVariants({ variant: "secondary" })}>
            Classify an image
          </Link>
        </EmptyContent>
      </Empty>
    </main>
  )
}
