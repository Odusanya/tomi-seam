"use client"
// L3 atom. The analysing state as a black stage: the photo is scanned by a shader
// (components/domain/scan-shader.ts) while the AI's narration step shows underneath.
// Rendered inside AnimatePresence so it fades out on the verdict. The canvas is decorative:
// the same photo, with its alt text, stays in the analysing view underneath.
import { motion, useReducedMotion } from "motion/react"

import { AIMark } from "@/components/domain/ai-mark"
import { ScanCanvas } from "@/components/domain/scan-canvas"
import { SCAN_DEFAULTS, SCAN_SPEED, type ScanTuning } from "@/components/domain/scan-shader"

// `screen` covers the viewport (the lab); `frame` fills its positioned parent (the Classify
// viewfinder), where the narration lives in the frame's own readout instead.
const PLACEMENT = {
  screen: "fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-scan-stage p-6",
  frame: "absolute inset-0 flex items-center justify-center bg-scan-stage",
} as const

// Reduced motion: hold one frame mid way down the slow pass instead of animating.
const STILL_FRAME_MS = 1800

function Narration({ step = "Starting analysis" }: { step?: string }) {
  return (
    <output className="flex items-center gap-2 text-body-sm text-on-inverted">
      <AIMark status="draft" />
      {step}
    </output>
  )
}

export function ScanStage({
  src,
  step,
  tuning = SCAN_DEFAULTS,
  speed = SCAN_SPEED,
  placement = "screen",
}: {
  src: string
  step?: string
  tuning?: ScanTuning
  speed?: number
  placement?: keyof typeof PLACEMENT
}) {
  const reduced = useReducedMotion()
  return (
    <motion.div
      className={PLACEMENT[placement]}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduced ? 0 : 0.2, ease: [0.4, 0, 0.2, 1] }}
    >
      <ScanCanvas src={src} tuning={tuning} speed={reduced ? 0 : speed} frame={reduced ? STILL_FRAME_MS : 0} />
      {placement === "screen" ? <Narration step={step} /> : null}
    </motion.div>
  )
}
