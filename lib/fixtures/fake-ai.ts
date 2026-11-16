// Fake latency and narration so running / failed states are real on screen. Not a backend.
export type FakeAIOptions = {
  ms?: number
  fail?: boolean
  /** Narration lines, spread evenly over `ms`. */
  steps?: readonly string[]
  onStep?: (step: string) => void
}

export async function fakeAI<T>(value: T, options: FakeAIOptions = {}): Promise<T> {
  const { ms = 900, fail = false, steps = [], onStep } = options
  steps.forEach((step, index) => {
    setTimeout(() => onStep?.(step), (ms / steps.length) * index)
  })
  await new Promise((resolve) => setTimeout(resolve, ms))
  if (fail) {
    throw new Error("The model did not respond. Try again.")
  }
  return value
}
