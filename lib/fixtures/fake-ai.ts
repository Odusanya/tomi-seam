// Fake latency so loading / failed states are real on screen. Not a backend.
export async function fakeAI<T>(value: T, { ms = 900, fail = false } = {}): Promise<T> {
  await new Promise((resolve) => setTimeout(resolve, ms))
  if (fail) {
    throw new Error("The model did not respond. Try again.")
  }
  return value
}
