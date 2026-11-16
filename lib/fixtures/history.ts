// Seeded History rows (40, about ten days of use), deterministic from prng() and DEMO_NOW.
import { MODEL, type ClassificationResult } from "@/lib/fixtures/classification"
import { DEMO_NOW, prng } from "@/lib/fixtures/prng"
import { samples } from "@/lib/fixtures/samples"

const ROWS = 40
const HOUR_MS = 3_600_000

function buildHistory(): ClassificationResult[] {
  const rand = prng(1107)
  const nowMs = Date.parse(DEMO_NOW)
  let offset = 0
  return Array.from({ length: ROWS }, (_, index) => {
    offset += rand.int(1, 9) * HOUR_MS
    const sample = rand.pick(samples)
    const id = `cls_${rand.int(0x10000000, 0xffffffff).toString(16)}`
    return {
      id,
      thumbnail: sample.src,
      verdict: sample.verdict,
      confidence: rand.int(62, 99) / 100,
      model: MODEL,
      classifiedAt: new Date(nowMs - offset - index * 60_000).toISOString(),
      source: rand.next() < 0.4 ? "sample" : "upload",
    }
  })
}

/** Newest first. */
export const seededHistory: readonly ClassificationResult[] = buildHistory()

/**
 * Faked outcome of re-running the model on one row (no real inference). Same verdict, a
 * nearby confidence, deterministic per row and attempt. The first re-run of about one row
 * in four fails, so the failed state can be seen; the next attempt succeeds.
 */
export function rerunOutcome(row: ClassificationResult, attempt: number): { fail: boolean; confidence: number } {
  let hash = 0
  for (const char of row.id) {
    hash = (Math.imul(hash, 31) + char.charCodeAt(0)) >>> 0
  }
  // Spread the seed: adjacent seeds give near-identical first draws.
  const rand = prng(hash ^ Math.imul(attempt, 0x9e3779b9))
  return { fail: attempt === 1 && hash % 4 === 0, confidence: rand.int(70, 99) / 100 }
}
