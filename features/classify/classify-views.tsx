// Presentational pieces of the Classify screen. State lives in classify-screen.tsx.
import { CircleAlertIcon, LoaderIcon } from "lucide-react"
import { AnimatePresence } from "motion/react"
import type { ComponentProps, RefObject } from "react"

import { Dropzone } from "@/components/domain/dropzone"
import { IsoTray } from "@/components/domain/iso-tray"
import { SampleTile } from "@/components/domain/sample-tile"
import { ScanStage } from "@/components/domain/scan-stage"
import { VerdictMark } from "@/components/domain/verdict-mark"
import { Button } from "@/components/ui/button"
import type { ScreenState } from "@/features/classify/classify-screen"
import type { Verdict } from "@/lib/fixtures/classification"
import { ACCEPTED_TYPES } from "@/lib/fixtures/classification"
import { creditFor, samples, type SampleImage } from "@/lib/fixtures/samples"

const ICON_STROKE = 1.5

function dropzoneState(dragging: boolean, rejection: string | null) {
  if (dragging) {
    return "dragging"
  }
  return rejection ? "rejected" : "idle"
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
      <div className="flex flex-col gap-2">
        <Dropzone ref={dropzoneRef} state={state} onClick={onBrowse} aria-describedby={rejection ? "classify-rejection" : undefined}>
          <IsoTray state={state} />
          <span className="text-body-sm font-medium text-fg-primary">Drop an image here, or browse</span>
          <span className="text-caption-lg text-fg-tertiary">JPEG, PNG or WebP, up to 10 MB</span>
        </Dropzone>
        <input ref={inputRef} type="file" accept={ACCEPTED_TYPES.join(",")} hidden tabIndex={-1} onChange={onFile} />
        {rejection ? (
          <p id="classify-rejection" role="alert" className="flex items-center gap-1.5 text-body-sm text-fg-danger">
            <CircleAlertIcon aria-hidden strokeWidth={ICON_STROKE} className="size-4 shrink-0" />
            {rejection}
          </p>
        ) : null}
      </div>
      <section aria-labelledby="classify-samples" className="flex flex-col gap-3">
        <h2 id="classify-samples" className="text-body-sm font-medium text-fg-secondary">
          Or try a sample
        </h2>
        <div className="grid grid-cols-3 gap-3">
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
    </>
  )
}

function Preview({ src, alt }: { src: string; alt: string }) {
  const credit = creditFor(src)
  return (
    <figure className="flex flex-col gap-1.5">
      {/* Object URLs and local photos: next/image adds nothing for one preview. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="aspect-3/2 w-full rounded-lg border border-subtle bg-sunken object-contain" />
      {credit ? (
        <figcaption className="text-caption-base text-fg-tertiary">
          Photo: {credit.author} ·{" "}
          <a href={credit.sourceUrl} target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-fg-secondary">
            {credit.license}, Wikimedia Commons
          </a>
        </figcaption>
      ) : null}
    </figure>
  )
}

export function AnalysingView({ preview, alt, step }: { preview: string; alt: string; step?: string }) {
  return (
    <div className="flex flex-col gap-4">
      <Preview src={preview} alt={alt} />
      <output className="flex items-center gap-2 text-body-sm text-fg-secondary">
        <LoaderIcon aria-hidden strokeWidth={ICON_STROKE} className="size-4 animate-spin motion-reduce:animate-none" />
        {step ?? "Starting analysis"}
      </output>
    </div>
  )
}

export function VerdictView({
  preview,
  alt,
  verdict,
  onReset,
  resetRef,
}: {
  preview: string
  alt: string
  verdict: Verdict
  onReset: () => void
  resetRef: RefObject<HTMLButtonElement | null>
}) {
  return (
    <div className="flex flex-col gap-6">
      <Preview src={preview} alt={alt} />
      <output className="block animate-in duration-200 fade-in motion-reduce:animate-none">
        <VerdictMark verdict={verdict} />
      </output>
      <div>
        <Button ref={resetRef} variant="secondary" size="touch" onClick={onReset}>
          Classify another
        </Button>
      </div>
    </div>
  )
}

// The black scan stage floats over the analysing view and fades out when the verdict lands.
export function ScanOverlay({ screen }: { screen: ScreenState }) {
  return (
    <AnimatePresence>
      {screen.status === "analysing" ? <ScanStage key="scan" src={screen.preview} step={screen.step} /> : null}
    </AnimatePresence>
  )
}
