"use client"

import { useRef, useState, type DragEvent } from "react"

import { PageBody, PageHeader } from "@/components/domain/page-header"
import { SCAN_CYCLE_MS, SCAN_SPEED } from "@/components/domain/scan-shader"

import { PickView, SubjectView } from "@/features/classify/classify-views"
import { NARRATION, type ScreenState } from "@/features/classify/types"
import { useClock } from "@/hooks/use-clock"
import { useFakeAI } from "@/hooks/use-fake-ai"
import { useFocusWhen } from "@/hooks/use-focus-when"
import { useScan } from "@/hooks/use-scan"
import { useSessionResults } from "@/hooks/use-session-results"
import { classify, validateImage, type ClassifyInput } from "@/lib/classify"
import type { ClassificationResult } from "@/lib/fixtures/classification"
import type { AIRun } from "@/lib/fixtures/types"
import type { SampleImage } from "@/lib/fixtures/samples"

// What the user picked. `phase` says whether the fake-AI run has started: until it has, any
// earlier run's result must not be shown for this image.
type Selection =
  | { kind: "rejected"; reason: string }
  | {
      kind: "picked"
      preview: string
      alt: string
      input: ClassifyInput
      phase: "preparing" | "running"
    }

// One full scan loop (up, dwell, down, dwell), so the verdict lands as the line comes to rest.
const ANALYSE_MS = SCAN_CYCLE_MS / SCAN_SPEED
function deriveScreen(
  selection: Selection | null,
  ai: AIRun<ClassificationResult>
): ScreenState {
  if (!selection) {
    return { status: "idle" }
  }
  if (selection.kind === "rejected") {
    return { status: "rejected", reason: selection.reason }
  }
  const { preview, alt, phase } = selection
  if (phase === "running" && ai.status === "done") {
    return { status: "verdict", preview, alt, result: ai.value }
  }
  if (phase === "running" && ai.status === "error") {
    return { status: "rejected", reason: ai.message }
  }
  return {
    status: "analysing",
    preview,
    alt,
    step: ai.status === "running" ? ai.step : undefined,
  }
}

// The photo being scanned or already judged; null while the user is still picking.
function subjectOf(screen: ScreenState) {
  if (screen.status === "analysing") {
    return { preview: screen.preview, alt: screen.alt, step: screen.step }
  }
  if (screen.status === "verdict") {
    return { preview: screen.preview, alt: screen.alt, result: screen.result }
  }
  return null
}

function releasePreview(selection: Selection | null) {
  if (selection?.kind === "picked" && selection.input.source === "upload") {
    URL.revokeObjectURL(selection.input.thumbnail)
  }
}

// Keyed by the sidebar's "Classify" counter: a bump remounts the screen at idle.
// `bare` drops the page chrome (main, header, width) for use inside the Classify dialog.
// `onDone` adds a "Done" action to the verdict (the dialog passes its close).
export function ClassifyScreen({ bare = false, onDone }: { bare?: boolean; onDone?: () => void }) {
  const { resetKey } = useScan()
  const flow = <ClassifyFlow key={resetKey} focusDropzoneOnMount={resetKey > 0} onDone={onDone} />
  if (bare) {
    return flow
  }
  return (
    <main className="flex min-w-0 flex-1 flex-col">
      <PageHeader title="Classify" />
      <PageBody width="narrow">{flow}</PageBody>
    </main>
  )
}

function ClassifyFlow({
  focusDropzoneOnMount,
  onDone,
}: {
  focusDropzoneOnMount: boolean
  onDone?: () => void
}) {
  const [selection, setSelection] = useState<Selection | null>(null)
  const [dragging, setDragging] = useState(false)
  const [ai, runAI] = useFakeAI<ClassificationResult>()
  const now = useClock()
  const { add: addResult } = useSessionResults()
  const token = useRef(0)
  const dragDepth = useRef(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropzoneRef = useRef<HTMLButtonElement>(null)
  const resetRef = useRef<HTMLButtonElement>(null)
  const [touched, setTouched] = useState(false)

  // Every pick, sample or file, goes through here. A newer pick cancels the older one:
  // the token drops a pending hash, and useFakeAI drops a pending run.
  async function start(preview: string, alt: string, input: ClassifyInput) {
    const mine = ++token.current
    setTouched(true)
    releasePreview(selection)
    setSelection({ kind: "picked", preview, alt, input, phase: "preparing" })
    const result = await classify(input, now())
    if (mine !== token.current) {
      return
    }
    setSelection({ kind: "picked", preview, alt, input, phase: "running" })
    await runAI(result, { ms: ANALYSE_MS, steps: NARRATION })
    // Only the latest pick lands in History; a replaced or reset run is dropped.
    if (mine === token.current) {
      void addResult(result)
    }
  }

  function pickSample(sample: SampleImage) {
    void start(sample.src, sample.alt, { source: "sample", sample })
  }

  async function pickFile(file: File) {
    const reason = validateImage(file)
    if (reason) {
      token.current++
      releasePreview(selection)
      setSelection({ kind: "rejected", reason })
      return
    }
    // A file that claims to be an image but cannot be decoded is rejected, not classified.
    const before = ++token.current
    const readable = await createImageBitmap(file).then(
      (bitmap) => {
        bitmap.close()
        return true
      },
      () => false,
    )
    if (before !== token.current) {
      return
    }
    if (!readable) {
      releasePreview(selection)
      setSelection({ kind: "rejected", reason: "That image could not be read. Try another file." })
      return
    }
    const url = URL.createObjectURL(file)
    void start(url, `Uploaded image: ${file.name}`, {
      source: "upload",
      file,
      thumbnail: url,
    })
  }

  function reset() {
    token.current++
    releasePreview(selection)
    setSelection(null)
  }

  function onDrop(event: DragEvent) {
    event.preventDefault()
    dragDepth.current = 0
    setDragging(false)
    const file = event.dataTransfer.files[0]
    if (file) {
      void pickFile(file)
    }
  }

  function onDragEnter(event: DragEvent) {
    event.preventDefault()
    dragDepth.current++
    setDragging(true)
  }

  function onDragLeave() {
    dragDepth.current = Math.max(0, dragDepth.current - 1)
    setDragging(dragDepth.current > 0)
  }

  const screen = deriveScreen(selection, ai)
  const subject = subjectOf(screen)
  // Focus follows the screen: the control that was focused unmounts on every change.
  useFocusWhen(resetRef, screen.status === "verdict")
  useFocusWhen(
    dropzoneRef,
    screen.status === "idle" && (touched || focusDropzoneOnMount)
  )

  return (
    <div
      className="flex flex-col gap-3"
      role="presentation"
      onDragEnter={onDragEnter}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {screen.status === "idle" || screen.status === "rejected" ? (
        <PickView
          dragging={dragging}
          rejection={screen.status === "rejected" ? screen.reason : null}
          inputRef={inputRef}
          dropzoneRef={dropzoneRef}
          onBrowse={() => inputRef.current?.click()}
          onFile={(event) => {
            const file = event.currentTarget.files?.[0]
            event.currentTarget.value = ""
            if (file) {
              void pickFile(file)
            }
          }}
          onSample={pickSample}
        />
      ) : null}
      {subject ? <SubjectView {...subject} onReset={reset} onDone={onDone} resetRef={resetRef} /> : null}
    </div>
  )
}
