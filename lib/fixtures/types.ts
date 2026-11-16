// Shared shapes for dummy data. Domain entities (Finding, Auditor, ...) are
// written on the day from the brief, next to their fixtures.

export type Actor = { kind: "ai"; model: string } | { kind: "human"; name: string }

/** Anything the AI produced. Purple until a human accepts it. */
export type AIOutput<T> = {
  value: T
  confidence: "high" | "medium" | "low"
  source?: { doc: string; page: number; quote?: string } // no source = cannot accept
  status: "draft" | "accepted" | "rejected" | "edited"
  reviewedBy?: string
  reason?: string // required when rejected or edited
}

/** One AI job on screen. `step` is the narration line, e.g. "Reading TD-118 · p.42". */
export type AIRun<T> =
  | { status: "idle" }
  | { status: "running"; step?: string }
  | { status: "done"; value: T }
  | { status: "error"; message: string }

export type AuditEvent = {
  id: string
  at: string // ISO string, fixed in fixtures
  actor: Actor
  action: string
  target: string
}
