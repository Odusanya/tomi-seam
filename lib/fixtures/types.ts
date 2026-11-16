// Shared shapes for dummy data. Domain entities (Finding, Auditor, ...) are
// written on the day from the brief, next to their fixtures.

export type Actor = { kind: "ai"; model: string } | { kind: "human"; name: string }

/** Anything the AI produced. Purple until a human approves it. */
export type AIOutput<T> = {
  value: T
  confidence: "high" | "medium" | "low"
  source?: { doc: string; page: number; quote?: string } // no source = cannot accept
  status: "draft" | "accepted" | "rejected" | "edited"
  reviewedBy?: string
  reason?: string // required when rejected or edited
}

export type AuditEvent = {
  id: string
  at: string // ISO string, fixed in fixtures
  actor: Actor
  action: string
  target: string
}
