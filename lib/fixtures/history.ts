// Seeded History rows (about 12), deterministic from prng() and DEMO_NOW.
// Built in M1; the History view that reads them is a later milestone.
import { MODEL, type ClassificationResult } from "@/lib/fixtures/classification"
import { DEMO_NOW, prng } from "@/lib/fixtures/prng"
import { samples } from "@/lib/fixtures/samples"

const ROWS = 12
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
