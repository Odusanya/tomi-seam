import assert from "node:assert/strict"
import { describe, test } from "node:test"

import { nextAttempt, rowEditsReducer, type RowEdits } from "./row-edits"

const ID = "cls_aa11"

/** Frozen, so a reducer that mutated its input would throw (modules run in strict mode). */
const state = (edits: RowEdits = {}): RowEdits => Object.freeze(edits)

describe("rowEditsReducer, re-run", () => {
  test("finish records the new confidence for the running attempt", () => {
    const running = state({ [ID]: { kind: "running", attempt: 1 } })

    const next = rowEditsReducer(running, {
      type: "finish",
      id: ID,
      attempt: 1,
      confidence: 0.81,
    })

    assert.deepEqual(next, {
      [ID]: { kind: "rerun", attempt: 1, confidence: 0.81 },
    })
  })

  test("fail marks the running attempt as failed", () => {
    const running = state({ [ID]: { kind: "running", attempt: 1 } })

    const next = rowEditsReducer(running, { type: "fail", id: ID, attempt: 1 })

    assert.deepEqual(next, { [ID]: { kind: "failed", attempt: 1 } })
  })

  test("edits to one row leave other rows' edits alone", () => {
    const other = { kind: "failed", attempt: 3 } as const
    const edits = state({ other, [ID]: { kind: "running", attempt: 1 } })

    const next = rowEditsReducer(edits, {
      type: "finish",
      id: ID,
      attempt: 1,
      confidence: 0.8,
    })

    assert.equal(next.other, other)
  })
})

describe("rowEditsReducer, late results", () => {
  test("a result from an older attempt is dropped", () => {
    const running = state({ [ID]: { kind: "running", attempt: 2 } })

    const next = rowEditsReducer(running, {
      type: "finish",
      id: ID,
      attempt: 1,
      confidence: 0.81,
    })

    assert.equal(next, running)
  })

  test("a failure from an older attempt is dropped", () => {
    const running = state({ [ID]: { kind: "running", attempt: 2 } })

    const next = rowEditsReducer(running, { type: "fail", id: ID, attempt: 1 })

    assert.equal(next, running)
  })

  test("a result that lands after an appeal does not replace the appeal", () => {
    const appealed = state({
      [ID]: {
        kind: "appealed",
        attempt: 0,
        verdict: "not-hot-dog",
        reason: "It is a corn dog",
      },
    })

    const next = rowEditsReducer(appealed, {
      type: "finish",
      id: ID,
      attempt: 1,
      confidence: 0.81,
    })

    assert.equal(next, appealed)
  })

  test("a result for a row with no edit is dropped", () => {
    const empty = state()

    const next = rowEditsReducer(empty, {
      type: "finish",
      id: ID,
      attempt: 1,
      confidence: 0.81,
    })

    assert.equal(next, empty)
  })

  test("a result that arrives twice is applied once", () => {
    const running = state({ [ID]: { kind: "running", attempt: 1 } })
    const finish = {
      type: "finish",
      id: ID,
      attempt: 1,
      confidence: 0.81,
    } as const

    const once = rowEditsReducer(running, finish)
    const twice = rowEditsReducer(once, finish)

    assert.equal(twice, once)
  })

  // Real bug, reachable in the UI: Re-run, Appeal within the 1.4 s, Withdraw, Re-run again.
  // Withdraw deletes the edit, so nextAttempt() hands out attempt 1 a second time and the
  // first run's late result is accepted as the second run's. Impact today is small (the faked
  // outcome is identical per attempt, so the row only settles early), but the guarantee in
  // row-edits.ts ("a late result from an older attempt is dropped") does not hold.
  test("a late result from before an appeal and withdrawal is dropped", () => {
    let edits = state()
    const dispatch = (action: Parameters<typeof rowEditsReducer>[1]) => {
      edits = rowEditsReducer(edits, action)
    }
    const firstRun = nextAttempt(edits[ID])
    dispatch({ type: "start", id: ID, attempt: firstRun })
    dispatch({
      type: "appeal",
      id: ID,
      verdict: "not-hot-dog",
      reason: "It is a corn dog",
    })
    dispatch({ type: "withdraw", id: ID })
    dispatch({ type: "start", id: ID, attempt: nextAttempt(edits[ID]) })

    dispatch({ type: "finish", id: ID, attempt: firstRun, confidence: 0.81 })

    assert.equal(edits[ID]?.kind, "running")
  })
})

describe("nextAttempt", () => {
  test("is 1 for a row that has never been re-run", () => {
    assert.equal(nextAttempt(undefined), 1)
  })

  test("is one more than the last attempt, whatever state it ended in", () => {
    assert.equal(nextAttempt({ kind: "running", attempt: 1 }), 2)
    assert.equal(nextAttempt({ kind: "failed", attempt: 2 }), 3)
    assert.equal(nextAttempt({ kind: "rerun", attempt: 3, confidence: 0.8 }), 4)
  })

  test("keeps counting through an appeal and its withdrawal", () => {
    assert.equal(
      nextAttempt({
        kind: "appealed",
        attempt: 2,
        verdict: "hot-dog",
        reason: "r",
      }),
      3
    )
    assert.equal(nextAttempt({ kind: "idle", attempt: 2 }), 3)
  })
})
