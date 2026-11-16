// Types shared by the Classify screen (state) and its views (presentation).
import type { ClassificationResult } from "@/lib/fixtures/classification"

/** What the screen shows. One value, so impossible combinations cannot be written. */
export type ScreenState =
  | { status: "idle" }
  | { status: "analysing"; preview: string; alt: string; step?: string }
  | { status: "verdict"; preview: string; alt: string; result: ClassificationResult }
  | { status: "rejected"; reason: string }

/** The scan's narration, in order. The screen runs them; the views draw one tick per step. */
export const NARRATION = ["Reading image", "Extracting features", "Evaluating..."] as const
