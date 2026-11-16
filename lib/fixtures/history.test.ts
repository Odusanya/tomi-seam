// Only the invariants that types cannot express and a glance at the screen would not show.
import assert from "node:assert/strict"
import { describe, test } from "node:test"

import { rerunOutcome, seededHistory } from "./history"

describe("seededHistory", () => {
  // Row edits and React keys are both keyed by id; a collision would make two rows share state.
  test("every id is unique", () => {
    const ids = seededHistory.map((row) => row.id)

    assert.equal(new Set(ids).size, ids.length)
  })
})

describe("rerunOutcome", () => {
  test("never fails after the first attempt, so Retry always recovers", () => {
    for (const row of seededHistory) {
      assert.equal(rerunOutcome(row, 2).fail, false)
      assert.equal(rerunOutcome(row, 3).fail, false)
    }
  })

  // The failure depends on a hash of the seeded ids. Change the seed and the failed state
  // (or the first-try success) could silently become unreachable in the demo.
  test("the seeded rows include a first attempt that fails and one that succeeds", () => {
    const firstAttempts = new Set(seededHistory.map((row) => rerunOutcome(row, 1).fail))

    assert.ok(firstAttempts.has(true), "no row shows the failed state")
    assert.ok(firstAttempts.has(false), "no row succeeds on the first try")
  })
})
