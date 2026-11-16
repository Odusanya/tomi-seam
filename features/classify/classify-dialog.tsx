"use client"
// Classify as a centred dialog, opened by the sidebar's call to action. The app layout
// renders it once; open state lives in hooks/use-scan.tsx so the sidebar can reach it.
import { PlayCircleIcon } from "@heroicons/react/16/solid"

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { ClassifyScreen } from "@/features/classify/classify-screen"
import { useScan } from "@/hooks/use-scan"
import { HOW_IT_WORKS_URL } from "@/lib/fixtures/nav"

export function ClassifyDialog() {
  const { dialogOpen, setDialogOpen } = useScan()
  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent className="max-h-svh overflow-y-auto sm:max-w-3xl">
        <div className="flex flex-col gap-0.5">
          <DialogTitle>Classify an image</DialogTitle>
          <DialogDescription>
            Hot dog or not. Inference is simulated in this sandbox.{" "}
            <a
              href={HOW_IT_WORKS_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1"
            >
              See how it works
              <PlayCircleIcon aria-hidden className="size-3.5" />
              <span className="sr-only">(video on YouTube, opens in a new tab)</span>
            </a>
          </DialogDescription>
        </div>
        <ClassifyScreen bare onDone={() => setDialogOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
