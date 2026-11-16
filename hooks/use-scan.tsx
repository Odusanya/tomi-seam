"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

// "Scan image" lives in the sidebar but resets the Classify screen on another route.
// A counter is the simplest shared state: the Classify screen is keyed by it, so a bump
// remounts it at idle and drops any in-flight analysis. No URL state, no store.
type ScanContextValue = { resetKey: number; scan: () => void }

const ScanContext = createContext<ScanContextValue>({ resetKey: 0, scan: () => {} })

export function ScanProvider({ children }: { children: ReactNode }) {
  const [resetKey, setResetKey] = useState(0)
  return <ScanContext value={{ resetKey, scan: () => setResetKey((key) => key + 1) }}>{children}</ScanContext>
}

export function useScan() {
  return useContext(ScanContext)
}
