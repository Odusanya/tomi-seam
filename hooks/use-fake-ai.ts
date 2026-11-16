"use client"

import { useRef, useState } from "react"

import { fakeAI, type FakeAIOptions } from "@/lib/fixtures/fake-ai"
import type { AIRun } from "@/lib/fixtures/types"

/**
 * One fake AI job as state: idle → running (with narration) → done | error.
 * Call `run` from an event handler. Call it again to retry.
 */
export function useFakeAI<T>() {
  const [state, setState] = useState<AIRun<T>>({ status: "idle" })
  const latest = useRef(0)

  async function run(value: T, options: Omit<FakeAIOptions, "onStep"> = {}) {
    const id = ++latest.current
    const set = (next: AIRun<T>) => {
      if (id === latest.current) {
        setState(next)
      }
    }
    set({ status: "running", step: options.steps?.[0] })
    try {
      const result = await fakeAI(value, { ...options, onStep: (step) => set({ status: "running", step }) })
      set({ status: "done", value: result })
    } catch (error) {
      set({ status: "error", message: error instanceof Error ? error.message : "Something went wrong." })
    }
  }

  return [state, run] as const
}
