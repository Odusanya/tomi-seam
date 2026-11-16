"use client"

import { useRef, useState, type DragEvent } from "react"

import { AnalysingView, PickView, VerdictView } from "@/features/classify/classify-views"
import { useClock } from "@/hooks/use-clock"
import { useFakeAI } from "@/hooks/use-fake-ai"
import { useFocusWhen } from "@/hooks/use-focus-when"
import { useScan } from "@/hooks/use-scan"
import { classify, validateImage, type ClassifyInput } from "@/lib/classify"
import type { ClassificationResult } from "@/lib/fixtures/classification"
import type { AIRun } from "@/lib/fixtures/types"
import type { SampleImage } from "@/lib/fixtures/samples"

/** What the screen shows. One value, so impossible combinations cannot be written. */
export type ScreenState =
  | { status: "idle" }
  | { status: "analysing"; preview: string; alt: string; step?: string }
  | { status: "verdict"; preview: string; alt: string; result: ClassificationResult }
  | { status: "rejected"; reason: string }

// What the user picked. `phase` says whether the fake-AI run has started: until it has, any
// earlier run's result must not be shown for this image.
type Selection =
  | { kind: "rejected"; reason: string }
  | { kind: "picked"; preview: string; alt: string; input: ClassifyInput; phase: "preparing" | "running" }

const ANALYSE_MS = 1300
const NARRATION = ["Reading image", "Extracting features", "Evaluating..."] as const

function deriveScreen(selection: Selection | null, ai: AIRun<ClassificationResult>): ScreenState {
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
  return { status: "analysing", preview, alt, step: ai.status === "running" ? ai.step : undefined }
}

function releasePreview(selection: Selection | null) {
  if (selection?.kind === "picked" && selection.input.source === "upload") {
    URL.revokeObjectURL(selection.input.thumbnail)
  }
}

// Keyed by the sidebar's "Scan image" counter: a bump remounts the screen at idle.
export function ClassifyScreen() {
  const { resetKey } = useScan()
  return <ClassifyFlow key={resetKey} focusDropzoneOnMount={resetKey > 0} />
}

function ClassifyFlow({ focusDropzoneOnMount }: { focusDropzoneOnMount: boolean }) {
  const [selection, setSelection] = useState<Selection | null>(null)
  const [dragging, setDragging] = useState(false)
  const [ai, runAI] = useFakeAI<ClassificationResult>()
  const now = useClock()
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
    void runAI(result, { ms: ANALYSE_MS, steps: NARRATION })
  }

  function pickSample(sample: SampleImage) {
    void start(sample.src, sample.alt, { source: "sample", sample })
  }

  function pickFile(file: File) {
    const reason = validateImage(file)
    if (reason) {
      token.current++
      releasePreview(selection)
      setSelection({ kind: "rejected", reason })
      return
    }
    const url = URL.createObjectURL(file)
    void start(url, `Uploaded image: ${file.name}`, { source: "upload", file, thumbnail: url })
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
      pickFile(file)
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
  // Focus follows the screen: the control that was focused unmounts on every change.
  useFocusWhen(resetRef, screen.status === "verdict")
  useFocusWhen(dropzoneRef, screen.status === "idle" && (touched || focusDropzoneOnMount))

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-6 p-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-heading-6 font-medium">Classify</h1>
        <p className="text-caption-lg text-fg-tertiary">Inference is simulated in this sandbox.</p>
      </header>
      <div
        className="flex flex-col gap-6"
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
                pickFile(file)
              }
            }}
            onSample={pickSample}
          />
        ) : null}
        {screen.status === "analysing" ? (
          <AnalysingView preview={screen.preview} alt={screen.alt} step={screen.step} />
        ) : null}
        {screen.status === "verdict" ? (
          <VerdictView preview={screen.preview} alt={screen.alt} verdict={screen.result.verdict} onReset={reset} resetRef={resetRef} />
        ) : null}
      </div>
    </main>
  )
}
