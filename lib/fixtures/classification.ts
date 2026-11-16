// The one result shape both views read. The Classify view shows `verdict` only;
// History shows the rest. There is no third "uncertain" verdict.
export const VERDICTS = ["hot-dog", "not-hot-dog"] as const
export type Verdict = (typeof VERDICTS)[number]

export const VERDICT_LABEL: Record<Verdict, string> = {
  "hot-dog": "Hot Dog",
  "not-hot-dog": "Not Hot Dog",
}

export type ClassificationSource = "sample" | "upload"

export type ClassificationResult = {
  id: string
  /** Image src: a public path for samples and fixtures, an object URL for fresh uploads. */
  thumbnail: string
  verdict: Verdict
  /** 0 to 1. A low value still commits to a verdict. */
  confidence: number
  model: { name: string; version: string }
  classifiedAt: string // ISO string
  source: ClassificationSource
}

export const MODEL = { name: "SeeFood", version: "2.1.0" } as const

// Real validation rules (a later milestone owns the full edge-state pass).
export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const
export const MAX_BYTES = 10 * 1024 * 1024
