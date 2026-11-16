// Seeded random so fixtures are identical on server and client (no hydration
// mismatch) and identical every reload. Never use Math.random() or Date.now() in fixtures.
export function prng(seed = 42) {
  let s = seed >>> 0
  const next = () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  const pick = <T,>(items: readonly T[]): T => items[Math.floor(next() * items.length)] as T
  const int = (min: number, max: number) => min + Math.floor(next() * (max - min + 1))
  return { next, pick, int }
}

/** Fixed "now" for the demo, so relative dates never drift. */
export const DEMO_NOW = "2026-11-20T09:00:00Z"
