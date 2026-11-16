"use client"
// L3 atom. The analysing state as a black stage: the photo is scanned by a shader
// (components/domain/scan-shader.ts) while the AI's narration step shows underneath.
// Rendered inside AnimatePresence so it fades out on the verdict. The canvas is decorative:
// the same photo, with its alt text, stays in the analysing view underneath.
import { motion, useReducedMotion } from "motion/react"

import { AIMark } from "@/components/domain/ai-mark"
import { ScanCanvas } from "@/components/domain/scan-canvas"
import { SCAN_DEFAULTS, type ScanTuning } from "@/components/domain/scan-shader"

// Reduced motion: hold one frame mid way down the slow pass instead of animating.
const STILL_FRAME_MS = 1800

export function ScanStage({ src, step, tuning = SCAN_DEFAULTS }: { src: string; step?: string; tuning?: ScanTuning }) {
  const reduced = useReducedMotion()
  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-scan-stage p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduced ? 0 : 0.2, ease: [0.4, 0, 0.2, 1] }}
    >
      <ScanCanvas src={src} tuning={tuning} speed={reduced ? 0 : 1} frame={reduced ? STILL_FRAME_MS : 0} />
      <output className="flex items-center gap-2 text-body-sm text-on-inverted">
        <AIMark status="draft" />
        {step ?? "Starting analysis"}
      </output>
    </motion.div>
  )
}
