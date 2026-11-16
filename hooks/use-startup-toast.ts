import { useEffect } from "react"
import { toast } from "sonner"

import { fakeAI } from "@/lib/fixtures/fake-ai"

const TOAST_ID = "startup"
const PREPARE_MS = 1500
const DISMISS_MS = 1500

// Once per page load (module flag, so route changes and StrictMode remounts do not repeat it).
// Fakes "environment preparation" with fakeAI. An effect is needed: it talks to the toast system,
// an external store. The toast never takes focus, and the app is usable while it shows.
let started = false

export function useStartupToast() {
  useEffect(() => {
    if (started) {
      return
    }
    started = true
    toast.loading("Preparing environment", {
      id: TOAST_ID,
      description: "Loading the sandbox classifier",
      duration: Number.POSITIVE_INFINITY,
    })
    void (async () => {
      await fakeAI(null, { ms: PREPARE_MS })
      toast.success("Environment ready", { id: TOAST_ID, description: "", duration: DISMISS_MS })
    })()
  }, [])
}
