// The mock boundary: the one place a real model would later be connected.
// Pure apart from `classifiedAt`, which the caller supplies (lint blocks reading the clock here).
// Latency is NOT here: the screen wraps the call in useFakeAI / fakeAI.
import {
  ACCEPTED_TYPES,
  MAX_BYTES,
  MODEL,
  type ClassificationResult,
  type Verdict,
} from "@/lib/fixtures/classification"
import { prng } from "@/lib/fixtures/prng"
import type { SampleImage } from "@/lib/fixtures/samples"

export type ClassifyInput =
  | { source: "sample"; sample: SampleImage }
  | { source: "upload"; file: File; thumbnail: string }

/** FNV-1a over the bytes: the same file always gives the same number. */
function hashBytes(bytes: Uint8Array): number {
  let hash = 0x811c9dc5
  for (const byte of bytes) {
    hash = Math.imul(hash ^ byte, 0x01000193) >>> 0
  }
  return hash
}

function hex(value: number) {
  return value.toString(16).padStart(8, "0")
}

/** Returns a user-facing reason, or null when the file is acceptable. */
export function validateImage(file: File): string | null {
  if (!(ACCEPTED_TYPES as readonly string[]).includes(file.type)) {
    return "That file is not a supported image. Use a JPEG, PNG or WebP."
  }
  if (file.size > MAX_BYTES) {
    return "That image is larger than 10 MB. Choose a smaller one."
  }
  return null
}

export async function classify(input: ClassifyInput, classifiedAt: string): Promise<ClassificationResult> {
  if (input.source === "sample") {
    const { sample } = input
    const rand = prng(hashBytes(new TextEncoder().encode(sample.id)))
    return {
      id: `cls_${hex(rand.int(0, 0xffffffff))}`,
      thumbnail: sample.src,
      verdict: sample.verdict,
      confidence: rand.int(88, 99) / 100,
      model: MODEL,
      classifiedAt,
      source: "sample",
    }
  }
  const hash = hashBytes(new Uint8Array(await input.file.arrayBuffer()))
  const rand = prng(hash)
  const verdict: Verdict = rand.next() < 0.5 ? "hot-dog" : "not-hot-dog"
  return {
    id: `cls_${hex(hash)}`,
    thumbnail: input.thumbnail,
    verdict,
    confidence: rand.int(62, 97) / 100,
    model: MODEL,
    classifiedAt,
    source: "upload",
  }
}
