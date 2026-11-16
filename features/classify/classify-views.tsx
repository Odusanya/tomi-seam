// Presentational pieces of the Classify flow. State lives in classify-screen.tsx.
// One viewfinder frame carries all three states: the drop target, the black scan stage and
// the photo with its verdict. Only what sits inside the brackets changes.
import { CircleAlertIcon } from "lucide-react"
import { AnimatePresence } from "motion/react"
import type { ComponentProps, ReactNode, RefObject } from "react"

import { HudLabel } from "@/components/domain/hud-label"
import { IsoTray } from "@/components/domain/iso-tray"
import { SampleTile } from "@/components/domain/sample-tile"
import { ScanStage } from "@/components/domain/scan-stage"
import { VerdictMark } from "@/components/domain/verdict-mark"
import { Viewfinder, ViewfinderButton } from "@/components/domain/viewfinder"
import { Button } from "@/components/ui/button"
import { NARRATION } from "@/features/classify/types"
import { ACCEPTED_TYPES, MODEL, type ClassificationResult } from "@/lib/fixtures/classification"
import { creditFor, samples, type SampleImage } from "@/lib/fixtures/samples"

const ICON_STROKE = 1.5

function dropzoneState(dragging: boolean, rejection: string | null) {
  if (dragging) {
    return "dragging"
  }
  return rejection ? "rejected" : "idle"
}

// The row above the frame: the model on the left, the state readout on the right.
function Hud({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <HudLabel tone="primary">
        <span aria-hidden className="size-1.5 rounded-full bg-fg-primary" />
        {MODEL.name} {MODEL.version}
      </HudLabel>
      {children}
    </div>
  )
}

// The zone under the frame keeps one height, so the dialog does not jump between states.
function Below({ children }: { children: ReactNode }) {
  return <div className="flex min-h-24 flex-col gap-2">{children}</div>
}

export function PickView({
  dragging,
  rejection,
  inputRef,
  dropzoneRef,
  onBrowse,
  onFile,
  onSample,
}: {
  dragging: boolean
  rejection: string | null
  inputRef: RefObject<HTMLInputElement | null>
  dropzoneRef: RefObject<HTMLButtonElement | null>
  onBrowse: () => void
  onFile: NonNullable<ComponentProps<"input">["onChange"]>
  onSample: (sample: SampleImage) => void
}) {
  const state = dropzoneState(dragging, rejection)
  return (
    <>
      <Hud>
        <HudLabel>Ready</HudLabel>
      </Hud>
      <ViewfinderButton
        ref={dropzoneRef}
        state={state}
        onClick={onBrowse}
        aria-describedby={rejection ? "classify-rejection" : undefined}
      >
        <IsoTray state={state} />
        <span className="text-body-base font-medium text-fg-primary">Drop an image to scan</span>
        <span className="text-caption-lg text-fg-tertiary">or browse · JPEG, PNG or WebP, up to 10 MB</span>
      </ViewfinderButton>
      <input ref={inputRef} type="file" accept={ACCEPTED_TYPES.join(",")} hidden tabIndex={-1} onChange={onFile} />
      {rejection ? (
        <p id="classify-rejection" role="alert" className="flex items-center gap-1.5 text-body-sm text-fg-danger">
          <CircleAlertIcon aria-hidden strokeWidth={ICON_STROKE} className="size-4 shrink-0" />
          {rejection}
        </p>
      ) : null}
      <Below>
        <section aria-labelledby="classify-samples" className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 id="classify-samples">
              <HudLabel>Or try a sample</HudLabel>
            </h2>
            <HudLabel>{String(samples.length).padStart(2, "0")} frames</HudLabel>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-9">
            {samples.map((sample) => (
              <SampleTile
                key={sample.id}
                src={sample.src}
                alt={sample.alt}
                label={sample.label}
                onClick={() => onSample(sample)}
              />
            ))}
          </div>
        </section>
      </Below>
    </>
  )
}

function Credit({ src }: { src: string }) {
  const credit = creditFor(src)
  if (!credit) {
    return null
  }
  return (
    <p className="text-caption-base text-fg-tertiary">
      Photo: {credit.author} ·{" "}
      <a href={credit.sourceUrl} target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-fg-secondary">
        {credit.license}, Wikimedia Commons
      </a>
    </p>
  )
}

// One tick per narration step: done, active (violet: the AI is still talking), pending.
function StepTicks({ step }: { step?: string }) {
  const active = NARRATION.findIndex((name) => name === step)
  return (
    <span aria-hidden className="flex items-center gap-1">
      {NARRATION.map((name, index) => {
        let tone = "bg-component"
        if (index < active) {
          tone = "bg-fg-primary"
        } else if (index === active) {
          tone = "bg-ai-solid"
        }
        return <span key={name} className={`h-0.5 w-4 rounded-full ${tone}`} />
      })}
    </span>
  )
}

// The verdict, stamped over the photo on its own white label so it reads on any image.
function Stamp({ result }: { result: ClassificationResult }) {
  return (
    <output className="absolute bottom-5 left-5 flex animate-in items-center gap-3 rounded-lg border border-subtle bg-page px-3 py-2 shadow-default duration-200 fade-in motion-reduce:animate-none">
      <VerdictMark verdict={result.verdict} size="md" />
      <span className="font-mono text-body-sm text-fg-secondary tabular-nums">
        {Math.round(result.confidence * 100)}%
      </span>
    </output>
  )
}

type ActionsProps = {
  onReset: () => void
  onDone?: () => void
  resetRef: RefObject<HTMLButtonElement | null>
}

function Actions({ onReset, onDone, resetRef }: ActionsProps) {
  return (
    <div className="flex items-center gap-2">
      {onDone ? (
        <Button variant="outline" size="touch" onClick={onDone}>
          Done
        </Button>
      ) : null}
      <Button ref={resetRef} size="touch" onClick={onReset}>
        Classify another
      </Button>
    </div>
  )
}

/**
 * The frame once there is a subject. While `result` is missing the scan stage covers the
 * photo; when it lands the stage fades out and the verdict is stamped over the photo.
 */
export function SubjectView({
  preview,
  alt,
  step,
  result,
  onReset,
  onDone,
  resetRef,
}: ActionsProps & {
  preview: string
  alt: string
  step?: string
  result?: ClassificationResult
}) {
  return (
    <>
      <Hud>
        <output>
          {result ? (
            <HudLabel>Scan complete</HudLabel>
          ) : (
            <HudLabel tone="ai">
              <StepTicks step={step} />
              {step ?? "Starting analysis"}
            </HudLabel>
          )}
        </output>
      </Hud>
      <Viewfinder state={result ? "verdict" : "scanning"}>
        {/* Object URLs and local photos: next/image adds nothing for one preview. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={preview} alt={alt} className="absolute inset-0 size-full object-contain" />
        <AnimatePresence>
          {result ? null : <ScanStage key="scan" placement="frame" src={preview} step={step} />}
        </AnimatePresence>
        {result ? <Stamp result={result} /> : null}
      </Viewfinder>
      <Below>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            {result ? <span className="font-mono text-caption-base text-fg-secondary">{result.id}</span> : null}
            <Credit src={preview} />
          </div>
          {result ? <Actions onReset={onReset} onDone={onDone} resetRef={resetRef} /> : null}
        </div>
      </Below>
    </>
  )
}
