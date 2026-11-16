import { useCallback } from "react"

// Reads the wall clock for session timestamps. Lint blocks Date.now() everywhere else, so
// event handlers get "now" from here and pass it down as data (lib/classify takes it as an argument).
export function useClock() {
  return useCallback(() => new Date().toISOString(), [])
}
