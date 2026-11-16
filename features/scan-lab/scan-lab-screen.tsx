"use client"
// Side experiment: a playground for the analysing scan. Pick a sample, drag the sliders,
// then copy the values to send as feedback. Nothing here is wired into Classify until
// the values are folded back into SCAN_DEFAULTS.
import { AnimatePresence } from "motion/react"
import { useState } from "react"
import { toast } from "sonner"

import { ScanCanvas } from "@/components/domain/scan-canvas"
import { SCAN_CYCLE_MS, SCAN_DEFAULTS, type ScanTuning } from "@/components/domain/scan-shader"
import { ScanStage } from "@/components/domain/scan-stage"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Toggle } from "@/components/ui/toggle"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useFakeAI } from "@/hooks/use-fake-ai"
import { samples } from "@/lib/fixtures/samples"

type Knob = { key: keyof ScanTuning; label: string; min: number; max: number; step: number; unit?: string }

const KNOBS: readonly Knob[] = [
  { key: "u_cut", label: "Subject cut", min: 0.02, max: 0.4, step: 0.01 },
  { key: "u_floor", label: "Background kept", min: 0, max: 0.5, step: 0.01 },
  { key: "u_wake", label: "Wake length", min: 0.05, max: 0.6, step: 0.01 },
  { key: "u_pitch", label: "Dot pitch", min: 4, max: 20, step: 1, unit: "px" },
  { key: "u_tint", label: "Wake tint", min: 0, max: 0.6, step: 0.01 },
  { key: "u_rim", label: "Outline glow", min: 0, max: 2, step: 0.05 },
]

const NARRATION = ["Reading image", "Extracting features", "Evaluating..."] as const

function firstValue(value: number | readonly number[]) {
  return typeof value === "number" ? value : value[0]
}

function SliderRow({
  id,
  label,
  value,
  display,
  min,
  max,
  step,
  onChange,
}: {
  id: string
  label: string
  value: number
  display: string
  min: number
  max: number
  step: number
  onChange: (value: number) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-caption-lg">
        <span id={id} className="text-fg-secondary">
          {label}
        </span>
        <span className="font-mono text-fg-tertiary tabular-nums">{display}</span>
      </div>
      <Slider aria-labelledby={id} value={[value]} min={min} max={max} step={step} onValueChange={(next) => onChange(firstValue(next))} />
    </div>
  )
}

export function ScanLabScreen() {
  const [sampleId, setSampleId] = useState(samples[0].id)
  const [tuning, setTuning] = useState<ScanTuning>(SCAN_DEFAULTS)
  const [speed, setSpeed] = useState(1)
  const [preview, runPreview] = useFakeAI<null>()
  const sample = samples.find((item) => item.id === sampleId) ?? samples[0]
  const showMask = tuning.u_mask > 0.5

  const set = (key: keyof ScanTuning, value: number) => setTuning((current) => ({ ...current, [key]: value }))

  async function copyValues() {
    const text = JSON.stringify({ sample: sample.label, speed, ...tuning }, null, 2)
    try {
      await navigator.clipboard.writeText(text)
      toast.success("Scan values copied")
    } catch {
      toast.error("Couldn't copy. The values are in the console.")
      console.warn(text)
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-heading-6 font-medium">Scan lab</h1>
        <p className="text-caption-lg text-fg-tertiary">
          Experiment. Tune the analysing scan on each sample, then copy the values and send them over.
        </p>
      </header>

      <div className="flex flex-col gap-6 xl:flex-row">
        <section aria-label="Scan preview" className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex items-center justify-center rounded-xl bg-scan-stage p-4">
            <ScanCanvas key={sample.src} src={sample.src} tuning={tuning} speed={speed} />
          </div>
          <p className="sr-only">{sample.alt}</p>
          <fieldset className="flex flex-wrap gap-1">
            <legend className="sr-only">Sample photo</legend>
            {samples.map((item) => (
              <Toggle
                key={item.id}
                variant="outline"
                size="sm"
                pressed={item.id === sampleId}
                onPressedChange={() => setSampleId(item.id)}
              >
                {item.label}
              </Toggle>
            ))}
          </fieldset>
        </section>

        <aside aria-label="Scan controls" className="flex shrink-0 flex-col gap-5 xl:w-68">
          <SliderRow
            id="knob-speed"
            label="Speed"
            value={speed}
            display={`${speed.toFixed(2)}×`}
            min={0}
            max={2}
            step={0.05}
            onChange={setSpeed}
          />
          {KNOBS.map((knob) => (
            <SliderRow
              key={knob.key}
              id={`knob-${knob.key}`}
              label={knob.label}
              value={tuning[knob.key]}
              display={knob.unit ? `${tuning[knob.key]} ${knob.unit}` : tuning[knob.key].toFixed(2)}
              min={knob.min}
              max={knob.max}
              step={knob.step}
              onChange={(value) => set(knob.key, value)}
            />
          ))}
          <ToggleGroup
            aria-label="View"
            variant="outline"
            size="sm"
            value={[showMask ? "mask" : "photo"]}
            onValueChange={(next) => next[0] && set("u_mask", next[0] === "mask" ? 1 : 0)}
          >
            <ToggleGroupItem value="photo">Photo</ToggleGroupItem>
            <ToggleGroupItem value="mask">Mask</ToggleGroupItem>
          </ToggleGroup>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => runPreview(null, { ms: SCAN_CYCLE_MS, steps: NARRATION })}>
              Play in modal
            </Button>
            <Button size="sm" variant="outline" onClick={copyValues}>
              Copy values
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setTuning(SCAN_DEFAULTS)
                setSpeed(1)
              }}
            >
              Reset
            </Button>
          </div>
        </aside>
      </div>

      <AnimatePresence>
        {preview.status === "running" ? <ScanStage key="scan" src={sample.src} step={preview.step} tuning={tuning} /> : null}
      </AnimatePresence>
    </main>
  )
}
