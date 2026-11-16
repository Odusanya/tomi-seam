"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

// The sidebar's "Classify" button opens the Classify dialog, which the app layout renders
// (components/ can't import features/). Shared state is one boolean plus a reset counter:
// the Classify flow is keyed by `resetKey`, so a bump remounts it at idle. No URL state, no store.
type ScanContextValue = {
  resetKey: number
  scan: () => void
  dialogOpen: boolean
  setDialogOpen: (open: boolean) => void
}

const ScanContext = createContext<ScanContextValue>({
  resetKey: 0,
  scan: () => {},
  dialogOpen: false,
  setDialogOpen: () => {},
})

export function ScanProvider({ children }: { children: ReactNode }) {
  const [resetKey, setResetKey] = useState(0)
  const [dialogOpen, setDialogOpen] = useState(false)
  const scan = () => {
    setResetKey((key) => key + 1)
    setDialogOpen(true)
  }
  return <ScanContext value={{ resetKey, scan, dialogOpen, setDialogOpen }}>{children}</ScanContext>
}

export function useScan() {
  return useContext(ScanContext)
}
