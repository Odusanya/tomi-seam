// The one result shape both views read. The Classify view shows the verdict, the
// confidence and the id; History shows the rest. There is no third "uncertain" verdict.
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

/**
 * Below this confidence a verdict is called out for a second look (History meter, glyph and
 * filter). OPEN DECISION: 75% is a placeholder nobody has signed off. Overview still flags
 * under 70% in features/overview/stats.ts; the two should read this one value.
 */
export const LOW_CONFIDENCE = 0.75

// Real validation rules (a later milestone owns the full edge-state pass).
export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const
export const MAX_BYTES = 10 * 1024 * 1024
