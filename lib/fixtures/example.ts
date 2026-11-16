// PATTERN ONLY. Delete once the brief's real fixtures exist.
// Fixtures are plain typed arrays, built once at module load, imported directly by pages.
import type { AIOutput } from "./types"
import { prng } from "./prng"
import { clauses, docs, severities } from "./vocab"

export type ExampleFinding = {
  id: string
  title: string
  severity: (typeof severities)[number]
  clause: string
  ai: AIOutput<string>
}

const r = prng(7)

export const exampleFindings: ExampleFinding[] = Array.from({ length: 6 }, (_, i) => ({
  id: `F-${String(i + 1).padStart(3, "0")}`,
  title: `Example finding ${i + 1}`,
  severity: r.pick(severities),
  clause: r.pick(clauses),
  ai: {
    value: "One-sentence finding text.",
    confidence: r.pick(["high", "medium", "low"] as const),
    source: i === 4 ? undefined : { doc: r.pick(docs), page: r.int(2, 120) },
    status: "draft",
  },
}))
