// Display formats for History cells. Both are pure and locale-free, so the server and the
// client render the same string (no Intl, no local time zone).
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const

const pad = (value: number) => String(value).padStart(2, "0")

/** 0.98 → "98%". The fixture holds whole percentages, so no decimals are invented. */
export function formatConfidence(confidence: number): string {
  return `${Math.round(confidence * 100)}%`
}

/** ISO → "16 Nov 2026, 14:02", in UTC. */
export function formatClassifiedAt(iso: string): string {
  const date = new Date(iso)
  const day = pad(date.getUTCDate())
  const month = MONTHS[date.getUTCMonth()]
  const time = `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}`
  return `${day} ${month} ${date.getUTCFullYear()}, ${time}`
}

/** The header count: "40", or "7 of 40" while a filter or search hides some rows. */
export function formatShown(shown: number, total: number): string {
  return shown === total ? String(total) : `${shown} of ${total}`
}

export function formatCount(count: number): string {
  return `${count} ${count === 1 ? "classification" : "classifications"}`
}
