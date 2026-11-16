// Overview numbers, derived from the History fixture during render. Pure and locale-free
// (UTC, no Intl), like features/history/format.ts, so server and client agree.
import type { ClassificationResult } from "@/lib/fixtures/classification"
import { DEMO_NOW } from "@/lib/fixtures/prng"

export const PERIODS = [
  { value: "7", label: "7 days" },
  { value: "14", label: "14 days" },
] as const
export type Period = (typeof PERIODS)[number]["value"]

export type DayBucket = {
  /** "2026-11-20", UTC. */
  key: string
  /** "20", or "Today" for the last bucket. */
  label: string
  /** "20 Nov", for tooltips and the table view. */
  long: string
  hotDog: number
  notHotDog: number
}

export type Kpis = {
  total: number
  /** Same-length window before this one. Null when the fixture has no rows there. */
  previousTotal: number | null
  hotDog: number
  /** 0 to 1, null with no rows. */
  hotDogRate: number | null
  averageConfidence: number | null
  lowConfidence: number
}

export type ConfidenceBand = {
  /** "90–100%". */
  label: string
  /** Inclusive lower edge, 0 to 1. */
  min: number
  hotDog: number
  notHotDog: number
  /** Rows in this band that isLowConfidence() flags. */
  low: number
}

export type OverviewStats = { days: DayBucket[]; kpis: Kpis; bands: ConfidenceBand[] }

// Highest first, so the confident bulk sits at the top and the shaky tail at the bottom.
// The fixture holds 62–99%; "Under 60%" keeps the chart honest if anything lower arrives.
const BAND_EDGES = [
  { label: "90–100%", min: 0.9 },
  { label: "80–89%", min: 0.8 },
  { label: "70–79%", min: 0.7 },
  { label: "60–69%", min: 0.6 },
  { label: "Under 60%", min: 0 },
] as const

function confidenceBands(rows: readonly ClassificationResult[]): ConfidenceBand[] {
  const bands: ConfidenceBand[] = BAND_EDGES.map((edge) => ({
    label: edge.label,
    min: edge.min,
    hotDog: 0,
    notHotDog: 0,
    low: 0,
  }))
  for (const row of rows) {
    const band = bands.find((candidate) => row.confidence >= candidate.min)
    if (!band) {
      continue
    }
    if (row.verdict === "hot-dog") {
      band.hotDog += 1
    } else {
      band.notHotDog += 1
    }
    if (isLowConfidence(row)) {
      band.low += 1
    }
  }
  // Drop an empty bottom band, so "Under 60%" only shows when it has rows.
  return bands.filter((band) => band.min > 0 || band.hotDog + band.notHotDog > 0)
}

const DAY_MS = 86_400_000
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const

/**
 * Whether a verdict is shaky enough to call out on the Overview (KPI, recent rows).
 *
 * TODO(you): this is a product decision, not a formula. The default flags anything under 70%.
 * Options worth weighing: a fixed cut-off (simple, explainable in one line of UI copy), a
 * per-verdict cut-off (Hot Dog is the rarer class, so a 72% Hot Dog may deserve more doubt than
 * a 72% Not Hot Dog), or excluding samples so only real uploads count. Whatever you choose,
 * update LOW_CONFIDENCE_HINT so the copy says the same thing.
 */
export function isLowConfidence(row: ClassificationResult): boolean {
  return row.confidence < 0.7
}
export const LOW_CONFIDENCE_HINT = "Under 70% confidence"

function dayKey(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10)
}

function startOfDay(ms: number): number {
  return Math.floor(ms / DAY_MS) * DAY_MS
}

function average(values: number[]): number | null {
  return values.length === 0 ? null : values.reduce((sum, value) => sum + value, 0) / values.length
}

export function overviewStats(rows: readonly ClassificationResult[], period: Period): OverviewStats {
  const count = Number(period)
  const today = startOfDay(Date.parse(DEMO_NOW))
  const from = today - (count - 1) * DAY_MS
  const previousFrom = from - count * DAY_MS

  const days: DayBucket[] = Array.from({ length: count }, (_, index) => {
    const ms = from + index * DAY_MS
    const date = new Date(ms)
    const day = String(date.getUTCDate())
    return {
      key: dayKey(ms),
      label: index === count - 1 ? "Today" : day,
      long: `${day} ${MONTHS[date.getUTCMonth()]}`,
      hotDog: 0,
      notHotDog: 0,
    }
  })
  const byKey = new Map(days.map((bucket) => [bucket.key, bucket]))

  const inPeriod: ClassificationResult[] = []
  let previous = 0
  for (const row of rows) {
    const at = Date.parse(row.classifiedAt)
    const bucket = byKey.get(dayKey(at))
    if (bucket) {
      inPeriod.push(row)
      if (row.verdict === "hot-dog") {
        bucket.hotDog += 1
      } else {
        bucket.notHotDog += 1
      }
    } else if (at >= previousFrom && at < from) {
      previous += 1
    }
  }

  const hotDog = inPeriod.filter((row) => row.verdict === "hot-dog").length
  return {
    days,
    bands: confidenceBands(inPeriod),
    kpis: {
      total: inPeriod.length,
      previousTotal: previous === 0 ? null : previous,
      hotDog,
      hotDogRate: inPeriod.length === 0 ? null : hotDog / inPeriod.length,
      averageConfidence: average(inPeriod.map((row) => row.confidence)),
      lowConfidence: inPeriod.filter(isLowConfidence).length,
    },
  }
}

/** 0.4167 → "42%". */
export function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`
}

/** 31 vs 24 → "+7 vs previous 7 days". */
export function formatDelta(total: number, previous: number | null, period: Period): string {
  if (previous === null) {
    return "No previous period"
  }
  const delta = total - previous
  let sign = "±"
  if (delta > 0) {
    sign = "+"
  } else if (delta < 0) {
    sign = "−"
  }
  return `${sign}${Math.abs(delta)} vs previous ${period} days`
}
